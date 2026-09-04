import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

type TabButtonProps = {
  tab: string;
  icon: React.ComponentType<any>;
  activeTab: string;
  onPress: () => void;
  isPrimary?: boolean;
};

const TabButton = ({ tab, icon: Icon, activeTab, onPress, isPrimary = false }: TabButtonProps) => {
  const isActive = activeTab === tab;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}
    >
      <View style={{
        padding: 10,
        borderRadius: 12,
        backgroundColor: isPrimary && isActive ? '#FDD835' : 'transparent',
        marginBottom: 4,
        width: 50,
        alignItems: 'center'
      }}>
        <Icon
          size={24}
          color={isActive ? (isPrimary ? '#000' : '#FDD835') : '#333'}
          strokeWidth={isActive ? 2.5 : 2}
        />
      </View>

      <Text style={{
        color: isActive ? '#FFF' : '#333',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        textTransform: 'uppercase'
      }}>
        {tab}
      </Text>

      {!isPrimary && isActive && (
        <View style={{ height: 2, width: 4, backgroundColor: '#FDD835', marginTop: 4, borderRadius: 2 }} />
      )}
    </TouchableOpacity>
  );
};

export default React.memo(TabButton);
