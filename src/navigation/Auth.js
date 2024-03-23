import React, { useState } from 'react'
import { Button,TouchableOpacity, Text, Alert, StyleSheet, View, AppState, TextInput } from 'react-native'
import { supabase } from '../lib/supabase'
import { globalStyles } from '../../global'

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return false;
    }
    return true;
  };

  const signInWithEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Sign In Error', error.message);
    setLoading(false);
  };
  async function signUpWithEmail() {
    if (!validateForm()) return;
    setLoading(true);

    const { user, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });


    if (signUpError) {
      Alert.alert('Sign Up Error', signUpError.message);
      setLoading(false);
      return;
    }
    const { user_bis, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (signInError) {
      Alert.alert('Sign In Error', signUpError.message);
      setLoading(false);
      return;
    }
    // Assuming the user is created successfully, now let's save their profile information



    const full_name = `${firstName} ${lastName}`




    const { error: userError } = await supabase.from('users').insert([{ last_name: lastName, first_name: firstName }]);
    const { error: profileError } = await supabase.from('profiles').upsert([{ username: firstName, full_name: full_name }]);

    if (profileError || userError) {
      console.log("Profile or User Insert Error", profileError?.message, userError?.message);
    } else {
      Alert.alert('Merci', 'Votre compte à bien été créé. Bienvenue sur dans la communauté Séléné !');
    }



    setLoading(false);
  }

  return (
    <View style={globalStyles.container_center}>
      <View style={globalStyles.form}>
        {/* Les champs Email et Mot de passe sont communs aux deux formulaires */}
        <TextInput
          onChangeText={setEmail}
          value={email}
          style={globalStyles.input}
          keyboardType="email-address"
          placeholder="Adresse email"
          autoCapitalize="none"
        />
        <TextInput
          onChangeText={setPassword}
          value={password}
          style={globalStyles.input}
          secureTextEntry={true}
          placeholder="Mot de passe"
          autoCapitalize="none"
        />

        {/* Afficher les champs supplémentaires pour l'inscription */}
        {isSigningUp && (
          <>
            <TextInput
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              style={globalStyles.input}
              secureTextEntry={true}
              placeholder="Confirmation du mot de passe"
              autoCapitalize="none"
            />
            <TextInput
              onChangeText={setFirstName}
              value={firstName}
              style={globalStyles.input}
              placeholder="Prénom"
              autoCapitalize="none"
            />
            <TextInput
              onChangeText={setLastName}
              value={lastName}
              style={globalStyles.input}
              placeholder="Nom"
              autoCapitalize="none"
            />
          </>
        )}

        {/* Boutons pour basculer entre les modes et soumettre le formulaire */}
        <View >
  {isSigningUp ? (
    <TouchableOpacity onPress={signUpWithEmail} disabled={loading} style={globalStyles.globalButton_wide}>
      <Text style={globalStyles.globalButtonText}>Créer un compte</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity onPress={signInWithEmail} disabled={loading} style={globalStyles.globalButton_wide}>
      <Text style={globalStyles.globalButtonText}>Se connecter</Text>
    </TouchableOpacity>
  )}
</View>
<View >
  <TouchableOpacity onPress={() => setIsSigningUp(!isSigningUp)} style={globalStyles.globalButton_wide}>
    <Text style={globalStyles.globalButtonText}>
      {isSigningUp ? "Vous avez déjà un compte ? Connectez-vous " : "Vous n'avez pas encore de compte ? Inscrivez-vous"}
    </Text>
  </TouchableOpacity>
</View>
      </View>
    </View>
  );
}