import React, { useState, useEffect } from 'react';
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
} from '../components/data_handling';

import { useFocusEffect } from '@react-navigation/native';
import { getActiveSubjectId } from '../components/local_storage';
import { globalStyles } from '../../global';
import BookIcon from '../../assets/icons/book.svg';
import PersonIcon from '../../assets/icons/person.svg';
import settings from '../../assets/icons/settings.svg';
import copyIcon from '../../assets/icons/paste.png';
import noteIcon from '../../assets/icons/notes.png';
import filterIcon from '../../assets/icons/filtre.png';
import Modal from 'react-native-modal'; // Ajoutez cette ligne pour importer le composant Modal
import { createAudioChunk, startRecording, stopRecording, uploadAudioToSupabase, delete_audio,playRecording_fromAudioFile, uploadImageToSupabase } from '../components/sound_handling'; // Ajoutez cette ligne
import { transcribeAudio } from '../components/call_to_google';
import MicroIcon from '../../assets/icons/microphone-lines-solid.svg';
import VolumeIcon from '../../assets/icons/volume_up_black_24dp.svg';
import trash from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import closeIcon from '../../assets/icons/close.png'; 
import edit from '../../assets/icons/pen-to-square-regular.svg';
import eyeIcon from '../../assets/icons/view.png';
import plusIcon from '../../assets/icons/plus.png';
import minusIcon from '../../assets/icons/minus.png';
import linkIcon from '../../assets/icons/link.png';
import AttachIcon from '../../assets/icons/attach.png';
import { v4 as uuidv4 } from 'uuid';
import Upload from '../../assets/icons/upload.png';
import * as DocumentPicker from 'expo-document-picker';
import DraggableFlatList from 'react-native-draggable-flatlist';





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

  const question = route.params?.question.id || '';
  const [selectedQuestion, setSelectedQuestion] = useState(question);
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
const [selectedAnswers, setSelectedAnswers] = useState([]);
const [selectedAnswerIds, setSelectedAnswerIds] = useState([]);
const [userIdFilter, setUserIdFilter] = useState('');
const [userNameFilter, setUserNameFilter] = useState('');
const [selectedUserName, setSelectedUserName] = useState('');
const [showAttachement, setShowAttachement] = useState(false);
const [answer, setAnswer] = useState('');
const [PleaseWait, setPleaseWait] = useState(false);
const [draggedAnswer, setDraggedAnswer] = useState(null);
const [dragOverAnswer, setDragOverAnswer] = useState(null);
const [voirTout,setVoirTout]=useState(false);
const [users, setUsers] = useState([]);
const [delegationUserId, setDelegationUserId] = useState(null);

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
    }, [])
  );
  
  
 

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
  

  const handleDeleteAnswer = async (answerId) => {
    const answerToDelete = answers.find(ans => ans.id === answerId);
    if (!answerToDelete) {
      Alert.alert("Erreur", "La réponse n'a pas été trouvée.");
      return;
    }

    if (answerToDelete.audio) {
      try {
        await delete_audio(answerToDelete.link_storage);
      } catch (error) {
        Alert.alert("Erreur lors de la suppression de l'audio", error.message);
        return;
      }
    }

    try {
      const result = await deleteMemories_Answer(answerId);
      if (result.success) {
        const updatedAnswers = answers.filter(ans => ans.id !== answerId);
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

  return (
    (!textFilter || answer.answer.includes(textFilter)) &&
    (!beforeDate || answerDate < beforeDate) &&
    (!afterDate || answerDate > afterDate) &&
    (question === '' || 
     (question === 'none' && answer.id_question === null) ||
     (answer.id_question !== null && question.toString() === answer.id_question.toString())) &&
    (selectedChapter === '' || 
     (selectedChapter === 'none' && answer.id_question === null) || 
     (questionIdsForSelectedChapter.length === 0 || questionIdsForSelectedChapter.includes(answer.id_question?.toString()))) &&
    (!selectedUserName || (userName && userName.toLowerCase().includes(selectedUserName.toLowerCase())))
  );
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

    await submitMemories_Answer(note, null, delegationUserId, !!audio, audio);
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
  
        const chunks = Math.ceil(duration / 30);
        const connectionId = uuidv4();
  
        for (let i = 0; i < chunks; i++) {
          const start = i * 30;
          const end = (i + 1) * 30 > duration ? duration : (i + 1) * 30;
          const chunkName = `${baseName}_part_${i + 1}.mp3`;
  
          const chunkUri = await createAudioChunk(uri, chunkName, start, end);
          await handleAnswerSubmit(chunkName, true, chunkUri, false, connectionId);
        }
      } catch (error) {
        console.error('Error during handleRecording:', error);
      } finally {
        console.log("Voilà c'est fait")
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

  const handleAnswerSubmit = async (name, isMedia, uri = null,isImage,connectionID) => {
    setModalVisible(false)
    let transcribedText = isMedia ? "audio pas encore converti en texte" : answer;
    if (isImage){
      transcribedText = "Ceci est une photographie"
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

    await submitMemories_Answer(transcribedText, question, delegationUserId, isMedia, name,isImage, connectionID,async () => {
      setAnswer('');
      setTimeout(async () => {
        await refreshAnswers();
      }, 1000);
    }
  
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
            const chunks = Math.ceil(duration / 30);
            const connectionId = uuidv4();
  
            for (let i = 0; i < chunks; i++) {
              const start = i * 30;
              const end = (i + 1) * 30 > duration ? duration : (i + 1) * 30;
              const chunkName = `${name}_part_${i + 1}.mp3`;
  
              const chunkUri = await createAudioChunk(uri, chunkName, start, end);
              await handleAnswerSubmit(chunkName, true, chunkUri, false, connectionId);
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
      {(question || voirTout) && (<>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={globalStyles.globalButton_wide}>
      <Text style={globalStyles.globalButtonText}>Ajouter une note</Text>
    </TouchableOpacity>
   
    <Modal isVisible={isModalVisible}>
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
        isRecording ? styles.recordingButton : {},
        { backgroundColor: isRecording ? "red" : '#b1b3b5', marginRight: 5 },
      ]}
      onPress={handleRecording}
    >
      <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Image source={MicroIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
        <Text style={globalStyles.globalButtonText}>
            
          {isRecording ? "Arrêter l'enregistrement" : "Répondre"}
          
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
</Modal>


<View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 5 }}>
  <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterIcon}>
    <Image source={filterIcon} style={{ width: 50, height: 50, opacity: 0.5, marginVertical : 30 }} />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => setShowDetails(!showDetails)} style={styles.filterIcon}>
  <Image 
    source={showDetails ? minusIcon : plusIcon} 
    style={{ width: 50, height: 50, opacity: 0.5, marginVertical: 30 }} 
  />
</TouchableOpacity>
{showDetails && (
<TouchableOpacity onPress={() => linkAnswers(answers)} style={styles.filterIcon}>
  <Image 
    source={linkIcon} 
    style={{ width: 50, height: 50, opacity: 0.5, marginVertical: 30 }} 
  />
</TouchableOpacity>
)}
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
  </View>
)}

<DraggableFlatList
  data={filteredAnswers}
  renderItem={({ item, drag, isActive }) => {
    const isSelected = selectedAnswerIds.includes(item.id); // Vérifier si la réponse est sélectionnée
    const question = questions.find(q => q.id === item.id_question);
    let chapter;
    if (question) {
      chapter = chapters.find(q => q.id === question.id_chapitre);
    }
    return (
      <TouchableOpacity
        key={item.id}
  style={[
    styles.answerCard,
    selectedAnswerIds.includes(item.id) && styles.selectedAnswerCard,
    isActive && styles.selectedAnswerCard,
    isConnectedToSelectedAnswer(item) && styles.connectedAnswerCard,
  ]}
  onPress={() => {
    setDraggedAnswer(item);
    drag();
  }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
          <View style={{ flex: 1 }}>
            {showDetails && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                {isLargeScreen && (
                  <>
                    <Text style={{ fontWeight: 'bold' }}>
                      {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={{ fontWeight: 'bold' }}>
                      {chapter ? chapter.title + " - " : ''} {question ? question.question : ''}
                    </Text>
                  </>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  {item.answer !== "audio pas encore converti en texte" && item.id !== editingAnswerId && (
                    <TouchableOpacity
                      onPress={() => {
                        setEditingAnswerId(item.id);
                        setEditingText(item.answer);
                      }}
                    >
                      <Image source={edit} style={{ width: 28, height: 28, opacity: 0.5 }} />
                    </TouchableOpacity>
                  )}
                  {item.audio && (
                    <TouchableOpacity onPress={() => playRecording_fromAudioFile(item.link_storage)} style={styles.playButton}>
                      <Image source={VolumeIcon} style={{ width: 35, height: 35, opacity: 0.5, marginHorizontal: 15 }} />
                    </TouchableOpacity>
                  )}
                  {item.image && (
                    <TouchableOpacity onPress={() => setFullscreenImage(`https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${item.link_storage}`)}>
                      <Image source={eyeIcon} style={{ width: 35, height: 35, opacity: 0.5, marginHorizontal: 15 }} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => { copyToClipboard(item.answer); integration(item.id); refreshAnswers(); }}>
                    <Image source={copyIcon} style={{ width: 27, height: 27, opacity: 0.5, marginHorizontal: 15 }} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteAnswer(item.id)}>
                    <Image source={trash} style={{ width: 36, height: 36, opacity: 0.5, marginLeft: 15 }} />
                  </TouchableOpacity>
                </View>
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
                  <Text style={styles.answerText}>{item.answer}</Text>
                )}
              </>
            )}
            <Text style={{ textAlign: 'right', marginTop: 10, fontStyle: 'italic' }}>
              {userNames[item.id_user]}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }}


  keyExtractor={(item) => item.id.toString()}
  onDragEnd={({ data }) => handleAnswerMove(data)}

/>

</>
)}

{!question && !voirTout && (
  <>
    <View style={globalStyles.container_wide}>
      <Text> </Text>
      <Text> </Text>
      <Text>Selectionner un chapitre pour afficher les notes associées </Text>
      <Text> </Text>
      <Text>... ou bien afficher toutes les contributions existantes : </Text>
      <TouchableOpacity onPress={() => setVoirTout(true)} style={globalStyles.globalButton}>
        <Text style={globalStyles.globalButtonText}>Afficher toutes les notes</Text>
      </TouchableOpacity>
    </View>
  </>
)}

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
  modalContainer: {
    backgroundColor: 'white',
    width:'100%',
    height:'100%',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 30,
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
    borderColor: 'blue', // Remplacez cette ligne par votre style personnalisé
    backgroundColor: '#93d9e6',
    borderWidth: 2,
  },
  connectedAnswerCard: {
    borderColor: 'green', // Remplacez cette ligne par votre style personnalisé
    backgroundColor: '#cce4e8',
    borderWidth: 2,
  },
  
});


export default NoteScreen;
