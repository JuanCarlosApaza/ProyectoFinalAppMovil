import { Text, View } from 'react-native';

export const EditScreenInfo = ({ path }: { path: string }) => {
  const title = 'Open up the code for this screensadasd:';
  const description = 'Change any of the text, save the file, and your app will automatically update222332.';

  return (
    <View>
      {/* Container principal */}
      <View className="items-center mx-12">
        <Text className="text-lg leading-6 text-center bg-amber-300">{title}</Text>
        
        {/* Contenedor del Path con margen y bordes redondeados */}
        <View className="rounded-md px-1 my-2 bg-slate-100"> 
          <Text className="font-mono">{path}</Text>
        </View>

        <Text className="text-lg leading-6 text-center ">{description}</Text>
      </View>
    </View>
  );
};