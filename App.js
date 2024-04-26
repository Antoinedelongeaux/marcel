// import 'react-native-url-polyfill/auto';
window.global = window;
import React, { useState, useEffect } from 'react';
import { supabase } from './src/lib/supabase';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator'; // Assurez-vous que ce chemin est correct

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);
  

  return (
    <NavigationContainer>
      <AppNavigator session={session} />
    </NavigationContainer>
  );
}
