import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useParams } from 'react-router-dom'; // Importer useParams
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

const Stack = createStackNavigator();

function AppNavigator({ session }) {
  const { suffix } = useParams(); // Utiliser useParams pour extraire le suffixe
  console.log("suffix : ", suffix);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
      <Stack.Screen name="InvitationScreen" component={InvitationScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
