import React, { useState, useEffect } from 'react';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
  Platform,
  Alert,
  Dimensions,
  Picker,
  ActivityIndicator,
  CheckBox,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  getSubject,
  getMemories_Answers,
  integration,
  getMemories_Questions,
  get_chapters,
  submitMemories_Answer,
  update_answer_text,
  deleteMemories_Answer,
  get_user_name,
  connectAnswers,
  disconnectAnswers,
  moveAnswer,
  get_project_contributors,
  update_answer_owner,
  getExistingLink,
  updateExistingLink,
  createNewLink,
  updateAnswer,
  getTheme_byProject,
} from '../components/data_handling';

import { useFocusEffect } from '@react-navigation/native';
import { getActiveSubjectId } from '../components/local_storage';
import { globalStyles } from '../../global';
import BookIcon from '../../assets/icons/book.svg';
import PersonIcon from '../../assets/icons/person.svg';
import settings from '../../assets/icons/accueil.png';
import copyIcon from '../../assets/icons/paste.png';
import noteIcon from '../../assets/icons/notes.png';
import filterIcon from '../../assets/icons/filtre.png';
import EmptyfilterIcon from '../../assets/icons/filtre_empty.png';
import Modal from 'react-native-modal'; // Ajoutez cette ligne pour importer le composant Modal
import { 
  createAudioChunk, 
  startRecording, 
  stopRecording,
  uploadAudioToSupabase, 
  delete_audio,
  playRecording_fromAudioFile, 
  uploadImageToSupabase,
  handlePlayPause } 
  from '../components/sound_handling'; // Ajoutez cette ligne
import { transcribeAudio } from '../components/call_to_whisper';
//import { transcribeAudio } from '../components/call_to_google';
import MicroIcon from '../../assets/icons/microphone-lines-solid.svg';
import VolumeIcon from '../../assets/icons/volume_up_black_24dp.svg';
import captionIcon from '../../assets/icons/caption.png';
import trash from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import closeIcon from '../../assets/icons/close.png'; 
import edit from '../../assets/icons/pen-to-square-regular.svg';
import eyeIcon from '../../assets/icons/view.png';
import plusIcon from '../../assets/icons/plus.png';
import minusIcon from '../../assets/icons/minus.png';
import questionIcon from '../../assets/icons/question.png';
import linkIcon from '../../assets/icons/link.png';
import AttachIcon from '../../assets/icons/attach.png';
import { v4 as uuidv4 } from 'uuid';
import Upload from '../../assets/icons/upload.png';
import * as DocumentPicker from 'expo-document-picker';
import DraggableFlatList from 'react-native-draggable-flatlist';
import Clipboard from '@react-native-clipboard/clipboard';
import shareIcon from '../../assets/icons/share.png';
import playIcon from '../../assets/icons/play.png';
import pauseIcon from '../../assets/icons/pause.png';
import AnswerCard from '../components/UI_components';







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

function NoteScreen({ route }) {
 
  const navigation = useNavigation();
  const session = route.params?.session;
  const notesMode = route.params?.mode;

  const [subjectActive, setSubjectActive] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subject, setSubject] = useState([]);
  const [textFilter, setTextFilter] = useState('');
  const [dateBefore, setDateBefore] = useState(null);
  const [dateAfter, setDateAfter] = useState(null);
  const [showDateBeforePicker, setShowDateBeforePicker] = useState(false);
  const [showDateAfterPicker, setShowDateAfterPicker] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [personal, setPersonal] = useState(false);
  const [chapters,setChapters] = useState([]);
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

  //const ID_question = route.params?.question.id || '';
  const [link,setLink]=useState([]);


  const question_reponse = route.params?.miscState?.question_reponse || 'réponse';
  const [selectedQuestion, setSelectedQuestion] = useState(route.params?.miscState?.question || '');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [showFilters, setShowFilters] = useState(false); 
  const [isModalVisible, setModalVisible] = useState(false); // Ajoutez cette ligne dans les états
const [isRecording, setIsRecording] = useState(false); // Ajoutez cette ligne dans les états
const [recording, setRecording] = useState(); // Ajoutez cette ligne dans les états
const [note, setNote] = useState(''); // Ajoutez cette ligne dans les états
const [editingAnswerId, setEditingAnswerId] = useState(null);
const [editingText, setEditingText] = useState('');
const [fullscreenImage, setFullscreenImage] = useState(null);
const [showDetails, setShowDetails] = useState(false);
const windowWidth = Dimensions.get('window').width;
const isLargeScreen = windowWidth > 768;
const [userNames, setUserNames] = useState({});
const [themeNames, setThemeNames] = useState({});
const [selectedAnswers, setSelectedAnswers] = useState([]);
const [selectedAnswerIds, setSelectedAnswerIds] = useState([]);
const [userIdFilter, setUserIdFilter] = useState('');
const [userNameFilter, setUserNameFilter] = useState('');
const [selectedUserName, setSelectedUserName] = useState('');
const [selectedTheme, setSelectedTheme] = useState('');
const [showAttachement, setShowAttachement] = useState(false);
const [answer, setAnswer] = useState('');
const [PleaseWait, setPleaseWait] = useState(false);
const [draggedAnswer, setDraggedAnswer] = useState(null);
const [dragOverAnswer, setDragOverAnswer] = useState(null);
const [voirTout,setVoirTout]=useState(false);
const [users, setUsers] = useState([]);
const [themes, setThemes] = useState([]);
const [delegationUserId, setDelegationUserId] = useState(null);
const [questionReponseFilter, setQuestionReponseFilter] = useState('');  // Ajoutez cette ligne
const [answerAndQuestion, setAnswerAndQuestion] = useState(question_reponse);
const [transcribingId, setTranscribingId] = useState(null);
const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
const [selectedAnswerId, setSelectedAnswerId] = useState(null);
const [selectedUserId, setSelectedUserId] = useState(null);
const [isShareModalVisible, setIsShareModalVisible] = useState(false);
const [utiliseFilter, setUtiliseFilter] = useState('tous');
const [reluFilter, setReluFilter] = useState('relu & non_relu');
const [playbackStatus, setPlaybackStatus] = useState({});
const [currentAudioId, setCurrentAudioId] = useState(null);
const [isTranscriptionModalVisible, setIsTranscriptionModalVisible] = useState(false);
const [answerIdToTranscribe, setAnswerIdToTranscribe] = useState(null);


useEffect(() => {
  if (notesMode === 'full') {
    setVoirTout(true);
  }
}, [notesMode]);






useEffect(() => {
  if (route.params?.miscState?.question) {
    setSelectedQuestion(route.params?.miscState?.question)
  }
}, [route.params?.miscState?.question]);


