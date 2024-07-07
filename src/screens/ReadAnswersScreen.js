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
  Switch,
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
  edit_question,
  delete_question,
  get_Question_by_id,
  integration,
  getUserStatus,
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import copyIcon from '../../assets/icons/paste.png';
import save from '../../assets/icons/save.png';
import note from '../../assets/icons/notes.png';
import NoteScreen from './NoteScreen';
import plusIcon from '../../assets/icons/plus.png';
import minusIcon from '../../assets/icons/minus.png';



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

const useFetchData = (id_user,subjectActive, setQuestions, tags, personal, setChapters,setUserStatus) => {
  useEffect(() => {
    if (subjectActive != null) {
      getMemories_Questions(subjectActive, setQuestions, tags, personal);
      get_chapters(subjectActive, setChapters);
      setUserStatus(getUserStatus(id_user,subjectActive))
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
  const [isEditChapterModalVisible, setIsEditChapterModalVisible] = useState(false);

  const [editChapterId, setEditChapterId] = useState(null);
  const [editChapterTitle, setEditChapterTitle] = useState('');
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editQuestionTitle, setEditQuestionTitle] = useState('');

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletionDetails, setDeletionDetails] = useState({ id: null, isChapter: true });
  const [subject, setSubject] = useState([]);
  const editor = useRef();
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
  const [middlePanelWidth, setMiddlePanelWidth] = useState(0.5*windowWidth )
  const [rightPanelWidth, setRightPanelWidth] = useState(windowWidth - middlePanelWidth - 550);
  const [initialMouseX, setInitialMouseX] = useState(null);
  const [initialMiddlePanelWidth, setInitialMiddlePanelWidth] = useState(middlePanelWidth);
  const [question, setQuestion] = useState('');
  const [hasUnclassifiedQuestions,setHasUnclassifiedQuestions] = useState(false);  
  const [isContentModified, setIsContentModified] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showIntegratedNotes, setShowIntegratedNotes] = useState(false);
  const [userStatus, setUserStatus] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [iconsVisible, setIconsVisible] = useState(false);
const [toggleIcon, setToggleIcon] = useState(plusIcon);



  


  const [isDragging, setIsDragging] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState({});

  useEffect(() => {
    const fetchUserStatus = async () => {
      const status = await getUserStatus(session.user.id, subjectActive);
      setUserStatus(status);
      console.log("User status:", status);
      if (status=="Contributeur") {
        setMiddlePanelWidth(0);
      }
    };
    if (subjectActive) {
      fetchUserStatus();
    }
  }, [session.user.id, subjectActive]);


const handleMouseDown = (e) => {
  setIsDragging(true);
  setInitialMouseX(e.clientX);
  setInitialMiddlePanelWidth(middlePanelWidth);
};

useEffect(() => {
    setHasUnclassifiedQuestions(questions.some((q) => q.id_chapitre === null));
}, [questions]);

const handleMouseMove = (e) => {
  if (!isDragging) return;
  const deltaX = e.clientX - initialMouseX;
  const newWidth = initialMiddlePanelWidth + deltaX;
  if (newWidth > 100 && newWidth < windowWidth - 100) {
    setMiddlePanelWidth(newWidth);
  }
};


const handleMouseUp = () => {
  setIsDragging(false);
};


useEffect(() => {
  if (Platform.OS === 'web') {
    const quillInstance = editor.current?.getEditor();
    if (quillInstance) {
      quillInstance.on('text-change', () => {
        setIsContentModified(true);
      });
    }
  } else {
    // Ajouter un gestionnaire pour RichEditor si nécessaire
    editor.current?.registerToolbar((event) => {
      if (event === 'text-change') {
        setIsContentModified(true);
      }
    });
  }
}, [editor]);



useEffect(() => {
  if (!isLeftPanelVisible){
    setRightPanelWidth(windowWidth - middlePanelWidth);
  }
  if (isLeftPanelVisible){
    setRightPanelWidth(windowWidth - middlePanelWidth-550);
  }
}, [middlePanelWidth,isLeftPanelVisible ]);


const toggleLeftPanel = () => {
  setIsLeftPanelVisible(!isLeftPanelVisible);
};

const copyToClipboard = (text) => {
  Clipboard.setString(text);
  Alert.alert('Copié dans le presse-papier', text);
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

  useFetchData(session.user.id,subjectActive, setQuestions, tags, personal, setChapters,setUserStatus);


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
      setActiveQuestionAnswers({});
    } else {
      await get_Question_by_id(questionId, setQuestion);
      const answers = await getMemories_Answers_to_Question(questionId);
      if (answers) {
        setActiveQuestionAnswers({ [questionId]: answers });
        refreshNoteScreen(question); // Ajoutez cette ligne pour rafraîchir NoteScreen
      }
    }
  };
  
  const refreshNoteScreen = (question) => {
    // Ici, vous pouvez appeler une fonction de rafraîchissement dans le composant NoteScreen si nécessaire
  };
  
  

  const confirmDeletion = (id, isChapter = true) => {
    setDeletionDetails({ id, isChapter });
    setDeleteModalVisible(true);
  };

  const refreshPage = async () => {
    if (subjectActive != null) {
      await getMemories_Questions(subjectActive, setQuestions, tags, personal);

      await get_chapters(subjectActive, setChapters);
      //setActiveQuestionAnswers({});
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
      setIsInitialLoad(false);
    }
  }, [content, isEditorReady]);
  

  useEffect(() => {

    if (Object.keys(activeQuestionAnswers)[0]) {
  
      const loadData = async () => {


        if (question && question.full_text && question.full_text.ops) {
          const converter = new QuillDeltaToHtmlConverter(question.full_text.ops, {});
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
  }, [activeQuestionAnswers,question]);

  const handleSaving = async () => {
    setIsSaving(true);
    if (Platform.OS === 'web') {
      try {
        const quillInstance = editor.current.getEditor();
        const content = quillInstance.getContents();
        setContent(content)
  
        const { error: errorUpdating } = await supabase
          .from('Memoires_questions')
          .update({ full_text: content })
          .match({ id: Object.keys(activeQuestionAnswers)[0] });
  
        if (errorUpdating) {
          console.error('Error updating:', errorUpdating);
        } else {
          console.log('Content successfully saved to Supabase');
          setIsContentModified(false);
        }
      } catch (error) {
        console.error('Failed to save content:', error);
      }
    } else {
      const content = editor.current.getContent();
      console.log('Saving content:', content);
      setIsContentModified(false);
    }
    setIsSaving(false);
  };
  
  

  useEffect(() => {
    if (isDragging) {

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
        {/*
        <TouchableOpacity onPress={refreshPage} style={styles.navButton}>
          <Image source={refresh} style={{ width: 60, height: 60, opacity: 1 }} />
        </TouchableOpacity>
        */}
        <TouchableOpacity
  onPress={() => navigateToScreen('ManageBiographyScreen')}
  style={[globalStyles.navButton, isHovered && globalStyles.navButton_over]}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  <Image source={settings} style={{ width: 120, height: 120 }} />
</TouchableOpacity>

        {/*
        <TouchableOpacity onPress={() => navigateToScreen('ProfileScreen')} style={styles.navButton}>
          <Image source={PersonIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigateToScreen('AideScreen')} style={styles.navButton}>
          <Image source={help} style={{ width: 60, height: 60, opacity: 0.5 }} />
        </TouchableOpacity>
        */}


      </View>
{/*}
      <TouchableOpacity onPress={refreshPage} style={{ position: 'absolute', bottom: 30, right: 40 }}>
        <Image source={refresh} style={{ width: 60, height: 60, opacity: 1 }} />
      </TouchableOpacity>

      */}


      <View style={isLargeScreen ? styles.largeScreenContainer : styles.smallScreenContainer}>
  {isLeftPanelVisible && (
    <View style={isLargeScreen ? styles.leftPanel : styles.fullWidth}>
      <View style={globalStyles.container_wide}> 
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    <Text style={globalStyles.title}>{subject.title}</Text>
    <TouchableOpacity onPress={() => {
      setIconsVisible(!iconsVisible);
      setToggleIcon(iconsVisible ? plusIcon : minusIcon);
    }}>
      <Image source={toggleIcon} style={{ width: 25, height: 25, opacity: 0.5, marginVertical: 5 }} />
    </TouchableOpacity>
  </View>
<Text> </Text>
      <ScrollView>
      {(hasUnclassifiedQuestions ? [{ id: null, title: 'Chapitres non classés' }] : []).concat(chapters).map((chapter) => (
  <View key={chapter.id || 'non-chapitre'}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <TouchableOpacity onPress={() => toggleChapter(chapter.id)}>
        <Text style={globalStyles.title_chapter}>{chapter.title}</Text>
      </TouchableOpacity>
      {iconsVisible && (
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
      )}
    </View>
    {openChapters[chapter.id] && (
      <>
        {questions.filter((q) => q.id_chapitre === chapter.id).map((question) => (
          <TouchableOpacity key={question.id} style={styles.questionCard} onPress={() => toggleAnswersDisplay(question.id)}>
            <Text style={styles.questionText}>{question.question}</Text>
            {iconsVisible && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.answersCount}>{question.answers_count} réponses</Text>
              
              <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
          onPress={() => {
            setEditQuestionId(question.id);
            setEditQuestionTitle(question.question);
            setIsEditChapterModalVisible(true);
          }}
          style={{ marginRight: 10 }}
        >
          <Image source={edit} style={{ width: 20, height: 20, opacity: 0.5 }} />
        </TouchableOpacity>
                <TouchableOpacity onPress={() => handleAssociateQuestion(question.id)} style={styles.associateButton}>
                  <Image source={LinkIcon} style={{ width: 18, height: 18, opacity: 0.5 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDeletion(question.id, false)} style={styles.deleteButton}>
                  <Image source={trash} style={{ width: 25, height: 25, opacity: 0.5 }} />
                </TouchableOpacity>
              </View>
            </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {userStatus==='Editeur'&&(
            <TouchableOpacity
              onPress={() => {
                navigateToScreen('EditChapterScreen', {questionId :question.id} );
              }}
              style={[globalStyles.globalButton_narrow, { backgroundColor: '#b1b3b5'}]}
            >
              <Text style={globalStyles.globalButtonText}>Lire</Text>
            </TouchableOpacity>
            )}
            
              </View>
          </TouchableOpacity>
        ))}
      </>
    )}
  </View>
))}


      </ScrollView>
    
      <View style={{ flexDirection: 'column', justifyContent: 'space-between', padding: 10 }}>
        <TouchableOpacity style={globalStyles.globalButton_wide} onPress={() => setIsModalVisible(true)}>
          <Text style={globalStyles.globalButtonText}>Nouvelle partie</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.globalButton_wide} onPress={() => navigateToScreen('AskQuestionScreen')}>
          <Text style={globalStyles.globalButtonText}>Nouveau chapitre </Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  )}
  {isLargeScreen && userStatus==="Editeur" && (
<View
  style={[styles.resizer, { right: rightPanelWidth -21 }]}
  onMouseDown={handleMouseDown}
>

<Text style={[styles.resizerText, { userSelect: 'none' }]}>{'< >'}</Text>

</View>
  )}
 
 
 <TouchableOpacity 
  onPress={toggleLeftPanel} 
  style={[
    styles.toggleLine, 
    { 
      position: !isLargeScreen ? 'absolute' : 'relative', // Utilise position absolue uniquement pour les petits écrans
      top: !isLargeScreen ? 0 : 'auto', // Utilise top 0 uniquement pour les petits écrans
      bottom: !isLargeScreen ? 0 : 'auto', // Utilise bottom 0 uniquement pour les petits écrans
      right: !isLargeScreen && isLeftPanelVisible ? 0 : 'auto', // Utilise right 0 uniquement pour les petits écrans et quand le panneau gauche est visible
      left: !isLargeScreen && !isLeftPanelVisible ? 0 : 'auto' // Utilise left 0 uniquement pour les petits écrans et quand le panneau gauche n'est pas visible
    }
  ]}
>
  <Text style={styles.toggleLineText}>{isLeftPanelVisible ? '<' : '>'}</Text>
</TouchableOpacity>

   
  {isLargeScreen && userStatus==="Editeur" && (
   <View style={isLargeScreen ? styles.middlePanelContainer : styles.fullWidth}>
   
   <View style={{ ...styles.MiddlePanel, width: middlePanelWidth }}>
   <Text style={globalStyles.title}>
  {question && question.question ? question.question : 'Veuillez sélectionner un chapitre à éditer'}
  {isContentModified && (
    <TouchableOpacity style={{ marginLeft: 10 }} onPress={handleSaving}>
      <Image source={save} style={{ width: 20, height: 20, opacity: 0.5 }} />
    </TouchableOpacity>
  )}
</Text>



     <View style={styles.container}>
       {Platform.OS === 'web' ? (
         <>
           <div id="toolbar"></div>
           <View style={styles.toolbarContainer}>

 
           <ReactQuill
  ref={editor}
  theme="snow"
  modules={quillModules}
  bounds={'#toolbar'}
  value={content}
  onChange={() => {
    if (!isSaving && !isInitialLoad) setIsContentModified(true);
  }}
  onChangeSelection={() => setIsInitialLoad(false)}
/>

           </View>
         </>
       ) : (
         <>
           <RichEditor
  ref={editor}
  style={styles.editor}
  initialContentHTML={content}
  onChange={() => {
    if (!isSaving && !isInitialLoad) setIsContentModified(true);
  }}
  onSelectionChange={() => setIsInitialLoad(false)}
/>

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
 </View>
 
  )}

{(isLargeScreen || !isLeftPanelVisible )&& ( 

<View style={[styles.rightPanel, { width: rightPanelWidth }]}>
<Text style={globalStyles.title}>Notes</Text> 

<NoteScreen route={{ params: { question } }} />

{/*
<Text> </Text>
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
  <Text> </Text>
  <Text>Montrer les notes déjà intégrées</Text>
  <Switch
    value={showIntegratedNotes}
    onValueChange={(value) => {setShowIntegratedNotes(value); refreshPage();}}
  />
  <Text> </Text>
</View>
<Text> </Text>
      <ScrollView>
        <>
        {Object.keys(activeQuestionAnswers).map((questionId) => (
          <>
            <TouchableOpacity
              key={questionId}
              onPress={() => {
                navigateToScreen('AnswerQuestionScreen', { questionId });
              }}
              style={globalStyles.globalButton_wide}
            >
              <Text style={globalStyles.globalButtonText}>Répondre</Text>
            </TouchableOpacity>
            
           </>
          ))}
        {Object.keys(activeQuestionAnswers).map((questionId) =>
  activeQuestionAnswers[questionId]
    ?.filter((answer) => showIntegratedNotes || !answer.used)
    .map((answer, index) => (
      <View key={index} style={styles.answerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text>{new Date(answer.created_at).toLocaleDateString()} {new Date(answer.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          <TouchableOpacity onPress={() => {copyToClipboard(answer.answer);integration(answer.id); refreshPage();}}>
            <Image source={copyIcon} style={{ width: 20, height: 20, opacity: 0.5 }} />
          </TouchableOpacity>
        </View>
        <Text style={styles.answerText}>{answer.answer}</Text>
      </View>
    ))
)}


         


        </>
      </ScrollView>
    */}
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
            <Text style={styles.modalText}>Nouvelle partie</Text>
            <TextInput
              style={styles.modalInput}
              onChangeText={setNewChapterTitle}
              value={newChapterTitle}
              placeholder="Titre de la partie"
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

      <Modal animationType="slide" transparent={true} visible={isEditChapterModalVisible} onRequestClose={() => setIsEditChapterModalVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Éditer Chapitre</Text>
            <TextInput
              style={styles.modalInput}
              onChangeText={setEditQuestionTitle}
              value={editQuestionTitle}
              placeholder="Nouveau titre du chapitre"
            />
            <TouchableOpacity
              style={[globalStyles.globalButton_wide]}
              onPress={() => {
                edit_question(editQuestionId, editQuestionTitle);
                setIsEditChapterModalVisible(false);
                setEditQuestionTitle('');
                refreshPage();
              }}
            >
              <Text style={globalStyles.globalButtonText}>Sauvegarder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.globalButton_wide]}
              onPress={() => {
                setIsEditChapterModalVisible(false);
                setEditQuestionTitle('');
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
              Êtes-vous sûr de vouloir supprimer {deletionDetails.isChapter ? 'cette partie ' : 'ce chapitre '}? Cette action est irréversible.
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

  largeScreenContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  smallScreenContainer: {
    flex: 1,
  },
  leftPanel: {
    width: 550,
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
    //flex: 1,
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
    width: '90%',
    alignSelf: 'center', 
  
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
    padding: 0,
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
    position: 'absolute',
    top: 0,
    bottom: 0,
    //width: 10,
    cursor: 'col-resize',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  resizerText: {
    fontWeight: 'bold',
    color: '#000', // Noir pour le contraste
  },

  
  togglePanelButton: {
    position: 'absolute',
    top: 20,
    //left: isLeftPanelVisible ? 200 : 0, // Adjust based on the sidebar width
    zIndex: 1000,
    backgroundColor: '#007BFF',
    borderRadius: 25,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePanelButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },

  toggleLine: {
    width: 10,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    height: '100%',
    zIndex: 1,
  },
  toggleLineText: {
    color: '#fff', // Blanc pour contraster avec la ligne noire
    fontWeight: 'bold',
  },
  middlePanelContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  
});

export default ReadQuestionsScreen;
