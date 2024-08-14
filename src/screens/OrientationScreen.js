import React, { useState, useEffect, useCallback,  useRef  } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Picker,
  Alert,
} from 'react-native';
import {
  getSubject,
  getSubjects,
  getUserStatus,
  get_user_name,
  submitMemories_Answer,
  createTheme,
  getTheme_byProject,
  getMemories_Answers_to_theme,
  deleteMemories_Answer,
  remember_active_subject,
} from '../components/data_handling';
import { getActiveSubjectId,saveActiveSubjectId } from '../components/local_storage';
import NoteScreen from './NoteScreen';
import { globalStyles } from '../../global';
import settings from '../../assets/icons/accueil.png';
import { Card, Paragraph } from 'react-native-paper';
import trash from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import { createAudioChunk, startRecording, stopRecording, uploadAudioToSupabase, delete_audio,playRecording_fromAudioFile, uploadImageToSupabase,handlePlayPause } from '../components/sound_handling'; 
import { v4 as uuidv4 } from 'uuid';
import ModalComponent from '../components/ModalComponent';
import {
  AnswerPanel_written, 
  AnswerPanel_oral,
  AnswerPanel_AudioFile,
  AnswerPanel_imageFile,
  ThemePanel
  }  from '../components/save_note';
import {AnswerCard,
  CarrousselThemes,
} from '../components/UI_components';



const useFetchData = (id_user, setUserName, subject, setSubject, setUserStatus, subjects, setSubjects) => {

    if (id_user) {

      getSubjects(id_user).then(setSubjects);
      get_user_name(id_user).then(setUserName);
      if (id_user && Array.isArray(subjects) && subjects.length > 0) {
        console.log("subjects : ", subjects);
        console.log("subjects.length : ", subjects.length);
        subjects.forEach((subject) => {  // Remplacez .map par .forEach car vous n'avez pas besoin de retourner un tableau
          if (subject && subject.id) {
            getUserStatus(id_user, subject.id).then((status) => {
              setUserStatus((prevStatus) => ({
                ...prevStatus,
                [subject.id]: status,
              }));
            });
          }
        });
      }
    }


};


