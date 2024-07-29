import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import 'react-native-gesture-handler';

import ReadAnswersScreen from "../screens/ReadAnswersScreen";




import React, { useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; 

const Tab = createBottomTabNavigator();

export default function Account({ route }) {
  const { session } = route.params;

  const navigation = useNavigation();

  useEffect(() => {
    // Déterminer quelle écran afficher en fonction de la biographie active
    if (session && session.user ){

    
      navigation.navigate('Marcel', { session });
    
  }
  }, [session, navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Récit') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Aide') {
            iconName = focused ? 'help-circle' : 'help-circle-outline';
          } else if (route.name === 'Paramètres') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size * 2} color={color} />;
        },
        tabBarStyle: { display: 'none' },  // Masquer la barre de navigation inférieure
        headerShown: false  // Masquer la barre de navigation supérieure
      })}
    >
   
      <Tab.Screen name="Marcel" component={ReadAnswersScreen} initialParams={{ session }} />
      {/* 
      <Tab.Screen name="Aide" component={AideScreen} />
      <Tab.Screen name="Paramètres" component={ProfileScreen} initialParams={{ session }} />
      <Tab.Screen name="Invitation" component={InvitationScreen} />   
       */}
    {/* 
    */}
    </Tab.Navigator>
  );
}