useFetchActiveSubjectId(setSubjectActive, setSubject, navigation);

useEffect(() => {

  const fetchUsers = async () => {
    try {
      const data = await get_project_contributors(subjectActive);
      if (!data) {
        console.error("Failed to fetch users: No data returned");
      } else {
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  if (subjectActive) {
    fetchUsers();
  }
}, [subjectActive]);

useEffect(() => {

  const fetchThemes = async () => {
    try {
      const data = await getTheme_byProject(subjectActive);
      if (!data) {
        console.error("Failed to fetch connections: No data returned");
      } else {
        setThemes(data)
      }
    } catch (error) {
      console.error("Error fetching connections: ", error);
    }
  };

  if (subjectActive) {
    fetchThemes();
  }
}, [subjectActive]);


useEffect(() => {
  if (selectedQuestion && selectedQuestion.id) {

  const fetchData = async () => {
    setLink(await getExistingLink(selectedQuestion.id, "id_question"));
  };
  
  fetchData();
  
}
}, [selectedQuestion]);

const copyLinkToClipboard = (text) => {
  Clipboard.setString(text);
  Alert.alert('Lien copié dans le presse-papier', text);
};

const toggleLinkStatus = async () => {
  
  if (link[0]) {
    const newExpired = !link[0].expired;
    await updateExistingLink(link[0].id,newExpired) ;
    setLink({ ...link, expired: newExpired });
    Alert.alert(newExpired ? 'Lien activé' : 'Lien désactivé');
  } else {
    const newLink = await createNewLink(selectedQuestion.id,'id_question')
    setLink(await getExistingLink(selectedQuestion.id,'id_question'));
    setIsShareModalVisible(false)
    }
  
};



useEffect(() => {
if(session.user){
    setDelegationUserId({ user: { id: session.user.id } });
  };

}, [session]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchAnswers = async () => {
        const fetchedAnswers = await getMemories_Answers();
        const sortedAnswers = fetchedAnswers.sort((a, b) => a.rank - b.rank);
        setAnswers(sortedAnswers);
        setIsLoading(false);
      };
  
      fetchAnswers();
    }, [navigation])
  );
  
  const handleAssignOwner = (answerId) => {
    setSelectedAnswerId(answerId);
    setIsAssignModalVisible(true);
  };
  
  const handleUpdateOwner = async () => {
    if (selectedAnswerId && selectedUserId) {
      await update_answer_owner(selectedAnswerId, selectedUserId);
      setIsAssignModalVisible(false);
      refreshAnswers();
    } else {
      Alert.alert("Erreur", "Veuillez sélectionner un utilisateur.");
    }
  };
  
  const selectAnswer = (answerId) => {
    const answer = answers.find((a) => a.id === answerId);
    if (answer) {
      setSelectedAnswers([answer.id]);
      setEditingAnswerId(answer.id);
      setEditingText(answer.answer);
      Alert.alert('Réponse sélectionnée', 'Vous avez sélectionné une réponse spécifique.');
    }
  };
  useEffect(() => {
    if (Platform.OS === 'web') {
      window.selectAnswer = selectAnswer;
    }
  }, [answers]);

  const copyAllToClipboard = () => {
    const combinedText = filteredAnswers.map(answer => {
      const ref = "<reference>" + answer.id + "</reference>";
      return `${answer.answer}\n\n${ref}`;
    }).join('\n\n');
    Clipboard.setString(combinedText);
    Alert.alert("Texte copié", "Toutes les réponses filtrées ont été copiées dans le presse-papiers.");
  };
  

  
  const copyToClipboard = (text, id_answer) => {
    const ref = "<reference>" + id_answer + "</reference>";
    const contentToCopy = `${text}\n\n${ref}`;
    Clipboard.setString(contentToCopy);
    Alert.alert("Texte copié", "Le texte et la référence ont été copiés dans le presse-papiers.");
  };
  

  const refreshAnswers = async () => {
  
    const answers = await getMemories_Answers();
    const sortedAnswers = answers.sort((a, b) => a.rank - b.rank);
        setAnswers(sortedAnswers);
      setIsLoading(false);
  };


  useEffect(() => {
    const fetchUserNames = async () => {
      const names = {};
      for (const answer of answers) {
        if (!names[answer.id_user]) {
          names[answer.id_user] = await get_user_name(answer.id_user);
        }
      }
      setUserNames(names);
    };
  
    if (answers.length > 0) {
      fetchUserNames();
    }
  }, [answers]);
  
  useEffect(() => {
    const fetchThemeNames = async () => {
      const themeNames = {};
      for (const answer of answers) {
        if (!themeNames[answer.id_connection]) {
  const theme = themes.find(theme => theme.id === answer.id_connection);
  if (theme) {
    themeNames[answer.id_connection] = theme.theme;
  }
}

      }
      setThemeNames(themeNames);
    };
  
    if (answers.length > 0) {

      fetchThemeNames();
    }
  }, [answers]);


  useEffect(() => {
    const fetchQuestionsAndChapters = async () => {

      if (subjectActive != null) {
        await getMemories_Questions(subjectActive, setQuestions, tags, personal);
        await get_chapters(subjectActive, setChapters);
      }
    };

    fetchQuestionsAndChapters();
  }, [subjectActive]);

  const navigateToScreen = (screenName, params) => {
    navigation.navigate(screenName, params);
  };

  const handleQuestionChange = (e) => {
    const selectedQuestionId = e.target.value;
    setSelectedQuestion(selectedQuestionId);
  
    const selectedQuestionObj = questions.find(question => question.id.toString() === selectedQuestionId);
    if (selectedQuestionObj) {
      setSelectedChapter(selectedQuestionObj.id_chapitre.toString());
    }
  };
  const handleInsertLink = (answerId) => {
    const quillInstance = editor.current.getEditor();
    const range = quillInstance.getSelection();
    if (range) {
      quillInstance.clipboard.dangerouslyPasteHTML(
        range.index,
        `<a href="javascript:void(0)" onclick="selectAnswer(${answerId})">Lien vers réponse ${answerId}</a>`
      );
    }
  };

  const handleRemoveFilters = () => {
    
    setTextFilter('')
    setSelectedQuestion('')
    route.params?.setReference('')
    setSelectedTheme('')
    setDateBefore('')
    setDateAfter('')
    setSelectedUserName('')
    setQuestionReponseFilter('')
    setReluFilter('relu & non_relu')
    setUtiliseFilter('tous')
    

  };
  

  const handleAnswerMove = async (data) => {
    console.log("Drag end initiated with data:", data);
    setAnswers(data);
  
    // Utilisez draggedAnswer pour trouver la réponse déplacée
    const movedAnswer = draggedAnswer;
    console.log("movedAnswer:", movedAnswer);
  
    if (movedAnswer) {
      const newIndex = data.findIndex(answer => answer.id === movedAnswer.id);
      const answerBefore = newIndex > 0 ? data[newIndex - 1] : null;
      const answerAfter = newIndex < data.length - 1 ? data[newIndex + 1] : null;
  
      let newRank;
      if (answerBefore && answerAfter) {
        newRank = (answerBefore.rank + answerAfter.rank) / 2;
      } else if (answerBefore) {
        newRank = answerBefore.rank + 1; // Si pas de answerAfter
      } else if (answerAfter) {
        newRank = answerAfter.rank - 1; // Si pas de answerBefore
      } else {
        newRank = 1; // Default value if there are no answers before or after
      }

      await moveAnswer(movedAnswer.id, newRank);
      refreshAnswers();
    }
};




  const handleShowDetails = () => {
    setShowDetails(!showDetails)
  };
  

  const handleDeleteAnswer = async (answerToDelete) => {

    if (!answerToDelete) {
      Alert.alert("Erreur", "La réponse n'a pas été trouvée.");
      return;
    }


    try {
      const result = await deleteMemories_Answer(answerToDelete);
      if (result.success) {
        const updatedAnswers = answers.filter(ans => ans.id !== answerToDelete.id);
        setAnswers(updatedAnswers);
        Alert.alert("Réponse supprimée");
      } else {
        Alert.alert("Erreur", "La suppression de la réponse a échoué");
      }
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
  };

 // Créer une liste d'IDs de questions pour le chapitre sélectionné
 const [questionIdsForSelectedChapter, setQuestionIdsForSelectedChapter] = useState([]);

useEffect(() => {
  // Vérifier si un chapitre est sélectionné
  if (selectedChapter) {
    // Filtrer les questions pour ne garder que celles appartenant au chapitre sélectionné
    const filteredQuestions = questions.filter(q => q.id_chapitre === selectedChapter);
    // Extraire les IDs des questions filtrées et les convertir en chaînes de caractères
    const ids = filteredQuestions.map(q => q.id.toString());
    setQuestionIdsForSelectedChapter(ids);

  } else {
    setQuestionIdsForSelectedChapter('');
  }
}, [selectedChapter, questions]);

const filteredAnswers = answers.filter(answer => {
  const answerDate = new Date(answer.created_at);
  const beforeDate = dateBefore ? new Date(dateBefore) : null;
  const afterDate = dateAfter ? new Date(dateAfter) : null;

  const userName = userNames[answer.id_user];
  const theme = answer.id_connection;


  return (
    (!textFilter || answer.answer.includes(textFilter)) &&
    (!beforeDate || answerDate < beforeDate) &&
    (!afterDate || answerDate > afterDate) &&
    (route.params?.reference === '' || answer.id === (route.params?.reference).toString())&&
    (selectedQuestion === '' || 
     (selectedQuestion === 'none' && answer.id_question === null) ||
     (answer.id_question !== null && (selectedQuestion.id).toString() === answer.id_question.toString())) &&
    (!selectedUserName || (userName && userName.toLowerCase().includes(selectedUserName.toLowerCase()))) &&
    (!selectedTheme || (theme && theme===selectedTheme )) &&
    (questionReponseFilter === '' || answer.question_reponse === questionReponseFilter) &&
    ((reluFilter === 'relu' && answer.quality) || (reluFilter === 'non_relu' && !answer.quality) || reluFilter === 'relu & non_relu')) &&
    ((utiliseFilter === 'used' && answer.used) || (utiliseFilter === 'not_used' && !answer.used) || utiliseFilter === 'tous')
  
});









  
  
  
  
  
  const handleSaveNote = async () => {
    const audio = isRecording ? `${Date.now()}.mp3` : null;
    if (audio) {
      const uploadedFileName = await uploadAudioToSupabase(recording, audio);
      if (!uploadedFileName) {
        Alert.alert('Erreur', 'Échec du téléchargement du fichier audio');
        return;
      }
    }

    await submitMemories_Answer(note, null, delegationUserId, !!audio, audio,null,resetAnswerAndFetchQuestion,answerAndQuestion);
    setNote('');
    setModalVisible(false);
    // Rafraîchir les notes
  };
  
  const handleRecording = async () => {
    if (isRecording) {
      try {
        setIsRecording(false);
        setModalVisible(false)
        setPleaseWait(true);
        const baseName = `${Date.now()}`;
        const { uri, duration } = await stopRecording(recording, `${baseName}.mp3`);
  
        const maxDuration = 60;  // Durée maximale d'un morceau en secondes
        const chunks = Math.ceil(duration / maxDuration);
        const connectionId = uuidv4();
  
        for (let i = 0; i < chunks; i++) {
          const start = i * maxDuration;
          const end = (i + 1) * maxDuration > duration ? duration : (i + 1) * maxDuration;
          const chunkName = `${baseName}_part_${i + 1}.mp3`;
  
          const chunkUri = await createAudioChunk(uri, chunkName, start, end);
          await handleAnswerSubmit(chunkName, true, chunkUri, false, connectionId);
        }
      } catch (error) {
        console.error('Error during handleRecording:', error);
      } finally {
        setPleaseWait(false);
      }
    } else {
      const temp = await startRecording();
      setRecording(temp);
      setIsRecording(true);
    }
  };
  

  const handleUpdateAnswer = async (answerId, newText) => {
    try {
      const result = await update_answer_text(answerId, newText);
      await refreshAnswers();
      setEditingAnswerId(null);
      setEditingText('');
    } catch (error) {
      Alert.alert("Erreur lors de la mise à jour", error.message);
    }
  };

  const handleTranscribe = async (answerId) => {
    const answerToUpdate = answers.find(ans => ans.id === answerId);
    if (answerToUpdate && answerToUpdate.audio) {
      try {
        const transcribedText = await transcribeAudio(answerToUpdate.link_storage);
        await update_answer_text(answerToUpdate.id, transcribedText);
        setTimeout(async () => {
          await refreshAnswers();
        }, 1000);
      } catch (error) {
        Alert.alert("Erreur de transcription", error.message);
      }
    }
  };
 
 

  const linkAnswers = async () => {
    await connectAnswers(selectedAnswers);
    setSelectedAnswers([]);
    await refreshAnswers();
  };

  const handleAnswerSubmit = async (name, isMedia, uri = null, isImage = false, connectionID = null) => {
    let transcribedText = isMedia ? "audio à convertir en texte" : answer;
    if (isImage) {
      transcribedText = "Ceci est une photographie";
    }
  
    if (isMedia && uri) {
      let uploadedFileName;
      if (name.endsWith('.mp3')) {
        uploadedFileName = await uploadAudioToSupabase(uri, name);
      } else {
        uploadedFileName = await uploadImageToSupabase(uri, name);
      }
  
      if (!uploadedFileName) {
        Alert.alert("Erreur", `Échec du téléchargement du fichier ${name.endsWith('.mp3') ? 'audio' : 'image'}`);
        return;
      }
    }
  
    await submitMemories_Answer(transcribedText, selectedQuestion.id, delegationUserId, isMedia, name, isImage, connectionID, async () => {
      setAnswer('');
      setTimeout(async () => {
        await refreshAnswers();
      }, 1000);
    },
    answerAndQuestion
  );
  };

  const handleUploadPhoto = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*', // Accepter les fichiers image
        copyToCacheDirectory: false
      });
  
      if (!result.canceled) {
        let uri, name, mimeType;
  
        // Gérer les différences de plateforme
        if (result.output && result.output.length > 0) {
       
          const file = result.output[0];
      
          uri = URL.createObjectURL(file);
          name = file.name;
          mimeType = file.type;
        } else if (result.assets && result.assets.length > 0) {
          console.log("Using result.assets");
          const asset = result.assets[0];
          console.log("Selected asset: ", asset);
          uri = asset.uri;
          name = asset.name;
          mimeType = asset.mimeType;
        } else {
          console.error("Invalid file selection result", result);
          throw new Error("Invalid file selection result");
        }
  
        if (!uri || !name) {
          console.error("Invalid file selection: URI or name is missing", { uri, name });
          throw new Error("Invalid file selection: URI or name is missing");
        }
  
        // Vérification du type MIME
        if (mimeType && mimeType.startsWith('image/')) {
          console.log("File selected is an image file:", { uri, name, mimeType });
        } else {
          console.error("Selected file is not an image file:", { uri, name, mimeType });
          Alert.alert("Erreur", "Le fichier sélectionné n'est pas un fichier image");
          return;
        }
  
        console.log("File selected successfully:", { uri, name });
        await handleAnswerSubmit(name, true, uri,true);
      } else {
        console.error("File selection was not successful: ", result);
        Alert.alert("Erreur", "Sélection du fichier échouée");
      }
    } catch (error) {
      console.error("Error handling file upload: ", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de la sélection du fichier");
    }
  };

  const handleFiles = async () => {
    setShowAttachement(!showAttachement)
  };

  const getAudioDuration = (uri) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(uri);
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
      audio.addEventListener('error', (e) => {
        reject(e);
      });
    });
  };
  


  const handleCaptionClick = (answerId) => {
    setAnswerIdToTranscribe(answerId);
    setIsTranscriptionModalVisible(true);
  };
  
  const handleConfirmTranscription = async () => {
    if (answerIdToTranscribe) {
      setTranscribingId(answerIdToTranscribe);
      await update_answer_text(answerIdToTranscribe, "audio pas encore converti en texte");
      await refreshAnswers();
      setTranscribingId(null);
      setIsTranscriptionModalVisible(false);
      setAnswerIdToTranscribe(null);
    }
  };
  
  

  const handleUploadAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: false
      });
  
      if (!result.canceled) {
        let uri, name, mimeType;
  
        if (result.output && result.output.length > 0) {
          const file = result.output[0];
          uri = URL.createObjectURL(file);
          name = file.name;
          mimeType = file.type;
        } else if (result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          uri = asset.uri;
          name = asset.name;
          mimeType = asset.mimeType;
        } else {
          throw new Error("Invalid file selection result");
        }
  
        if (!uri || !name) {
          throw new Error("Invalid file selection: URI or name is missing");
        }
  
        console.log("Selected audio URI:", uri);
        if (mimeType && mimeType.startsWith('audio/')) {
          try {
            const duration = await getAudioDuration(uri); // Modifié pour récupérer directement la durée
            console.log("Audio duration:", duration);
            const maxDuration = 60;  // Durée maximale d'un morceau en secondes
            const chunks = Math.ceil(duration / maxDuration);
            const connectionId = uuidv4();
  
            for (let i = 0; i < chunks; i++) {
              const start = i * maxDuration;
              const end = (i + 1) * maxDuration > duration ? duration : (i + 1) * maxDuration;
              const chunkName = `${name}_part_${i + 1}.mp3`;
  
              console.log(`Creating chunk: ${chunkName} from ${start} to ${end}`);
              const chunkUri = await createAudioChunk(uri, chunkName, start, end);
  
              if (chunkUri) {
                console.log(`Uploading chunk: ${chunkName}`);
                await handleAnswerSubmit(chunkName, true, chunkUri, false, connectionId);
              } else {
                console.error(`Failed to create chunk: ${chunkName}`);
              }
            }
          } catch (e) {
            console.error("Error getting audio duration:", e);
            Alert.alert("Erreur", "Impossible d'obtenir la durée de l'audio");
          }
        } else {
          Alert.alert("Erreur", "Le fichier sélectionné n'est pas un fichier audio");
        }
      } else {
        Alert.alert("Erreur", "Sélection du fichier échouée");
      }
    } catch (error) {
      console.error("Error during file selection or processing:", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de la sélection du fichier");
    }
  };
  
  
  
    
  const isConnectedToSelectedAnswer = (answer) => {
    const selectedConnections = selectedAnswers.map(id => {
      const selectedAnswer = answers.find(ans => ans.id === id);
      return selectedAnswer ? selectedAnswer.connection : null;
    }).filter(conn => conn !== null);
  
    return selectedConnections.includes(answer.connection);
  };
  useEffect(() => {
    answers.forEach((answer) => {
      if (answer.answer === "audio pas encore converti en texte" && answer.audio) {
        handleTranscribe(answer.id);
      }
    });
  }, [answers]);
  const closeFullscreenImage = () => {
    setFullscreenImage(null);
  };

  if (isLoading) {
    return (
      <Text>Loading</Text>
    );
  }




  return (
    <View style={globalStyles.container}>
      

      {fullscreenImage && (
  <View style={styles.fullscreenContainer}>
    <TouchableOpacity style={styles.closeButton} onPress={closeFullscreenImage}>
      <Text style={styles.closeButtonText}>X</Text>
    </TouchableOpacity>
    <Image source={{ uri: fullscreenImage }} style={styles.fullscreenImage} />
  </View>
)}


{notesMode === "Contributeur" && (<>
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
 

 
  <Text style={globalStyles.title}>
    {!questionReponseFilter.includes('question') && ("Notes")}
    {!questionReponseFilter.includes('question') && !questionReponseFilter.includes('réponse') && (" & ")}
    {!questionReponseFilter.includes('réponse') && ("Questions")}
  </Text> 
  <View style={[styles.toggleTextContainer, { flexDirection: 'column', justifyContent: 'center' }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <Text style={styles.toggleText}>Notes </Text>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          !questionReponseFilter.includes('question') && styles.selectedToggle
        ]}
        onPress={() =>
          setQuestionReponseFilter((prev) =>
            prev.includes('question')
              ? prev.replace('question', '')
              : prev + 'question'
          )
        }
      >
        <View
          style={[
            styles.toggleButtonCircle,
            questionReponseFilter.includes('question') ? { left: 2 } : { right: 2 }
          ]}
        />
      </TouchableOpacity>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.toggleText}>Questions</Text>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          !questionReponseFilter.includes('réponse') && styles.selectedToggle
        ]}
        onPress={() =>
          setQuestionReponseFilter((prev) =>
            prev.includes('réponse')
              ? prev.replace('réponse', '')
              : prev + 'réponse'
          )
        }
      >
        <View
          style={[
            styles.toggleButtonCircle,
            questionReponseFilter.includes('réponse') ? { left: 2 } : { right: 2 }
          ]}
        />
      </TouchableOpacity>
    </View>
  </View>
