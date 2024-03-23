// AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Auth from './src/navigation/Auth';
import Account from './src/navigation/Account';
import BiographyScreen from './src/screens/BiographyScreen';
import AskQuestionScreen from './src/screens/AskQuestionScreen';
import AnswerQuestionScreen from './src/screens/AnswerQuestionScreen';
import AideScreen from './src/screens/AideScreen';
import ReadAnswersScreen from './src/screens/ReadAnswersScreen';


// Importez d'autres écrans nécessaires

const Stack = createStackNavigator();

function AppNavigator({ session }) {

  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
    }}>
      {
        session && session.user ?
          (
            // Utilisateur connecté, afficher l'écran de compte et les autres écrans de l'app
            <>
              <Stack.Screen name="Account" component={Account} initialParams={{ session }} />
              <Stack.Screen name="BiographyScreen" component={BiographyScreen} />
              <Stack.Screen name="AideScreen" component={AideScreen} />
              
              <Stack.Screen name="ReadAnswersScreen" component={ReadAnswersScreen} initialParams={{ session: session }}/>
              <Stack.Screen name="AskQuestionScreen" component={AskQuestionScreen} />
              <Stack.Screen name="AnswerQuestionScreen" component={AnswerQuestionScreen} initialParams={{ session: session }} />

            </>
          ) :
          (
            // Utilisateur non connecté, afficher l'écran d'authentification
            <Stack.Screen name="Auth" component={Auth} />
          )
      }
    </Stack.Navigator>
  );
}

export default AppNavigator;



