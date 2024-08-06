import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  get_user_name,
  delete_question,
  get_Question_by_id,
  integration,
  getUserStatus,
  save_question,
  linkAnalysis,
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
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import copyIcon from '../../assets/icons/paste.png';
import save from '../../assets/icons/save.png';
import note from '../../assets/icons/notes.png';
import NoteScreen from './NoteScreen';
import ReadNotesScreen from './ReadNotesScreen';
import plusIcon from '../../assets/icons/plus.png';
import minusIcon from '../../assets/icons/minus.png';
import doubleArrowIcon from '../../assets/icons/arrows_1.png';
import leftArrowIcon from '../../assets/icons/left-arrow.png';
import rightArrowIcon from '../../assets/icons/right-arrow.png';
import ReactHtmlParser from 'react-html-parser'; 
import { decode, encode } from 'he';


const useFetchActiveSubjectId = (setSubjectActive, setSubject, setIsLoading, navigation) => {
  useFocusEffect(
    useCallback(() => {
      const fetchActiveSubjectId = async () => {
        const temp = await getActiveSubjectId();
        console.log("Voici le projet actif récupéré : ",temp)
        setSubjectActive(temp);
        if (temp) {
          const temp2 = await getSubject(temp);
          setSubject(temp2);
        } else {
          navigation.navigate('Projets');
        }
        setIsLoading(false); // Définir isLoading à false une fois le sujet actif récupéré
      };
      fetchActiveSubjectId();
    }, [navigation])
  );
};

const useFetchData = (id_user, subjectActive, setQuestions, tags, personal, setChapters, setUserStatus) => {
  useEffect(() => {
    if (subjectActive ) {
      getMemories_Questions(subjectActive, setQuestions, tags, personal);
      get_chapters(subjectActive, setChapters);
      getUserStatus(id_user, subjectActive).then(setUserStatus);
    }
  }, [subjectActive, tags, personal, id_user]); 
};