</View>

</>)}


     
        

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 5 }}>
        
        {notesMode === "Contributeur" && (<>
        {!questionReponseFilter.includes('question') &&(
      <TouchableOpacity onPress={() => {setAnswerAndQuestion("réponse");setModalVisible(true)}} style={globalStyles.globalButton_narrow}>
      <Text style={globalStyles.globalButtonText}>Ajouter une note</Text>
    </TouchableOpacity>
    )}
    {!questionReponseFilter.includes('réponse') &&(
      <TouchableOpacity onPress={() => {setAnswerAndQuestion("question"); setModalVisible(true)}} style={globalStyles.globalButton_narrow}>
      <Text style={globalStyles.globalButtonText}>Poser une question</Text>
    </TouchableOpacity>
    )}
    </>
  )}


</View>
   
    <Modal isVisible={isModalVisible}>
    <View style={styles.overlay}>
  <View style={styles.modalContainer}>
    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
      <Image source={closeIcon} style={styles.closeIcon} />
    </TouchableOpacity>
    <Text style={styles.modalTitle}>Ajouter une note</Text>

    <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginBottom: 10 }}>
  
    <Text>S'exprimer au nom de :</Text>
        <Picker
          selectedValue={delegationUserId.user.id}
          onValueChange={(itemValue) => {
            setDelegationUserId(itemValue);
            setDelegationUserId({ user: { id: itemValue } });
          }}
        >
          {users.map((user) => (
            <Picker.Item key={user.id_user} label={user.name} value={user.id_user} />
          ))}
        </Picker>


    <TouchableOpacity
      style={[
        globalStyles.globalButton_wide,
        { backgroundColor: isRecording ? "red" : '#b1b3b5', marginRight: 5 },
      ]}
      onPress={handleRecording}
    >
      <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Image source={MicroIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
        <Text style={globalStyles.globalButtonText}>
            
          {isRecording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
          
        </Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity onPress={handleFiles} style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} >
      
    <Image source={AttachIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
    </TouchableOpacity>
    
    {showAttachement && (
      <>
  <TouchableOpacity
    style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5', flex: 1, marginLeft: 5 }]}
    onPress={handleUploadAudio}
  >
    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Image source={Upload} style={{ width: 60, height: 60, opacity: 0.5 }} />
      <Text style={globalStyles.globalButtonText}>
        Envoyer un enregistrement vocal
      </Text>
    </View>
    
  </TouchableOpacity>
  <TouchableOpacity
  style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5', marginLeft: 5 }]}
  onPress={handleUploadPhoto}
>
  <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <Image source={Upload} style={{ width: 60, height: 60, opacity: 0.5 }} />
    <Text style={globalStyles.globalButtonText}>
      Envoyer une photographie
    </Text>
  </View>
  
</TouchableOpacity>
</>
)}


  
  <TextInput
    style={globalStyles.input}
    value={answer}
    onChangeText={setAnswer}
    placeholder="Écrire une réponse..."
    multiline={true}
    numberOfLines={4}
  />





  <TouchableOpacity
    style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5' , marginRight: 5 }]}
    onPress={() => handleAnswerSubmit('', false)}
  >
    <Text style={globalStyles.globalButtonText}>Envoyer la réponse écrite</Text>
  </TouchableOpacity>
  </View>      

  </View>
</View>
</Modal>

<Modal isVisible={isTranscriptionModalVisible}>
  <View style={styles.overlay}>
    <View style={styles.modalContainer}>
      <TouchableOpacity onPress={() => setIsTranscriptionModalVisible(false)} style={styles.closeButton}>
        <Image source={closeIcon} style={styles.closeIcon} />
      </TouchableOpacity>
      <Text style={styles.modalTitle}>Confirmation de retranscription</Text>
      <Text style={styles.modalText}>
        Voulez-vous vraiment retranscrire ce message audio ? Le texte existant sera alors effacé et remplacé par la nouvelle retranscription.
      </Text>
      <TouchableOpacity onPress={handleConfirmTranscription} style={globalStyles.globalButton_wide}>
        <Text style={globalStyles.globalButtonText}>Confirmer</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


<View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 5 }}>
<TouchableOpacity onPress={() => setShowDetails(!showDetails)} style={styles.filterIcon}>
  <Image 
    source={showDetails ? minusIcon : plusIcon} 
    style={{ width: 50, height: 50, opacity: 0.5, marginVertical: 30 }} 
  />
