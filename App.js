import 'react-native-url-polyfill/auto';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './src/lib/supabase';
import { NavigationContainer } from '@react-navigation/native';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppNavigator from './AppNavigator';
import { HashRouter as Router } from 'react-router-dom';


export default function App() {
  const [session, setSession] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <BrowserRouter> {/* Envelopper NavigationContainer avec BrowserRouter */}
      <NavigationContainer ref={ref}>
        <Routes> {/* Utiliser Routes pour définir les itinéraires */}
          <Route path="/*" element={<AppNavigator session={session} />} /> {/* Définir un itinéraire global */}
          <Route path="/:suffix/*" element={<AppNavigator session={session} />} /> {/* Définir un itinéraire avec suffix */}
        </Routes>
      </NavigationContainer>
    </BrowserRouter>
  );
}
