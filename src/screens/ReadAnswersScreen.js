import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import {
  Image,
  Modal,
  Platform,
  TextInput,
  Alert,
  Button,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  getSubject,
  getMemories_Questions,
  getMemories_Answers_to_Question,
  get_chapters,
  join_question_to_chapter,
  create_chapter,
  delete_chapter,
  edit_chapter,
  delete_question,
} from '../components/data_handling';
import { useFocusEffect } from '@react-navigation/native';
import { getActiveSubjectId } from '../components/local_storage';
import { globalStyles } from '../../global';
import BookIcon from '../../assets/icons/book.svg';
import refresh from '../../assets/icons/refresh_black_24dp.svg';
import PersonIcon from '../../assets/icons/person.svg';
import help from '../../assets/icons/help-circle.svg';
import trash from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import settings from '../../assets/icons/settings.svg';
import LinkIcon from '../../assets/icons/link.png';
import expand_more from '../../assets/icons/expand_more_black_24dp.svg';
import expand_less from '../../assets/icons/expand_less_black_24dp.svg';
import edit from '../../assets/icons/pen-to-square-regular.svg';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

const windowWidth = Dimensions.get('window').width;

const useFetchActiveSubjectId = (setSubjectActive, setSubject, navigation) => {
  useFocusEffect(
    React.useCallback(() => {
      const fetchActiveSubjectId = async () => {
        const temp = await getActiveSubjectId();
        setSubjectActive(temp);
        if (temp != null) {
          const temp2 = await getSubject(temp);
          setSubject(temp2);
        } else {
          navigation.navigate('ManageBiographyScreen');
        }
      };
      fetchActiveSubjectId();
    }, [navigation])
  );
};

const useFetchData = (subjectActive, setQuestions, tags, personal, setChapters) => {
  useEffect(() => {
    if (subjectActive != null) {
      getMemories_Questions(subjectActive, setQuestions, tags, personal);
      get_chapters(subjectActive, setChapters);
    }
  }, [subjectActive, tags, personal]);
};