</TouchableOpacity>
  <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterIcon}>
    <Image source={filterIcon} style={{ width: 50, height: 50, opacity: 0.5, marginVertical : 30 }} />
  </TouchableOpacity>

  <TouchableOpacity onPress={() => handleRemoveFilters()} style={styles.filterIcon}>
  <Image source={EmptyfilterIcon} style={{ width: 50, height: 50, opacity: 0.5, marginVertical : 30 }} />
  </TouchableOpacity>

  <TouchableOpacity onPress={() => { copyAllToClipboard() }}>
     <Image source={copyIcon} style={{ width: 50, height: 50, opacity: 0.5, marginVertical : 30 }} />
   </TouchableOpacity>

{/*
  {notesMode !== 'full' &&(
  <TouchableOpacity onPress={() => setIsShareModalVisible(true)} style={styles.filterIcon}>
  <Image source={shareIcon} style={{ width: 50, height: 50, opacity: 0.5, marginVertical : 30 }} />
</TouchableOpacity>
  )}




{showDetails && (
<TouchableOpacity onPress={() => linkAnswers(answers)} style={styles.filterIcon}>
  <Image 
    source={linkIcon} 
    style={{ width: 50, height: 50, opacity: 0.5, marginVertical: 30 }} 
  />
</TouchableOpacity>
)}
*/}



