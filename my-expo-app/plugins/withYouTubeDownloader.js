const { withMainApplication, withAppBuildGradle, withAndroidManifest } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function (config) {
  // 1. Copiar archivos Kotlin y registrar en MainApplication
  config = withMainApplication(config, (cfg) => {
    const projectRoot = cfg.modRequest.projectRoot;
    const androidSrc = path.join(cfg.modRequest.platformProjectRoot, "app", "src", "main", "java", "com", "carlosexpo", "myapp");
    const target = path.join(androidSrc, "ytdownloader");
    const src = path.join(projectRoot, "plugins", "native");

    fs.mkdirSync(target, { recursive: true });
    fs.copyFileSync(path.join(src, "YouTubeDownloaderModule.kt"), path.join(target, "YouTubeDownloaderModule.kt"));
    fs.copyFileSync(path.join(src, "YouTubeDownloaderPackage.kt"), path.join(target, "YouTubeDownloaderPackage.kt"));

    let code = cfg.modResults.contents;

    if (!code.includes("YouTubeDownloaderPackage")) {
      code = code.replace(
        "import expo.modules.ReactNativeHostWrapper",
        "import expo.modules.ReactNativeHostWrapper\nimport com.carlosexpo.myapp.ytdownloader.YouTubeDownloaderPackage"
      );
    }

    if (!code.includes("add(YouTubeDownloaderPackage())")) {
      code = code.replace(
        /PackageList\(this\)\.packages\.apply\s*\{[^}]*\}/s,
        `PackageList(this).packages.apply {\n              add(YouTubeDownloaderPackage())\n            }`
      );
    }

    cfg.modResults.contents = code;
    return cfg;
  });

  // 2. Agregar dependencias al app/build.gradle
  config = withAppBuildGradle(config, (cfg) => {
    let code = cfg.modResults.contents;

    if (!code.includes("youtubedl-android")) {
      code = code.replace(
        /dependencies\s*\{/,
        `dependencies {\n    implementation("io.github.junkfood02.youtubedl-android:library:0.18.1")\n    implementation("io.github.junkfood02.youtubedl-android:ffmpeg:0.18.1")`
      );
    }

    if (!code.includes("extractNativeLibs")) {
      code = code.replace(
        /packaging\s*\{/,
        `packaging {\n            jniLibs { useLegacyPackaging = true }`
      );
      if (!code.includes("jniLibs")) {
        code = code.replace(
          /android\s*\{/,
          `android {\n    packaging {\n        jniLibs {\n            useLegacyPackaging = true\n        }\n    }`
        );
      }
    }

    cfg.modResults.contents = code;
    return cfg;
  });

  // 3. Agregar extractNativeLibs al AndroidManifest
  config = withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    if (manifest.application && manifest.application[0]) {
      const appAttrs = manifest.application[0].$;
      if (!appAttrs["android:extractNativeLibs"]) {
        appAttrs["android:extractNativeLibs"] = "true";
      }
    }
    return cfg;
  });

  return config;
};
