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
  validate_project_contributors,
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



const useFetchData = (
  id_user, 
  setUserName, 
  subjects, 
  setSubjects,
  navigateToScreen,
  setProjectsCount
) => {



  useEffect(() => {
    const fetchMachin = async () => { 

    if (id_user && subjects) { 

      if(subjects.length === 0){

      const temp = await getSubjects(id_user)
      setSubjects(temp);
      await get_user_name(id_user).then(setUserName);

      console.log("subjects.length : ",temp.length)
      if ( temp.length > 0) {
      
        setProjectsCount(temp.length); 
    }  else  {
        navigateToScreen('Projets');
      } 

    }}}
    fetchMachin()     
  }, [id_user, subjects]);

  }





function OrientationScreen({ route }) {
  const navigation = useNavigation();
  const session = route.params?.session;

  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState([]);
  const [answers, setAnswers] = useState([]);
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
  const [projectsCount, setProjectsCount] = useState({});
  

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



/*
  useEffect(() => {
    const fetchSubject = async () => {
      const temp = await getActiveSubjectId();
      if (temp !== subject?.id) { // Vérifie si le sujet a changé avant de déclencher l'appel
        const newSubject = await getSubject(temp);
        setSubject(newSubject);
      }
    };
    fetchSubject();
  }, [subject?.id]); // Ajoutez une dépendance sur subject.id pour éviter les appels inutiles
  */
  
  const navigateToScreen = useCallback((screenName, params) => {
    navigation.navigate(screenName, params);
  }, [navigation]);

  

  useFetchData(session.user.id,setUserName,subjects, setSubjects,navigateToScreen,setProjectsCount);
  
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



  useEffect(() => { 
    console.log("projectsCount :",projectsCount)
    if (projectsCount && projectsCount==1){
      const fetchSubject = async () => {
        const temp = await getActiveSubjectId();
        if (temp !== subject?.id) { // Vérifie si le sujet a changé avant de déclencher l'appel
          const newSubject = await getSubject(temp);
          setSubject(newSubject);
        }
      };
      fetchSubject();
      handleChoice_2() }
    if (projectsCount && projectsCount>1){
      handleChoice_1() }
      
  }, [projectsCount]);






  useEffect(() => {
    if (userName) {
      const messageContent = `Bonjour ${userName}, bienvenue !`;
      displayProgressiveText(messageContent, setProgressiveMessage_0);
      
    }
   
  }, [userName]);









  const handleChoice_1 = async () => {
    setShowChoices_2(false)
    setShowChoices_1(false)
    setSubject([])

    const message = "Veuillez selectionner un projet : ";
    
    displayProgressiveText(message, setProgressiveMessage_1);
    setTimeout(() => setShowChoices_1(true), message.split(' ').length * 10);
  };

  const handleChoice_2 = async () => {
    setShowChoices_2(false)

    const message = "Que souhaitez-vous faire ?";
    
    displayProgressiveText(message, setProgressiveMessage_2);
    setTimeout(() => setShowChoices_2(true), message.split(' ').length * 10);
  };


  const handleChoice_3 = async (choice) => {

    if(choice ==='Contribuer en fournissant des éléments ou en suggérant des thèmes'){
      // chnager le status en "pas d'accès" 
      await validate_project_contributors(subject.id,session.user.id,true,"Contributeur","Pas d'accès") 
      console.log("Pas d'accès")
      navigateToScreen('Incipit');
      // envoyer sur la bonne page
    };
    if(choice ==="Participer à la rédaction du projet sur la base des contributions existantes"){
      // changer le status en "Editeur"
      await validate_project_contributors(subject.id,session.user.id,true,"Contributeur","Editeur")   
      console.log("Editeur")
      navigateToScreen('Marcel');
      // envoyer sur la bonne page
    };
    if(choice ==="Lire et commenter les chapitres déjà rédigés"){
      // changer le status en "Lecteur"  
      await validate_project_contributors(subject.id,session.user.id,true,"Contributeur","Lecteur")   
      console.log("Lecteur")
      navigateToScreen('Marcel');
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

            
              
            <Card style={globalStyles.QuestionBubble}>
    <Card.Content>
      <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_0}</Paragraph>
    </Card.Content>
  </Card>

 {progressiveMessage_1 !=="" &&(
  <Card style={globalStyles.QuestionBubble}>
    <Card.Content>
      <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_1}</Paragraph>
    </Card.Content>
  </Card>
  )}

  {showChoices_1 && (
    <Picker
    selectedValue={subject?.id || "Sélectionner un projet"}
    style={styles.picker}
    onValueChange={(itemValue, itemIndex) => {
      if (itemValue !== "Sélectionner un projet") {
        const selectedSubject = subjects.find(subj => subj.content_subject.id === itemValue).content_subject;
        setSubject(selectedSubject);
        saveActiveSubjectId(selectedSubject.id)
          .then(() => {
            remember_active_subject(selectedSubject.id, session.user.id);
            handleChoice_2(true);
          })
          .catch((error) => {
            console.error('Error saving active subject ID:', error);
          });
      }
    }}
  >
    <Picker.Item label="Choisissez un projet" value="default" />
    {subjects.map((subj, index) => (
      <Picker.Item key={index} label={subj.content_subject.title} value={subj.content_subject.id} />
    ))}
  </Picker>
  
  
  )}

{progressiveMessage_2 !=="" &&( 
  <Card style={globalStyles.QuestionBubble}>
    <Card.Content>
      <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_2}</Paragraph>
    </Card.Content>
  </Card>
)}

  {showChoices_2 && (
                <View style={{ flexDirection: isLargeScreen ? 'column' : 'column', flexWrap: 'wrap', justifyContent: 'flex-end' }}>

                {['Contribuer en fournissant des éléments ou en suggérant des thèmes', 'Participer à la rédaction du projet sur la base des contributions existantes', 'Lire et commenter les chapitres déjà rédigés'].map((choix) => (
                      <Card style={[globalStyles.ResponseBubble, selectedChoice_4 === choix && globalStyles.ResponseBubble_selected, { marginHorizontal: 20 }]} key={choix}>
                          <Card.Content>
                              <TouchableOpacity
                                onPress={() => handleChoice_3(choix)}
                                onMouseEnter={() => setIsHoveredButton(choix)}
                                onMouseLeave={() => setIsHoveredButton('')}
                              >
  <Paragraph style={[globalStyles.choiceButtonText, isHoveredButton === choix && { fontWeight: 'bold' }, selectedChoice_4 === choix && { color: 'white' }]}>
    {choix}
  </Paragraph>
</TouchableOpacity>
</Card.Content>
</Card>
))}
                </View>
  
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