function OrientationScreen({ route }) {
  const navigation = useNavigation();
  const session = route.params?.session;
  console.log("session : ",session)
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [userStatus, setUserStatus] = useState({});
  const [users, setUsers] = useState([]);

  const [question_reponse, setQuestion_reponse] = useState('réponse');
  const windowWidth = Dimensions.get('window').width;
  const rightPanelWidth = windowWidth;
  const isLargeScreen = windowWidth > 768;
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [themeText, setThemeText] = useState('');
  const [theme, setTheme] = useState(null);
  const [themes, setThemes] = useState([]);
  const [themesAllUsers, setThemesAllUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState({});
  

  const [showChoices_0, setShowChoices_0] = useState(false);
  const [showChoices_1, setShowChoices_1] = useState(false);
  const [showChoices_2, setShowChoices_2] = useState(false);
  const [showChoices_3, setShowChoices_3] = useState(false);
  const [showChoices_4, setShowChoices_4] = useState(false);
  const [showChoices_5, setShowChoices_5] = useState(false);

  const [showChoices_7, setShowChoices_7] = useState(true);



  const [progressiveMessage_0, setProgressiveMessage_0] = useState('');
  const [progressiveMessage_1, setProgressiveMessage_1] = useState('');
  const [progressiveMessage_2, setProgressiveMessage_2] = useState('');
  const [progressiveMessage_3, setProgressiveMessage_3] = useState('');
  const [progressiveMessage_4, setProgressiveMessage_4] = useState('');
  const [progressiveMessage_5, setProgressiveMessage_5] = useState('');


  const [selectedChoice_1, setSelectedChoice_1] = useState('');
  const [selectedChoice_2, setSelectedChoice_2] = useState('');
  const [selectedChoice_3, setSelectedChoice_3] = useState('');
  const [selectedChoice_4, setSelectedChoice_4] = useState('');


  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredButton, setIsHoveredButton] = useState('');



  console.log("On passe bien par là !")
  useEffect( async() => { 
    const fetchSubject = async () => {
    const temp = await getActiveSubjectId()
    await getSubject(temp).then(setSubject);
    }
    fetchSubject()
  },[])

  useEffect( async() => { 
    console.log("subjects : ",subjects)
    console.log("subjects.length : ",subjects.length)
  },[subjects])

  useFetchData(session.user.id,setUserName,subject,setSubject, setUserStatus, setSubjects);
  
  const containerRef = useRef();

  const displayProgressiveText = (message, setMessage) => {
    const words = message.split(' ');
    let index = 0;
    const intervalId = setInterval(() => {
      setMessage(words.slice(0, index + 1).join(' '));
      index++;
      if (index === words.length) {
        clearInterval(intervalId);
      }
    }, 10);
  };


  const fetchUserStatus = useCallback(async () => {
    // si aucun projet dans projects tel que userStatus[project.id].access === true  -> navigateToScreen('Projets');

    // si un seul projet dans projects tel que userStatus[project.id].access === true  -> setShowChoices_2(true) [que voulez vous faire (contribuer /  écrire / lire)]

    // si plusieurs projets dans projects tel que userStatus[project.id].access === true -> setShowChoice_1(true) [choisir un projet]

    if (subject && subject.id) {
      const status = await getUserStatus(session.user.id, subject.id);
      setUserStatus(status);
      if (status.chapters === 'Auditeur') {
        setQuestion_reponse('question');
      }
      const name = await get_user_name(session.user.id);
      setUserName(name);
      if (!status.access) {
        navigateToScreen('Projets');
      }
    }
  }, [session.user.id, subject, navigateToScreen]);


  useEffect(() => { 
    if (userStatus){
      if (showChoices_1 && !showChoices_2) {
        console.log("showChoices_1 uniquement")
      }
      if (!showChoices_1 && showChoices_2) {
        console.log("showChoices_2 uniquement")
      }
      if (showChoices_1 && showChoices_2) {
        console.log("showChoices_1 et showChoices_2")
      }
    }

  }, [userStatus, showChoices_1, showChoices_2]);



  const navigateToScreen = useCallback((screenName, params) => {
    navigation.navigate(screenName, params);
  }, [navigation]);

  useEffect(() => {
    if (userName) {
      const messageContent = `Bonjour ${userName}, bienvenue ! Que souhaitez-vous faire ?`;
      displayProgressiveText(messageContent, setProgressiveMessage_1);
      setTimeout(() => setShowChoices_1(true), messageContent.split(' ').length * 10);
    }
  }, [userName]);








  const handleChoice_1 = async (choice) => {
    setShowChoices_2(false)
    setSelectedChoice_1(choice);
    let message='';
    if(choice ==='Voir les notes déjà produites'){
        message = "Voici les notes qui ont déjà été rassemblées sur ce projet. Vous pouvez les filtrer par date, contributeur, mot clé, etc. en utilisant les filtres ci-dessous";
    };
    if(choice ==='Ajouter une note'){
        message = "Savez-vous déjà ce que vous souhaitez raconter ?"
    };
    if(choice ==='Proposer un thème'){
      message = "Merci, ce thème sera proposé à d'autre contributeurs afin de les inspirer."
    };

    displayProgressiveText(message, setProgressiveMessage_2);
    setTimeout(() => setShowChoices_2(true), message.split(' ').length * 10);

  };

  const handleChoice_2 = async (choice) => {
    if(choice ==='Contribuer en fournissant des éléments ou en suggérant des thèmes'){
      // chnager le status en "pas d'accès"  
      // envoyer sur la bonne page
    };
    if(choice ==="Participer à la rédaction du projet sur la base des contributions existantes"){
      // changer le status en "Editeur"  
      // envoyer sur la bonne page
    };
    if(choice ==="Lire et commenter les chapitres déjà rédigés"){
      // changer le status en "Lecteur"  
      // envoyer sur la bonne page
    };

  
  };




  if ( subjects.length===0 ) {
    return (
      <View style={globalStyles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }


  

  return (
    <View style={globalStyles.container} ref={containerRef}>
      
            <>

            { !selectedChoice_1 && ( 
              <>
            <Card style={globalStyles.QuestionBubble}>
    <Card.Content>
      <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_1}</Paragraph>
    </Card.Content>
  </Card>
  {showChoices_1 && (
    <Picker
    selectedValue={subject.id || ""}
    style={styles.picker}
    onValueChange={(itemValue, itemIndex) => {
      const selectedSubject = subjects.find(subj => subj.content_subject.id === itemValue).content_subject;
      setSubject(selectedSubject)
      saveActiveSubjectId(selectedSubject.id)
        .then(() => {
          remember_active_subject(selectedSubject.id, session.user.id);
          (true);
        })
        .catch((error) => {
          console.error('Error saving active subject ID:', error);
          //setShowChoices_1(false); // Ajoutez cette ligne pour garantir l'exécution
        });
    }}
  >
    <Picker.Item label="Sélectionner un projet" value="" />
    {subjects.map((subj, index) => (
      <Picker.Item key={index} label={subj.content_subject.title} value={subj.content_subject.id} />
    ))}
  </Picker>
  
  )}
  </>
)}

              {selectedChoice_1  && !showChoices_1 &&  ( 
                <>
                    <Text> Coucou sans choix 1</Text>
                </>
              )}
            
            {selectedChoice_1  && showChoices_1 &&  ( 
                <>
                    {!showChoices_1 && (
                      <Text> Coucou avec choix 1</Text>
                    )}
                    {showChoices_1 && (
                      <Text> Coucou sans choix 1</Text>
                    )}

                    {showChoices_2 && (
                      <View style={{ flexDirection: isLargeScreen ? 'row' : 'column', flexWrap: 'wrap', justifyContent: 'flex-end' }}>

                      {['Contribuer en fournissant des éléments ou en suggérant des thèmes', 'Participer à la rédaction du projet sur la base des contributions existantes', 'Lire et commenter les chapitres déjà rédigés'].map((format) => (
                            <Card style={[globalStyles.ResponseBubble, selectedChoice_4 === format && globalStyles.ResponseBubble_selected, { marginHorizontal: 20 }]} key={format}>
                                <Card.Content>
                                    <TouchableOpacity
                                      onPress={() => handleChoice_2(choix)}
                                      onMouseEnter={() => setIsHoveredButton(choix)}
                                      onMouseLeave={() => setIsHoveredButton('')}
                                    >
        <Paragraph style={[globalStyles.choiceButtonText, isHoveredButton === choix && { fontWeight: 'bold' }, selectedChoice_4 === format && { color: 'white' }]}>
          {choix}
        </Paragraph>
      </TouchableOpacity>
    </Card.Content>
  </Card>
))}
                      </View>
                    )}

                </>
              )}
            
            <Text> </Text>
            <Text> </Text>
            <Text> </Text>
            <Text> </Text>
            <Text> </Text>
            <Text> </Text>
            <Text> </Text>
            <Text> </Text>
            <Text> </Text>
  
            </>
     

      

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
  rightPanel: {
    padding: 10,
    marginRight: 5,
  },
  chatContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  chatBubble: {
    borderRadius: 15,
    padding: 10,
    maxWidth: '80%',
  },
  chatStart: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f0f0', // Couleur de la bulle de chat du début
  },
  chatEnd: {
    alignSelf: 'flex-end',
    backgroundColor: '#007aff', // Couleur de la bulle de chat de fin
  },
  chatTextEnd: {
    color: '#fff', // Couleur du texte de la bulle de chat de fin
  },
    picker: {
      height: 50,
      width: '100%',
    },

});


export default OrientationScreen;
