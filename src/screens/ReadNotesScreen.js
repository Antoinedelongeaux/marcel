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
  TextInput,
  Picker,
  Alert,
  InteractionManager,
} from 'react-native';
import {
  getSubject,
  getSubjects,
  getMemories_Questions,
  getMemories_Answers_to_Question,
  get_project_contributors,
  get_chapters,
  getUserStatus,
  get_user_name,
  get_Question_by_id,
  submitMemories_Answer,
  createTheme,
  getTheme_byProject,
  getTheme_byUser,
  getMemories_Answers_to_theme,
  deleteMemories_Answer,
  remember_active_subject,
} from '../components/data_handling';
import { useFocusEffect } from '@react-navigation/native';
import { getActiveSubjectId,saveActiveSubjectId } from '../components/local_storage';
import NoteScreen from './NoteScreen';
import { globalStyles } from '../../global';
import settings from '../../assets/icons/settings.svg';
import { Card, Paragraph } from 'react-native-paper';
import trash from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import { createAudioChunk, startRecording, stopRecording, uploadAudioToSupabase, delete_audio,playRecording_fromAudioFile, uploadImageToSupabase,handlePlayPause } from '../components/sound_handling'; 
import { v4 as uuidv4 } from 'uuid';
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



const useFetchActiveSubjectId = ( setSubject, setIsLoading, navigation) => {
  useFocusEffect(
    useCallback(() => {
      const fetchActiveSubjectId = async () => {
        const temp = await getActiveSubjectId();
        if (temp) {
          const temp2 = await getSubject(temp);
          setSubject(temp2);
          console.log(temp2)
        } else {
          navigation.navigate('Projets');
        }
        setIsLoading(false);
      };
      fetchActiveSubjectId();
    }, [navigation, setSubject, setIsLoading])
  );
};

const useFetchData = (id_user, subject, setQuestions, tags, personal, setChapters, setUserStatus,setThemes,setSubjects,setUsers) => {
  useEffect(() => {
    if (subject && subject.id) {
      getMemories_Questions(subject.id, setQuestions, tags, personal);
      get_chapters(subject.id, setChapters);
      getUserStatus(id_user, subject.id).then(setUserStatus);
      getTheme_byUser(id_user, subject.id).then(setThemes);
      getSubjects(id_user).then(setSubjects);
      get_project_contributors(subject.id).then(setUsers);
      

    }
  }, [subject, tags, personal, id_user, setQuestions, setChapters, setUserStatus]);
};

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

