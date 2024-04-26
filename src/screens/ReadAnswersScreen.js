import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Image, Modal, TextInput, Alert, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getSubject, getMemories_Questions, getMemories_Answers_to_Question, get_chapters, join_question_to_chapter, create_chapter, delete_chapter, edit_chapter, delete_question } from '../components/data_handling';
import { useFocusEffect } from '@react-navigation/native';
import { getActiveSubjectId } from '../components/local_storage';
import { globalStyles } from '../../global';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BookIcon from '../../assets/icons/book.svg';
//import ArrowLeftIcon from '../../assets/icons/arrow-left-solid.svg';
import refresh from '../../assets/icons/refresh_black_24dp.svg';
import PersonIcon from '../../assets/icons/person.svg';
import help from '../../assets/icons/help-circle.svg';
import trash from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import settings from '../../assets/icons/settings.svg';
import LinkIcon from '../../assets/icons/link.png';
import expand_more from '../../assets/icons/expand_more_black_24dp.svg';
import expand_less from '../../assets/icons/expand_less_black_24dp.svg';
import edit from '../../assets/icons/pen-to-square-regular.svg';
import Svg, { Path } from 'react-native-svg';





function ReadQuestionsScreen({ route }) {
  const navigation = useNavigation();
  const session = route.params.session;
  const [questions, setQuestions] = useState([]);
  const [subject_active, setSubject_active] = useState(null);
  // Assurez-vous que "posée par un proche" est un choix possible dès le départ si nécessaire
  const [tags, setTags] = useState(["Famille", "Vie professionnelle", "Vie personnelle", "Hobbies & passions", "Valeurs", "Voyages", "Autre", ""]);
  const allTags = ["Famille", "Vie professionnelle", "Vie personnelle", "Hobbies & passions", "Valeurs", "Voyages", "Autre"];
  const [personal, setPersonal] = useState(false);
  const [activeQuestionAnswers, setActiveQuestionAnswers] = useState({});
  const [chapters, setChapters] = useState([]);
  const [openChapters, setOpenChapters] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [isChapterModalVisible, setIsChapterModalVisible] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editChapterId, setEditChapterId] = useState(null);
  const [editChapterTitle, setEditChapterTitle] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletionDetails, setDeletionDetails] = useState({ id: null, isChapter: true });


  const [subject, setSubject] = useState([]);

  const Icon = ({ color }) => (
    <Svg width="60" height="60" viewBox="0 0 24 24">
      <Path fill={color} d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" />
    </Svg>
  );


  useFocusEffect(
    React.useCallback(() => {
      const fetchActiveSubjectId = async () => {
        var temp = null;
        temp = await getActiveSubjectId();
        setSubject_active(temp);
        if (temp != null) {
          const temp2 = await getSubject(temp);
          setSubject(temp2);
        } else {
          navigation.navigate('ManageBiographyScreen');
        }

      };

      fetchActiveSubjectId();

    }, [])
  );



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
  const navigateToScreen = (screenName, params) => {
    navigation.navigate(screenName, params);
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
      Alert.alert("Aucun chapitre disponible", "Veuillez d'abord créer des chapitres.");
      return;
    }
    setSelectedQuestionId(questionId);
    setIsChapterModalVisible(true);
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


  const confirmDeletion = (id, isChapter = true) => {
    setDeletionDetails({ id: id, isChapter: isChapter });
    setDeleteModalVisible(true);

  };


  const refreshPage = async () => {
    if (subject_active != null) {
      // Récupérer les questions liées au sujet actif
      await getMemories_Questions(subject_active, setQuestions, tags, personal);

      // Récupérer les chapitres liés au sujet actif
      await get_chapters(subject_active, setChapters);

      // Optionnellement, vous pourriez vouloir réinitialiser d'autres états si nécessaire
      setActiveQuestionAnswers({});  // Réinitialise les réponses affichées si elles sont gérées localement
    } else {
      Alert.alert("Erreur", "Aucun sujet actif sélectionné. Veuillez sélectionner un sujet pour rafraîchir les données.");
    }
  };


  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.navigationContainer}>
        <TouchableOpacity onPress={refreshPage} style={styles.navButton}>
          {/* <FontAwesome name="refresh" size={60} color="tomato" /> */}
          <Image source={BookIcon} style={{ width: 60, height: 60, opacity: 1 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToScreen('ProfileScreen')} style={styles.navButton}>
          <Image source={PersonIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToScreen('AideScreen')} style={styles.navButton}>
          <Image source={help} style={{ width: 60, height: 60, opacity: 0.5 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToScreen('ManageBiographyScreen')} style={styles.navButton}>
          <Image source={settings} style={{ width: 60, height: 60, opacity: 0.5 }} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={refreshPage} style={{position: 'absolute', bottom: 30, right : 40}}>
        {/* <FontAwesome name="refresh" size={60} color="tomato" /> */}
        <Image source={refresh} style={{ width: 60, height: 60, opacity: 1 }} />
      </TouchableOpacity>
      <Text style={globalStyles.title}>{subject.title}</Text>

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
          <Text style={globalStyles.globalButtonText}>Nouvelle Note / question </Text>
        </TouchableOpacity>



      </View>
      <View style={styles.questionsContainer}>

        <>

          {[{ id: null, title: "Non classé" }, ...chapters].map((chapter) => (
            <View key={chapter.id ? chapter.id : "non-chapitre"}>
              <TouchableOpacity onPress={() => toggleChapter(chapter.id)}>
                <Text style={globalStyles.title_chapter}>{chapter.title}</Text>
              </TouchableOpacity>
              {openChapters[chapter.id] && (
                <>
                  <View style={styles.navigationContainer}>
                    <Text></Text>
                    <Text></Text>
                    <Text></Text>
                    <Text></Text>
                    <Text></Text>
                    <Text></Text>
                    <Text></Text>
                    <Text></Text>
                    <Text></Text>
                    <Text></Text>
                    {/* Icône d'édition */}
                    <TouchableOpacity
                      onPress={() => {
                        setEditChapterId(chapter.id);
                        setEditChapterTitle(chapter.title);
                        setIsEditModalVisible(true);
                      }}
                      style={{ marginRight: 10 }} // Ajustez selon le besoin
                    >
                      <Image source={edit} style={{ width: 20, height: 20, opacity: 0.5 }} />

                    </TouchableOpacity>


                    {/* Icône de suppression */}
                    <TouchableOpacity
                      onPress={() => confirmDeletion(chapter.id, true)} // true pour spécifier qu'il s'agit d'un chapitre
                      style={{ marginRight: 10 }}
                    >
                      <Image source={trash} style={{ width: 25, height: 25, opacity: 0.5 }} />

                    </TouchableOpacity>

                  </View>
                  <Text></Text>
                  <Text></Text>
                </>
              )}


              {openChapters[chapter.id] && questions.filter(q => q.id_chapitre === chapter.id).map((question) => (

                <View key={question.id} style={styles.questionCard}>
                  <Text style={styles.questionText}>{question.question}</Text>
                  <View style={styles.navigationContainer}>
                    <Text style={styles.answersCount}>
                      {question.answers_count} réponses
                    </Text>
                    <TouchableOpacity onPress={() => handleAssociateQuestion(question.id)} style={styles.associateButton}>
                      <Image source={LinkIcon} style={{ width: 18, height: 18, opacity: 0.5 }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => confirmDeletion(question.id, false)} // false pour spécifier qu'il s'agit d'une question
                      style={styles.deleteButton}
                    >
                      <Image source={trash} style={{ width: 25, height: 25, opacity: 0.5 }} />
                    </TouchableOpacity>

                  </View>



                  {/* Assurez-vous que cette partie est correctement rendue et que le TouchableOpacity est accessible */}
                  <TouchableOpacity
                    onPress={() => toggleAnswersDisplay(question.id)}
                    style={styles.toggleAnswersButton}
                  >
                    <Image source={expand_more} style={{ width: 25, height: 25, opacity: 0.5 }} />
                  </TouchableOpacity>
                  {activeQuestionAnswers[question.id] && activeQuestionAnswers[question.id].map((answer, answerIndex) => (
                    <View key={answerIndex} style={styles.answerContainer}>

                      <Text style={styles.answerText}>{answer.answer}</Text>
                      {answerIndex < activeQuestionAnswers[question.id]?.length - 1 && (
                        <View style={styles.separator} />
                      )}
                    </View>
                  )

                  )}

                  {activeQuestionAnswers[question.id] && (
                    <TouchableOpacity
                      onPress={() => { console.log("questionId:", question.id); navigateToScreen('AnswerQuestionScreen', { questionId: question.id }) }}
                      style={globalStyles.globalButton_wide}
                    >
                      <Text style={globalStyles.globalButtonText}>Répondre</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          ))}
        </>



      </View>



      <Text></Text>


      <Modal
        animationType="slide"
        transparent={true}
        visible={isChapterModalVisible}
        onRequestClose={() => setIsChapterModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView>
              <Text>Déplacer la note dans le chapitre : </Text>
              <Text></Text>
              {chapters.map((chapter) => (
                <TouchableOpacity
                  key={chapter.id}
                  onPress={() => {
                    handleJoinQuestionToChapter(selectedQuestionId, chapter.id);
                    setIsChapterModalVisible(false);
                  }}
                  style={styles.modalButton} // Utilisez le style ajusté ici
                >
                  <Text style={styles.textStyle}>{chapter.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsChapterModalVisible(false)}
              style={[globalStyles.globalButton_wide]}
            >
              <Text style={globalStyles.globalButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
                //get_chapters(subject_active, setChapters);
                refreshPage()
              }}
            >
              <Text style={globalStyles.globalButtonText}>Créer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.globalButton_wide]}
              onPress={() => {
                setIsModalVisible(!isModalVisible);
              }}
            >
              <Text style={globalStyles.globalButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Éditer Chapitre</Text>
            <TextInput
              style={styles.modalInput}
              onChangeText={setEditChapterTitle}
              value={editChapterTitle}
              placeholder="Nouveau titre du chapitre"
            />
            <TouchableOpacity
              style={[globalStyles.globalButton_wide]}
              onPress={() => {
                edit_chapter(editChapterId, editChapterTitle);
                setIsEditModalVisible(false);
                setEditChapterTitle(''); // Reset title after update
                get_chapters(subject_active, setChapters); // Refresh chapters list
              }}
            >
              <Text style={globalStyles.globalButtonText}>Sauvegarder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.globalButton_wide]}
              onPress={() => {
                setIsEditModalVisible(false);
                setEditChapterTitle('');
              }}
            >
              <Text style={globalStyles.globalButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => {
          setDeleteModalVisible(!deleteModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Êtes-vous sûr de vouloir supprimer ce {deletionDetails.isChapter ? 'chapitre' : 'question'}? Cette action est irréversible.</Text>
            <TouchableOpacity
              style={[globalStyles.globalButton_wide]}
              onPress={() => {
                if (deletionDetails.isChapter) {
                  delete_chapter(deletionDetails.id);
                  refreshPage()
                } else {
                  delete_question(deletionDetails.id);
                  refreshPage()
                }
                setDeleteModalVisible(false);
              }}
            >
              <Text style={globalStyles.globalButtonText}>Supprimer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.globalButton_wide]}
              onPress={() => {
                setDeleteModalVisible(false);
              }}
            >
              <Text style={globalStyles.globalButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </View>
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
    //backgroundColor: 'lightgrey',
  },
  questionText: {
    fontSize: 16,
    color: 'blue',
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
    marginRight: 5,
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

  // Mettez à jour ce style pour s'assurer que le texte est visible sur un fond clair
  textStyle: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18, // Supposant que la taille par défaut est 16, cela rendra le texte deux fois plus grand.
  },

  // Assurez-vous que le style du modalView est correct et ne cause pas de texte blanc sur fond blanc
  modalView: {
    margin: 20,
    backgroundColor: "white", // Fond blanc, assurez-vous que le texte n'est pas aussi blanc
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
  modalButton: {
    // Supposons que vous ajoutiez un nouveau style pour les boutons dans le modal
    marginBottom: 10, // Ajoutez de l'espace entre les boutons pour une meilleure répartition
    padding: 10, // Augmentez le padding pour que le touchable ait une meilleure apparence
  },



});

export default ReadQuestionsScreen;