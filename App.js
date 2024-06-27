// App.js
import 'react-native-url-polyfill/auto';
window.global = window;
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './src/lib/supabase';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator'; 

export default function App() {
  const [session, setSession] = useState(null);
  const ref = useRef(null);

  const linking = {
    prefixes: ['http://localhost:8081', 'https://redesigned-parakeet-544gx7qrgqv2v9qj-8081.app.github.dev','https://marcel-eight.vercel.app/'],
    config: {
      screens: {
        InvitationScreen: 'invitation',
      },
    },
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <NavigationContainer ref={ref} linking={linking}>
      <AppNavigator session={session} />
    </NavigationContainer>
  );
}
