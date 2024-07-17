import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { globalStyles } from '../../global';
import { getMemories_Question_by_id, getMemories_Question, submitMemories_Answer, deleteMemories_Answer, get_user_name, update_answer_text } from '../components/data_handling'; // Assurez-vous d'implémenter deleteMemories_Answer
import { createAudioChunk,record_answer, playRecording_fromAudioFile, delete_audio, startRecording, stopRecording, uploadAudioToSupabase, uploadImageToSupabase } from '../components/sound_handling';
import { transcribeAudio } from '../components/call_to_whisper';
//import { transcribeAudio } from '../components/call_to_google';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { saveActiveSubjectId, getActiveSubjectId } from '../components/local_storage';
import { useFocusEffect } from '@react-navigation/native';
import ArrowLeftIcon from '../../assets/icons/arrow-left-solid.svg';
import refresh from '../../assets/icons/refresh_black_24dp.svg';
import PersonIcon from '../../assets/icons/person.svg';
import BookIcon from '../../assets/icons/book.svg';
import HelpIcon from '../../assets/icons/help-circle.svg';
import trash from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import SettingsIcon from '../../assets/icons/settings.svg';
import LinkIcon from '../../assets/icons/link-solid.svg';
import expand_more from '../../assets/icons/expand_more_black_24dp.svg';
import expand_less from '../../assets/icons/expand_less_black_24dp.svg';
import edit from '../../assets/icons/pen-to-square-regular.svg';
import MicroIcon from '../../assets/icons/microphone-lines-solid.svg';
import VolumeIcon from '../../assets/icons/volume_up_black_24dp.svg';
import Upload from '../../assets/icons/upload.png';
import Svg, { Path } from 'react-native-svg';
import * as DocumentPicker from 'expo-document-picker';
import AttachIcon from '../../assets/icons/attach.png';
import { v4 as uuidv4 } from 'uuid';


