import React, { useState } from 'react';
import { Button, TouchableOpacity, Text, Alert, StyleSheet, View, AppState, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import { globalStyles } from '../../global';

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState('');

  const translateErrorMessage = (message) => {
    if (message === 'User already registered') {
      return 'Un utilisateur est déjà enregistré avec cette adresse email';
    } else if (message === 'Invalid login credentials') {
      return 'Erreur dans l\'email ou dans le mot de passe';
    } else {
      return message;
    }
  };

  


  const validateForm = () => {
    if (!email || !password || !confirmPassword ) {
      setError('Veuillez remplir tous les champs.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return false;
    }
    setError('');
    return true;
  };

  const signInWithEmail = async () => {
    setLoading(true);
    setError('');
    console.log("Coucou !")
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.log("error : ",error)
      setError(translateErrorMessage(error.message));
    }
    setLoading(false);
  };

  const signUpWithEmail = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError('');

    const { user, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (signUpError) {
      console.log("error : ",error)
      setError(translateErrorMessage(signUpError.message));
      setLoading(false);
      return;
    }


    const { user_bis, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (signInError) {
      console.log("signInError : ",signInError)
      setError(translateErrorMessage(signInError.message));
      setLoading(false);
      return;
    }

    const session = await supabase.auth.getSession()
    const id_user = session.data.session.user.id
    
    const full_name = `${firstName} ${lastName}`;

    //console.log(firstName,lastName,full_name)
    //console.log(id_user)
    const { error: profileError } = await supabase.from('profiles').update({ username: firstName, full_name: full_name}).match({id: id_user   });


    if (profileError ) {
      console.log("Erreur lors de l'insertion du profil ou de l'utilisateur", profileError?.message);
      setError('Erreur lors de la création du profil. Veuillez réessayer.');
    } else {
      Alert.alert('Merci', 'Votre compte a bien été créé. Bienvenue dans la communauté BioScriptum !');
    }

    setLoading(false);
  };

  const resetPassword = async () => {
    if (!email) {
      setError('Veuillez entrer votre adresse email.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setError(translateErrorMessage(error.message));
    } else {
      Alert.alert('Réinitialisation de mot de passe', 'Un email de réinitialisation de mot de passe a été envoyé.');
    }
    setLoading(false);
  };

  return (
    <View style={globalStyles.container_center}>
      <View style={globalStyles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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

        <View>
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
        <View>
          <TouchableOpacity onPress={() => setIsSigningUp(!isSigningUp)} style={globalStyles.globalButton_wide}>
            <Text style={globalStyles.globalButtonText}>
              {isSigningUp ? "Vous avez déjà un compte ? Connectez-vous" : "Vous n'avez pas encore de compte ? Inscrivez-vous"}
            </Text>
          </TouchableOpacity>
        </View>
        {!isSigningUp && (
          <TouchableOpacity onPress={resetPassword} style={globalStyles.globalButton_wide}>
            <Text style={globalStyles.globalButtonText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