function ReadNotesScreen({ route }) {
  const navigation = useNavigation();
  const session = route.params?.session;
  const [questions, setQuestions] = useState([]);
  //const [subjectActive, setSubjectActive] = useState(null);
  const [subjects, setSubjects] = useState();
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
  const [subject, setSubject] = useState([]);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [userStatus, setUserStatus] = useState('');
  const [users, setUsers] = useState([]);

  const [question_reponse, setQuestion_reponse] = useState('réponse');
  const windowWidth = Dimensions.get('window').width;
  const rightPanelWidth = windowWidth;
  const isLargeScreen = windowWidth > 768;
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [themeText, setThemeText] = useState('');
  const [theme, setTheme] = useState(null);
  const [themes, setThemes] = useState([]);
  const [themesAllUsers, setThemesAllUsers] = useState([]);
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState({});
  


  const [showChoices_1, setShowChoices_1] = useState(false);
  const [showChoices_2, setShowChoices_2] = useState(false);
  const [showChoices_3, setShowChoices_3] = useState(false);
  const [showChoices_4, setShowChoices_4] = useState(false);
  const [showChoices_5, setShowChoices_5] = useState(false);
  const [showChoices_6, setShowChoices_6] = useState(false);
  const [showChoices_7, setShowChoices_7] = useState(false);

  const [showQuestion_1, setshowQuestion_1] = useState('');
  const [showQuestion_2, setshowQuestion_2] = useState('');
  const [showQuestion_3, setshowQuestion_3] = useState('');
  const [showQuestion_4, setshowQuestion_4] = useState('');
  const [showQuestion_5, setshowQuestion_5] = useState('');
  const [showQuestion_6, setshowQuestion_6] = useState('');
  const [showQuestion_7, setshowQuestion_7] = useState('');

  const [progressiveMessage_1, setProgressiveMessage_1] = useState('');
  const [progressiveMessage_2, setProgressiveMessage_2] = useState('');
  const [progressiveMessage_3, setProgressiveMessage_3] = useState('');
  const [progressiveMessage_4, setProgressiveMessage_4] = useState('');
  const [progressiveMessage_5, setProgressiveMessage_5] = useState('');
  const [progressiveMessage_6, setProgressiveMessage_6] = useState('');
  const [progressiveMessage_7, setProgressiveMessage_7] = useState('');

  const [selectedChoice_1, setSelectedChoice_1] = useState('');
  const [selectedChoice_2, setSelectedChoice_2] = useState('');
  const [selectedChoice_3, setSelectedChoice_3] = useState('');
  const [selectedChoice_4, setSelectedChoice_4] = useState('');
  const [selectedChoice_5, setSelectedChoice_5] = useState('');
  const [selectedChoice_6, setSelectedChoice_6] = useState('');
  const [selectedChoice_7, setSelectedChoice_7] = useState('');

  const [showFormatChoices, setShowFormatChoices] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredButton, setIsHoveredButton] = useState('');

  const [IsNoteScreenVisible, setIsNoteScreenVisible] = useState(false);


  const [subChoiceMessage, setSubChoiceMessage] = useState('');
  const [subChoiceMessage_2, setSubChoiceMessage_2] = useState('');
  const [formatChoiceMessage, setFormatChoiceMessage] = useState('');
  const [format, setFormat] = useState('');
  const [subChoice, setSubChoice] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(); // Ajoutez cette ligne dans les états
  const [PleaseWait, setPleaseWait] = useState(false);
  const [delegationUserId, setDelegationUserId] = useState(null);
  const [answerAndQuestion, setAnswerAndQuestion] = useState("réponse");
  const [answer, setAnswer] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [changeSubject, setChangeSubject] = useState(false);
  




  const containerRef = useRef();



  const scrollToBottom = () => {
    console.log("Trying to scroll to bottom");
    if (containerRef.current) {
      console.log("containerRef.current", containerRef.current);
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    } else {
      console.log("containerRef is not valid");
    }
  };
  
  
  
  useFetchActiveSubjectId(setSubject, setIsLoading, navigation);
  useFetchData(session.user.id, subject, setQuestions, tags, personal, setChapters, setUserStatus,setThemes,setSubjects,setUsers);
  

  
  useEffect(() => {
    const refreshData = async () => {
      await getActiveSubjectId()
        .then(async (id) => {
          if (id) {
            const fetchedSubject = await getSubject(id);
            setSubject(fetchedSubject);
            setIsLoading(false);
          } else {
            navigation.navigate('Projets');
          }
        });
    };
  
    refreshData();
  }, [changeSubject]);
  


  

  const fetchUserStatus = useCallback(async () => {
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


  const fetchThemesAllUsers = async () => {
      if (subject && subject.id) {
        await getTheme_byProject(subject.id).then(setThemesAllUsers);
      }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchThemesAllUsers();
    };
  
    fetchData();
  }, [session.user.id, subject, navigateToScreen]);
  

  useEffect(() => {
    fetchUserStatus();
  }, [fetchUserStatus]);

  useEffect(() => {
    if (userStatus === "non trouvé") {
      navigateToScreen('Projets');
    }
  }, [userStatus, navigateToScreen]);


  const navigateToScreen = useCallback((screenName, params) => {
    navigation.navigate(screenName, params);
  }, [navigation]);

  useEffect(() => {
    if (userName) {
      const messageContent = `Bonjour ${userName}, merci de votre contribution au projet. Que souhaitez-vous faire ?`;
      displayProgressiveText(messageContent, setProgressiveMessage_1);
      setTimeout(() => setShowChoices_1(true), messageContent.split(' ').length * 10);
      scrollToBottom();
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
    scrollToBottom();
  };

  const handleChoice_2 = async (choice) => {
    setSelectedChoice_2(choice);
    let message='';
    if(choice ==='Oui, je sais'){
        message = "Quel sujet souhaitez-vous aborder ?";
    };
    if(choice ==="Non, j'ai besoin d'inspiration"){
        await fetchThemesAllUsers()
        message = "Voici quelques questions qui peuvent vous inspirer"
        console.log("themesAllUsers : ",themesAllUsers)
    };
    if(choice ==='Thème ok'){
      setShowChoices_2(false)
      setSelectedChoice_1('')
      message = "";
  };

    displayProgressiveText(message, setProgressiveMessage_3);
    setTimeout(() => setShowChoices_3(true), message.split(' ').length * 10);
    scrollToBottom();
  };



  const handleChoice_3 = (format) => {

    setSelectedChoice_3(format)
    setProgressiveMessage_4('');
    //setShowChoices_2(false);
    refreshAnswers()

    const message = "Sous quel format souhaitez-vous contribuer ?";
    displayProgressiveText(message, setProgressiveMessage_4);
    setTimeout(() => setShowChoices_4(true), message.split(' ').length * 10);
    scrollToBottom();
  };



  const handleChoice_4 = (format) => {
    setSelectedChoice_4(format)
    setProgressiveMessage_5('');
    //setShowChoices_2(false);
    let message=''
    if (format ==="J\'enregistre un message vocal"){
    message = "Je vous écoute. Appuyez une fois sur l'icône microphone, parlez, puis cloturez l'enregistrement en appuyant à nouveau sur l'icône microphone";
    }
    if (format ==="J\'ai un texte à copier/coller"){
    message = "Vous pouvez écrire ou coller votre texte dans le champ ci-dessous : ";
      }
      if (format ==="Je pose une question"){
        message = "Vous pouvez poser une question afin de guider les contributeurs : ";
          }
    if (format ==="J\'ai un enregistrement audio"){
      message = "L'audio chargé va être découpé en tranche d'une minute, enregistré puis sera transcrit en format texte.";
          }
    if (format ==="J\'ai une photographie ou le scan d'un document"){
            message = "Le document chargé va être enregistré puis sera visible lors de la consultation de ce thème.";
                }
    
    displayProgressiveText(message, setProgressiveMessage_5);
    setTimeout(() => setShowChoices_5(true), message.split(' ').length * 10);
    scrollToBottom();
  };

  const handleSaveTheme= async (text) => { 
    const temp = await createTheme(text,subject.id)
    setTheme(temp)
    handleChoice_3("Thème ok")

  }
  

  const handleRecording = async () => {
    if (isRecording) {
      try {
        setIsRecording(false);
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
          await uploadAudioToSupabase(chunkUri,chunkName)
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
  
    await submitMemories_Answer(transcribedText, question, delegationUserId, isMedia, name, isImage, connectionID, async () => {
      setAnswer('');
      setTimeout(async () => {
        await refreshAnswers();
      }, 1000);
    },
    answerAndQuestion,
    theme.id
  );
  };


  const refreshAnswers = async () => {
    const answers = await getMemories_Answers_to_theme(theme.id);
    const sortedAnswers = answers.sort((a, b) => a.rank - b.rank);
      setAnswers(sortedAnswers);
      setIsLoading(false);
      console.log("Answers : ",sortedAnswers)
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

  if (isLoading || !subjects ) {
    return (
      <View style={globalStyles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container} ref={containerRef}>
  <View>
  <Picker
    selectedValue={subject.id}
    style={styles.picker}
    onValueChange={(itemValue, itemIndex) => {
      const selectedSubject = subjects.find(subj => subj.content_subject.id === itemValue).content_subject;
      console.log("New selectedSubject : ", selectedSubject)
      saveActiveSubjectId(selectedSubject.id)
        .then(() => {
          remember_active_subject(selectedSubject.id, session.user.id);
          setChangeSubject(prev => !prev);
        })
        .catch((error) => {
          console.error('Error saving active subject ID:', error);
        });
    }}
  >
    {subjects.map((subj, index) => (
      <Picker.Item key={index} label={subj.content_subject.title} value={subj.content_subject.id} />
    ))}
  </Picker>
  <Text style={globalStyles.title}>
    {subject.title}
  </Text>
</View>

 


      <View style={[
  globalStyles.navigationContainer,
  { position: 'fixed' },
  isLargeScreen ? { top: '0%', alignSelf: 'flex-end' } : { bottom: '0%', alignSelf: 'center' }
]}>

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
        <View style={[styles.rightPanel, { width: rightPanelWidth }]}>
        <ScrollView>

             <Card style={globalStyles.QuestionBubble}> 
  
              <Card.Content>
                <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_1}</Paragraph>
              </Card.Content>
            </Card>
            {showChoices_1 && (
              <>
                <View style={{ flexDirection: isLargeScreen ? 'row' : 'column', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {/* 
                <Card style={[globalStyles.ResponseBubble, selectedChoice_1 === 'Voir les notes déjà produites'&& (globalStyles.ResponseBubble_selected), {marginHorizontal: 20}]}>
                    <Card.Content>
                      <TouchableOpacity
               
                        onPress={() => handleChoice_1('Voir les notes déjà produites' )}
                        onMouseEnter={() => setIsHoveredButton('Voir les notes déjà produites')}
                        onMouseLeave={() => setIsHoveredButton('')}
                      >
                        <Paragraph style={[globalStyles.choiceButtonText, isHoveredButton==='Voir les notes déjà produites' && { fontWeight: 'bold' },selectedChoice_1 === 'Voir les notes déjà produites' && {color:'white'} ]}>Voir les notes déjà produites</Paragraph>
                      </TouchableOpacity>
                    </Card.Content>
                  </Card>
                */}
                  <Card style={[globalStyles.ResponseBubble,selectedChoice_1 === 'Ajouter une note'&& (globalStyles.ResponseBubble_selected), {marginHorizontal: 20}]}>
                    <Card.Content>
                      <TouchableOpacity
               
                        onPress={() => handleChoice_1('Ajouter une note' )}
                        onMouseEnter={() => setIsHoveredButton('Ajouter une note')}
                        onMouseLeave={() => setIsHoveredButton('')}
                      >
                        <Paragraph style={[
                            globalStyles.choiceButtonText,
                            isHoveredButton==='Ajouter une note' &&{ fontWeight: 'bold' },
                            selectedChoice_1 === 'Ajouter une note' && { color: 'white' }
                            ]}>Ajouter une note</Paragraph>
                      </TouchableOpacity>
                    </Card.Content>
                  </Card>
                  <Card style={[globalStyles.ResponseBubble, selectedChoice_1 === 'Proposer un thème'&& (globalStyles.ResponseBubble_selected), {marginHorizontal: 20}]}>
                    <Card.Content>
                      <TouchableOpacity
         
                        onPress={() => handleChoice_1('Proposer un thème' )}
                        onMouseEnter={() => setIsHoveredButton('Proposer un thème')}
                        onMouseLeave={() => setIsHoveredButton('')}
                      >
                        <Paragraph style={[globalStyles.choiceButtonText, isHoveredButton==='Proposer un thème' && { fontWeight: 'bold' },selectedChoice_1 === 'Proposer un thème' && { color: 'white' }]}>Proposer un thème</Paragraph>
                      </TouchableOpacity>
                    </Card.Content>
                  </Card>
                </View>
              </>
            )}
            {selectedChoice_1 !== '' && (
              <>
                <Card style={globalStyles.QuestionBubble}>
                  <Card.Content>
                    <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_2}</Paragraph>
                  </Card.Content>
                </Card>
              </>
            )}
            {selectedChoice_1 === 'Ajouter une note'  && (
              <>
                
                {showChoices_2 && (
                <>
                  <View style={{ flexDirection: isLargeScreen ? 'row' : 'column', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    

                  <Card style={[globalStyles.ResponseBubble, selectedChoice_2 === 'Oui, je sais' && globalStyles.ResponseBubble_selected, { marginHorizontal: 20 }]}>
  <Card.Content>
    <TouchableOpacity
      onPress={() => handleChoice_2('Oui, je sais')}
      onMouseEnter={() => setIsHoveredButton('Oui, je sais')}
      onMouseLeave={() => setIsHoveredButton('')}
    >
      <Paragraph style={[globalStyles.choiceButtonText, isHoveredButton === 'Oui, je sais' && { fontWeight: 'bold' }, selectedChoice_2 === 'Oui, je sais' && { color: 'white' }]}>
        Oui, je sais
      </Paragraph>
    </TouchableOpacity>
  </Card.Content>
</Card>

<Card style={[globalStyles.ResponseBubble, selectedChoice_2 === "Non, j'ai besoin d'inspiration" && globalStyles.ResponseBubble_selected, { marginHorizontal: 20 }]}>
  <Card.Content>
    <TouchableOpacity
      onPress={() => handleChoice_2("Non, j'ai besoin d'inspiration")}
      onMouseEnter={() => setIsHoveredButton("Non, j'ai besoin d'inspiration")}
      onMouseLeave={() => setIsHoveredButton('')}
    >
      <Paragraph style={[globalStyles.choiceButtonText, isHoveredButton === "Non, j'ai besoin d'inspiration" && { fontWeight: 'bold' }, selectedChoice_2 === "Non, j'ai besoin d'inspiration" && { color: 'white' }]}>
        Non, j'ai besoin d'inspiration
      </Paragraph>
    </TouchableOpacity>
  </Card.Content>
</Card>

                   
                  </View>
                </>)}
                {selectedChoice_2 === 'Oui, je sais' && (
                  <>

                    <Card style={globalStyles.QuestionBubble}>
                      <Card.Content>
                        <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_3}</Paragraph>
                      </Card.Content>
                    </Card>
                    
                    {showChoices_3 && (
  <View style={globalStyles.container_wide}>
  
  {/* 
  <View style={globalStyles.column}>
    {themes.length > 0 && (
      <View>
        <Picker
          selectedValue={theme?.id || ""}
          onValueChange={(itemValue) => {
            const selected = themes.find(theme => theme.id === itemValue);
            setTheme(selected);
            setThemeText(selected ? selected.theme : "");
          }}
        >
          <Picker.Item label="Choisir un thème existant" value="" />
          {themes.map((theme) => (
            <Picker.Item key={theme.id} label={theme.theme} value={theme.id} />
          ))}
        </Picker>
      </View>
    )}

    <View>
      <TextInput
        style={globalStyles.input}
        placeholder="Renseigner le thème"
        onChangeText={(text) => {
          setThemeText(text);
          setTheme(null);
        }}
        value={themeText}
        multiline={true}
        numberOfLines={4}
      />
    </View>

    {theme ? (
      <TouchableOpacity
        style={globalStyles.globalButton_wide}
        onPress={() => {
          handleChoice_3("Thème ok");
        }}
      >
        <Text style={globalStyles.globalButtonText}>Continuer à traiter ce thème existant</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={globalStyles.globalButton_wide}
        onPress={() => handleSaveTheme(themeText)}
      >
        <Text style={globalStyles.globalButtonText}>Démarrer ce nouveau thème</Text>
      </TouchableOpacity>
    )}

  </View>
  */}

  < ThemePanel  
      ID_USER={session.user.id}
      ID_subject={subject.id} 
      new_theme={false} 
      themes={themes}
      themesAllUsers={themesAllUsers} 
      theme={theme} 
      setTheme={setTheme} 
      themeText={themeText} 
      setThemeText={setThemeText} 
      closureFunction={handleChoice_3}
      />

   
</View>

)}
</>)}
{selectedChoice_2 === "Non, j'ai besoin d'inspiration" && (
                  <>
                    <Card style={globalStyles.QuestionBubble}>
                      <Card.Content>
                        <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_3}</Paragraph>
                      </Card.Content>
                    </Card>
                    {showChoices_3 && ( 
                      <> 
                          <CarrousselThemes
                            themes={themesAllUsers}
                            isLargeScreen={isLargeScreen}
                            theme={theme}
                            setTheme={setTheme}
                          />
         
                      {theme && (
                        <TouchableOpacity
                          style={globalStyles.globalButton_wide}
                          onPress={() => {
                            handleChoice_3("Thème ok");
                          }}
                        >
                          <Text style={globalStyles.globalButtonText}>Choisir ce thème</Text>
                        </TouchableOpacity>
                      ) }

                      </>
                      
                    )}                 
                  </>
                )}


{(selectedChoice_2 === 'Oui, je sais' || selectedChoice_2 === "Non, j'ai besoin d'inspiration") && (
  <>

                    {selectedChoice_3 === 'Thème ok' &&(
                    <Card style={globalStyles.QuestionBubble}>
                      <Card.Content>
                        <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_4}</Paragraph>
                      </Card.Content>
                    </Card>
                    )}
                    {showChoices_4  && (
                      <>
                      <View style={{ flexDirection: isLargeScreen ? 'row' : 'column', flexWrap: 'wrap', justifyContent: 'flex-end' }}>

                      {['J\'enregistre un message vocal', 'J\'ai un texte à copier/coller', 'J\'ai un enregistrement audio', 'J\'ai une photographie ou le scan d\'un document','Je pose une question'].map((format) => (
  <Card style={[globalStyles.ResponseBubble, selectedChoice_4 === format && globalStyles.ResponseBubble_selected, { marginHorizontal: 20 }]} key={format}>
    <Card.Content>
      <TouchableOpacity
        onPress={() => handleChoice_4(format)}
        onMouseEnter={() => setIsHoveredButton(format)}
        onMouseLeave={() => setIsHoveredButton('')}
      >
        <Paragraph style={[globalStyles.choiceButtonText, isHoveredButton === format && { fontWeight: 'bold' }, selectedChoice_4 === format && { color: 'white' }]}>
          {format}
        </Paragraph>
      </TouchableOpacity>
    </Card.Content>
  </Card>
))}
                      </View>
                      {selectedChoice_4==='J\'enregistre un message vocal' &&(<> 
                        <Card style={globalStyles.QuestionBubble}>
                  <Card.Content>
                    <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_5}</Paragraph>
                  </Card.Content>
                </Card>
                {showChoices_5 === true && (
  <>
<View style={{
    padding: 10,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center'}}>
  <AnswerPanel_oral
        ID_USER={session.user.id}
        Id_question={null}
        Id_connection={theme.id}
        question_reponse={"réponse"}
        refreshAnswers={refreshAnswers}
 
      />
</View>

 
  </>
)}

                      </>)}
                      {selectedChoice_4==='J\'ai un texte à copier/coller'&&(<> 
                        <Card style={globalStyles.QuestionBubble}>
                  <Card.Content>
                    <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_5}</Paragraph>
                  </Card.Content>
                </Card>
                {showChoices_5 === true && (
  
  <View style={{
    padding: 10,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center'}}>
  <AnswerPanel_written
        ID_USER={session.user.id}
        Id_question={null}
        Id_connection={theme.id}
        question_reponse={"réponse"}
        refreshAnswers={refreshAnswers}
 
      />
</View>

 
  
)}

                      </>)}
                      {selectedChoice_4==='Je pose une question'&&(<> 
                        <Card style={globalStyles.QuestionBubble}>
                  <Card.Content>
                    <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_5}</Paragraph>
                  </Card.Content>
                </Card>
                {showChoices_5 === true && (
  
  <View style={{
    padding: 10,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center'}}>
  <AnswerPanel_written
        ID_USER={session.user.id}
        Id_question={null}
        Id_connection={theme.id}
        question_reponse={"question"}
        refreshAnswers={refreshAnswers}
 
      />
</View>

 
  
)}

                      </>)}

                      {selectedChoice_4==='J\'ai un enregistrement audio'&&(<> 
                        <Card style={globalStyles.QuestionBubble}>
                  <Card.Content>
                    <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_5}</Paragraph>
                  </Card.Content>
                </Card>
                {showChoices_5 === true && (
  
  <View style={{
    padding: 10,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center'}}>
  <AnswerPanel_AudioFile
        ID_USER={session.user.id}
        Id_question={null}
        Id_connection={theme.id}
        question_reponse={"réponse"}
        refreshAnswers={refreshAnswers}
 
      />
</View>

 
  
)}

                      </>)}

                      
                      {selectedChoice_4==="J\'ai une photographie ou le scan d'un document" &&(<> 
                        <Card style={globalStyles.QuestionBubble}>
                  <Card.Content>
                    <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_5}</Paragraph>
                  </Card.Content>
                </Card>
                {showChoices_5 === true && (
  
  <View style={{
    padding: 10,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center'}}>
  <AnswerPanel_imageFile
        ID_USER={session.user.id}
        Id_question={null}
        Id_connection={theme.id}
        question_reponse={"réponse"}
        refreshAnswers={refreshAnswers}
 
      />
</View>

 
  
)}

                      </>)}

                      </>
                    )}


                    
                                           {/* Ajouter ici la liste de tous les éléments de answers */}
    
                                           {selectedChoice_3 === 'Thème ok' &&(
    <View  >
      <Text> </Text>
      <Text>Notes déjà présentes dans ce thème :</Text> 
      <Text> </Text>
      {answers.map((answer, index) => (
         <View key={answer.id} style={[globalStyles.container_wide, { flexDirection: 'row'}]}>
         <AnswerCard
           key={answer.id} // Ajoutez une clé ici
           item={answer} 
           showDetails={showDetails}
           isLargeScreen={isLargeScreen}
           users={users} 
         />
          {session.user.id===answer.id_user &&  (
         <TouchableOpacity key={`${answer.id}-delete`} onPress={() => handleDeleteAnswer(answer)}>
           <Image source={trash} style={{ width: 72, height: 72, opacity: 0.5, marginLeft: 30 }} />
         </TouchableOpacity>
          )}
        {/* 
        <Card key={index} style={[globalStyles.ResponseBubble, { marginHorizontal: 20, width: '80%' }]}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexGrow: 1, flexShrink: 1, flexDirection: 'column' }}> 
              <Paragraph style={globalStyles.choiceButtonText}>
                {answer.answer === 'audio à convertir en texte' ? `${new Date(answer.created_at).toLocaleDateString()} ${new Date(answer.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : answer.answer}
              </Paragraph>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity onPress={() => handlePlayPause(answer.id, answer.link_storage, currentAudioId, setCurrentAudioId, playbackStatus, setPlaybackStatus)}>
                  <Image source={playbackStatus.isPlaying && currentAudioId === answer.id ? pauseIcon : playIcon} style={{ width: 25, height: 25 }} />
                </TouchableOpacity>
                <Slider
                  style={{ flex: 1, marginHorizontal: 10 }}
                  value={currentAudioId === answer.id ? playbackStatus.positionMillis || 0 : 0}
                  minimumValue={0}
                  maximumValue={playbackStatus.durationMillis || 0}
                  onSlidingComplete={async (value) => {
                    if (playbackStatus.sound) {
                      await playbackStatus.sound.setPositionAsync(value);
                    }
                  }}
                />
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDeleteAnswer(answer.id)} style={{ flexShrink: 0 }}>
              <Image source={trash} style={{ width: 36, height: 36, opacity: 0.5, marginLeft: 15 }} />
              {isLargeScreen && <Text>Supprimer</Text>}
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
      */}
      </View>
      ))}
    </View>
                                           )}    
    

                  </>
                )}
              
              </>)}

            {selectedChoice_1 === 'Voir les notes déjà produites' && showChoices_2 && (
              <NoteScreen route={{ params: { session, question, question_reponse, mode: "full" } }} />
            )}
            
            {selectedChoice_1 === 'Proposer un thème'  && showChoices_2 &&  ( 
              <View style={{
    padding: 10,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center'}}>
< ThemePanel  
      ID_USER={session.user.id}
      ID_subject={subject.id} 
      new_theme={true} 
      themes={themesAllUsers}
      themesAllUsers={themesAllUsers}  
      theme={null} 
      setTheme={setTheme} 
      themeText={themeText} 
      setThemeText={setThemeText} 
      closureFunction={handleChoice_2}
      />

{/*
  <AnswerPanel_written
        ID_USER={session.user.id}
        Id_question={null}
        Id_connection={null}
        question_reponse={"question"}
        refreshAnswers={refreshAnswers}
        theme={theme}
        setTheme={setTheme}
 
      />
      */}
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
  
          </ScrollView>
        </View>
      </View>
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


export default ReadNotesScreen;
