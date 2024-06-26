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
import { startRecording, stopRecording, uploadAudioToSupabase, delete_audio,playRecording_fromAudioFile } from '../components/sound_handling'; // Ajoutez cette ligne
import { transcribeAudio } from '../components/call_to_google';
import MicroIcon from '../../assets/icons/microphone-lines-solid.svg';
import VolumeIcon from '../../assets/icons/volume_up_black_24dp.svg';
import trash from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import closeIcon from '../../assets/icons/close.png'; 
import edit from '../../assets/icons/pen-to-square-regular.svg';



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
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [showFilters, setShowFilters] = useState(false); 
  const [isModalVisible, setModalVisible] = useState(false); // Ajoutez cette ligne dans les états
const [isRecording, setIsRecording] = useState(false); // Ajoutez cette ligne dans les états
const [recording, setRecording] = useState(); // Ajoutez cette ligne dans les états
const [note, setNote] = useState(''); // Ajoutez cette ligne dans les états
const [editingAnswerId, setEditingAnswerId] = useState(null);
const [editingText, setEditingText] = useState('');

  useFetchActiveSubjectId(setSubjectActive, setSubject, navigation);


  useFocusEffect(
    React.useCallback(() => {
      const fetchAnswers = async () => {
        const answers = await getMemories_Answers();
        setAnswers(answers);
        setIsLoading(false);
      };
  
      fetchAnswers();
    }, [])
  );
  

  const refreshAnswers = async () => {
    const answers = await getMemories_Answers();
      setAnswers(answers);
      setIsLoading(false);
  };

  useEffect(() => {
    console.log("réponses : ", answers)
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

  const filteredAnswers = answers.filter(answer => {
    const answerDate = new Date(answer.created_at);
    const beforeDate = dateBefore ? new Date(dateBefore) : null;
    const afterDate = dateAfter ? new Date(dateAfter) : null;
  
    return (
      (!textFilter || answer.answer.includes(textFilter)) &&
      (!beforeDate || answerDate < beforeDate) &&
      (!afterDate || answerDate > afterDate) &&
      (selectedQuestion === '' || 
       (selectedQuestion === 'none' && answer.id_question === null) ||
       (answer.id_question !== null && selectedQuestion === answer.id_question.toString())) // Assurez-vous que les types sont cohérents pour la comparaison
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
    await submitMemories_Answer(note, null, session, !!audio, audio);
    setNote('');
    setModalVisible(false);
    // Rafraîchir les notes
  };
  
  const handleRecording = async () => {
    if (isRecording) {
      const name = `${Date.now()}.mp3`;
      await stopRecording(recording, name);
      const transcribedText = "audio pas encore converti en texte";
      submitMemories_Answer(transcribedText, selectedQuestion, session, true, name, async () => {
        setTimeout(async () => {
          await refreshAnswers();
        }, 100);
      });
      setIsRecording(false);
      setModalVisible(false)
      

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

  const handleAnswerSubmit = async (name, audio, uri = null) => {
    const transcribedText = audio ? "audio pas encore converti en texte" : note;
  
    if (audio && uri) {
      const uploadedFileName = await uploadAudioToSupabase(uri, name);
      if (!uploadedFileName) {
        Alert.alert("Erreur", "Échec du téléchargement du fichier audio");
        return;
      }
    }

    await submitMemories_Answer(transcribedText, selectedQuestion, session, audio, name, async () => {
      setNote('');
      setModalVisible(false)
      setTimeout(async () => {
        await refreshAnswers();
      }, 1000);
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
        await handleAnswerSubmit(name, true, uri);
      } else {
        console.error("File selection was not successful: ", result);
        Alert.alert("Erreur", "Sélection du fichier échouée");
      }
    } catch (error) {
      console.error("Error handling file upload: ", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de la sélection du fichier");
    }
  };
  

  if (isLoading) {
    return (
      <Text>Loading</Text>
    );
  }




  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.navigationContainer}>
        <TouchableOpacity onPress={() => navigateToScreen('ReadAnswersScreen')} style={styles.navButton}>
          <Image source={BookIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToScreen('NoteScreen')} style={styles.navButton}>
          <Image source={noteIcon} style={{ width: 60, height: 60, opacity: 1 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToScreen('ManageBiographyScreen')} style={styles.navButton}>
          <Image source={settings} style={{ width: 60, height: 60, opacity: 0.5 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToScreen('ProfileScreen')} style={styles.navButton}>
          <Image source={PersonIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
        </TouchableOpacity>
      </View>

      <Text style={globalStyles.title}> </Text>

      <TouchableOpacity onPress={() => setModalVisible(true)} style={globalStyles.globalButton_wide}>
      <Text style={globalStyles.globalButtonText}>Ajouter une note</Text>
    </TouchableOpacity>

    <Modal isVisible={isModalVisible}>
  <View style={styles.modalContainer}>
    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
      <Image source={closeIcon} style={styles.closeIcon} />
    </TouchableOpacity>
    <Text style={styles.modalTitle}>Ajouter une note</Text>

<Text style={styles.selectedQuestionText}>Chapitre sélectionné: {selectedQuestion ? questions.find(q => q.id === parseInt(selectedQuestion))?.question : "Aucun"}</Text>
<View style={styles.dropdownContainer}>
  <select
    style={styles.dropdown}
    value={selectedQuestion}
    onChange={(e) => setSelectedQuestion(e.target.value)}
  >
    <option value="">Sélectionner un chapitre</option>
    {questions.map((question, index) => (
      <option key={index} value={question.id}>{question.question}</option>
    ))}
  </select>
</View>

    <TouchableOpacity
      style={[
        globalStyles.globalButton_wide,
        isRecording ? styles.recordingButton : {},
        { backgroundColor: isRecording ? "red" : '#b1b3b5',  alignItems: 'center', paddingVertical: 10, marginRight: 5 },
      ]}
      onPress={handleRecording}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Image source={MicroIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
        <Text style={globalStyles.globalButtonText}>
          {isRecording ? "Arrêter l'enregistrement" : "Répondre"}
        </Text>
      </View>
    </TouchableOpacity >
    <Text> </Text>
    <TextInput
      style={styles.input}
      placeholder="Écrire une note..."
      value={note}
      onChangeText={setNote}
      multiline={true}
      numberOfLines={4}
      
    />
   

      <TouchableOpacity onPress={() => handleAnswerSubmit('', false)} style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5', alignItems: 'center', paddingVertical: 10, marginRight: 5 },]}>
        <Text style={globalStyles.globalButtonText}>Enregistrer la note écrite</Text>
      </TouchableOpacity>
      

  </View>
</Modal>


<View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 5 }}>
  <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterIcon}>
    <Image source={filterIcon} style={{ width: 50, height: 50, opacity: 0.5, marginVertical : 30 }} />
  </TouchableOpacity>
</View>

{showFilters && ( 
      <View style={styles.filterContainer}>
  <TextInput
    style={styles.input}
    placeholder="Filtrer par texte"
    value={textFilter}
    onChangeText={setTextFilter}
  />
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
  

  <View style={styles.dropdownContainer}>
    <select
      style={styles.dropdown}
      value={selectedQuestion}
      onChange={(e) => setSelectedQuestion(e.target.value)}
    >
      <option value="">Tous les chapitres</option>
      <option value="none">Aucun chapitre </option>
      {questions.map((question, index) => (
        <option key={index} value={question.id}>{question.question}</option>
      ))}
    </select>
  </View>
</View>
)}

<ScrollView>
    {filteredAnswers.length > 0 ? filteredAnswers.map((answer, index) => {
      const question = questions.find(q => q.id === answer.id_question);
      return (
        <View key={index} style={styles.answerCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
  <Text style={{ fontWeight: 'bold' }}>
    {new Date(answer.created_at).toLocaleDateString()} {new Date(answer.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  </Text>
  <Text style={{ fontWeight: 'bold' }}>
    {question ? "Chapitre : " + question.question : 'Réponse incluse dans aucun chapitre'}
  </Text>
  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
  {answer.answer !== "audio pas encore converti en texte" && answer.id !== editingAnswerId && (
                        <TouchableOpacity
                          onPress={() => {
                            setEditingAnswerId(answer.id);
                            setEditingText(answer.answer);
                          }}
                        >
                          <Image source={edit} style={{ width: 28, height: 28, opacity: 0.5 }} />
                        </TouchableOpacity>
                      )}
    {answer.audio && (
      <TouchableOpacity onPress={() => playRecording_fromAudioFile(answer.link_storage)} style={styles.playButton}>
        <Image source={VolumeIcon} style={{ width: 35, height: 35, opacity: 0.5, marginHorizontal: 15 }} />
      </TouchableOpacity>
    )}
    <TouchableOpacity onPress={() => { copyToClipboard(answer.answer); integration(answer.id); refreshAnswers(); }}>
      <Image source={copyIcon} style={{ width: 27, height: 27, opacity: 0.5, marginHorizontal: 15 }} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => handleDeleteAnswer(answer.id)}>
      <Image source={trash} style={{ width: 36, height: 36, opacity: 0.5, marginLeft: 15 }} />
    </TouchableOpacity>
  </View>
</View>

{answer.id === editingAnswerId ? (
  <>
                      <TextInput
                        style={globalStyles.input}
                        value={editingText}
                        onChangeText={setEditingText}
                        multiline={true}
                        numberOfLines={10}
                      />
                      
                        <TouchableOpacity
                          onPress={() => handleUpdateAnswer(answer.id, editingText)}
                          style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5', alignItems: 'center', paddingVertical: 10, marginRight: 5 },]}
                        >
                          <Text style={globalStyles.globalButtonText}>Enregistrer</Text>
                        </TouchableOpacity>
                        </>
                    ) : (
                      <Text style={styles.answerText}>{answer.answer}</Text>
                    )}

      
        </View>
      );
    }) : (
      <Text>Aucune réponse trouvée</Text>
    )}
  </ScrollView>
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
    padding: 10,
    zIndex: 3,
    marginHorizontal :5,
    marginVertical : 20,
    borderWidth: 1, // Ajoutez cette ligne
    borderColor: '#ccc', // Ajoutez cette ligne pour définir la couleur de la bordure
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
  
});


export default NoteScreen;
