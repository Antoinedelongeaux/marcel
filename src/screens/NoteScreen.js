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

} from '../components/data_handling';
import { useFocusEffect } from '@react-navigation/native';
import { getActiveSubjectId } from '../components/local_storage';
import { globalStyles } from '../../global';
import BookIcon from '../../assets/icons/book.svg';
import PersonIcon from '../../assets/icons/person.svg';
import settings from '../../assets/icons/settings.svg';
import copyIcon from '../../assets/icons/paste.png';
import note from '../../assets/icons/notes.png';
import filterIcon from '../../assets/icons/filtre.png';
import Modal from 'react-native-modal'; // Ajoutez cette ligne pour importer le composant Modal
import { startRecording, stopRecording, uploadAudioToSupabase } from '../components/sound_handling'; // Ajoutez cette ligne
import { submitMemories_Answer } from '../components/data_handling'; // Ajoutez cette ligne



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

  useFetchActiveSubjectId(setSubjectActive, setSubject, navigation);


  useEffect(() => {
    const fetchAnswers = async () => {
      const answers = await getMemories_Answers();
      setAnswers(answers);
      setIsLoading(false);
    };

    fetchAnswers();
  }, []);

  useEffect(() => {
    console.log("questions : ", questions)
  }, [questions]);

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

  const refreshPage = () => {
    console.log("Coucou !");
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
       (selectedQuestion === answer.id_question.toString())) // Assurez-vous que les types sont cohérents pour la comparaison
    );
  });
  
  const handleRecording = async () => {
    if (isRecording) {
      const name = `${Date.now()}.mp3`;
      await stopRecording(recording, name);
      setIsRecording(false);
    } else {
      const temp = await startRecording();
      setRecording(temp);
      setIsRecording(true);
    }
  };
  
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
  
  

  if (isLoading) {
    return (
      <Text>Loading</Text>
    );
  }




  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.navigationContainer}>
        <TouchableOpacity onPress={() => navigateToScreen('ReadAnswersScreen')} style={globalStyles.navButton}>
          <Image source={BookIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToScreen('NoteScreen')} style={styles.navButton}>
          <Image source={note} style={{ width: 60, height: 60, opacity: 1 }} />
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
        <Text style={styles.modalTitle}>Ajouter une note</Text>
        <TextInput
          style={styles.input}
          placeholder="Écrire une note..."
          value={note}
          onChangeText={setNote}
          multiline={true}
        />
        <TouchableOpacity onPress={handleRecording} style={styles.recordButton}>
          <Text style={styles.recordButtonText}>{isRecording ? 'Arrêter' : 'Enregistrer une note orale'}</Text>
        </TouchableOpacity>
        <View style={styles.modalButtonContainer}>
          <TouchableOpacity onPress={handleSaveNote} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

      <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterIcon}>
  <Image source={filterIcon} style={{ width: 30, height: 30, opacity: 0.5 }} />
</TouchableOpacity>
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
  <TouchableOpacity onPress={() => { copyToClipboard(answer.answer); integration(answer.id); refreshPage(); }}>
    <Image source={copyIcon} style={{ width: 20, height: 20, opacity: 0.5 }} />
  </TouchableOpacity>
</View>

          <Text style={styles.answerText}>{answer.answer}</Text>
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
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  
});


export default NoteScreen;
