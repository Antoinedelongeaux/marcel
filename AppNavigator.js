
import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useParams } from 'react-router-dom'; // Importer useParams
import { useNavigation } from '@react-navigation/native';
import Auth from './src/navigation/Auth';
import Account from './src/navigation/Account';
import BiographyScreen from './src/screens/BiographyScreen';
import AskQuestionScreen from './src/screens/AskQuestionScreen';
import AnswerQuestionScreen from './src/screens/AnswerQuestionScreen';
import AideScreen from './src/screens/AideScreen';
import EditChapterScreen from './src/screens/EditChapterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ReadAnswersScreen from './src/screens/ReadAnswersScreen';
import ManageBiographyScreen from './src/screens/ManageBiography';
import NoteScreen from './src/screens/NoteScreen';
import InvitationScreen from './src/screens/InvitationScreen';
import { saveActiveSubjectId } from './src/components/local_storage';
import {
  linkAnalysis,
  updateExistingLink,
  joinSubject,
  remember_active_subject,
  get_Profile

} from './src/components/data_handling';
import {
  View,
  Text,
} from 'react-native';


const Stack = createStackNavigator();

function AppNavigator({ session }) {
  const navigation = useNavigation();
  const [check, setCheck] = useState({nature : 'en cours'});
  const { suffix } = useParams(); // Utiliser useParams pour extraire le suffixe
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {

    if(suffix){
    const fetchSuffixData= async () => {
      setCheck(await linkAnalysis(suffix));
    
     
    };
  
    fetchSuffixData();
  }

  }, [suffix]);
  
  

  useEffect(() => {
    if (session && session.user && check.nature === 'subject') {
      const joinSubjectAction = async () => {
        try {
          // Rejoindre le projet et attendre la réussite
          console.log("Etape 1 :  s'associer au projet")
          await joinSubject(check.id_subject, session.user.id, true);
          console.log("Etape 2 :  désactiver le lien d'association")
          // Si joinSubject a réussi, procéder avec les autres opérations
          await updateExistingLink(suffix, true);
          console.log("Etape 3 :  mettre à jour le projet actif du user")
          await remember_active_subject(check.id_subject, session.user.id);
          console.log("Etape 4 :  enregister le projet actif dans le navigateur...",check.id_subject)
          await saveActiveSubjectId(check.id_subject);
          
        } catch (error) {
          // Gérer les erreurs ici
          console.error('Erreur lors de l\'exécution des actions :', error.message);
        }
      };
  
      joinSubjectAction();
    }
    if (session && session.user && check.nature!== 'subject') {
      const reachActiveSubject = async () => {
        try {
          // Rejoindre le projet et attendre la réussite
          console.log("Etape A :  chercher les infos de profil utilisateur")
          const profile = await get_Profile( session.user.id);
           if (profile.active_biography){ 
            console.log("Etape B :  enregister le projet actif dans le navigateur...", profile.active_biography)
          await saveActiveSubjectId(profile.active_biography);
        }
        setLoading (false)
        } catch (error) {
          // Gérer les erreurs ici
          console.error('Erreur lors de l\'exécution des actions :', error.message);
        }
      };
  
      reachActiveSubject();
    }

  }, [check, session]);
  

 
  if (loading) {
    return (
      <View >
        <Text>Loading...</Text>
      </View>
    );
  }



  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {check.nature==='question' ? (
        
        <Stack.Screen name="AnswerQuestionScreen" component={AnswerQuestionScreen} initialParams={{ questionId : check.id_question }}/>
        
      ):(

<>
      {session && session.user ? (
        <>
          <Stack.Screen name="Account" component={Account} initialParams={{ session }} />
          <Stack.Screen name="Notes" component={NoteScreen} initialParams={{ session }} />
          <Stack.Screen name="BiographyScreen" component={BiographyScreen} />
          <Stack.Screen name="AideScreen" component={AideScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} initialParams={{ session }} />
          <Stack.Screen name="Projets" component={ManageBiographyScreen} initialParams={{ session }} />
          <Stack.Screen name="Marcel" component={ReadAnswersScreen} initialParams={{ session }} />
          <Stack.Screen name="AskQuestionScreen" component={AskQuestionScreen} initialParams={{ session }} />
          <Stack.Screen name="EditChapterScreen" component={EditChapterScreen} initialParams={{ session }} />
          <Stack.Screen name="AnswerQuestionScreen" component={AnswerQuestionScreen} initialParams={{ session }} />

        </>
      ) : (
        <Stack.Screen name="Auth" component={Auth} />
      )}
    </>
    )}
    
      <Stack.Screen name="InvitationScreen" component={InvitationScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
