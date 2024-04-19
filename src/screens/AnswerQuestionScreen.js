import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { globalStyles } from '../../global';
import { getMemories_Question_by_id,getMemories_Question, submitMemories_Answer, deleteMemories_Answer, get_user_name,update_answer_text } from '../components/data_handling'; // Assurez-vous d'implémenter deleteMemories_Answer
import { record_answer, playRecording_fromAudioFile, delete_audio, startRecording, stopRecording,transcribeAudio } from '../components/sound_handling';
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


import Svg, { Path } from 'react-native-svg';


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
  const [recording, setRecording] = useState();
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingText, setEditingText] = useState('');


  
  // Fonction pour naviguer vers une nouvelle page
  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };


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
    }, [session, subject_active])
  );





  const handleRecording = async () => {
    if (isRecording) {
      // Arrêter l'enregistrement
      const name = `${Date.now()}.mp3`;
      await stopRecording(recording, name);
      // Initialiser transcribedText
      //const transcribedText = await transcribeAudio(recording.getURI()); -> ici ça marche très bien
      const transcribedText = "audio pas encore converti en texte";
      // Soumettre la réponse avec transcribedText initialisé
      submitMemories_Answer(transcribedText, question, session, true, name, async () => {
        setTimeout(async () => {
          await refreshAnswers();
        }, 1000);
      });
      setIsRecording(false); // Réinitialiser l'état d'enregistrement
    } else {
      // Démarrer l'enregistrement
      const temp = await startRecording();
      setRecording(temp);
      setIsRecording(true); // Mettre à jour l'état pour indiquer que l'enregistrement est en cours
    }
  };
  
  const handleUpdateAnswer = async (answerId, newText) => {
    try {
      const result = await update_answer_text(answerId, newText);
      
        await refreshAnswers(); // Mise à jour des réponses affichées
        setEditingAnswerId(null); // Sortie du mode édition pour fermer le champ
        setEditingText(''); // Réinitialiser le texte édité
      
      
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
        console.log(transcribedText);
        // Rafraîchir les réponses après la transcription
        setTimeout(async () => {
          await refreshAnswers();
        }, 1000);
      } catch (error) {
        Alert.alert("Erreur de transcription", error.message);
      }
    }
  };
  

  const handleAnswerSubmit = async (name, audio) => {
    await submitMemories_Answer(answer, question, session, audio, name, async () => {
      setAnswer('');
      // Rafraîchir les réponses après l'ajout d'une nouvelle réponse
      setTimeout(async () => {
        await refreshAnswers();
      }, 1000);
    });
  };

  const refreshAnswers = async () => {
    console.log("Rafraîchissement des réponses pour la question", id_question);
    await getMemories_Question_by_id(id_question, setQuestion, setAnswers, setOwner);
    // Ici, getMemories_Question_by_id devrait déjà mettre à jour `answers` via `setAnswers`.
  };
  
  

  const handleDeleteAnswer = async (answerId) => {
    // Trouver la réponse correspondante dans l'état `answers`
    const answerToDelete = answers.find(ans => ans.id === answerId);
    if (!answerToDelete) {
      Alert.alert("Erreur", "La réponse n'a pas été trouvée.");
      return;
    }

    // Si la réponse est audio, exécutez `delete_audio(link_storage)`
    if (answerToDelete.audio) {
      try {
        await delete_audio(answerToDelete.link_storage);
      } catch (error) {
        Alert.alert("Erreur lors de la suppression de l'audio", error.message);
        return;
      }
    }

    // Procédez à la suppression de la réponse de la base de données
    try {
      const result = await deleteMemories_Answer(answerId);
      if (result.success) {
        // Supprimez la réponse du tableau d'état après la suppression réussie
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
  <TouchableOpacity onPress={() => navigateToScreen('ReadAnswersScreen')} style={styles.navButton}>
  <Image source={ArrowLeftIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
  </TouchableOpacity>
  <TouchableOpacity onPress={refreshAnswers} style={styles.navButton}>
  <Image source={refresh} style={{ width: 60, height: 60, opacity: 0.5 }} />
  </TouchableOpacity>

</View>

      


      
      {question ? (<>

        {question.question == "End" ? (<Text>Vous avez atteint la dernière question correspondant à ces filtres</Text>) : (


          <View key={question.id} style={styles.questionContainer}>

            <Text style={globalStyles.title}>{question.question}</Text>
            <Text>
  Question posée par <Text style={{ fontWeight: 'bold' }}>{owner && owner !== '' ? owner : "Marcel"}</Text>
</Text>

            <Text ></Text>
            {/*
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text ></Text>
            <Text ></Text>

              <TextInput
                style={globalStyles.answer_input}
                onChangeText={setAnswer}
                value={answer}
                placeholder="Votre réponse ici ou titre de votre note vocale"
                multiline={true}
                numberOfLines={8}
              />
            </View >

        */}
<View style={{ paddingVertical: 20 }}>
<TouchableOpacity
  style={[
    globalStyles.globalButton,
    isRecording ? styles.recordingButton : {},
    { marginTop: 10, marginBottom: 10, backgroundColor: isRecording ? "red" : '#b1b3b5' },  // Corrected the color assignment here
  ]}
  onPress={handleRecording}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>  
    <Image source={MicroIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
    <Text style={globalStyles.globalButtonText}>
      {isRecording ? "   Arrêter l'enregistrement" : "   Répondre"}
    </Text>
  </View>
</TouchableOpacity>




            {/*}  
              <TouchableOpacity
                style={globalStyles.globalButton_narrow}
                onPress={() => { handleAnswerSubmit('', false) }}>
                <Text style={globalStyles.globalButtonText_narrow}>
                  <FontAwesome name="pencil" size={36} color="black" /> <Text > réponse écrite </Text>
                </Text>
              </TouchableOpacity>
              */}
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
      <Text style={styles.answerText}>{ans.answer}</Text>
    )}
    <View style={styles.answerFooter}>
      {ans.audio && (
        <TouchableOpacity onPress={() => playRecording_fromAudioFile(ans.link_storage)} style={styles.playButton}>
          <Image source={VolumeIcon} style={{ width: 36, height: 36, opacity: 0.5 }} />
        </TouchableOpacity>
      )}
       {ans.answer === "audio pas encore converti en texte" && (
        <TouchableOpacity onPress={() => handleTranscribe(ans.id)} style={styles.transcribeButton}>
          <Image source={edit} style={{ width: 28, height: 28, opacity: 0.5 }} />
        </TouchableOpacity>
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
      <TouchableOpacity onPress={() => handleDeleteAnswer(ans.id)} >
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
        )}</>
      ) : (
        <Text>Questions en cours de chargement ...</Text>
      )}
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
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
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
    backgroundColor: "#E8FFF6", // Appliquez l'arrière-plan au conteneur principal
    paddingTop: 60,
  },
  contentContainer: {
    flexGrow: 1, // Ajoutez ceci pour vous assurer que le contentContainer du ScrollView utilise l'espace disponible
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
    backgroundColor: '#dedede', // Changez la couleur selon votre thème
  },
  recordingButton: {
    backgroundColor: '#ffcccc', // Par exemple, une couleur rouge clair pour indiquer l'enregistrement
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
    backgroundColor: 'lightblue', // Style pour le bouton d'édition
    padding: 5,
    borderRadius: 5,
  },

});

export default ReadAnswersScreen;
