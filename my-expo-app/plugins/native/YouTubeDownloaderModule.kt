package com.carlosexpo.myapp.ytdownloader

import android.content.ContentValues
import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMuxer
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import com.facebook.react.bridge.*
import com.yausername.youtubedl_android.YoutubeDL
import com.yausername.youtubedl_android.YoutubeDLRequest
import java.io.File
import java.nio.ByteBuffer

class YouTubeDownloaderModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val TAG = "YTDLP_MODULE"
    private var isInitialized = false
    override fun getName(): String = "YouTubeDownloader"

    @ReactMethod
    fun init(promise: Promise) {
        try {
            if (!isInitialized) {
                YoutubeDL.getInstance().init(reactApplicationContext)
                isInitialized = true
            }
            promise.resolve("OK")
        } catch (e: Exception) {
            Log.e(TAG, "Init failed", e)
            promise.reject("INIT_ERROR", e.message ?: e.toString())
        }
    }

    @ReactMethod
    fun downloadAudio(videoId: String, promise: Promise) {
        Thread {
            try {
                if (!isInitialized) {
                    YoutubeDL.getInstance().init(reactApplicationContext)
                    isInitialized = true
                }
                val ctx = reactApplicationContext
                val videoUrl = "https://www.youtube.com/watch?v=$videoId"

                val tempDir = File(ctx.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "temp")
                if (!tempDir.exists()) tempDir.mkdirs()

                val nombreArchivo = "%(title)s"
                val rutaGuardado = "${tempDir.absolutePath}/${nombreArchivo}.%(ext)s"

                Log.d(TAG, "Iniciando descarga de: $videoUrl")

                val request = YoutubeDLRequest(videoUrl).apply {
                    addOption("--no-check-certificate")
                    addOption("--no-update")
                    addOption("--extractor-args", "youtube:player_client=android,web")
                    addOption("-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best")
                    addOption("--merge-output-format", "mp4")
                    addOption("-o", rutaGuardado)
                }

                YoutubeDL.getInstance().execute(request) { progress, etaInSeconds, line ->
                    Log.d(TAG, "Progreso: $progress% | Restante: ${etaInSeconds}s")
                }

                Log.d(TAG, "Descarga completada. Esperando archivos...")
                Thread.sleep(1000)

                val archivos = tempDir.listFiles()
                var guardadoEn: String? = null

                archivos?.forEach { archivo ->
                    if (archivo.extension == "mp4") {
                        val archivoTemporalM4a = File(tempDir, archivo.nameWithoutExtension + ".m4a")
                        Log.d(TAG, "Convirtiendo ${archivo.name} a m4a...")
                        val exito = extraerAudio(archivo.absolutePath, archivoTemporalM4a.absolutePath)
                        if (exito) {
                            val nombreLimpio = archivo.nameWithoutExtension
                            guardadoEn = guardarEnDownloadsPublico(archivoTemporalM4a, "$nombreLimpio.m4a")
                            archivo.delete()
                            archivoTemporalM4a.delete()
                            if (guardadoEn != null) {
                                Log.d(TAG, "Audio guardado en Downloads: $guardadoEn")
                            } else {
                                Log.e(TAG, "No se pudo guardar en Downloads publico")
                            }
                        } else {
                            Log.e(TAG, "Error al extraer audio, guardando mp4 como fallback")
                            guardadoEn = guardarEnDownloadsPublico(archivo, "${archivo.nameWithoutExtension}.m4a")
                            archivo.delete()
                            if (guardadoEn != null) {
                                Log.d(TAG, "Fallback mp4 guardado: $guardadoEn")
                            }
                        }
                    }
                }

                tempDir.deleteRecursively()

                if (guardadoEn != null) {
                    val response = Arguments.createMap()
                    response.putString("status", "ok")
                    response.putString("path", guardadoEn)
                    promise.resolve(response)
                } else {
                    promise.reject("DOWNLOAD_ERROR", "No se pudo descargar")
                }

            } catch (e: Exception) {
                Log.e(TAG, "Error durante la descarga", e)
                promise.reject("DOWNLOAD_ERROR", e.message ?: e.toString())
            }
        }.start()
    }

    private fun guardarEnDownloadsPublico(archivo: File, nombreArchivo: String): String? {
        return try {
            val contentValues = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, nombreArchivo)
                put(MediaStore.Downloads.MIME_TYPE, "audio/mp4")
                put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/RosqMusic")
            }
            val resolver = reactApplicationContext.contentResolver
            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
            if (uri != null) {
                resolver.openOutputStream(uri)?.use { output ->
                    archivo.inputStream().use { input -> input.copyTo(output) }
                }
                uri.toString()
            } else null
        } catch (e: Exception) {
            Log.e(TAG, "Error al guardar en Downloads", e)
            null
        }
    }

    private fun extraerAudio(inputPath: String, outputPath: String): Boolean {
        return try {
            val extractor = MediaExtractor()
            extractor.setDataSource(inputPath)

            var audioTrackIndex = -1
            var audioFormat: MediaFormat? = null

            for (i in 0 until extractor.trackCount) {
                val format = extractor.getTrackFormat(i)
                val mime = format.getString(MediaFormat.KEY_MIME) ?: continue
                if (mime.startsWith("audio/")) {
                    audioTrackIndex = i
                    audioFormat = format
                    break
                }
            }

            if (audioTrackIndex == -1 || audioFormat == null) {
                Log.e(TAG, "No se encontro pista de audio")
                extractor.release()
                return false
            }

            extractor.selectTrack(audioTrackIndex)

            val muxer = MediaMuxer(outputPath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            val muxerTrackIndex = muxer.addTrack(audioFormat)
            muxer.start()

            val bufferSize = if (audioFormat.containsKey(MediaFormat.KEY_MAX_INPUT_SIZE)) {
                audioFormat.getInteger(MediaFormat.KEY_MAX_INPUT_SIZE)
            } else {
                1024 * 1024
            }
            val buffer = ByteBuffer.allocate(bufferSize)
            val bufferInfo = MediaCodec.BufferInfo()

            while (true) {
                bufferInfo.offset = 0
                bufferInfo.size = extractor.readSampleData(buffer, 0)
                if (bufferInfo.size < 0) break
                bufferInfo.presentationTimeUs = extractor.sampleTime
                bufferInfo.flags = extractor.sampleFlags
                muxer.writeSampleData(muxerTrackIndex, buffer, bufferInfo)
                extractor.advance()
            }

            muxer.stop()
            muxer.release()
            extractor.release()
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error al extraer audio", e)
            false
        }
    }
}