function ReadQuestionsScreen({ route }) {
  const navigation = useNavigation();
  const session = route.params?.session;
  const [questions, setQuestions] = useState([]);
  const [subjectActive, setSubjectActive] = useState(null);
  const [tags, setTags] = useState([
    'Famille',
    'Vie professionnelle',
    'Vie personnelle',
    'Hobbies & passions',
    'Valeurs',
    'Voyages',
    'Autre',
    '',
  ]);
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
  const editor = useRef();
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
  const [middlePanelWidth, setMiddlePanelWidth] = useState(windowWidth * 0.6);
const [isDragging, setIsDragging] = useState(false);

const handleMouseDown = () => {
  console.log('Et ça tire !')
  setIsDragging(true);
};

const handleMouseMove = (e) => {
  if (!isDragging) return;
  const newWidth = e.clientX;
  if (newWidth > 100 && newWidth < windowWidth - 100) {
    setMiddlePanelWidth(newWidth);
    console.log("nouvelle largeur : ",newWidth)
  }
};

const handleMouseUp = () => {
  setIsDragging(false);
};


const toggleLeftPanel = () => {
  setIsLeftPanelVisible(!isLeftPanelVisible);
};


  const quillModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: '1' }, { header: '2' }, { font: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        ['clean'],
        [{ color: [] }, { background: [] }],
        ['save'],
      ],
      handlers: {
        save: handleSaving,
      },
    },
  };
  useFetchActiveSubjectId(setSubjectActive, setSubject, navigation);
  useFetchData(subjectActive, setQuestions, tags, personal, setChapters);

  const toggleChapter = (chapterId) => {
    setOpenChapters((prevOpenChapters) => ({
      ...prevOpenChapters,
      [chapterId]: !prevOpenChapters[chapterId],
    }));
  };

  const navigateToScreen = (screenName, params) => {
  //const navigation = useNavigation();
  navigation.navigate(screenName, params);
};
  const toggleTag = (tag) => {
    const updatedTags = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    setTags(updatedTags);

    if (tag === 'posée par un proche') {
      setPersonal(!personal);
      getMemories_Questions(subjectActive, setQuestions, updatedTags, !personal);
      get_chapters(subjectActive, setChapters);
    }
  };

  const handleJoinQuestionToChapter = async (id_question, id_chapter) => {
    await join_question_to_chapter(id_question, id_chapter);
    getMemories_Questions(subjectActive, setQuestions, tags, personal);
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
      setActiveQuestionAnswers((prev) => ({ ...prev, [questionId]: undefined }));
    } else {
      const answers = await getMemories_Answers_to_Question(questionId);
      if (answers) {
        setActiveQuestionAnswers((prev) => ({ ...prev, [questionId]: answers }));
      }
    }
  };

  const confirmDeletion = (id, isChapter = true) => {
    setDeletionDetails({ id, isChapter });
    setDeleteModalVisible(true);
  };

  const refreshPage = async () => {
    if (subjectActive != null) {
      await getMemories_Questions(subjectActive, setQuestions, tags, personal);
      await get_chapters(subjectActive, setChapters);
      setActiveQuestionAnswers({});
    } else {
      Alert.alert('Erreur', 'Aucun sujet actif sélectionné. Veuillez sélectionner un sujet pour rafraîchir les données.');
    }
  };

  const isLargeScreen = windowWidth > 768;

  const [content, setContent] = useState('<p>Commencez à écrire ici...</p>');
  const [isEditorReady, setEditorReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (editor.current && isEditorReady) {
      if (Platform.OS === 'web') {
        editor.current.getEditor().setContents(content);
      } else {
        editor.current.setContent(content);
      }
    }
  }, [content, isEditorReady]);

  useEffect(() => {
    console.log("ID question in :", activeQuestionAnswers);

    
    if (Object.keys(activeQuestionAnswers)[0]) {
      console.log("Coucou !!!");
      const loadData = async () => {
        console.log("ID question in :", Object.keys(activeQuestionAnswers)[0]);

        const { data, error } = await supabase
          .from('Memoires_questions')
          .select('full_text')
          .eq('id', Object.keys(activeQuestionAnswers)[0])
          .single();

        if (error) {
          console.error('Error loading data:', error);
        } else if (data && data.full_text && data.full_text.ops) {
          const converter = new QuillDeltaToHtmlConverter(data.full_text.ops, {});
          const html = converter.convert();
          setContent(html);
        } else {
          console.error('Data is not in the expected format:', data.full_text);
        }
        setIsLoading(false);
      };

      loadData();
    }

    setIsLoading(false);
  }, [activeQuestionAnswers]);

  const handleSaving = async () => {
 

    if (Platform.OS === 'web') {
      try {
        const quillInstance = editor.current.getEditor();
        const content = quillInstance.getContents();
        console.log('Saving content:', content);
        console.log("ID question out :",Object.keys(activeQuestionAnswers)[0])

        const { error: errorUpdating } = await supabase
          .from('Memoires_questions')
          .update({ full_text: content })
          .match({ id: Object.keys(activeQuestionAnswers)[0] });

        if (errorUpdating) {
          console.error('Error updating:', errorUpdating);
        } else {
          console.log('Content successfully saved to Supabase');
        }
      } catch (error) {
        console.error('Failed to save content:', error);
      }
    } else {
      const content = editor.current.getContent();
      console.log('Saving content:', content);
    }
    
  };

  useEffect(() => {
    if (isDragging) {
      console.log("toujours")
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  

  if (isLoading) {
    return (
      <View style={globalStyles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.navigationContainer}>
        <TouchableOpacity onPress={refreshPage} style={styles.navButton}>
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

      <TouchableOpacity onPress={refreshPage} style={{ position: 'absolute', bottom: 30, right: 40 }}>
        <Image source={refresh} style={{ width: 60, height: 60, opacity: 1 }} />
      </TouchableOpacity>
      <Text style={globalStyles.title}>{subject.title}</Text>

      <View style={isLargeScreen ? styles.largeScreenContainer : styles.smallScreenContainer}>
  {isLeftPanelVisible && (
    <View style={isLargeScreen ? styles.leftPanel : styles.fullWidth}>
      <View style={{ flexDirection: 'column', justifyContent: 'space-between', padding: 10 }}>
        <TouchableOpacity style={globalStyles.globalButton_wide} onPress={() => setIsModalVisible(true)}>
          <Text style={globalStyles.globalButtonText}>Nouvelle partie</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.globalButton_wide} onPress={() => navigateToScreen('AskQuestionScreen')}>
          <Text style={globalStyles.globalButtonText}>Nouveau chapitre </Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
      {[ { id: null, title: 'Non classé' }, ...chapters].map((chapter) => (
  <View key={chapter.id || 'non-chapitre'}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <TouchableOpacity onPress={() => toggleChapter(chapter.id)}>
        <Text style={globalStyles.title_chapter}>{chapter.title}</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={() => {
            setEditChapterId(chapter.id);
            setEditChapterTitle(chapter.title);
            setIsEditModalVisible(true);
          }}
          style={{ marginRight: 10 }}
        >
          <Image source={edit} style={{ width: 20, height: 20, opacity: 0.5 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDeletion(chapter.id, true)} style={{ marginRight: 10 }}>
          <Image source={trash} style={{ width: 25, height: 25, opacity: 0.5 }} />
        </TouchableOpacity>
      </View>
    </View>
    {openChapters[chapter.id] && (
      <>
        {questions.filter((q) => q.id_chapitre === chapter.id).map((question) => (
  <TouchableOpacity key={question.id} style={styles.questionCard} onPress={() => toggleAnswersDisplay(question.id)}>
    <Text style={styles.questionText}>{question.question}</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={styles.answersCount}>{question.answers_count} réponses</Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => handleAssociateQuestion(question.id)} style={styles.associateButton}>
          <Image source={LinkIcon} style={{ width: 18, height: 18, opacity: 0.5 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDeletion(question.id, false)} style={styles.deleteButton}>
          <Image source={trash} style={{ width: 25, height: 25, opacity: 0.5 }} />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
))}

      </>
    )}
  </View>
))}

      </ScrollView>
    </View>
  )}
  <TouchableOpacity onPress={toggleLeftPanel} style={styles.togglePanelButton}>
    <Text style={styles.togglePanelButtonText}>{isLeftPanelVisible ? '←' : '→'}</Text>
  </TouchableOpacity>
  {isLargeScreen && (
    <View style={{ ...styles.MiddlePanel, width: middlePanelWidth }}>
      <View style={styles.container}>
        {Platform.OS === 'web' ? (
          <>
            <div id="toolbar"></div>
            <View style={styles.toolbarContainer}>
              <TouchableOpacity style={globalStyles.globalButton_wide} onPress={handleSaving}>
                <Text style={globalStyles.globalButtonText}>Enregistrer le texte du chapitre </Text>
              </TouchableOpacity>
              
              <ReactQuill ref={editor} theme="snow" modules={quillModules} bounds={'#toolbar'} value={content} />
            </View>
          </>
        ) : (
          <>
            <RichEditor ref={editor} style={styles.editor} initialContentHTML={content} />
            <RichToolbar
              editor={editor}
              style={styles.toolbar}
              iconTint="#000000"
              selectedIconTint="#209cee"
              selectedButtonStyle={{ backgroundColor: 'transparent' }}
              actions={[
                'bold',
                'italic',
                'underline',
                'unorderedList',
                'orderedList',
                'insertLink',
                'insertImage',
                'blockQuote',
                'undo',
                'redo',
                'save',
              ]}
              onSave={handleSaving}
            />
          </>
        )}
      </View>
    </View>
  )}
<View
    style={styles.resizer}
    onMouseDown={handleMouseDown}
  />
  {isLargeScreen && (
    <View style={{ ...styles.rightPanel, width: windowWidth - middlePanelWidth - 30 }}>
      <ScrollView>
        <>
          {Object.keys(activeQuestionAnswers).map((questionId) => (
            <TouchableOpacity
              key={questionId}
              onPress={() => {
                navigateToScreen('AnswerQuestionScreen', { questionId });
              }}
              style={globalStyles.globalButton_wide}
            >
              <Text style={globalStyles.globalButtonText}>Répondre</Text>
            </TouchableOpacity>
          ))}
          {Object.keys(activeQuestionAnswers).map((questionId) =>
            activeQuestionAnswers[questionId]?.map((answer, index) => (
              <View key={index} style={styles.answerCard}>
                <Text style={styles.answerText}>{answer.answer}</Text>
              </View>
            ))
          )}
        </>
      </ScrollView>
    </View>
  )}
</View>


      <Modal
        animationType="slide"
        transparent={true}
        visible={isChapterModalVisible}
        onRequestClose={() => setIsChapterModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView>
              <Text>Déplacer la note dans le chapitre :</Text>
              {chapters.map((chapter) => (
                <TouchableOpacity
                  key={chapter.id}
                  onPress={() => {
                    handleJoinQuestionToChapter(selectedQuestionId, chapter.id);
                    setIsChapterModalVisible(false);
                  }}
                  style={styles.modalButton}
                >
                  <Text style={styles.textStyle}>{chapter.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setIsChapterModalVisible(false)} style={[globalStyles.globalButton_wide]}>
              <Text style={globalStyles.globalButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(!isModalVisible)}>
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
                create_chapter(newChapterTitle, subjectActive);
                setIsModalVisible(!isModalVisible);
                setNewChapterTitle('');
                refreshPage();
              }}
            >
              <Text style={globalStyles.globalButtonText}>Créer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[globalStyles.globalButton_wide]} onPress={() => setIsModalVisible(!isModalVisible)}>
              <Text style={globalStyles.globalButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)}>
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
                setEditChapterTitle('');
                get_chapters(subjectActive, setChapters);
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

      <Modal animationType="slide" transparent={true} visible={deleteModalVisible} onRequestClose={() => setDeleteModalVisible(!deleteModalVisible)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer ce {deletionDetails.isChapter ? 'chapitre' : 'question'}? Cette action est irréversible.
            </Text>
            <TouchableOpacity
              style={[globalStyles.globalButton_wide]}
              onPress={() => {
                if (deletionDetails.isChapter) {
                  delete_chapter(deletionDetails.id);
                  refreshPage();
                } else {
                  delete_question(deletionDetails.id);
                  refreshPage();
                }
                setDeleteModalVisible(false);
              }}
            >
              <Text style={globalStyles.globalButtonText}>Supprimer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[globalStyles.globalButton_wide]} onPress={() => setDeleteModalVisible(false)}>
              <Text style={globalStyles.globalButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  navButton: {
    padding: 10,
  },
  largeScreenContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  smallScreenContainer: {
    flex: 1,
  },
  leftPanel: {
  
    padding: 10,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  MiddlePanel: {
 
    padding: 10,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  rightPanel: {
    flex: 1,
    padding: 10,
    marginRight: 5, // Ajoutez cette ligne pour la marge à droite
  },
  
  fullWidth: {
    width: '100%',
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
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
    marginLeft: 20,
  },
  answerContainer: {
    paddingVertical: 10,
  },
  associateButton: {
    marginRight: 5,
  },
  deleteButton: {
    marginRight: 5,
  },
  toggleAnswersButton: {
    alignSelf: 'flex-end',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 15,
    borderWidth: 1,
    width: '100%',
    padding: 10,
    borderRadius: 5,
    borderColor: 'gray',
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  modalButton: {
    marginBottom: 10,
    padding: 10,
  },
  answerCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  unSelectedTag: {
    backgroundColor: '#b1b3b5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    padding: 10,
  },
  icon: {
    marginLeft: 10,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  editor: {
    flex: 1,
    backgroundColor: 'white',
  },
  toolbarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  saveButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 10,
    zIndex: 1,
  },
  togglePanelButton: {
    width: 30,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  togglePanelButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resizer: {
    width: 10,
    cursor: 'col-resize',
    backgroundColor: '#ccc',
    zIndex: 1,
  },
  
});

export default ReadQuestionsScreen;
