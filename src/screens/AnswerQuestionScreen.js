import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { globalStyles } from '../../global';
import { getMemories_Question_by_id,getMemories_Question, submitMemories_Answer, deleteMemories_Answer, get_user_name,update_answer_text } from '../components/data_handling'; // Assurez-vous d'implémenter deleteMemories_Answer
import { record_answer, playRecording_fromAudioFile, delete_audio, startRecording, stopRecording,transcribeAudio } from '../components/sound_handling';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { saveActiveSubjectId, getActiveSubjectId } from '../components/local_storage';
import { useFocusEffect } from '@react-navigation/native';


function ReadAnswersScreen({ route }) {
  const navigation = useNavigation();
  const id_question = route.params.questionId;
  console.log('route.params :',route.params)
  const session = route.params.session;
  const [question, setQuestion] = useState(null);
  const [owner, setOwner] = useState(null);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [subject_active, setSubject_active] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState();


  
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
        console.log("id_question",id_question)
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
    <ScrollView contentContainerStyle={styles.contentContainer}>

<View style={styles.navigationContainer}>
  <TouchableOpacity onPress={() => navigateToScreen('BiographyScreen')} style={styles.navButton}>
    <FontAwesome name="arrow-left" size={28} color="black" />
  </TouchableOpacity>
  <TouchableOpacity onPress={refreshAnswers} style={styles.navButton}>
    <FontAwesome name="refresh" size={28} color="black" />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => navigateToScreen('AskQuestionScreen')} style={styles.navButton}>
    <MaterialIcons name="question-answer" size={28} color="black" />
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
      { marginTop: 10, marginBottom: 10 }, 
    ]}
    onPress={handleRecording}>
    <Text style={globalStyles.globalButtonText}>
      <MaterialIcons name="mic" size={36} color={isRecording ? "red" : "black"} />
      <Text> {isRecording ? "Arrêter l'enregistrement" : "Répondre"} </Text>
    </Text>
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
        <Text style={styles.answerText}>{ans.answer}</Text>
        {ans.audio && (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <TouchableOpacity onPress={() => playRecording_fromAudioFile("https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/" + ans.link_storage, ans.link_storage)} style={styles.playButton}>
      <MaterialIcons name="volume-up" size={36} color="black" />
    </TouchableOpacity>
    {ans.answer === "audio pas encore converti en texte" && (
      <TouchableOpacity onPress={() => handleTranscribe(ans.id)} style={styles.transcribeButton}>
        <MaterialIcons name="edit" size={36} color="black" />
      </TouchableOpacity>
    )}
  </View>
)}
        <View style={styles.answerFooter}>
          <Text style={styles.dateText}>
            Répondu le : {
              new Date(ans.created_at).toLocaleString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })
            }
          </Text>
          <TouchableOpacity onPress={() => handleDeleteAnswer(ans.id)} style={styles.iconButton}>
            <FontAwesome name="trash-o" size={24} color="red" />
          </TouchableOpacity>
        </View>
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

  

});

export default ReadAnswersScreen;
