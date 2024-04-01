import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {  Modal, TextInput,Alert, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getMemories_Questions,getMemories_Answers_to_Question ,get_chapters,join_question_to_chapter,create_chapter} from '../components/data_handling';
import { useFocusEffect } from '@react-navigation/native';
import { getActiveSubjectId } from '../components/local_storage';
import { globalStyles } from '../../global';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function ReadQuestionsScreen({ route }) {
  const navigation = useNavigation();
  const session = route.params.session;
  const [questions, setQuestions] = useState([]);
  const [subject_active, setSubject_active] = useState(null);
  // Assurez-vous que "posée par un proche" est un choix possible dès le départ si nécessaire
  const [tags, setTags] = useState(["Famille", "Vie professionnelle", "Vie personnelle", "Hobbies & passions", "Valeurs", "Voyages", "Autre"]);
  const allTags = ["Famille", "Vie professionnelle", "Vie personnelle", "Hobbies & passions", "Valeurs", "Voyages", "Autre"];
  const [personal, setPersonal] = useState(false);
  const [activeQuestionAnswers, setActiveQuestionAnswers] = useState({});
  const [chapters, setChapters] = useState([]);
  const [openChapters, setOpenChapters] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
 const [newChapterTitle, setNewChapterTitle] = useState('');


  useEffect(() => {
    if (subject_active != null) {
      getMemories_Questions(subject_active, setQuestions, tags, personal);
      get_chapters(subject_active, setChapters);
    }
  }, [subject_active, tags, personal]);

  const toggleChapter = (chapterId) => {
    setOpenChapters(prevOpenChapters => ({
      ...prevOpenChapters,
      [chapterId]: !prevOpenChapters[chapterId],
    }));
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchActiveSubjectId = async () => {
        const temp = await getActiveSubjectId();
        setSubject_active(temp);
      };
      fetchActiveSubjectId();
      if (session && subject_active != null) {
        getMemories_Questions(subject_active, setQuestions, tags, personal);
        get_chapters(subject_active, setChapters);
      }
    }, [session, subject_active, tags, personal])
  );

    // Fonction pour naviguer vers une nouvelle page
    const navigateToScreen = (screenName) => {
      navigation.navigate(screenName);
    };
  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
      // Ajouter une vérification spécifique pour le tag "posée par un proche"
      if (tag === "posée par un proche") {
        setPersonal(!personal); // Réinitialiser à false si le tag est désélectionné
      }
    } else {
      setTags([...tags, tag]);
      // Si le tag "posée par un proche" est ajouté, ajustez setPersonal et rappelez getMemories_Question
      if (tag === "posée par un proche") {
        setPersonal(!personal); // Mettre à jour personal à true
        // Assurez-vous que les autres paramètres requis par getMemories_Question sont corrects
        getMemories_Questions(subject_active, setQuestions, tags, personal);
        get_chapters(subject_active, setChapters);
      }
    }
  };
  
  const handleJoinQuestionToChapter = async (id_question, id_chapter) => {
    console.log(`Associating question ${id_question} to chapter ${id_chapter}`); // Débogage
    await join_question_to_chapter(id_question, id_chapter);

    getMemories_Questions(subject_active, setQuestions, tags, personal);
  };


  const handleAssociateQuestion = (questionId) => {

    if (chapters.length === 0) {
      // Affichez une alerte ou un message si aucune donnée de chapitre n'est disponible
      Alert.alert("Aucun chapitre disponible", "Veuillez d'abord créer des chapitres.");
      return;
    }
  
    const chapterButtons = chapters.map((chapter) => ({
      text: chapter.title,
      onPress: () => handleJoinQuestionToChapter(questionId, chapter.id),
    }));
  
    Alert.alert("Associer à un chapitre", "Choisissez le chapitre:", [
      ...chapterButtons,
      { text: "Annuler", style: "cancel" },
    ]);
  };



