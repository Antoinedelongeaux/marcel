import React, { useState, useEffect } from 'react';
import { Button, TouchableOpacity, Text, Alert, StyleSheet, View, AppState, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import { globalStyles } from '../../global';
import { useParams } from 'react-router-dom'; // Importer useParams

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
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [isForgottenPassword, setIsForgottenPassword] = useState(false);
  const [isTokenPage,setTokenPage]=useState(false);
  const [error, setError] = useState('');
  //const { suffix } = useParams(); 


  const translateErrorMessage = (message) => {
    if (message === 'User already registered') {
      return 'Un utilisateur est déjà enregistré avec cette adresse email';
    } else if (message === 'Invalid login credentials') {
      return 'Erreur dans l\'email ou dans le mot de passe';
    } else {
      return message;
    }
  };

  /*
  useEffect(() => {
    if (suffix) {
      console.log("suffix : ", suffix);
      // Vérifie si le suffix commence par '#access_token=' et met à jour l'état isTokenPage
      if (suffix.startsWith('#access_token=')) {
        setTokenPage(true);
      } else {
        setTokenPage(false);
      }
    }
  }, [suffix]); 
  
  */

  useEffect(() => {
    const hash = window.location.hash; // Capturer le fragment de l'URL
    if (hash) {
      console.log("Hash : ", hash);
      // Vérifie si le fragment commence par '#access_token=' et met à jour l'état isTokenPage
      if (hash.startsWith('#access_token=')) {
        setTokenPage(true);
        console.log("access_token : ", hash.slice(14)); // Log du token, si besoin
      } else {
        setTokenPage(false);
      }
    }
  }, []); // Exécuter une seule fois au montage du composant
  

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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://bioscriptum.com',
    })

    if (error) {
      setError(translateErrorMessage(error.message));
    } else {
      Alert.alert('Réinitialisation de mot de passe', 'Un email de réinitialisation de mot de passe a été envoyé.');
    }
    setLoading(false);
  };

  async function updatePassword() {
    if ( !password || !confirmPassword ) {
      setError('Veuillez remplir tous les champs.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return false;
    }
    
    const { error } = await supabase.auth.updateUser({
      password: password,
    })
  
    if (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error.message)
    } else {
      console.log('Mot de passe mis à jour avec succès.')
    }
  }

  

  return (
    <View style={globalStyles.container_center}>
      <View style={globalStyles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        { !isTokenPage  && ( 
        <TextInput
          onChangeText={setEmail}
          value={email}
          style={globalStyles.input}
          keyboardType="email-address"
          placeholder="Adresse email"
          autoCapitalize="none"
        />
      )}
        { !isForgottenPassword && (
        <TextInput
          onChangeText={setPassword}
          value={password}
          style={globalStyles.input}
          secureTextEntry={true}
          placeholder="Mot de passe"
          autoCapitalize="none"
        />
        )}
        {(isSigningUp ||isTokenPage )   && !isForgottenPassword && (
          
            <TextInput
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              style={globalStyles.input}
              secureTextEntry={true}
              placeholder="Confirmation du mot de passe"
              autoCapitalize="none"
            />
         )}
        {isSigningUp && !isForgottenPassword && !isTokenPage && (
          <>
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
          {isSigningUp && !isForgottenPassword && !isTokenPage &&(
            <TouchableOpacity onPress={signUpWithEmail} disabled={loading} style={globalStyles.globalButton_wide}>
              <Text style={globalStyles.globalButtonText}>Créer un compte</Text>
            </TouchableOpacity>
          )} 
          { isSigningIn && !isForgottenPassword && !isTokenPage &&(
            <TouchableOpacity onPress={signInWithEmail} disabled={loading} style={globalStyles.globalButton_wide}>
              <Text style={globalStyles.globalButtonText}>Se connecter</Text>
            </TouchableOpacity>
          )}
          { isForgottenPassword && !isTokenPage && (
            <TouchableOpacity onPress={resetPassword} disabled={loading} style={globalStyles.globalButton_wide}>
              <Text style={globalStyles.globalButtonText}>M'envoyer un lien par email</Text>
            </TouchableOpacity>
          )}



        </View>
        {!isForgottenPassword && !isTokenPage &&(
        <View>
        
          <TouchableOpacity onPress={() => {setIsSigningUp(!isSigningUp);setIsSigningIn(!isSigningIn) }} style={globalStyles.globalButton_wide}>
            <Text style={globalStyles.globalButtonText}>
              {isSigningUp ? "Vous avez déjà un compte ? Connectez-vous" : "Vous n'avez pas encore de compte ? Inscrivez-vous"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
     
        {!isForgottenPassword && !isTokenPage && (
          <TouchableOpacity onPress={() => setIsForgottenPassword(true)} style={globalStyles.globalButton_wide}>
            <Text style={globalStyles.globalButtonText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        )}

        {isTokenPage && (
          <TouchableOpacity onPress={updatePassword} style={globalStyles.globalButton_wide}>
            <Text style={globalStyles.globalButtonText}>Changer mon mot de passe</Text>
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
