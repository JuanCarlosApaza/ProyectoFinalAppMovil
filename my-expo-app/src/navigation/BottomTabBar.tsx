import React, { useCallback } from "react";
import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Search, Disc3, Library } from "lucide-react-native";
import TabButton from "@/components/TabButton";

const BottomTabBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const activeTab = route.name;

  const goToSearch = useCallback(() => navigation.navigate('Search'), [navigation]);
  const goToLibrary = useCallback(() => navigation.navigate('Library'), [navigation]);
  const goToAlbums = useCallback(() => navigation.navigate('Albums'), [navigation]);

  return (
    <View style={{
        backgroundColor: '#000',
        flexDirection: 'row',
        height: 80,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#121212'
    }}>
      <TabButton
        tab="Buscar"
        icon={Search}
        activeTab={activeTab}
        onPress={goToSearch}
      />

      <TabButton
        tab="Play"
        isPrimary={true}
        icon={Disc3}
        activeTab={activeTab === 'Library' ? 'Play' : activeTab}
        onPress={goToLibrary}
      />

      <TabButton
        tab="Albumes"
        icon={Library}
        activeTab={activeTab}
        onPress={goToAlbums}
      />
    </View>
  );
};

export default React.memo(BottomTabBar);