</View>

{showFilters && (
  <View style={styles.filterContainer}>
    <TextInput
      style={[styles.input, { backgroundColor: 'white' }]}
      placeholder="Filtrer par texte"
      value={textFilter}
      onChangeText={setTextFilter}
    />
    <View style={styles.dropdownContainer}>
      <Picker
        selectedValue={selectedUserName}
        onValueChange={(itemValue, itemIndex) => setSelectedUserName(itemValue)}
        style={styles.dropdown}
      >
        <Picker.Item label="Tous les utilisateurs" value="" />
        {Object.values(userNames).map((name, index) => (
          <Picker.Item key={index} label={name} value={name} />
        ))}
      </Picker>
    </View>
    <View style={styles.dropdownContainer}>
  <Picker
    selectedValue={selectedTheme}
    onValueChange={(itemValue, itemIndex) => setSelectedTheme(itemValue)}
    style={styles.dropdown}
  >
    <Picker.Item label="Tous les thèmes" value="" />
    {themes
      .filter(theme => answers.some(answer => answer.id_connection === theme.id)) // Filtrer les thèmes sans réponse
      .map((theme, index) => (
        <Picker.Item key={index} label={theme.theme} value={theme.id} />
      ))}
  </Picker>
</View>
<View style={styles.dropdownContainer}>
<Picker
  selectedValue={selectedQuestion}
  onValueChange={(itemValue, itemIndex) => {
    const itemValueNumber = Number(itemValue); // Convertir itemValue en nombre
    const selectedQuestion_temp = questions.find(question => question.id === itemValueNumber);

    if (selectedQuestion_temp) {
        setSelectedQuestion(selectedQuestion_temp);
    } else {
      setSelectedQuestion('');
    }
}}

  style={styles.dropdown}
>
  <Picker.Item label="Tous les chapitres" value="" />
  {questions
    .filter(question => answers.some(answer => answer.id_question === question.id)) // Filtrer les thèmes sans réponse
    .map((question, index) => (
      <Picker.Item key={index} label={question.question} value={question.id} />
    ))}
</Picker>

</View>

    <View style={styles.dateFilterContainer}>
      {Platform.OS === 'web' ? (
        <DatePicker
          selected={dateBefore}
          onChange={(date) => setDateBefore(date)}
          placeholderText="Filtrer avant la date"
          className="date-picker"
          style={styles.datePicker}
        />
      ) : (
        <View style={styles.datePicker}>
          <Button title="Filtrer avant la date" onPress={() => setShowDateBeforePicker(true)} />
          {showDateBeforePicker && (
            <DateTimePicker
              value={dateBefore || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || dateBefore;
                setShowDateBeforePicker(false);
                setDateBefore(currentDate);
              }}
              style={styles.datePicker}
            />
          )}
        </View>
      )}
      {Platform.OS === 'web' ? (
        <DatePicker
          selected={dateAfter}
          onChange={(date) => setDateAfter(date)}
          placeholderText="Filtrer après la date"
          className="date-picker"
          style={styles.datePicker}
        />
      ) : (
        <View style={styles.datePicker}>
          <Button title="Filtrer après la date" onPress={() => setShowDateAfterPicker(true)} />
          {showDateAfterPicker && (
            <DateTimePicker
              value={dateAfter || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || dateAfter;
                setShowDateAfterPicker(false);
                setDateAfter(currentDate);
              }}
              style={styles.datePicker}
            />
          )}
        </View>
      )}
    </View>

    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'space-between',}}>
      <Text></Text>
    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
  <Text style={styles.toggleText}>Relu</Text>
  <TouchableOpacity
    style={[
      styles.toggleButton,
      (reluFilter === 'relu' ||reluFilter === 'relu & non_relu') && styles.selectedToggle
    ]}
    onPress={() =>
      setReluFilter((prev) =>
        prev === 'relu' ? '' : (prev === 'relu & non_relu' ? 'non_relu' : (prev === 'non_relu' ? 'relu & non_relu' : 'relu'))
      )
    }
  >
    <View
      style={[
        styles.toggleButtonCircle,
        (reluFilter === 'relu' ||reluFilter === 'relu & non_relu') ? { right: 2 } : { left: 2 }
      ]}
    />
  </TouchableOpacity>
