import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {  Modal, Image,View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { globalStyles } from '../../global'; // Assurez-vous que le chemin est correct
import { getMemories_Question,save_question,getMemories_Questions_by_tags,get_chapters,join_question_to_chapter } from '../components/data_handling';
import { saveActiveSubjectId, getActiveSubjectId } from '../components/local_storage';
import { useFocusEffect } from '@react-navigation/native';
import ArrowLeftIcon from '../../assets/icons/arrow-left-solid.svg';

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
  const [isChapterModalVisible, setIsChapterModalVisible] = useState(false);
  const [chapters, setChapters] = useState([]);

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

  const handleAction = async () => {
    if (choice === 'newQuestion') {
      const savedQuestion = await save_question(userInput, tags, subject_active, setQuestion);
      setQuestion(savedQuestion);
      setIsChapterModalVisible(true); // Ouvrir la modale pour choisir un chapitre
    } else {
      navigateToScreen('AnswerQuestionScreen', { questionId: question.id });
    }
  };
  
  useEffect(() => {

    if(subject_active!== null ){
    const fetchChapters = async () => {
      const fetchedChapters = await get_chapters(subject_active,setChapters); // Adaptez cette ligne si nécessaire
      //setChapters(fetchedChapters);
    }
    fetchChapters();
    };
  
    
  }, [subject_active]);
  
  

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
    <View style={{ flex: 1, backgroundColor: "#E8FFF6" }}>
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.navigationContainer}>
      <TouchableOpacity onPress={() => navigateToScreen('ReadAnswersScreen')} style={styles.navButton}>
      <View>
      <Image source={ArrowLeftIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />

</View>
      </TouchableOpacity>
      <Text></Text>
    </View>
     
      <Text></Text>
      <Text></Text>


          <TextInput
            style={[globalStyles.answer_input]}
            placeholder={question.question ? question.question : "Définir le titre de votre chapitre ici"}
            value={userInput}
            onChangeText={text => setUserInput(text)}
            multiline={true}
            numberOfLines={4}
          />
          

        
      


   
   <TouchableOpacity
        style={globalStyles.globalButton_wide}
        onPress={handleAction}>
        <Text style={globalStyles.globalButtonText}>Enregistrer le titre du chapitre</Text>
      </TouchableOpacity>
    
<Text></Text>
<Text> </Text>
<View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
<Text> Quels thèmes seront abordés dans ce chapitre ?</Text>
</View>
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
    <Modal
  animationType="slide"
  transparent={true}
  visible={isChapterModalVisible}
  onRequestClose={() => {setIsChapterModalVisible(false);navigateToScreen('ReadAnswersScreen')}}
>
  <View style={styles.centeredView}>
    <View style={styles.modalView}>
    <ScrollView>
  {chapters && chapters.length > 0 ? (
    chapters.map((chapter) => (
      <TouchableOpacity
        key={chapter.id}
        onPress={() => {
          join_question_to_chapter(question.id, chapter.id);
          setIsChapterModalVisible(false);
          navigateToScreen('ReadAnswersScreen')
        }}
        style={styles.modalButton}
      >
        <Text style={styles.textStyle}>{chapter.title}</Text>
      </TouchableOpacity>
    ))
  ) : (
    <Text>Pas de chapitres disponibles.</Text>
  )}
</ScrollView>

      <TouchableOpacity
        onPress={() => {setIsChapterModalVisible(false);navigateToScreen('ReadAnswersScreen')}}
        style={[globalStyles.globalButton_narrow]}
      >
        <Text style={styles.textStyle}>Fermer</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0, // Supprimez toute marge qui pourrait avoir été définie
  },
  modalView: {
    width: '100%', // Largeur à 100% de l'écran
    height: '100%', // Hauteur à 100% de l'écran
    backgroundColor: "white",
    borderRadius: 0, // Optionnel : enlever les bordures arrondies pour un affichage plein écran
    padding: 20, // Ajustez le padding selon vos besoins
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalButton: {
    padding: 10,
    marginVertical: 10, // Ajustez pour l'espacement vertical des boutons
  },
  textStyle: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center"
  },
  buttonClose: {
    backgroundColor: "#2196F3", // Couleur du bouton fermer, à ajuster selon le thème de l'application
    padding: 10,
    elevation: 2,
    marginTop: 20 // Espacement avec les autres éléments
  }
  
});

export default AskQuestionScreen;
