import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { globalStyles } from '../../global'; // Assurez-vous que le chemin est correct
import { getMemories_Question,save_question,getMemories_Questions_by_tags } from '../components/data_handling';
import { saveActiveSubjectId, getActiveSubjectId } from '../components/local_storage';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

function AskQuestionScreen({ route }) {
  const navigation = useNavigation();
  const session = route.params.session;
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState('');
  const [owner, setOwner] = useState(null);
  const [tags, setTags] = useState([""]);
  const [subject_active, setSubject_active] = useState(null);
  const [choice, setChoice] = useState('newQuestion'); // 'newQuestion' ou 'existingQuestion'
  const [personal, setPersonal] = useState(true);
  const [inspirationClicked, setInspirationClicked] = useState(false);
  const [userInput, setUserInput] = useState('');


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

  const handleAction = () => {
    if (choice === 'newQuestion') {
      console.log("questionId: ",question.id )
      save_question(userInput, tags, subject_active, setQuestion).then((savedQuestion) => {
        navigateToScreen('AnswerQuestionScreen', { questionId: savedQuestion.id });
      }).catch(error => console.error(error));
    } else {
      console.log("questionId: ",question.id )
      navigateToScreen('AnswerQuestionScreen', { questionId: question.id });
    }
  };
  


  const navigateToScreen = (screenName, params) => {
    navigation.navigate(screenName, params);
  };

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  useEffect(() => {
    if (choice === 'newQuestion') {
      setQuestion(''); // Réinitialiser question à une chaîne vide pour une nouvelle question
      setUserInput(''); // Réinitialiser également userInput
      setPersonal(false);
    } else {
      setPersonal(true);
    }
  }, [choice]);




  
 

  useEffect(() => {

    setInspirationClicked(true);
    getMemories_Questions_by_tags((questions) => {
      setQuestions(questions); // Mise à jour de l'état question avec l'objet question
    }, tags);

  }, [tags]);



  

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.navigationContainer}>
      <TouchableOpacity onPress={() => navigateToScreen('ReadAnswersScreen')} style={styles.navButton}>
        <FontAwesome name="arrow-left" size={28} color="black" />
      </TouchableOpacity>
      <Text></Text>
    </View>
     
      <Text></Text>
      <Text></Text>


          <TextInput
            style={[globalStyles.answer_input]}
            placeholder={question.question ? question.question : "Définir le titre de votre note ici"}
            value={userInput}
            onChangeText={text => setUserInput(text)}
            multiline={true}
            numberOfLines={4}
          />
          

        
      


   
   <TouchableOpacity
        style={globalStyles.globalButton_wide}
        onPress={handleAction}>
        <Text style={globalStyles.globalButtonText}>Enregistrer le titre de la note </Text>
      </TouchableOpacity>
    
<Text></Text>
<Text></Text>



      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            {allTags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[globalStyles.globalButton_tag, tags.includes(tag) ? {} : styles.unSelectedTag]}
                onPress={() => toggleTag(tag)}>
                <Text style={globalStyles.globalButtonText_tag}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>


          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>

</View>

 


      {questions.length > 0 && (
  <View style={{marginBottom: 20}}>
    {questions.map((questionItem, i) => (
      <TouchableOpacity
        key={i}
        style={styles.questionContainer}
        onPress={() => setUserInput(questionItem.question)}>
        <Text>{questionItem.question}</Text>
      </TouchableOpacity>
    ))}
  </View>
)}


    </ScrollView>

    
  );
}

const styles = StyleSheet.create({
  unSelectedTag: {
    backgroundColor: '#dedede', // Changez la couleur selon votre thème
  },
  choiceSelected: {
    flex: 1, 
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'blue', // Ajustez la couleur selon votre thème
  },
  choiceUnselected: {
    flex: 1,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  choiceTextSelected: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  choiceTextUnselected: {
    textAlign: 'center', 
    color: 'grey',
  },
  navigationContainer: {
    flexDirection: 'row', // Organise les éléments enfants en ligne
    justifyContent: 'space-between', // Distribue l'espace entre les éléments enfants
    padding: 10, // Ajoute un peu de padding autour pour éviter que les éléments touchent les bords
  },
  navButton: {
    // Style pour les boutons de navigation
    padding: 10, // Ajoute un peu de padding pour rendre le touchable plus grand
    // Ajoutez d'autres styles ici selon le design souhaité
    alignItems: 'center', // Centre le contenu (l'icône) du bouton
  },
  questionContainer: {
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 10,
  },
  
});

export default AskQuestionScreen;
