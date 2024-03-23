import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from "../screens/ProfileScreen"
import BiographyScreen from "../screens/BiographyScreen"
import { supabase } from '../lib/supabase';
import AideScreen from "../screens/AideScreen";
import React, { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons'; 



const Tab = createBottomTabNavigator();

export default function Account({ route }) {
  const { session } = route.params;

  const [currentGroup, setCurrentGroup] = useState('')
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    const userID = session.user?.id;
    const fetchUserGroups = async () => {
      try {
        // récupérer les groupes de l'utilisateur
        const { data, error } = await supabase
          .from('users_in_groups')
          .select('id_group')
          .eq('id_user', userID);

        if (error) {
          throw error;
        }

        // Récupération des IDs des groupes
        const groupIDs = data.map((group) => group.id_group);

        // Requête pour obtenir les détails des groupes
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIDs);

        if (groupError) {
          throw groupError;
        }

        // Mise à jour de l'état avec les détails des groupes
        setUserGroups(groupData);
      } catch (error) {
        console.error('Erreur lors de la récupération des groupes de l\'utilisateur :', error.message);
      }
    };

    if (userID) {
      fetchUserGroups();
    }
  }, []);


  console.log(userGroups)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
  
          if (route.name === 'Biographie') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Aide') {
            iconName = focused ? 'help-circle' : 'help-circle-outline';
          } else if (route.name === 'Paramètres') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
  
          return <Ionicons name={iconName} size={size * 2} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 80, // Augmente la hauteur de la barre de navigation. Ajustez cette valeur selon vos besoins.
          paddingBottom: 5, // Ajustez cela si nécessaire pour centrer correctement les icônes/texte dans la nouvelle hauteur de barre
          paddingTop: 5, // Ajustement pour l'alignement vertical des icônes et du texte
        },
      })}
    >
      <Tab.Screen name="Biographie" component={BiographyScreen} initialParams={{ session: session }} />
      <Tab.Screen name="Aide" component={AideScreen} />
      <Tab.Screen name="Paramètres" component={ProfileScreen} initialParams={{ session: session }} />
 
     
    </Tab.Navigator>
  );
  
}

