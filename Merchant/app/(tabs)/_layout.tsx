import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{
      headerShown: false,
      animation:'shift',

      
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

function CustomTabBar({ state, descriptors, navigation }:any) {
    const isLastTab = state.index === 2;

  return (
    <View
    style={[
      styles.tabBar,
      {
        // backgroundColor: isMiddleTab ? 'transparent' : '#FFFFFF',
        backgroundColor:"transparent"
      },
    ]}
  >      
  {state.routes.map((route:any, index:number) => {
        const { options } = descriptors[route.key];
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

        // Special styling for center tab
        let icon;
        if (route.name === 'index') {
          icon = <AntDesign name="home" size={isFocused?30:24} style={{opacity:isFocused?1:0.7}} color={!isLastTab?"#FFFFFF":"#000000"}/>;
        } else if (route.name === 'payment') {
          icon = (
          <FontAwesome6 name="indian-rupee-sign" size={isFocused?30:24} style={{opacity:isFocused?1:0.7}} color={!isLastTab?"#FFFFFF":"#000000"} />
          );
        } else if (route.name === 'reciept') {
          icon = (
            // color = {isMiddleTab?"#FFFFFF":"#000000"}
            <MaterialIcons name="call-received" size={isFocused?30:24} style={{opacity:isFocused?1:0.7}}  color={!isLastTab?"#FFFFFF":"#000000"}/>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            onPress={onPress}
            style={styles.tabButton}
          >
            {/* {isMiddle ? (
              <View style={styles.floatingButton}>
                {icon}
              </View>
            ) : ( */}
              {icon}
            {/* )} */}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    position: 'absolute',      // <--- Key line
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor: 'transparent',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    elevation: 0,
  }
,  
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  middleButtonContainer: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
  }
});