function ReadAnswersScreen({ route }) {
  const navigation = useNavigation();
  const id_question = route.params.questionId;
  const session = route.params.session;
  const [question, setQuestion] = useState(null);
  const [owner, setOwner] = useState(null);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [subject_active, setSubject_active] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [PleaseWait, setPleaseWait] = useState(false);
  const [recording, setRecording] = useState();
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [showAttachement, setShowAttachement] = useState(false);
  
  const closeFullscreenImage = () => {
    setFullscreenImage(null);
  };
  

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  useEffect(() => {
    answers.forEach((answer) => {
      if (answer.answer === "audio pas encore converti en texte" && answer.audio) {
        handleTranscribe(answer.id);
      }
    });
  }, [answers]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchActiveSubjectId = async () => {
        var temp = null;
        temp = await getActiveSubjectId();
        setSubject_active(temp);
      };
      fetchActiveSubjectId();
      if (session && subject_active != null) {
        getMemories_Question_by_id(id_question, setQuestion, setAnswers, setOwner);
      }
    }, [session, subject_active, navigation])
  );

  const handleRecording = async () => {
    if (isRecording) {
      try {
        setIsRecording(false);
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
 
  const handleAnswerSubmit = async (name, isMedia, uri = null,isImage,connectionID) => {
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
  
    await submitMemories_Answer(transcribedText, question, session, isMedia, name,isImage, connectionID,async () => {
      setAnswer('');
      setTimeout(async () => {
        await refreshAnswers();
      }, 1000);
    }
  
  );
  };
  
  // Mettez à jour handleUploadPhoto pour utiliser handleAnswerSubmit correctement
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
          console.log("Using result.output");
          const file = result.output[0];
          console.log("Selected file: ", file);
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
  
  

  
  
  const handleUploadAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: false
      });
  

  
      if (!result.canceled) {
        let uri, name, mimeType;
  
        // Gérer les différences de plateforme
        if (result.output && result.output.length > 0) {
          console.log("Using result.output");
          const file = result.output[0];
          console.log("Selected file: ", file);
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
        if (mimeType && mimeType.startsWith('audio/')) {
          console.log("File selected is an audio file:", { uri, name, mimeType });
        } else {
          console.error("Selected file is not an audio file:", { uri, name, mimeType });
          Alert.alert("Erreur", "Le fichier sélectionné n'est pas un fichier audio");
          return;
        }
  
        console.log("File selected successfully:", { uri, name });
        await handleAnswerSubmit(name, true, uri,false);
      } else {
        console.error("File selection was not successful: ", result);
        Alert.alert("Erreur", "Sélection du fichier échouée");
      }
    } catch (error) {
      console.error("Error handling file upload: ", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de la sélection du fichier");
    }
  };
  
  
  
  
  

  const refreshAnswers = async () => {
    await getMemories_Question_by_id(id_question, setQuestion, setAnswers, setOwner);
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

  return (
    <View style={{ flex: 1, backgroundColor: "#E8FFF6" }}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.navigationContainer}>
          <TouchableOpacity onPress={() => navigateToScreen('Marcel')} style={styles.navButton}>
            <Image source={ArrowLeftIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={refreshAnswers} style={styles.navButton}>
            <Image source={refresh} style={{ width: 60, height: 60, opacity: 0.5 }} />
          </TouchableOpacity>
        </View>

        {fullscreenImage && (
  <View style={styles.fullscreenContainer}>
    <TouchableOpacity style={styles.closeButton} onPress={closeFullscreenImage}>
      <Text style={styles.closeButtonText}>X</Text>
    </TouchableOpacity>
    <Image source={{ uri: fullscreenImage }} style={styles.fullscreenImage} />
  </View>
)}


        {question ? (
          <>
            {question.question == "End" ? (
              <Text>Vous avez atteint la dernière question correspondant à ces filtres</Text>
            ) : (
              <View key={question.id} style={styles.questionContainer}>
                <Text style={globalStyles.title}>{question.question}</Text>
                <Text>
                  Question posée par <Text style={{ fontWeight: 'bold' }}>{owner && owner !== '' ? owner : "Marcel"}</Text>
                </Text>
                <Text></Text>
                <View style={{ paddingVertical: 20 }}>
  <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginBottom: 10 }}>
  
    <TouchableOpacity
      style={[
        globalStyles.globalButton_wide,
        isRecording ? styles.recordingButton : {},
        { backgroundColor: isRecording ? "red" : '#b1b3b5', flex: 1, marginRight: 5 },
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
  style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5', flex: 1, marginLeft: 5 }]}
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

  </View>

  <TextInput
    style={globalStyles.input}
    value={answer}
    onChangeText={setAnswer}
    placeholder="Écrire une réponse..."
    multiline={true}
    numberOfLines={4}
  />
   <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
  <TouchableOpacity
    style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5' , flex: 1, marginRight: 5 }]}
    onPress={() => handleAnswerSubmit('', false)}
  >
    <Text style={globalStyles.globalButtonText}>Envoyer la réponse écrite</Text>
  </TouchableOpacity>
  </View>
</View>


{Array.isArray(answers) && answers.map((ans) => (
  <View key={ans.id} style={styles.answerCard}>
    {ans.id === editingAnswerId ? (
      <TextInput
        style={globalStyles.input}
        value={editingText}
        onChangeText={setEditingText}
        multiline={true}
        numberOfLines={10}
      />
    ) : (
      ans.image ? (
<>
        <TouchableOpacity onPress={() => setFullscreenImage(`https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${ans.link_storage}`)}>
  <Image 
    source={{ uri: `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${ans.link_storage}` }} 
    style={{ width: '100%', height: 300, resizeMode: 'contain' }} 
  />
  
  <Text style={{ justifyContent: 'center', textAlign: 'center' }}>{ans.answer}</Text>

</TouchableOpacity>
</>

) : (
  <Text style={styles.answerText}>{ans.answer}</Text>
      )
    )}
    <View style={styles.answerFooter}>
      {ans.audio && (
        <TouchableOpacity onPress={() => playRecording_fromAudioFile(ans.link_storage)} style={styles.playButton}>
          <Image source={VolumeIcon} style={{ width: 36, height: 36, opacity: 0.5 }} />
        </TouchableOpacity>
      )}
      {ans.answer === "audio pas encore converti en texte" && (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0b2d52" />
        </View>
      )}
      {ans.answer !== "audio pas encore converti en texte" && ans.id !== editingAnswerId && (
        <TouchableOpacity
          onPress={() => {
            setEditingAnswerId(ans.id);
            setEditingText(ans.answer);
          }}
        >
          <Image source={edit} style={{ width: 28, height: 28, opacity: 0.5 }} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => handleDeleteAnswer(ans.id)}>
        <Image source={trash} style={{ width: 36, height: 36, opacity: 0.5 }} />
      </TouchableOpacity>
    </View>
    {ans.id === editingAnswerId && (
      <TouchableOpacity
        onPress={() => handleUpdateAnswer(ans.id, editingText)}
        style={globalStyles.globalButton}
      >
        <Text style={globalStyles.globalButton_text}>Enregistrer</Text>
      </TouchableOpacity>
    )}
  </View>
))}

              </View>
            )}
          </>
        ) : (
          <Text>Questions en cours de chargement ...</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ajoutez ou ajustez vos styles existants ici
  deleteButton: {
    marginTop: 5,
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: "#E8FFF6",
    paddingTop: 60,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingRight: 10,
    paddingLeft: 10,
  },
  questionContainer: {
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 10,
  },
  questionText: {
    marginBottom: 10,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  navButton: {
    padding: 10,
  },
  unSelectedTag: {
    backgroundColor: '#dedede',
  },
  recordingButton: {
    backgroundColor: '#ffcccc',
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  answerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    marginTop: 5,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  editButton: {
    marginRight: 5,
    backgroundColor: 'lightblue',
    padding: 5,
    borderRadius: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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
  
});

export default ReadAnswersScreen;
