import { useWalletAuth } from '@/hook/useWalletAuth';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  const { isLoggedIn, isAuthResolved } = useWalletAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthResolved) return;

    if (!isLoggedIn) {
      router.replace('/sign-in');
    }
  }, [isLoggedIn, isAuthResolved]);

  if (!isAuthResolved || !isLoggedIn) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: 'transparent' }} />
        ),
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    />
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const isLastTab = true;

  return (
    <View style={[styles.tabBar, { backgroundColor: 'transparent' }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let icon;
        if (route.name === 'index') {
          icon = (
            <AntDesign
              name="home"
              size={isFocused ? 30 : 24}
              style={{ opacity: isFocused ? 1 : 0.7 }}
              color={!isLastTab ? '#FFFFFF' : '#000000'}
            />
          );
        } else if (route.name === 'explore') {
          icon = (
            <FontAwesome
              name="google-wallet"
              size={isFocused ? 30 : 24}
              style={{ opacity: isFocused ? 1 : 0.7 }}
              color={!isLastTab ? '#FFFFFF' : '#000000'}
            />
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            onPress={onPress}
            style={styles.tabButton}
          >
            {icon}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    elevation: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  middleButtonContainer: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
  },
});
