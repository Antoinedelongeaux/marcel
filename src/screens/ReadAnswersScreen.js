import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { useParams } from 'react-router-dom';
import {
  Image,
  Modal,
  Platform,
  TextInput,
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  TouchableWithoutFeedback,
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
  get_user_name,
  delete_question,
  get_Question_by_id,
  getUserStatus,
  save_question,
  createTheme,
  updateQuestion,
  getMemories_Questions_Published,
} from '../components/data_handling';
import {
  ToggleButton
} from '../components/UI_components';

import { useFocusEffect } from '@react-navigation/native';
import { getActiveSubjectId } from '../components/local_storage';
import { globalStyles } from '../../global';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import Clipboard from '@react-native-clipboard/clipboard';
import NoteScreen from './NoteScreen';
import RenderContent from '../components/RenderContent';
import ModalComponent from '../components/ModalComponent';
import plusIcon from '../../assets/icons/plus.png';
import minusIcon from '../../assets/icons/minus.png';
import doubleArrowIcon from '../../assets/icons/arrows_1.png';
import leftArrowIcon from '../../assets/icons/left-arrow.png';
import rightArrowIcon from '../../assets/icons/right-arrow.png';
import settingsIcon from '../../assets/icons/accueil.png';
import orientationIcon from '../../assets/icons/echantillon.png';
import saveIcon from '../../assets/icons/save.png';
import editIcon from '../../assets/icons/pen-to-square-regular.svg';
import viewIcon from '../../assets/icons/view.png';
import trash from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import linkIcon from '../../assets/icons/link.png';
import { decode, encode } from 'he';
import { } from 'he';
import {  CarrousselOrientation,
} from '../components/UI_components';


const deepEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};


const useFetchActiveSubjectId = (setSubjectActive, setSubject, setMiscState, navigation) => {
  useFocusEffect(
    useCallback(() => {
      const fetchActiveSubjectId = async () => {
        const temp = await getActiveSubjectId();
    
        setSubjectActive(temp);
        if (temp) {
          const temp2 = await getSubject(temp);
          setSubject(temp2);
        } else {
          navigation.navigate('Projets');
        }
        setMiscState(prevState => ({ ...prevState, isLoading:false}));
      };
      fetchActiveSubjectId();
    }, [navigation, setSubjectActive, setSubject, setMiscState.isLoading])
  );
};

const useFetchData = (userStatus, id_user, subjectActive, setQuestions, tags, personal, setChapters, setMiscState) => {
  // Utilisez useRef pour stocker les valeurs précédentes
  const previousValues = useRef({ userStatus, id_user, subjectActive, tags, personal });

  useEffect(() => {
    
    // Comparer les valeurs actuelles avec les valeurs précédentes
    const hasChanged = 
      !deepEqual(previousValues.current.userStatus, userStatus) 

    if (hasChanged) {
      // Si une valeur a changé, mettre à jour les valeurs précédentes
      previousValues.current = { userStatus, id_user, subjectActive, tags, personal };

      // Exécute le code de récupération des données
      if (subjectActive && userStatus) {
        if (userStatus.chapters === "Lecteur" &&userStatus.notes != "Publicateur") { 
          getMemories_Questions_Published(subjectActive, setQuestions, tags, personal);
        } else {
          getMemories_Questions(subjectActive, setQuestions, tags, personal);
        }
        
        get_chapters(subjectActive, setChapters);
        getUserStatus(id_user, subjectActive).then(result => 
          setMiscState(prevState => ({ ...prevState, userStatus: result }))
        );
      }
    }
  }, [userStatus]); // Toujours surveiller ces valeurs
};



