
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
  getUserStatus,
  countSubjects,

} from './src/components/data_handling';
import {
  View,
  Text,
} from 'react-native';


const Stack = createStackNavigator();

function AppNavigator({ session }) {
  const navigation = useNavigation();
  const [check, setCheck] = useState({nature : 'en cours'});
  const [activeSubjectId, setActiveSubjectId] = useState(null); 
  const [subjectCount, setSubjectCount] = useState(-1); 
  const { suffix } = useParams(); // Utiliser useParams pour extraire le suffixe
  const [loading, setLoading] = useState(true);
  const [actionLaunch,setActionLaunch]= useState(false);

  

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
          if(!actionLaunch){

          setActionLaunch(true)
          // Rejoindre le projet et attendre la réussite
          console.log("Etape 1 :  s'associer au projet")
          await joinSubject(check.id_subject, session.user.id, true,check.Inspirer,check.Raconter,check.Reagir,check.Structurer, check.Rédiger,check.Relire,check.Publier,check.Lire);
          console.log("Etape 2 :  désactiver le lien d'association")
          // Si joinSubject a réussi, procéder avec les autres opérations
          await updateExistingLink(suffix, true);
          const temp = await getUserStatus(session.user.id,check.id_subject)
          await saveActiveSubjectUserStatus(temp)
          setLoading(false)
            setActionLaunch(false)
        }
          
        } catch (error) {
          // Gérer les erreurs ici
          console.error('Erreur lors de l\'exécution des actions :', error.message);
        }
      };
  
      joinSubjectAction();
    }
    if (session && session.user && check.nature!== 'subject') {
      const reachActiveSubject = async () => {
             
          // Rejoindre le projet et attendre la réussite
          
          const count = await countSubjects(session.user.id); 
          setSubjectCount(count)
          setLoading(false)
      };
  
      reachActiveSubject();
    }

  }, [check, session]);

  


  
 
  if (loading && session && (session.user || subjectCount===-1) ){

    return (
      <View >
        <Text>Veuillez rafraichir la page...</Text>
      </View>
    );
  }
  



  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={subjectCount===0 ?  "Projets":"Orientation"}>


      {check.nature==='question' ? (
        
        <Stack.Screen name="AnswerQuestionScreen" component={AnswerQuestionScreen} initialParams={{ questionId : check.id_question }}/>
        
      ):(

<>
      {session && session.user ? (
        <>
        {subjectCount===0?  (<> 
          
          <Stack.Screen name="Projets" component={ManageBiographyScreen} initialParams={{ session }} />
          <Stack.Screen name="Profil" component={ProfileScreen} initialParams={{ session }} />
     
          
          </>) :(<> 

          <Stack.Screen name="Orientation" component={OrientationScreen} initialParams={{ session }} />
          <Stack.Screen name="Marcel" component={ReadAnswersScreen} initialParams={{ session }} />
          <Stack.Screen name="Account" component={Account} initialParams={{ session }} />
          <Stack.Screen name="Incipit" component={ReadNotesScreen} initialParams={{ session }} />  
          <Stack.Screen name="Notes" component={NoteScreen} initialParams={{ session }} />
          <Stack.Screen name="Profil" component={ProfileScreen} initialParams={{ session }} />
          <Stack.Screen name="Projets" component={ManageBiographyScreen} initialParams={{ session }} />
          <Stack.Screen name="AskQuestionScreen" component={AskQuestionScreen} initialParams={{ session }} />
          <Stack.Screen name="EditChapterScreen" component={EditChapterScreen} initialParams={{ session }} />
          <Stack.Screen name="AnswerQuestionScreen" component={AnswerQuestionScreen} initialParams={{ session }} />
          </>) }
        
        
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