const toggleAnswersDisplay = async (questionId) => {
  if (activeQuestionAnswers[questionId]) {
    // Si les réponses sont déjà affichées, les masquer
    setActiveQuestionAnswers(prev => ({ ...prev, [questionId]: undefined }));
  } else {
    // Sinon, récupérer et afficher les réponses
    const answers = await getMemories_Answers_to_Question(questionId); // Assurez-vous que cette fonction renvoie les réponses
    if (answers) {
      setActiveQuestionAnswers(prev => ({ ...prev, [questionId]: answers }));
    }
  }
};


  return (
    <>

<View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.contentContainer}>
<View style={styles.navigationContainer}>
      <TouchableOpacity onPress={() => navigateToScreen('BiographyScreen')} style={styles.navButton}>
        <FontAwesome name="arrow-left" size={28} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToScreen('AskQuestionScreen')} style={styles.navButton}>
        <MaterialIcons name="question-answer" size={28} color="black" />
      </TouchableOpacity>
    </View>

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
      <View style={styles.questionsContainer}>
      {questions?.length > 0 ? 
       <>
       {[{ id: null, title: "Non Chapitré" }, ...chapters].map((chapter) => (
         <View key={chapter.id ? chapter.id : "non-chapitre"}>
           <TouchableOpacity onPress={() => toggleChapter(chapter.id)}>
             <Text style={globalStyles.title}>{chapter.title}</Text>
           </TouchableOpacity>
           {openChapters[chapter.id] && questions.filter(q => q.id_chapitre === chapter.id).map((question) => (
             <View key={question.id} style={styles.questionCard}>
               <Text style={styles.questionText}>{question.question}</Text>
    
               <TouchableOpacity onPress={() => handleAssociateQuestion(question.id)} style={styles.associateButton}>
                 <FontAwesome name="link" size={24} color="black" />
               </TouchableOpacity>

               <Text style={styles.answersCount}>
         
      {question.answers_count} réponses
    </Text>
    {/* Assurez-vous que cette partie est correctement rendue et que le TouchableOpacity est accessible */}
    <TouchableOpacity 
      onPress={() => toggleAnswersDisplay(question.id)} 
      style={styles.toggleAnswersButton}
    >
      <MaterialIcons name="expand-more" size={24} color="black" />
    </TouchableOpacity>
               {activeQuestionAnswers[question.id] && activeQuestionAnswers[question.id].map((answer, answerIndex) => (
                 <View key={answerIndex} style={styles.answerContainer}>
                   <Text style={styles.answerDateText}>
              Répondu le : {new Date(answer.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            <Text style={styles.answerText}>{answer.answer}</Text>
            {answerIndex < activeQuestionAnswers[question.id]?.length - 1 && (
              <View style={styles.separator} />
            )}
                 </View>
               ))}
             </View>
           ))}
         </View>
       ))}
     </>
      
      : <Text>Aucune question trouvée.</Text>}

      </View>
      


    </ScrollView>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
    <TouchableOpacity
  style={globalStyles.globalButton_narrow}
  onPress={() => setIsModalVisible(true)}
>
  <Text style={globalStyles.globalButtonText}>Nouveau Chapitre</Text>
</TouchableOpacity>

<TouchableOpacity
  style={globalStyles.globalButton_narrow}
  onPress={() => navigateToScreen('AskQuestionScreen')}
>
  <Text style={globalStyles.globalButtonText}>Nouvelle Question</Text>
</TouchableOpacity>



</View>

<Text></Text>

    </View>
    <Modal
  animationType="slide"
  transparent={true}
  visible={isModalVisible}
  onRequestClose={() => {
    setIsModalVisible(!isModalVisible);
  }}
>
  <View style={styles.centeredView}>
    <View style={styles.modalView}>
      <Text style={styles.modalText}>Nouveau Chapitre</Text>
      <TextInput
        style={styles.modalInput}
        onChangeText={setNewChapterTitle}
        value={newChapterTitle}
        placeholder="Titre du chapitre"
      />
      <TouchableOpacity
        style={[globalStyles.globalButton_wide]}
        onPress={() => {
          create_chapter(newChapterTitle, subject_active);
          setIsModalVisible(!isModalVisible);
          setNewChapterTitle(''); 
          get_chapters(subject_active, setChapters);
        }}
      >
        <Text style={globalStyles.globalButtonText}>Créer</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  navButton: {
    padding: 10,
  },
  tagButton: {
    margin: 5,
    padding: 10,
    borderRadius: 20,
  },
  selectedTag: {
    backgroundColor: 'skyblue',
  },
  unSelectedTag: {
    backgroundColor: '#dedede',
  },
  tagButtonText: {
    fontSize: 16,
  },
  questionsContainer: {
    marginTop: 20,
  },
  questionContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'lightgrey',
  },
  questionText: {
    fontSize: 18,
  },
  answersCount: {
    fontWeight: 'bold',
  },
  answerText: {
    fontSize: 16,
    marginLeft: 20, // Un peu d'indentation pour les distinguer des questions
  },
  separator: {
    height: 1,
    backgroundColor: "#CCCCCC",
    marginVertical: 10,
  },
  answerCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  answerDateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  answerContainer: {
    paddingVertical: 10,
  },
  joinButton: {
    marginTop: 10,
    backgroundColor: 'skyblue',
    padding: 10,
    borderRadius: 5,
  },
  joinButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  associateButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  

  // pour ne pas bloquer le bouton par la barre de navigation
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Augmentez le padding en bas
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  modalInput: {
    marginBottom: 15,
    borderWidth: 1,
    width: "100%",
    padding: 10,
    borderRadius: 5,
    borderColor: "gray"
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonClose: {
    backgroundColor: "#2196F3"
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  
  
});

export default ReadQuestionsScreen;