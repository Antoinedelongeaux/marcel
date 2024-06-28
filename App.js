import 'react-native-url-polyfill/auto';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './src/lib/supabase';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';

export default function App() {
  const [session, setSession] = useState(null);
  const ref = useRef(null);

  const linking = {
    prefixes: [
      'https://marcel-eight.vercel.app',
      'http://localhost:8081',
      'https://redesigned-parakeet-544gx7qrgqv2v9qj-8081.app.github.dev',
    ],
    config: {
      screens: {
        InvitationScreen: 'invitation/:id_invitation',
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