function ReadAnswersScreen({ route }) {
  const navigation = useNavigation();
  const { session } = route.params || {};
  const { suffix } = useParams();
  const [questions, setQuestions] = useState([]);
  const [subjectActive, setSubjectActive] = useState(null);
  const [tags, setTags] = useState([
    'Famille', 'Vie professionnelle', 'Vie personnelle', 'Hobbies & passions', 'Valeurs', 'Voyages', 'Autre', ''
  ]);
  const [personal, setPersonal] = useState(false);
  const [activeQuestionAnswers, setActiveQuestionAnswers] = useState({});
  const [chapters, setChapters] = useState([]);
  const [openChapters, setOpenChapters] = useState({});
  const [modals, setModals] = useState({
    isModalVisible: false,
    isModalNewQuestionVisible: false,
    isChapterModalVisible: false,
    isEditModalVisible: false,
    isEditChapterModalVisible: false,
    deleteModalVisible: false,
  });
  const [newTitles, setNewTitles] = useState({
    newChapterTitle: '',
    newQuestionTitle: '',
    editChapterTitle: '',
    editQuestionTitle: '',
  });
  
  const [selected, setSelected] = useState({
    selectedQuestionId: null,
    editChapterId: null,
    editQuestionId: null,
    deletionDetails: { id: null, isChapter: true }
  });
  const [miscState, setMiscState] = useState({
    question: '',
    hasUnclassifiedQuestions: false,
    isContentModified: false,
    isInitialLoad: true,
    isSaving: false,
    showIntegratedNotes: false,
    userStatus: '',
    isHovered: false,
    isHoveredOrientation: false,
    iconsVisible: false,
    userName: '',
    toggleIcon: plusIcon,
    question_reponse: 'réponse',
    middlePanelWidth: 0.5 * Dimensions.get('window').width,
    rightPanelWidth: Dimensions.get('window').width - (0.5 * Dimensions.get('window').width) - 550,
    isDragging: false,
    expandedAnswers: {},
    isLargeScreen: Dimensions.get('window').width > 768,
    content: '',
    contentRead: '<p>Le chapitre n\'a pas encore été rédigé</p>',
    contentEdit: '<p>Commencez à écrire ici</p>',
    isEditorReady: false,
    isLoading: true,
    isShareModalVisible: false,
    isLeftPanelVisible: true,
  });
  const [subject, setSubject] = useState([]);
  const [reference, setReference] = useState('');
  const [filterSelectedQuestion, setFilterSelectedQuestion] = useState('');
  const [editVsView,setEditVsView] = useState('edit');
 

  const editor = useRef();

  useFetchActiveSubjectId(setSubjectActive, setSubject, setMiscState, navigation);
  

  useFetchData(miscState.userStatus,session.user.id, subjectActive, setQuestions, tags, personal, setChapters, setMiscState);

  

  useEffect(() => {
    const fetchUserStatus = async () => {
      const status = await getUserStatus(session.user.id, subjectActive);
      setMiscState(prevState => ({ ...prevState, userStatus: status }));
      if (status.chapters === 'Auditeur') {
        setMiscState(prevState => ({ ...prevState, question_reponse: 'question' }));
      }
      const name = await get_user_name(session.user.id);
      setMiscState(prevState => ({ ...prevState, userName: name }));
      if (!status.access) {
        navigateToScreen('Projets');
      }
      if (status.chapters === "Pas d'accès" && navigation.isFocused()) {
        navigateToScreen('Incipit');
        setMiscState(prevState => ({ ...prevState, middlePanelWidth: 0 }));
      }
    };
    if (subjectActive) {
      fetchUserStatus();
    }
    const unsubscribe = navigation.addListener('focus', () => {
      const windowWidth = Dimensions.get('window').width;
      setMiscState(prevState => ({
        ...prevState,
        middlePanelWidth: prevState.isLargeScreen ? 0.5 * windowWidth : windowWidth,
        rightPanelWidth: prevState.userStatus.chapters === "Pas d'accès" ? windowWidth - 550 : windowWidth - prevState.middlePanelWidth - 550
      }));
    });
    return unsubscribe;
  }, [navigation, subjectActive]);

  useEffect(() => {
    if (miscState.userStatus && miscState.userStatus.chapters === "Pas d'accès") {
      setMiscState(prevState => ({ ...prevState, rightPanelWidth: Dimensions.get('window').width - 550 }));
    } else {
      setMiscState(prevState => ({ ...prevState, rightPanelWidth: Dimensions.get('window').width - prevState.middlePanelWidth - 550 }));
      if (miscState.userStatus && (miscState.userStatus.chapters === "Auditeur"|| miscState.userStatus.chapters === "Lecteur")) {
        setEditVsView('view')
      }
    }
    
  }, [miscState.userStatus]);

  useEffect(() => {
    if (miscState.userStatus && miscState.userStatus === "non trouvé") {
      navigateToScreen('Projets');
    }    
  }, [miscState.userStatus]);

  
  /*
  useEffect(() => {
    if (editVsView ==='edit') {
       setMiscState(prevState => ({ ...prevState, content: miscState.contentEdit }));
    }
    if (editVsView ==='view') {
      setMiscState(prevState => ({ ...prevState, content: miscState.contentRead }));
   }
  }, [miscState.contentEdit,miscState.contentRead]);
*/
  
  useEffect(() => {
    if (miscState.question && miscState.question.id) {
      toggleAnswersDisplay(miscState.question.id);
      setFilterSelectedQuestion(miscState.question);
    }
  }, [miscState.question]);

  const handleMouseDown = (e) => {
    setMiscState(prevState => ({
      ...prevState,
      isDragging: true,
      initialMouseX: e.clientX,
      initialMiddlePanelWidth: prevState.middlePanelWidth
    }));
  };

  const handleReferencePress = useCallback((referenceContent) => {

    setReference(referenceContent);

  }, []);

  useEffect(() => {
    setMiscState(prevState => ({
      ...prevState,
      hasUnclassifiedQuestions: questions.some(q => q.id_chapitre === null)
    }));
  }, [questions]);

  const handleMouseMove = (e) => {
    if (!miscState.isDragging) return;
    const deltaX = e.clientX - miscState.initialMouseX;
    const newWidth = miscState.initialMiddlePanelWidth + deltaX;
    if (newWidth > 100 && newWidth < Dimensions.get('window').width - 100) {
      setMiscState(prevState => ({ ...prevState, middlePanelWidth: newWidth }));
    }
  };

  const handleMouseUp = () => {
    setMiscState(prevState => ({ ...prevState, isDragging: false }));
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      const quillInstance = editor.current?.getEditor();
      if (quillInstance) {
        quillInstance.on('text-change', () => {
          setMiscState(prevState => ({ ...prevState, isContentModified: true }));
        });
      }
    } else {
      editor.current?.registerToolbar(event => {
        if (event === 'text-change') {
          setMiscState(prevState => ({ ...prevState, isContentModified: true }));
        }
      });
    }
  }, [editor]);

  useEffect(() => {
    if (!miscState.isLeftPanelVisible) {
      setMiscState(prevState => ({
        ...prevState,
        rightPanelWidth: prevState.isLargeScreen ? Dimensions.get('window').width - prevState.middlePanelWidth - 10 : Dimensions.get('window').width
      }));
    } else {
      setMiscState(prevState => ({
        ...prevState,
        rightPanelWidth: Dimensions.get('window').width - prevState.middlePanelWidth - 550 - 10
      }));
    }
  }, [miscState.middlePanelWidth, miscState.isLeftPanelVisible, miscState.userStatus]);

  const toggleLeftPanel = () => {
    setMiscState(prevState => ({ ...prevState, isLeftPanelVisible: !prevState.isLeftPanelVisible }));
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

  const toggleChapter = (chapterId) => {
    setOpenChapters(prevOpenChapters => ({
      ...prevOpenChapters,
      [chapterId]: !prevOpenChapters[chapterId],
    }));
  };

  const navigateToScreen = (screenName, params) => {
    navigation.navigate(screenName, params);
  };



  const handleJoinQuestionToChapter = async (id_question, id_chapter) => {
    await join_question_to_chapter(id_question, id_chapter);
    refreshPage();
    //getMemories_Questions(subjectActive, setQuestions, tags, personal);
  };

  const handleAssociateQuestion = (questionId) => {
    if (chapters.length === 0) {
      Alert.alert("Aucun chapitre disponible", "Veuillez d'abord créer des chapitres.");
      return;
    }
    setSelected(prevState => ({ ...prevState, selectedQuestionId: questionId }));
    setModals(prevState => ({ ...prevState, isChapterModalVisible: true }));
  };

  const toggleAnswersDisplay = useCallback(async (questionId) => {
    if (activeQuestionAnswers[questionId]) {
      setActiveQuestionAnswers({});
    } else {
      await get_Question_by_id(questionId, setMiscState);
      const answers = await getMemories_Answers_to_Question(questionId);
      if (answers) {
        setActiveQuestionAnswers({ [questionId]: answers });
      }
    }
  }, [activeQuestionAnswers]);

  const confirmDeletion = (id, isChapter = true) => {
    setSelected(prevState => ({ ...prevState, deletionDetails: { id, isChapter } }));
    setModals(prevState => ({ ...prevState, deleteModalVisible: true }));
  };

  const refreshPage = async () => {
    if (subjectActive) {
      if(miscState.userStatus.chapters ==='Lecteur') { 
        await getMemories_Questions_published(subjectActive, setQuestions, tags, personal);
      }else {
     
        await getMemories_Questions(subjectActive, setQuestions, tags, personal);
    }
      await get_chapters(subjectActive, setChapters);
    } else {
      Alert.alert('Erreur', 'Aucun sujet actif sélectionné. Veuillez sélectionner un sujet pour rafraîchir les données.');
    }
  };

  const handleSaving = async () => {
    setMiscState(prevState => ({ ...prevState, isSaving: true }));
    try {
      const quillInstance = editor.current.getEditor();
      const content_new = quillInstance.getContents();
      const encodedContent = encode(JSON.stringify(content_new)); // Encode as HTML entities
      const { error: errorUpdating } = await supabase
        .from('Memoires_questions')
        .update({ full_text: encodedContent })
        .match({ id: Object.keys(activeQuestionAnswers)[0] });

      if (errorUpdating) {
        console.error('Error updating:', errorUpdating);
      } else {
        console.log('Content successfully saved to Supabase');
        // Formater les balises <reference> correctement
        const formattedContent = miscState.contentEdit.replace(/&lt;reference&gt;/g, '<reference>').replace(/&lt;\/reference&gt;/g, '</reference>');

        setMiscState(prevState => ({ 
          ...prevState, 
          isContentModified: false, 
          contentRead: formattedContent   // Mettre à jour contentRead avec contentEdit après sauvegarde
        }));
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    }
    setMiscState(prevState => ({ ...prevState, isSaving: false }));
  };

  const handlePublication_private = async (id_question, statut) => {
    await updateQuestion(id_question, 'published_private', statut);
    setQuestions(questions.map((q) =>
        q.id === id_question ? { ...q, published_private: statut } : q
      ),
    );
  };
  

  const handlePublication_public = async (id_question, statut) => {
    await updateQuestion(id_question, 'published_public', statut);
    setQuestions(questions.map((q) =>
      q.id === id_question ? { ...q, published_public: statut } : q
    ),
  );
  };
  



  useEffect(() => {
    if (Object.keys(activeQuestionAnswers)[0]) {
      const loadData = async () => {
        if (miscState.question && miscState.question.full_text) {
          if (miscState.question.full_text?.ops && miscState.question.full_text.ops[0]) {
      
          const html = new QuillDeltaToHtmlConverter(miscState.question.full_text.ops, {}).convert();
          
          setMiscState(prevState => ({
            ...prevState,
            contentRead: decode(html),
            contentEdit: decode(html),
            isLoading: false
          }));
         } else{
          const decodedContent = decode(miscState.question.full_text);
          const parsedContent = JSON.parse(decodedContent);
          const html = new QuillDeltaToHtmlConverter(parsedContent.ops, {}).convert();
          const cleanReadHtml = decode(html.replace(/<p>(.*?)&lt;reference&gt;/, '<p>$1</p>&lt;reference&gt;<p>')
                            .replace(/&lt;&#x2F;reference&gt;(.*?)<\/p>/, '</p>&lt;&#x2F;reference&gt;<p>$1</p>'))
          const cleanEditHtml = html.replace(/&lt;reference&gt;/g, '&lt;reference&gt;')
                            .replace(/&lt;\/reference&gt;/g, '&lt;&#x2F;reference&gt;')
                            .replace(/&lt;br\/&gt;/g, '<br/>');               
                      
      setMiscState(prevState => ({ ...prevState, contentRead: cleanReadHtml,contentEdit: cleanEditHtml, isLoading: false }));
      

        }

        }
      };
      loadData();
    }
  }, [activeQuestionAnswers, miscState.question, miscState.userStatus]);




  useEffect(() => {
    if (editor.current && miscState.isEditorReady && !miscState.isContentModified) {
      if (Platform.OS === 'web') {
        const quillInstance = editor.current.getEditor();
        if (quillInstance) {
          const delta = customHTMLToDelta(miscState.content);
          quillInstance.setContents(delta);
        }
      } else {
        editor.current.setContent(miscState.content);
      }
      setMiscState(prevState => ({ ...prevState, isInitialLoad: false }));
    }
  }, [miscState.content, miscState.isEditorReady]);

  useEffect(() => {
    if (miscState.isDragging) {
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
  }, [miscState.isDragging]);

  if (miscState.isLoading) {
    return (
      <View style={globalStyles.container}>
        <Text>{"Chargement ... "}</Text>
      </View>
    );
  }



  return (
    <View style={globalStyles.container}>
      
      <View style={[globalStyles.navigationContainer, { position: 'fixed', bottom: '0%', alignSelf: 'center' }]}>
      
      {/* 
      <TouchableOpacity
          onPress={() => navigateToScreen('Orientation')}
          style={[globalStyles.navButton, miscState.isHoveredOrientation && globalStyles.navButton_over]}
          onMouseEnter={() => setMiscState(prevState => ({ ...prevState, isHoveredOrientation: true }))}
          onMouseLeave={() => setMiscState(prevState => ({ ...prevState, isHoveredOrientation: false }))}
        >
          <Image source={orientationIcon  } style={{ width: 120, height: 120, opacity: 0.5 }} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigateToScreen('Projets')}
          style={[globalStyles.navButton, miscState.isHovered && globalStyles.navButton_over]}
          onMouseEnter={() => setMiscState(prevState => ({ ...prevState, isHovered: true }))}
          onMouseLeave={() => setMiscState(prevState => ({ ...prevState, isHovered: false }))}
        >
          <Image source={settingsIcon} style={{ width: 120, height: 120, opacity: 0.5 }} />
        </TouchableOpacity>
     
      */}

<CarrousselOrientation isLargeScreen={miscState.isLargeScreen} />
      </View>

      <View style={miscState.isLargeScreen ? styles.largeScreenContainer : styles.smallScreenContainer}>
         
        
        {miscState.isLeftPanelVisible && miscState.userStatus.notes!='Contributeur' && (
          <View style={(miscState.isLargeScreen && miscState.userStatus.notes!='Structurateur'&& miscState.userStatus.notes!='Publicateur') ? styles.leftPanel : styles.fullWidth}>

            <View style={globalStyles.container_wide}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={globalStyles.title}>{subject.title}</Text>
                {miscState.userStatus.chapters !== "Lecteur" && miscState.userStatus.notes !== 'Structurateur' && miscState.userStatus.notes!='Publicateur' && (
                <TouchableOpacity
                  onPress={() => {
                    setMiscState(prevState => ({
                      ...prevState,
                      iconsVisible: !prevState.iconsVisible,
                      toggleIcon: prevState.iconsVisible ? plusIcon : minusIcon
                    }));
                  }}
                >
                  <Image source={miscState.toggleIcon} style={{ width: 25, height: 25, opacity: 0.5, marginVertical: 5 }} />
                </TouchableOpacity>
                  )}
              </View>
              <View style={{ height: 10 }} />
              {miscState.userStatus.notes === 'Structurateur' && (<>
  <p>
    Voici la structure du projet. Les parties apparaissent en <strong style={{ color: 'black' }}>noir</strong> et les chapitres en <strong style={{ color: 'blue' }}>bleu</strong> à l'intérieur de chacune des parties.
  </p>
  </>
)}

{miscState.userStatus.notes === 'Publicateur' && (<>
  <p>
    Les chapitres doivent être publiés individuellement. Vous pouvez choisir une publication <strong style={{ color: '#008080' }}>privée</strong> ou une publication <strong style={{ color: '#008080' }}>publique</strong>. </p>
    <p>Dans le premier cas, seuls les presonnes ayant accès au projet auront accès à la publication. </p>
    <p>Dans le second cas, toute personne se rendant sur le site internet bioScriptum y aura accès.
  </p>
  </>
)}


            </View>

            <ScrollView>
              <View style={globalStyles.container_wide}>
                {(miscState.hasUnclassifiedQuestions ? [{ id: null, title: 'Chapitres non classés' }] : []).concat(chapters).map((chapter) => (
                  <View key={chapter.id || 'non-chapitre'}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <TouchableOpacity onPress={() => toggleChapter(chapter.id)}>
                        <Text style={globalStyles.title_chapter}>{chapter.title}</Text>
                      </TouchableOpacity>
                      {(miscState.iconsVisible || miscState.userStatus.notes === 'Structurateur') && (
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity
                            onPress={() => {
                              setSelected(prevState => ({ ...prevState, editChapterId: chapter.id }));
                              setNewTitles(prevState => ({ ...prevState, editChapterTitle: chapter.title }));
                              setModals(prevState => ({ ...prevState, isEditModalVisible: true }));
                            }}
                            style={{ marginRight: 10 }}
                          >
                            <Image source={editIcon} style={{ width: 20, height: 20, opacity: 0.5 }} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => confirmDeletion(chapter.id, true)} style={{ marginRight: 10 }}>
                            <Image source={trash} style={{ width: 25, height: 25, opacity: 0.5 }} />
                          </TouchableOpacity>
                        </View>
                      )}


                    </View>
                    {openChapters[chapter.id] && (
                      <>
                      {questions.filter(q => q.id_chapitre === chapter.id).length === 0 ? (
                        <Text style={{ color: 'grey', fontStyle: 'italic', marginVertical: 10 }}>Aucun chapitre trouvé dans cette partie</Text>
                      ) : (
                        questions.filter(q => q.id_chapitre === chapter.id).map(question => (
                          <TouchableOpacity
                            key={question.id}
                            style={[styles.questionCard, question.id === selected.selectedQuestionId && { backgroundColor: 'lightblue' }]}
                            onPress={() => {
                              setSelected(prevState => ({ ...prevState, selectedQuestionId: question.id }));
                              toggleAnswersDisplay(question.id);
                            }}
                          >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <Text style={styles.questionText}>{question.question}</Text>
                    
                              {(miscState.iconsVisible || miscState.userStatus.notes === 'Structurateur') ? (
                                <>
                                  {/*
                                  <Text style={styles.answersCount}>{question.answers_count} réponses</Text>
                                  */}
                                  
                                  <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity
                                      onPress={() => {
                                        setSelected(prevState => ({ ...prevState, editQuestionId: question.id }));
                                        setNewTitles(prevState => ({ ...prevState, editQuestionTitle: question.question }));
                                        setModals(prevState => ({ ...prevState, isEditChapterModalVisible: true }));
                                      }}
                                      style={{ marginRight: 10 }}
                                    >
                                      <Image source={editIcon} style={{ width: 20, height: 20, opacity: 0.5 }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleAssociateQuestion(question.id)} style={styles.associateButton}>
                                      <Image source={linkIcon} style={{ width: 18, height: 18, opacity: 0.5 }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => confirmDeletion(question.id, false)} style={styles.deleteButton}>
                                      <Image source={trash} style={{ width: 25, height: 25, opacity: 0.5 }} />
                                    </TouchableOpacity>
                                  </View>
                                </>
                              ) : (<Text> </Text>)}
                    
                              {miscState.userStatus.notes === 'Publicateur' && (
                                <View style={{ flexDirection: 'row' }}>
                                  <Text> Publication privée : </Text>
                                  <ToggleButton bool={question.published_private} setBool={() => handlePublication_private(question.id, !question.published_private)} />
                                  <Text> </Text>
                                  <Text> Publication publique : </Text>
                                  <ToggleButton bool={question.published_public} setBool={() => handlePublication_public(question.id, !question.published_public)} />
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))
                      )}
                    </>
                    
                    )}
                  </View>
                ))}
                <View style={{ height: 10 }} />
                <View style={{ height: 10 }} />

              </View>

              <View style={{ flexDirection: 'column', justifyContent: 'space-between', padding: 10 }}>
                
              {miscState.userStatus.chapters !== "Lecteur"  && ( 
               <>
               <TouchableOpacity style={globalStyles.globalButton_wide} onPress={() => setModals(prevState => ({ ...prevState, isModalVisible: true }))}>
                  <Text style={globalStyles.globalButtonText}>Nouvelle partie</Text>
                </TouchableOpacity>
                <TouchableOpacity style={globalStyles.globalButton_wide} onPress={() => setModals(prevState => ({ ...prevState, isModalNewQuestionVisible: true }))}>
                  <Text style={globalStyles.globalButtonText}>Nouveau chapitre</Text>
                </TouchableOpacity>
              </>
              )}
                <View style={{ height: 200 }} />
              </View>
            </ScrollView>
          
          </View>
        )}
          

        { miscState.isLargeScreen && miscState.userStatus &&(miscState.question && miscState.question.question) && (miscState.userStatus.notes!="Structurateur") && (miscState.userStatus.notes!='Publicateur') && (miscState.userStatus.notes!='Contributeur') && (miscState.userStatus.chapters === "Editeur" || miscState.userStatus.chapters === "Lecteur" || miscState.userStatus.chapters === "Auditeur") && (
          <View style={[styles.resizer, { right: miscState.rightPanelWidth - 30 }]} onMouseDown={handleMouseDown}>
            <Image source={doubleArrowIcon} style={{ width: 120, height: 120, opacity: 0.5 }} />
          </View>
        )}
 
        {(miscState.userStatus.notes !='Contributeur')&&(
        <TouchableOpacity
          onPress={toggleLeftPanel}
          style={[
            styles.toggleLine,
            {
              position: !miscState.isLargeScreen ? 'absolute' : 'relative',
              top: !miscState.isLargeScreen ? 0 : 'auto',
              bottom: !miscState.isLargeScreen ? 0 : 'auto',
              right: !miscState.isLargeScreen && miscState.isLeftPanelVisible ? 0 : 'auto',
              left: !miscState.isLargeScreen && !miscState.isLeftPanelVisible ? 0 : 'auto'
            }
          ]}
        > 
          {miscState.userStatus.notes!='Structurateur'&& (miscState.userStatus.notes!='Publicateur')  && (<>
          {miscState.isLeftPanelVisible ? (
            <Image
              source={leftArrowIcon}
              style={[
                styles.togglePanelButton,
                {
                  width: 60,
                  height: 60,
                  opacity: 0.5,
                  transform: [{ translateX: -30 }],
                  backgroundColor: 'transparent'
                }
              ]}
            />
          ) : (
            <Image
              source={rightArrowIcon}
              style={[
                styles.togglePanelButton,
                {
                  width: 60,
                  height: 60,
                  opacity: 0.5,
                  transform: [{ translateX: 30 }],
                  backgroundColor: 'transparent'
                }
              ]}
            />
          )}
          </>
        )}
        </TouchableOpacity>
        )}

        {(miscState.isLargeScreen || !miscState.isLeftPanelVisible)&&(miscState.userStatus.notes !='Contributeur') && (
          <View style={miscState.isLargeScreen ? styles.middlePanelContainer : styles.fullWidth}>
            
         
            
            <View style={{ ...styles.MiddlePanel, width: miscState.middlePanelWidth }}>
              
             
              <Text style={globalStyles.title}>
                {miscState.question && miscState.question.question ? miscState.question.question : 'Veuillez sélectionner un chapitre'}
                {miscState.isContentModified && editVsView ==='edit' &&(
                  <TouchableOpacity style={{ marginLeft: 10 }} onPress={handleSaving}>
                    <Image source={saveIcon} style={{ width: 20, height: 20, opacity: 0.5 }} />
                  </TouchableOpacity>
                )}
                {!miscState.isContentModified && miscState.userStatus.chapters && (miscState.userStatus.chapters === 'Editeur' || miscState.userStatus.chapters === 'Auditeur') && editVsView ==='edit' && (
                  <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => (setEditVsView('view'))}>
                    <Image source={viewIcon} style={{ width: 20, height: 20, opacity: 0.5 }} />
                  </TouchableOpacity>
                )}

                { miscState.userStatus.chapters && (miscState.userStatus.chapters === 'Editeur' || miscState.userStatus.chapters === 'Auditeur') && editVsView ==='view' && (
                  <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => (setEditVsView('edit'))}>
                    <Image source={editIcon} style={{ width: 20, height: 20, opacity: 0.5 }} />
                  </TouchableOpacity>
                )}



              </Text>
              
              <View style={styles.container}>
                
                {miscState.userStatus && editVsView==='edit' ? (
                  <>
                    {Platform.OS === 'web' ? (
                      <>
                        <div id="toolbar"></div>
                        <View style={styles.toolbarContainer}>
                          <ReactQuill
                            ref={editor}
                            theme="snow"
                            modules={quillModules}
                            readOnly={false}
                            bounds={'#toolbar'}
                            value={miscState.contentEdit}
                            onChange={newContent => {
                              if (!miscState.isSaving) {
                                setMiscState(prevState => ({ ...prevState, contentEdit: newContent, isContentModified: true }));
                              }
                            }}
                            onChangeSelection={() => setMiscState(prevState => ({ ...prevState, isInitialLoad: false }))}
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <RichEditor
                          ref={editor}
                          style={styles.editor}
                          initialContentHTML={miscState.contentEdit}
                          onChange={() => {
                            if (!miscState.isSaving && !miscState.isInitialLoad) setMiscState(prevState => ({ ...prevState, isContentModified: true }));
                          }}
                          onSelectionChange={() => setMiscState(prevState => ({ ...prevState, isInitialLoad: false }))}
                        />
                        <RichToolbar
                          editor={editor}
                          style={styles.toolbar}
                          iconTint="#000000"
                          selectedIconTint="#209cee"
                          selectedButtonStyle={{ backgroundColor: 'transparent' }}
                          actions={[
                            'bold', 'italic', 'underline', 'unorderedList', 'orderedList', 'insertLink', 'insertImage', 'blockQuote', 'undo', 'redo', 'save',
                          ]}
                          onSave={handleSaving}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {miscState.question && miscState.question.question && (
                      <RenderContent content={miscState.contentRead} onReferencePress={handleReferencePress} />
                    )}
                  </>
                )}
                
              </View>
            </View>
          
          

          </View>
        )}

{(miscState.isLargeScreen || !miscState.isLeftPanelVisible || miscState.userStatus.notes ==='Contributeur') && ((miscState.userStatus.notes ==='Contributeur') || (miscState.question && miscState.question.question) )&& (
    <View style={[styles.rightPanel, { width: (miscState.userStatus.notes !='Contributeur')? miscState.rightPanelWidth : '100%' }]}>
      <ScrollView>
        <NoteScreen 
          route={{ 
            params: { 
              session, 
              miscState:miscState,
              setMiscState: setMiscState, 
              filterSelectedQuestion: filterSelectedQuestion, 
              setFilterSelectedQuestion: setFilterSelectedQuestion, 
              question_reponse: miscState.question_reponse, 
              mode: miscState.userStatus?.chapters,
//              mode: (miscState.userStatus?.notes === 'Contributeur'?  'full':miscState.userStatus?.chapters), 
              reference: reference, 
              setReference: setReference, 
            } 
          }} 
          key={reference} 
        />
      </ScrollView>
    </View>
    
)}

           

        
      </View>

      

      <ModalComponent
        isVisible={modals.isChapterModalVisible}
        onClose={() => setModals(prevState => ({ ...prevState, isChapterModalVisible: false }))}
        title="Placer le chapitre dans la partie :"
        content={
          chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter.id}
              onPress={() => {
                handleJoinQuestionToChapter(selected.selectedQuestionId, chapter.id);
                setModals(prevState => ({ ...prevState, isChapterModalVisible: false }));
              }}
              style={styles.modalButton}
            >
              <Text style={styles.textStyle}>{chapter.title}</Text>
            </TouchableOpacity>
          ))
        }
      />

<ModalComponent
  isVisible={modals.isModalVisible}
  onClose={() => setModals(prevState => ({ ...prevState, isModalVisible: !prevState.isModalVisible }))}
  title="Nouvelle partie"
  inputValue={newTitles.newChapterTitle !== undefined ? newTitles.newChapterTitle : ''}  // Correction ici
  onInputChange={(text) => setNewTitles(prevState => ({ ...prevState, newChapterTitle: text }))}
  onSave={() => {
    create_chapter(newTitles.newChapterTitle, subjectActive);
    setModals(prevState => ({ ...prevState, isModalVisible: !prevState.isModalVisible }));
    setNewTitles(prevState => ({ ...prevState, newChapterTitle: '' }));
    refreshPage();
  }}
/>

<ModalComponent
  isVisible={modals.isModalNewQuestionVisible}
  onClose={() => setModals(prevState => ({ ...prevState, isModalNewQuestionVisible: !prevState.isModalNewQuestionVisible }))}
  title="Nouveau Chapitre"
  inputValue={newTitles.newQuestionTitle !== undefined ? newTitles.newQuestionTitle : ''}  // Correction ici
  onInputChange={(text) => setNewTitles(prevState => ({ ...prevState, newQuestionTitle: text }))}
  onSave={async () => {
    const question = await save_question(newTitles.newQuestionTitle, tags, subjectActive, setMiscState);
    await createTheme(newTitles.newQuestionTitle, subjectActive);
    setSelected(prevState => ({ ...prevState, selectedQuestionId: question.id }));
    setModals(prevState => ({
      ...prevState,
      isModalNewQuestionVisible: !prevState.isModalNewQuestionVisible,
      isChapterModalVisible: true,
    }));
    setNewTitles(prevState => ({ ...prevState, newQuestionTitle: '' }));
    refreshPage();
  }}
/>




      <ModalComponent
  isVisible={modals.isEditModalVisible}
  onClose={() => setModals(prevState => ({ ...prevState, isEditModalVisible: false }))}
  title="Éditer le titre de la partie"
  inputValue={newTitles.editChapterTitle!== undefined ? newTitles.editChapterTitle : ''}
  onInputChange={(text) => {setNewTitles(prevState => ({ ...prevState, editChapterTitle: text })) }}
  onSave={async () => {
    await edit_chapter(selected.editChapterId, newTitles.editChapterTitle);
    setModals(prevState => ({ ...prevState, isEditModalVisible: false }));
    setNewTitles(prevState => ({ ...prevState, editChapterTitle: '' }));
    await get_chapters(subjectActive, setChapters);
    await refreshPage();
  }}
/>


      <ModalComponent
  isVisible={modals.isEditChapterModalVisible}
  onClose={() => setModals(prevState => ({ ...prevState, isEditChapterModalVisible: false }))}
  title="Éditer le Chapitre"
  inputValue={newTitles.editQuestionTitle !== undefined ? newTitles.editQuestionTitle : ''}
  onInputChange={(text) => {
    setNewTitles(prevState => ({ ...prevState, editQuestionTitle: text }));
  }}
  onSave={async () => {
    await edit_question(selected.editQuestionId, newTitles.editQuestionTitle);
    setModals(prevState => ({ ...prevState, isEditChapterModalVisible: false }));
    setNewTitles(prevState => ({ ...prevState, editQuestionTitle: '' }));
    await refreshPage();
  }}
/>

      <ModalComponent
  isVisible={modals.deleteModalVisible}
  onClose={() => setModals(prevState => ({ ...prevState, deleteModalVisible: !prevState.deleteModalVisible }))}
  title={`Êtes-vous sûr de vouloir supprimer ${selected.deletionDetails.isChapter ? 'cette partie ' : 'ce chapitre '}? Cette action est irréversible.`}
  saveButtonText="Supprimer" // Ajoutez cette ligne pour personnaliser le texte du bouton
  onConfirm={async () => {
    if (selected.deletionDetails.isChapter) {
      await delete_chapter(selected.deletionDetails.id);
    } else {
      await delete_question(selected.deletionDetails.id);
    }
    await refreshPage();
    setModals(prevState => ({ ...prevState, deleteModalVisible: false }));
  }}
/>



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
    padding: 10,
    marginRight: 5,
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
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    transform: [{ translateY: -30 }],
    backgroundColor: 'transparent',
    position: 'fixed',
  },
  togglePanelButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resizer: {
    position: 'fixed',
    right: 0,
    width: 60,
    top: '50%',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    display: 'flex',
  },
  toggleLine: {
    width: 10,
    backgroundColor: '#b1b3b5',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    height: '100%',
    zIndex: 1,
  },
  middlePanelContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  contentContainer: {
    zIndex: 10,
    position: 'relative',
  },
});

export default ReadAnswersScreen;
