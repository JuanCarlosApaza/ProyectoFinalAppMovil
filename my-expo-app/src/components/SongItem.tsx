import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Disc3, MoreVertical } from 'lucide-react-native';

const SongItem = React.memo(({ track, isCurrent, onPress, formatTime }: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)'
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
          backgroundColor: isCurrent ? '#FDD835' : '#111'
        }}>
          <Disc3 color={isCurrent ? "#000" : "#444"} size={22} />
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{
            fontSize: 15,
            fontWeight: 'bold',
            color: isCurrent ? '#FDD835' : '#EEE'
          }}>
            {track.filename.replace(/\.(mp3|wav|m4a|aac)$/i, '')}
          </Text>
          <Text style={{ color: '#555', fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>
            {formatTime(track.duration)} • DIGITAL
          </Text>
        </View>
      </View>
      <MoreVertical color={isCurrent ? "#FDD835" : "#333"} size={18} />
    </TouchableOpacity>
  );
});

export default SongItem;