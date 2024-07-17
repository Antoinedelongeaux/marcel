import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from '../../global';
import { saveActiveSubjectId, getActiveSubjectId } from '../components/local_storage';
import { useState, useEffect } from 'react'
import { getSubject } from '../components/data_handling';
import { useFocusEffect } from '@react-navigation/native';


function BiographyScreen() {
  const navigation = useNavigation();
  const [subject_active, setSubject_active] = useState(null);
  const [subject, setSubject] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchActiveSubjectId = async () => {
        var temp = null;
        temp = await getActiveSubjectId();
        setSubject_active(temp);
        if (temp != null) {
          const temp2 = await getSubject(temp);
          setSubject(temp2);
        }else {
          navigation.navigate('ManageBiographyScreen');
        }

      };

      fetchActiveSubjectId();

    }, [])
  );


  // Fonction pour naviguer vers une nouvelle page
  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };


  return (
    <View style={styles.container}>
      {subject_active != null && (<>

        <Text style={globalStyles.title}>{subject.title}</Text>


       


        <TouchableOpacity
          style={globalStyles.globalButton_wide}
          onPress={() => navigateToScreen('Marcel')}>
          <Text style={globalStyles.globalButtonText}>Consulter la biographie</Text>
        </TouchableOpacity>
        <Text></Text>
        <TouchableOpacity
          style={globalStyles.globalButton_wide}
          onPress={() => navigateToScreen('ManageBiographyScreen')}>
          <Text style={globalStyles.globalButtonText}>Gérer la biographie</Text>
        </TouchableOpacity>

      </>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around', // Modifier pour espacer les sections uniformément
    alignItems: 'center',
    flex: 1,

    paddingTop: 20,
    backgroundColor: "#E8FFF6",

  },
  section: {
    width: '80%', // Largeur des boutons pour une meilleure apparence
    padding: 20, // Espacement interne pour un toucher facile
    backgroundColor: '#f0f0f0', // Un léger fond pour distinguer les sections
    alignItems: 'center',
    borderRadius: 10, // Bordures arrondies pour l'esthétique
  },
  text: {
    fontSize: 16, // Taille de la police pour une meilleure lisibilité
  },
});

export default BiographyScreen;
