import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { getMemories_Question, submitMemories_Answer } from '../components/data_handling';
import { globalStyles } from '../../global'; // Assurez-vous que le chemin est correct

function MemoiresScreen({ route }) {
  const session = route.params.session;
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    getMemories_Question(session, setQuestion);
  }, [session]);

  const handleAnswerSubmit = () => {
    submitMemories_Answer(answer, question, session, () => {
      setAnswer(''); // Réinitialiser le champ de réponse
      getMemories_Question(session, setQuestion); // Récupérer une nouvelle question
    });
  };

  return (
    <View style={globalStyles.answer_container}>
      {question ? (
        <>
          <Text>{question.question}</Text>
          <TextInput
            style={globalStyles.answer_input}
            onChangeText={setAnswer}
            value={answer}
            placeholder="Votre réponse ici"
          />
          <Button title="Répondre" onPress={handleAnswerSubmit} />
        </>
      ) : (
        <Text>Nous n'avons pas trouvé de question sans réponse ...</Text>
      )}
    </View>
  );
}

// Styles restent inchangés

export default MemoiresScreen;

