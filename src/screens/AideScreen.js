import React from 'react';
import { Image,View, Text, Button, Linking, StyleSheet,TouchableOpacity  } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from '../../global';


//import ArrowLeftIcon from '../../assets/icons/arrow-left-solid.svg';
import refresh from '../../assets/icons/refresh_black_24dp.svg';
import PersonIcon from '../../assets/icons/person.svg';
import BookIcon from '../../assets/icons/book.svg';
import HelpIcon from '../../assets/icons/help-circle.svg';
import trash from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import SettingsIcon from '../../assets/icons/settings.svg';
import LinkIcon from '../../assets/icons/link-solid.svg';
import expand_more from '../../assets/icons/expand_more_black_24dp.svg';
import expand_less from '../../assets/icons/expand_less_black_24dp.svg';
import edit from '../../assets/icons/pen-to-square-regular.svg';
import Svg, { Path } from 'react-native-svg';


const AideScreen = () => {

  const navigation = useNavigation();
  const phoneNumber = '+33669737164';

  const makeCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const sendSMS = () => {
    Linking.openURL(`sms:${phoneNumber}`);
  };


  const navigateToScreen = (screenName, params) => {
    navigation.navigate(screenName, params);
  };


  return (
    <View style={{ flex: 1, backgroundColor: "#E8FFF6" }}>

<View style={globalStyles.navigationContainer}>



      
      <TouchableOpacity onPress={() => navigateToScreen('ReadAnswersScreen')} style={globalStyles.navButton}>

    <Image source={BookIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => navigateToScreen('ProfileScreen')} style={globalStyles.navButton}>
        <Image source={PersonIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
      </TouchableOpacity>
  <TouchableOpacity onPress={() => navigateToScreen('AideScreen')} style={globalStyles.navButton}>
  <Image source={HelpIcon} style={{ width: 90, height: 90, opacity: 1 }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToScreen('ManageBiographyScreen')} style={globalStyles.navButton}>
      <Image source={SettingsIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
      </TouchableOpacity>
    </View>
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
