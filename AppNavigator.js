
import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useParams } from 'react-router-dom'; // Importer useParams
import { useNavigation } from '@react-navigation/native';
import Auth from './src/navigation/Auth';
import Account from './src/navigation/Account';
import AskQuestionScreen from './src/screens/AskQuestionScreen';
import AnswerQuestionScreen from './src/screens/AnswerQuestionScreen';
import EditChapterScreen from './src/screens/EditChapterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ReadAnswersScreen from './src/screens/ReadAnswersScreen';
import ReadNotesScreen from './src/screens/ReadNotesScreen';
import OrientationScreen from './src/screens/OrientationScreen';
import ManageBiographyScreen from './src/screens/ManageBiography';
import NoteScreen from './src/screens/NoteScreen';
import { saveActiveSubjectId,getActiveSubjectId, saveActiveSubjectUserStatus,getActiveSubjectUserStatus } from './src/components/local_storage';
import {
  linkAnalysis,
  updateExistingLink,
  joinSubject,
  remember_active_subject,
  get_Profile,
  getUserStatus

} from './src/components/data_handling';
import {
  View,
  Text,
} from 'react-native';


const Stack = createStackNavigator();

function AppNavigator({ session }) {
  const navigation = useNavigation();
  const [check, setCheck] = useState({nature : 'en cours'});
  const[activeSubjectId,setActiveSubjectId]= useState();
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

          const temp = await getUserStatus(session.user.id,check.id_subject)
          await saveActiveSubjectUserStatus(temp)
          setLoading(false)
          
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
          const profile = await get_Profile( session.user.id);
           if (profile.active_biography){ 
            setActiveSubjectId(profile.active_biography)
            const temp = await getUserStatus(session.user.id,profile.active_biography)
            await saveActiveSubjectId(profile.active_biography);
            await saveActiveSubjectUserStatus(temp)
            setLoading(false)

        }
        
        } catch (error) {
          // Gérer les erreurs ici
          console.error('Erreur lors de l\'exécution des actions :', error.message);
        }
      };
  
      reachActiveSubject();
    }else{
      setLoading(false)

    }

  }, [check, session]);

  

 
  if (loading && session && session.user ){

    return (
      <View >
        <Text>Veuillez rafraichir la page...</Text>
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
        {activeSubjectId?  (<> 
          <Stack.Screen name="Orientation" component={OrientationScreen} initialParams={{ session }} />
          <Stack.Screen name="Marcel" component={ReadAnswersScreen} initialParams={{ session }} />
          <Stack.Screen name="Account" component={Account} initialParams={{ session }} />
          <Stack.Screen name="Incipit" component={ReadNotesScreen} initialParams={{ session }} />  
          <Stack.Screen name="Notes" component={NoteScreen} initialParams={{ session }} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} initialParams={{ session }} />
          <Stack.Screen name="Projets" component={ManageBiographyScreen} initialParams={{ session }} />
          <Stack.Screen name="AskQuestionScreen" component={AskQuestionScreen} initialParams={{ session }} />
          <Stack.Screen name="EditChapterScreen" component={EditChapterScreen} initialParams={{ session }} />
          <Stack.Screen name="AnswerQuestionScreen" component={AnswerQuestionScreen} initialParams={{ session }} />
          </>) : (<> 
          <Stack.Screen name="Projets" component={ManageBiographyScreen} initialParams={{ session }} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} initialParams={{ session }} />
     
          
          </>)}
        
        
        </>
      ) : (
        <Stack.Screen name="Auth" component={Auth} />
      )}
    </>
    )}
    

    </Stack.Navigator>
  );
}

export default AppNavigator;
