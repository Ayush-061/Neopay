import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

//@ts-ignore
import Avatar from 'react-native-boring-avatars';

const avatarColors = [
  '#FFAD08',
  '#EDD75A',
  '#73B06F',
  '#0C8F8F',
  '#405059',
  '#EF5B5B',
  '#5BC0EB',
  '#FDE74C',
  '#9BC53D',
  '#E55934'
];

const RandomAvatar = ({ size = 120, onPress }: { size?: number; onPress?: () => void }) => {
  const randomName = Math.random().toString(36).substring(7);
  const randomVariant = ['marble', 'beam', 'pixel', 'sunset', 'bauhaus'][
    Math.floor(Math.random() * 5)
  ] as 'marble' | 'beam' | 'pixel' | 'sunset' | 'bauhaus';

  const avatar = (
    <Avatar
      size={size}
      name={randomName}
      variant={randomVariant}
      colors={avatarColors}
    />
  );

  return (
    <View style={styles.container}>
      {onPress ? (
        <TouchableOpacity onPress={onPress}>{avatar}</TouchableOpacity>
      ) : (
        avatar
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
});

export default RandomAvatar;