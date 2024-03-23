import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { globalStyles } from '../../global'; // Assurez-vous que le chemin est correct
import { save_question } from '../components/data_handling';
import { saveActiveSubjectId, getActiveSubjectId } from '../components/local_storage';
import { useFocusEffect } from '@react-navigation/native';

function AskQuestionScreen() {
  const [question, setQuestion] = useState('');
  const [tags, setTags] = useState(["Famille"]);
  const [subject_active, setSubject_active] = useState(null);

  const allTags = ["Famille", "Vie professionnelle", "Vie personnelle", "Hobbies & passions", "Valeurs", "Voyages", "Autre"];

  useFocusEffect(
    React.useCallback(() => {
      const fetchActiveSubjectId = async () => {
        const temp = await getActiveSubjectId();
        setSubject_active(temp);
      };
      fetchActiveSubjectId();
    }, [])
  );

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <View style={globalStyles.answer_container}>
      <TextInput
        style={globalStyles.answer_input}
        placeholder="Posez votre question ici"
        value={question}
        onChangeText={setQuestion}
        multiline={true}
        numberOfLines={8} // Définit le nombre initial de lignes à trois
      />
      <Text></Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        {allTags.map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={[globalStyles.globalButton_tag, tags.includes(tag) ? {} : styles.unSelectedTag]}
            onPress={() => toggleTag(tag)}>
            <Text style={globalStyles.globalButtonText_tag}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text></Text>
      <TouchableOpacity
        style={globalStyles.globalButton_wide}
        onPress={() => save_question(question, tags, subject_active)}>
        <Text style={globalStyles.globalButtonText}>Poser la question</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  unSelectedTag: {
    backgroundColor: '#dedede', // Changez la couleur selon votre thème
  },
});

export default AskQuestionScreen;
