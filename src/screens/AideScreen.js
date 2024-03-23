import React from 'react';
import { View, Text, Button, Linking, StyleSheet,TouchableOpacity  } from 'react-native';

import { globalStyles } from '../../global';

const AideScreen = () => {
  const phoneNumber = '+33669737164';

  const makeCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const sendSMS = () => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  return (
    <View style={styles.container}>
        <Text></Text>
        <TouchableOpacity
          style={globalStyles.globalButton_wide}
          onPress={makeCall} >
          <Text style={globalStyles.globalButtonText}>Appeler le support</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={globalStyles.globalButton_wide}
          onPress={sendSMS} >
          <Text style={globalStyles.globalButtonText}>Envoyer un SMS au support</Text>
        </TouchableOpacity>
        <Text></Text>

    
    </View>
  );
};

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

export default AideScreen;