function ReadQuestionsScreen({ route }) {
  const navigation = useNavigation();
  const session = route.params?.session;
  const { suffix } = useParams();
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
  const [isModalNewQuestionVisible, setIsModalNewQuestionVisible] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
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
  const [initialMouseX, setInitialMouseX] = useState(null);
  const [initialMiddlePanelWidth, setInitialMiddlePanelWidth] = useState(middlePanelWidth);
  const [question, setQuestion] = useState('');
  const [hasUnclassifiedQuestions, setHasUnclassifiedQuestions] = useState(false);
  const [isContentModified, setIsContentModified] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showIntegratedNotes, setShowIntegratedNotes] = useState(false);
  const [userStatus, setUserStatus] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [iconsVisible, setIconsVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [toggleIcon, setToggleIcon] = useState(plusIcon);
  const [question_reponse, setQuestion_reponse] = useState('réponse');
  const windowWidth = Dimensions.get('window').width;
  const [middlePanelWidth, setMiddlePanelWidth] = useState(0.5 * windowWidth);
  const [rightPanelWidth, setRightPanelWidth] = useState(windowWidth - middlePanelWidth - 550);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const isLargeScreen = windowWidth > 768;
  const [content, setContent] = useState('<p>Commencez à écrire ici...</p>');
  const [isEditorReady, setEditorReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [reference, setReference] = useState('');


  const CustomParser = ({ content, onReferencePress }) => {
    return ReactHtmlParser(content, {
      transform: (node, index) => {
        if (node.type === 'tag' && node.name === 'reference') {
          return (
            <TouchableOpacity key={index} onPress={() => onReferencePress(node.children[0].data)}>
              <Text style={{ color: 'blue' }}>{node.children[0].data}</Text>
            </TouchableOpacity>
          );
        }
      }
    });
  };
  
  
  const RenderContent = ({ content }) => {
    const handleReferencePress = (referenceContent) => {
      console.log("Coucou !");
      setReference(referenceContent);
      console.log("Contenu référencé :", referenceContent);
    };
  
    const transformNode = (node, index) => {
      if (node.type === 'tag' && node.name === 'reference') {
        return (
          <Text key={index} onPress={() => handleReferencePress(node.children[0].data)} style={{ color: 'blue' }}>
            {node.children[0].data}
          </Text>
        );
      }
    
      // Eviter d'utiliser <div> à l'intérieur de <p>
      if (node.type === 'tag' && node.name === 'div' && node.parent && node.parent.name === 'p') {
        return (
          <View key={index} style={{ display: 'inline' }}>
            {ReactHtmlParser(node.children, { transform: transformNode })}
          </View>
        );
      }
    
      // Rendu par défaut pour les autres nœuds
      return undefined;
    };
    
  
    return (
      <View>
        {ReactHtmlParser(content, { transform: transformNode })}
      </View>
    );
  };
  
  
  
  
  
  
  
  
  
  
  

  
  useFetchActiveSubjectId(setSubjectActive, setSubject, setIsLoading, navigation);
  useFetchData(session.user.id, subjectActive, setQuestions, tags, personal, setChapters, setUserStatus);

  useEffect(() => {
    const fetchUserStatus = async () => {
      const status = await getUserStatus(session.user.id, subjectActive);
      setUserStatus(status);
      if (status.chapters === 'Auditeur') {
        setQuestion_reponse('question');
      }

      const name = await get_user_name(session.user.id);
      setUserName(name);
      if (!status.access) {
        navigateToScreen('Projets');
      }
      if (status.chapters === "Pas d'accès" && navigation.isFocused()) {
        navigateToScreen('Incipit');
        setMiddlePanelWidth(0);
      }
      
    };
    if (subjectActive) {
      fetchUserStatus();
    }
    const unsubscribe = navigation.addListener('focus', () => {
      const windowWidth = Dimensions.get('window').width;
      setMiddlePanelWidth(0.5 * windowWidth);
      if (userStatus.chapters === "Pas d'accès") {
        setRightPanelWidth(windowWidth - 550);
      } else {
        setRightPanelWidth(windowWidth - middlePanelWidth - 550);
      }
    });
    return unsubscribe;
  }, [navigation, userStatus]);

  useEffect(() => {
    if (userStatus.chapters === "Pas d'accès") {
      setRightPanelWidth(windowWidth - 550);
    } else {
      setRightPanelWidth(windowWidth - middlePanelWidth - 550);
    }
  }, [userStatus]);

  useEffect(() => {
    if (userStatus === "non trouvé") {
      navigateToScreen('Projets');
    }
  }, [userStatus]);

  useEffect(() => {
    if (question.id) {
      toggleAnswersDisplay(question.id);
    }
  }, [question]);

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
      editor.current?.registerToolbar((event) => {
        if (event === 'text-change') {
          setIsContentModified(true);
        }
      });
    }
  }, [editor]);

  useEffect(() => {
    if (!isLeftPanelVisible) {
      if (isLargeScreen) {
        setRightPanelWidth(windowWidth - middlePanelWidth - 10);
      } else {
        setRightPanelWidth(windowWidth);
      }
    }
    if (isLeftPanelVisible) {
      setRightPanelWidth(windowWidth - middlePanelWidth - 550 - 10);
    }
  }, [middlePanelWidth, isLeftPanelVisible, userStatus]);

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

  

  const toggleChapter = (chapterId) => {
    setOpenChapters((prevOpenChapters) => ({
      ...prevOpenChapters,
      [chapterId]: !prevOpenChapters[chapterId],
    }));
  };

  const navigateToScreen = (screenName, params) => {
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
      }
    }
  };

  const confirmDeletion = (id, isChapter = true) => {
    setDeletionDetails({ id, isChapter });
    setDeleteModalVisible(true);
  };

  const refreshPage = async () => {
    if (subjectActive) {
      await getMemories_Questions(subjectActive, setQuestions, tags, personal);
      await get_chapters(subjectActive, setChapters);
    } else {
      Alert.alert('Erreur', 'Aucun sujet actif sélectionné. Veuillez sélectionner un sujet pour rafraîchir les données.');
    }
  };



  const customHTMLToDelta = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const deltaOps = [];
    
    const traverseNodes = (nodes) => {
      nodes.forEach((node) => {
        if (node.nodeName === 'P') {
          traverseNodes(node.childNodes);
          deltaOps.push({ insert: '\n' });
        } else if (node.nodeName === 'reference') {
          deltaOps.push({ insert: { reference: node.textContent } });
        } else {
          deltaOps.push({ insert: node.textContent || node.outerHTML || '' });
        }
      });
    };
  
    traverseNodes(doc.body.childNodes);
    
    return deltaOps;
  };
  

  
  useEffect(() => {
    if (Object.keys(activeQuestionAnswers)[0]) {
      const loadData = async () => {
        if (question && question.full_text) {
          const decodedContent = decode(question.full_text);
          const parsedContent = JSON.parse(decodedContent);
   /*
          if (userStatus.chapters === "Editeur") {
            console.log("parsedContent.ops : ", parsedContent.ops);
            
            const ops = parsedContent.ops.map(op => {
              if (op.insert && typeof op.insert === 'string') {
                  // Échapper les balises <reference>...</reference> dans les chaînes de caractères
                  const newInsert = op.insert.replace(/<reference>(.*?)<\/reference>/g, (_, reference) => `&lt;reference&gt;${reference}&lt;/reference&gt;`);
                  console.log("Old insert :", op.insert);
                  console.log("New insert :", newInsert);
                  return {
                      insert: newInsert
                  };
              } else if (op.insert && typeof op.insert === 'object' && op.insert.reference) {
                  // Traiter les objets contenant des références
                  return {
                      insert: `&lt;reference&gt;${op.insert.reference}&lt;/reference&gt;`
                  };
              }
              return op;
          });
          
          
          
            const html = new QuillDeltaToHtmlConverter(ops, {}).convert();
            setContent(decode(html));
        } else {
          */
            const html = new QuillDeltaToHtmlConverter(parsedContent.ops, {}).convert();
      
            if (userStatus.chapters === "Editeur"){
              setContent(html);
            }else {
              setContent(decode(html));
            }
 
         
          
        }
        setIsLoading(false);
      };
  
      loadData();
    }
  }, [activeQuestionAnswers, question, userStatus.chapters]);
  
  
  
  useEffect(() => {
    if (editor.current && isEditorReady && !isContentModified) {
      if (Platform.OS === 'web') {
        const quillInstance = editor.current.getEditor();
        if (quillInstance) {
          const delta = customHTMLToDelta(content);
          quillInstance.setContents(delta);
        }
      } else {
        editor.current.setContent(content);
      }
      setIsInitialLoad(false);
    }
  }, [content, isEditorReady]);
  
  
  
  
  

  const handleSaving = async () => {
    setIsSaving(true);
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
        setIsContentModified(false);
      }
    } catch (error) {
      console.error('Failed to save content:', error);
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
         <Text> {"Chargement ... "}</Text>
        </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={[globalStyles.navigationContainer, { position: 'fixed', bottom: '0%', alignSelf: 'center' }]}>
        <TouchableOpacity
          onPress={() => navigateToScreen('Projets')}
          style={[globalStyles.navButton, isHovered && globalStyles.navButton_over]}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image source={settings} style={{ width: 120, height: 120, opacity: 0.5 }} />
        </TouchableOpacity>
      </View>
      
    

      <View style={isLargeScreen ? styles.largeScreenContainer : styles.smallScreenContainer}>
  
      {isLeftPanelVisible && (
    <View style={isLargeScreen ? styles.leftPanel : styles.fullWidth}>
      <View style={globalStyles.container_wide}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={globalStyles.title}>{subject.title}</Text>
          <TouchableOpacity
            onPress={() => {
              setIconsVisible(!iconsVisible);
              setToggleIcon(iconsVisible ? plusIcon : minusIcon);
            }}
          >
            <Image source={toggleIcon} style={{ width: 25, height: 25, opacity: 0.5, marginVertical: 5 }} />
          </TouchableOpacity>
        </View>
        <Text> </Text>
      </View>
      <ScrollView>
        <View style={globalStyles.container_wide}>
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
                    <TouchableOpacity
                      key={question.id}
                      style={[styles.questionCard, question.id === selectedQuestionId && { backgroundColor: 'lightblue' }]}
                      onPress={() => {
                        setSelectedQuestionId(question.id);
                        toggleAnswersDisplay(question.id);
                      }}
                    >
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
                 
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          ))}
          <Text>  </Text>
          <Text>  </Text>
         
        </View>
      
        <View style={{ flexDirection: 'column', justifyContent: 'space-between', padding: 10 }}>
          <TouchableOpacity style={globalStyles.globalButton_wide} onPress={() => setIsModalVisible(true)}>
            <Text style={globalStyles.globalButtonText}>Nouvelle partie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.globalButton_wide} onPress={() => setIsModalNewQuestionVisible(true)}>
            <Text style={globalStyles.globalButtonText}>Nouveau chapitre</Text>
          </TouchableOpacity>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
         
        </View>
        
      </ScrollView>
    </View>
  )}
       
        
        
        {isLargeScreen && (userStatus.chapters === "Editeur" || userStatus.chapters === "Lecteur" || userStatus.chapters === "Auditeur") && (
          <View style={[styles.resizer, { right: rightPanelWidth - 30 }]} onMouseDown={handleMouseDown}>
            <Image source={doubleArrowIcon} style={{ width: 120, height: 120, opacity: 0.5 }} />
          </View>
        )}
        <TouchableOpacity
          onPress={toggleLeftPanel}
          style={[
            styles.toggleLine,
            {
              position: !isLargeScreen ? 'absolute' : 'relative',
              top: !isLargeScreen ? 0 : 'auto',
              bottom: !isLargeScreen ? 0 : 'auto',
              right: !isLargeScreen && isLeftPanelVisible ? 0 : 'auto',
              left: !isLargeScreen && !isLeftPanelVisible ? 0 : 'auto'
            }
          ]}
        >
          {isLeftPanelVisible ? (
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
        </TouchableOpacity>
        
        {isLargeScreen && (userStatus.chapters === "Editeur" || userStatus.chapters === "Lecteur" || userStatus.chapters === "Auditeur") && (
          <View style={isLargeScreen ? styles.middlePanelContainer : styles.fullWidth}>
            <View style={{ ...styles.MiddlePanel, width: middlePanelWidth }}>
              
              <Text style={globalStyles.title}>
                {question && question.question ? question.question : 'Veuillez sélectionner un chapitre'}
                {isContentModified && (
                  <TouchableOpacity style={{ marginLeft: 10 }} onPress={handleSaving}>
                    <Image source={save} style={{ width: 20, height: 20, opacity: 0.5 }} />
                  </TouchableOpacity>
                )}
              </Text>
              
              
              <View style={styles.container}>
  {userStatus.chapters === "Editeur" ? (
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
              value={content}
              onChange={(newContent) => {
                if (!isSaving) {
                  setContent(newContent);
                  setIsContentModified(true);
                }
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
    </>
  ) : (
    <>
      {question && question.question && (
        <RenderContent content={content} />
      )}

    </>
  )}
</View>


            </View>
          </View>
        )}
        


        {(isLargeScreen || !isLeftPanelVisible) && (
          
          
          <View style={[styles.rightPanel, { width: rightPanelWidth }]}> 
            <ScrollView>
            <NoteScreen route={{ params: { session, question, question_reponse, mode: userStatus.notes, reference } }} key={reference} />
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
              <Text>Placer le chapitre dans la partie :</Text>
              <Text> </Text>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(!isModalVisible)}
      >
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalNewQuestionVisible}
        onRequestClose={() => setIsModalNewQuestionVisible(!isModalNewQuestionVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Nouveau Chapitre</Text>
            <TextInput
              style={styles.modalInput}
              onChangeText={setNewQuestionTitle}
              value={newQuestionTitle}
              placeholder="Titre du chapitre"
            />
            <TouchableOpacity
              style={[globalStyles.globalButton_wide]}
              onPress={async () => {
                const question = await save_question(newQuestionTitle, tags, subjectActive, setQuestion);
                setSelectedQuestionId(question.id);
                setIsModalNewQuestionVisible(!isModalNewQuestionVisible);
                setNewQuestionTitle('');
                setIsChapterModalVisible(true);
                refreshPage();
              }}
            >
              <Text style={globalStyles.globalButtonText}>Créer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[globalStyles.globalButton_wide]} onPress={() => setIsModalNewQuestionVisible(!isModalNewQuestionVisible)}>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditChapterModalVisible}
        onRequestClose={() => setIsEditChapterModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Éditer le Chapitre</Text>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(!deleteModalVisible)}
      >
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
    transform: [{ translateY: -30 }], // Assurez-vous que translateY soit un nombre
    backgroundColor: 'transparent',
    position: 'fixed', // Utilisez 'fixed' pour positionner par rapport à l'écran
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
});

export default ReadQuestionsScreen;