</View>
<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
  <Text style={styles.toggleText}>Non relu</Text>
  <TouchableOpacity
    style={[
      styles.toggleButton,
      (reluFilter === 'non_relu' ||reluFilter === 'relu & non_relu') && styles.selectedToggle
    ]}
    onPress={() =>
      setReluFilter((prev) =>
        prev === 'non_relu' ? '' : (prev === 'relu & non_relu' ? 'relu' : (prev === 'relu' ? 'relu & non_relu' : 'non_relu'))
      )
    
    }
  >
    <View
      style={[
        styles.toggleButtonCircle,
        (reluFilter === 'non_relu' ||reluFilter === 'relu & non_relu') ? { right: 2 } : { left: 2 }
      ]}
    />
  </TouchableOpacity>
</View>

</View>



<View style={{ flexDirection: 'column', alignItems: 'center' }}>

<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
  <Text style={styles.toggleText}>Utilisé</Text>
  <TouchableOpacity
    style={[
      styles.toggleButton,
      (utiliseFilter === 'used' || utiliseFilter === 'tous') && styles.selectedToggle
    ]}
    onPress={() =>
      setUtiliseFilter((prev) =>
        prev === 'used' ? '' : (prev === 'tous' ? 'not_used' : (prev === 'not_used' ? 'tous' : 'used'))
      )
    }
  >
    <View
      style={[
        styles.toggleButtonCircle,
        (utiliseFilter === 'used' || utiliseFilter === 'tous') ? { right: 2 } : { left: 2 }
      ]}
    />
  </TouchableOpacity>
</View>

<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
  <Text style={styles.toggleText}>Non utilisé</Text>
  <TouchableOpacity
    style={[
      styles.toggleButton,
      (utiliseFilter === 'not_used' || utiliseFilter === 'tous') && styles.selectedToggle
    ]}
    onPress={() =>
      setUtiliseFilter((prev) =>
        prev === 'not_used' ? '' : (prev === 'tous' ? 'used' : (prev === 'used' ? 'tous' : 'not_used'))
      )
    }
  >
    <View
      style={[
        styles.toggleButtonCircle,
        (utiliseFilter === 'not_used' || utiliseFilter === 'tous') ? { right: 2 } : { left: 2 }
      ]}
    />
  </TouchableOpacity>
</View>
</View>
<Text></Text>
</View>
  </View>
 
)}


<DraggableFlatList
  data={filteredAnswers}
  renderItem={({ item, drag, isActive }) => {
    const isSelected = selectedAnswerIds.includes(item.id); // Vérifier si la réponse est sélectionnée
    const question_temp = questions.find(q => q.id === item.id_question);
    let chapter;
    if (question_temp) {
      chapter = chapters.find(q => q.id === question_temp.id_chapitre);
    }
    return (
      <TouchableOpacity
        key={item.id}
  style={[
    styles.answerCard,
    selectedAnswerIds.includes(item.id) && styles.selectedAnswerCard,
    //isActive && styles.selectedAnswerCard,
    isConnectedToSelectedAnswer(item) && styles.connectedAnswerCard,
  ]}
  onLongPress={() => {
    setDraggedAnswer(item);
    drag();
  }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/*
        {showDetails && (
          <CheckBox
            value={isSelected}
            onValueChange={(newValue) => {
              if (newValue) {
                setSelectedAnswerIds([...selectedAnswerIds, item.id]);
              } else {
                setSelectedAnswerIds(selectedAnswerIds.filter(id => id !== item.id));
              }
            }}
          />
        )}
        */}
          <View style={{ flex: 1 }}>
            {showDetails && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
                

                    <Text style={{ fontWeight: 'bold' }}>
                      {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {isLargeScreen && (
                    <Text style={{ fontWeight: 'bold' }}>
                      {chapter ? chapter.title + " - " : ''} {question_temp ? question_temp.question : ''}
                    </Text>
                  
                )}
 
              </View>
            )}
            {item.id === editingAnswerId ? (
              <>
                <TextInput
                  style={globalStyles.input}
                  value={editingText}
                  onChangeText={setEditingText}
                  multiline={true}
                  numberOfLines={10}
                />
                <TouchableOpacity
                  onPress={() => handleUpdateAnswer(item.id, editingText)}
                  style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5', alignItems: 'center', paddingVertical: 10, marginRight: 5 },]}
                >
                  <Text style={globalStyles.globalButtonText}>Enregistrer</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {item.answer === "audio pas encore converti en texte" && (
                  <View style={styles.container}>
                    <ActivityIndicator size="large" color="#0b2d52" />
                  </View>
                )}
                {item.answer !== "audio pas encore converti en texte" && (
                  <>
                  {item.image && (
                    <>
                    <TouchableOpacity onPress={() => setFullscreenImage(`https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${item.link_storage}`)}>
            
            
                    <Image 
                    source={{ uri: `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${item.link_storage}` }} 
                    style={{ width: '100%', height: 300, resizeMode: 'contain' }} 
                  />
                  <Text></Text>
                  <Text style={{ justifyContent: 'center', textAlign: 'center' }}>{item.answer}</Text>
                  
                    </TouchableOpacity>
                  </>
                  )}
                  {!item.image && (
                    <View style={{ flexDirection: 'row'}}>
                     {item.question_reponse == "question" && (<Image source={questionIcon} style={{ width: 36, height: 36, opacity: 0.5, marginLeft: 15 }} />)}
                  <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
                  </>
                )}
              </>
            )}


<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>

{showDetails && (
   
                
<>

   {item.answer !== "audio pas encore converti en texte" && item.id !== editingAnswerId && (
     <TouchableOpacity
       onPress={() => {
         setEditingAnswerId(item.id);
         setEditingText(item.answer);
       }}
     >
       <Image source={edit} style={{ width: 28, height: 28, opacity: 0.5 }} />
       {isLargeScreen && <Text>Editer</Text>}
     </TouchableOpacity>
   )}
   {item.audio && (
     <>

     <TouchableOpacity onPress={() => handleCaptionClick(item.id)} style={styles.playButton}>
         <Image source={captionIcon} style={{ width: 25, height: 25, opacity: 0.5, marginHorizontal: 15 }} />
         {isLargeScreen && <Text>Retranscrire</Text>}
       </TouchableOpacity>
 

     </>
   )}
   {item.image && (
     <TouchableOpacity onPress={() => setFullscreenImage(`https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${item.link_storage}`)}>
       <Image source={eyeIcon} style={{ width: 35, height: 35, opacity: 0.5, marginHorizontal: 15 }} />
       {isLargeScreen && <Text>Voir</Text>}
     </TouchableOpacity>
   )}
   {isLargeScreen && (<>
   <TouchableOpacity onPress={() => { copyToClipboard(item.answer,item.id); refreshAnswers(); }}>
     <Image source={copyIcon} style={{ width: 27, height: 27, opacity: 0.5, marginHorizontal: 15 }} />
     {isLargeScreen && <Text>Copier</Text>}
   </TouchableOpacity>
   </>)}
   
   <View style={{flexDirection: 'column', alignItems: 'center' }}>
   <TouchableOpacity
  style={[styles.toggleButton, item.used && styles.selectedToggle]}
  onPress={async () => {
    await updateAnswer(item.id, 'used', !item.used);
    const updatedAnswers = answers.map(answer =>
      answer.id === item.id ? { ...answer, used: !answer.used } : answer
    );
    setAnswers(updatedAnswers);
  }}
>
  <View style={{ flexDirection: 'column', alignItems: 'center' }}>
    <View style={[
      styles.toggleButtonCircle,
      { left: item.used ? 2 : null, right: !item.used ? 2 : null }
    ]} />
    
  </View>
  <Text style={[styles.toggleText, { marginTop: 5 }]}> </Text>
</TouchableOpacity>
<Text >{item.used ? 'Utilisé' : 'Non utilisé'}</Text>
</View>
<View style={{flexDirection: 'column', alignItems: 'center' }}>
<TouchableOpacity
  style={[styles.toggleButton, item.quality && styles.selectedToggle]}
  onPress={async () => {
    await updateAnswer(item.id, 'quality', !item.quality);
    const updatedAnswers = answers.map(answer =>
      answer.id === item.id ? { ...answer, quality: !answer.quality } : answer
    );
    setAnswers(updatedAnswers);
  }}
>
  <View style={{flexDirection: 'column', alignItems: 'center' }}>
    <View style={[
      styles.toggleButtonCircle,
      { left: item.quality ? 2 : null, right: !item.quality ? 2 : null }
    ]} />
    
  </View>
  <Text style={[styles.toggleText, { marginTop: 5 }]}> </Text>
</TouchableOpacity>
<Text >{item.quality ? 'Relu' : 'Non relu'}</Text>
</View>



   

   <TouchableOpacity onPress={() => handleDeleteAnswer(item)}>
     <Image source={trash} style={{ width: 36, height: 36, opacity: 0.5, marginLeft: 15 }} />
     {isLargeScreen && <Text>Supprimer</Text>}
   </TouchableOpacity>
 
   </>
              
            )}

{!showDetails && (
<Text></Text>
)}


            <Text style={{ textAlign: 'right', marginTop: 10, fontStyle: 'italic' }} onPress={() => handleAssignOwner(item.id)}>
              {userNames[item.id_user]}
            </Text>
            </View>
            {item.audio && showDetails && (
     
       <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
  <TouchableOpacity onPress={() => handlePlayPause(item.id, item.link_storage,currentAudioId,setCurrentAudioId,playbackStatus,setPlaybackStatus)}>
    <Image source={playbackStatus.isPlaying && currentAudioId === item.id ? pauseIcon : playIcon} style={{ width: 25, height: 25 }} />
  </TouchableOpacity>
  <Slider
    style={{ flex: 1, marginHorizontal: 10 }}
    value={currentAudioId === item.id ? playbackStatus.positionMillis || 0 : 0}
    minimumValue={0}
    maximumValue={playbackStatus.durationMillis || 0}
    onSlidingComplete={async (value) => {
      if (playbackStatus.sound) {
        await playbackStatus.sound.setPositionAsync(value);
      }
    }}
  />
</View>

     
   )}
          </View>
        </View>
        
      </TouchableOpacity>
    );
  }}


  keyExtractor={(item) => item.id.toString()}
  onDragEnd={({ data }) => handleAnswerMove(data)}

/>






<Modal isVisible={isAssignModalVisible}>
<View style={styles.overlay}>
  <View style={styles.modalContainer}>
    <TouchableOpacity onPress={() => setIsAssignModalVisible(false)} style={styles.closeButton}>
      <Image source={closeIcon} style={styles.closeIcon} />
    </TouchableOpacity>
    <Text style={styles.modalTitle}>Attribuer à un utilisateur</Text>
    <Picker
      selectedValue={selectedUserId}
      onValueChange={(itemValue) => setSelectedUserId(itemValue)}
    >
      {users.map((user) => (
        <Picker.Item key={user.id_user} label={user.name} value={user.id_user} />
      ))}
    </Picker>
    <TouchableOpacity onPress={handleUpdateOwner} style={globalStyles.globalButton_wide}>
      <Text style={globalStyles.globalButtonText}>Attribuer</Text>
    </TouchableOpacity>
  </View>
  </View>
</Modal>

<Modal
  animationType="slide"
  transparent={true}
  visible={isShareModalVisible}
  onRequestClose={() => setIsShareModalVisible(false)}
>
<View style={styles.overlay}>
<View style={styles.modalContainer}>
<TouchableOpacity onPress={() => setIsShareModalVisible(false)} style={styles.closeButton}>
      <Image source={closeIcon} style={styles.closeIcon} />
    </TouchableOpacity>
      <Text style={styles.modalText}>
      {'\n'}
        Vous pouvez partager un lien qui permettra à votre proche de contribuer au projet sans identification préalable. {'\n'}
        {'\n'}
        Attention, n'importe qui ayant ce lien aura un accès libre aux contributions propres aux chapitres considérés, tant que vous laissez le lien de partage actif.
        {'\n'}
        {'\n'}
      </Text>
  
      {link[0] ? (
        <>
          <TouchableOpacity style={globalStyles.globalButton_wide} onPress={() => copyLinkToClipboard("https://marcel-eight.vercel.app/"+link[0].id)}>
            <Text style={globalStyles.globalButtonText}>Copier le lien dans le presse-papier</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={globalStyles.globalButton_wide} onPress={toggleLinkStatus}>
            <Text style={globalStyles.globalButtonText}>{link[0].expired ? 'Réactiver le lien' : 'Désactiver le lien'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={globalStyles.globalButton_wide} onPress={toggleLinkStatus}>
          <Text style={globalStyles.globalButtonText}>Créer un lien de partage</Text>
        </TouchableOpacity>
      )}

    
  </View>
  </View>
</Modal>


<View>
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

    </View>
  );
}

const styles = StyleSheet.create({
  navButton: {
    padding: 10,
  },
  filterIcon: {
    alignSelf: 'flex-end',
    margin: 10,
  },
  filterContainer: {
    width: '90%',
    alignSelf: "center",
    padding: 10,
    zIndex: 3,
    marginHorizontal :5,
    marginVertical : 20,
    borderWidth: 1, // Ajoutez cette ligne
    borderColor: '#ccc', // Ajoutez cette ligne pour définir la couleur de la bordure
    backgroundColor:'#b1b3b5',
  },

  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 3, // Ajoutez cette ligne
  },
  input: {
    height: 40,
    padding: 10,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    zIndex: 3, // Ajoutez cette ligne
  },
  datePicker: {
    flex: 1,
    marginHorizontal: 5,
    zIndex: 3, // Ajoutez cette ligne
    position: 'absolute', // Ajoutez cette ligne pour le placer au-dessus
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
    zIndex: 1, // Ajoutez cette ligne
  },
  answerText: {
    fontSize: 16,
    marginLeft: 20,
  },
  dropdownContainer: {
    marginVertical: 10,
  },
  dropdown: {
    height: 40,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
 

  recordButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  fullscreenImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  /*
  selectedAnswerCard: {
    backgroundColor: '#93d9e6', // Couleur de fond différente pour les réponses sélectionnées
  },
  connectedAnswerCard: {
    backgroundColor: '#cce4e8', // Bleu clair pour les réponses connectées
  },
  */
  selectedAnswerCard: {
    //borderColor: 'blue', // Remplacez cette ligne par votre style personnalisé
    backgroundColor: '#93d9e6',
    //borderWidth: 2,
    zIndex: 2,
  },
  connectedAnswerCard: {
    //borderColor: 'green', // Remplacez cette ligne par votre style personnalisé
    backgroundColor: '#cce4e8',
    //borderWidth: 2,
    zIndex: 2,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  selectedToggle: {
    backgroundColor: '#008080',
  },
  toggleButtonCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    position: 'absolute',
  },
  toggleTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  toggleText: {
    marginHorizontal: 10,
    fontSize: 16,
    width: 100,
  },

  modalContainer : {
    backgroundColor: 'white', //changer la couleur ici
    width:'100%',
    height:'100%',
    padding: 20,
    borderRadius: 10,
  },

  modalContainer: {
    backgroundColor: '#E8FFF6',
    width: '90%',
    padding: 20,
    borderRadius: 10,
    alignSelf: 'center',
    zIndex: 20,
  },
  
  closeButtonText: {
    color: 'white',
    fontSize: 30,
  },


  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },


  closeIcon: {
    width: 24,
    height: 24,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  
  
  
});


export default NoteScreen;
