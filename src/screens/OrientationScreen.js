import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Picker } from 'react-native';
import { TouchableOpacity } from 'react-native-web';
import { useNavigation } from '@react-navigation/native';
import { Card, Paragraph } from 'react-native-paper';
import { globalStyles } from '../../global';
import { getSubject, getSubjects, getUserStatus, get_user_name, validate_project_contributors,remember_active_subject } from '../components/data_handling';
import { getActiveSubjectId,saveActiveSubjectId } from '../components/local_storage';

const useFetchData = (id_user, setUserName, subjects, setSubjects, navigateToScreen, setProjectsCount) => {
  useEffect(() => {
    const fetchMachin = async () => {
      if (id_user && subjects.length === 0) {
        const temp = await getSubjects(id_user);
        setSubjects(temp);
        await get_user_name(id_user).then(setUserName);
        if (temp.length > 0) {
          setProjectsCount(temp.length);
        } else {
          navigateToScreen('Projets');
        }
      }
    };
    fetchMachin();
  }, [id_user, subjects]);
};

const OrientationScreen = ({ route }) => {
  const [animationValues] = useState([...Array(6)].map(() => new Animated.Value(0)));
  const containerRef = useRef();
  const titles = ['Structurer', 'Raconter', 'Réagir', 'Rédiger', 'Corriger', 'Lire'];
  const details = [
    <>
      <Text style={{ fontWeight: 'bold' }}>Proposez</Text> un thème autour duquel l'information sera collectée
    </>,
    <>
      <Text style={{ fontWeight: 'bold' }}>Partagez</Text> vos souvenirs {"\n\n"} 
      ou bien {"\n\n"} 
      <Text style={{ fontWeight: 'bold' }}>Apportez</Text> de la matière brute : {"\n"} 
      - lettres, {"\n"} 
      - enregistrements audios, {"\n"} 
      - photographies, {"\n"} 
      - etc.
    </>,
    <>
      <Text style={{ fontWeight: 'bold' }}>Prenez</Text> la suite d'un thème existant en y apportant vos compléments ou vos questions
    </>,
    <>
      <Text style={{ fontWeight: 'bold' }}>Rédigez</Text> un chapitre à partir de la matière déjà collectée
    </>,
    <>
      <Text style={{ fontWeight: 'bold' }}>Relisez</Text>, complétez, annotez un chapitre rédigé
    </>,
    <>
      <Text style={{ fontWeight: 'bold' }}>Lisez</Text> les chapitres rédigés
    </>
  ];

  const colors = ['#0c2d48','#145da0',  '#2e8bc0','#fc2e20' ,  '#fd7f20','#fdb750'];

  // Valeurs d'animation de zoom pour chaque carte
  const [zoomAnimations] = useState(titles.map(() => new Animated.Value(1)));

  // État pour gérer le zIndex de chaque carte
  const [zIndexes, setZIndexes] = useState(titles.map(() => 0));

  const [userName, setUserName] = useState('');
  const session = route.params?.session;
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState([]);
  const [projectsCount, setProjectsCount] = useState({});

  const [progressiveMessage_0, setProgressiveMessage_0] = useState('');
  const [progressiveMessage_1, setProgressiveMessage_1] = useState('');
  const [progressiveMessage_2, setProgressiveMessage_2] = useState('');

  const [showChoices_1, setShowChoices_1] = useState(false);
  const [showChoices_2, setShowChoices_2] = useState(false);

  // Nouveaux états pour s'assurer que les messages ne sont affichés qu'une seule fois
  const [message0Displayed, setMessage0Displayed] = useState(false);
  const [message1Displayed, setMessage1Displayed] = useState(false);

  const navigation = useNavigation();
  const [, forceUpdate] = useState();
  
  const navigateToScreen = useCallback((screenName, params) => {
    navigation.navigate(screenName, params);
  }, [navigation]);

  useEffect(() => {
    if (projectsCount === 1) {
      const fetchSubject = async () => {
        const temp = await getActiveSubjectId();
        if (temp !== subject?.id) {
          const newSubject = await getSubject(temp);
          setSubject(newSubject);
        }
      };
      fetchSubject();
      handleChoice_2();
    } else if (projectsCount > 1) {
      handleChoice_1();
    }
  }, [projectsCount]);

  useEffect(() => {
    if (userName && !message0Displayed) {
      const messageContent = `Bonjour ${userName}, bienvenue !`;
      displayProgressiveText(messageContent, setProgressiveMessage_0);
      setMessage0Displayed(true); // Empêche le message de s'afficher plusieurs fois
    }
  }, [userName, message0Displayed]);

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

  useFetchData(session.user.id, setUserName, subjects, setSubjects, navigateToScreen, setProjectsCount);

  const handleChoice_1 = async () => {
    setShowChoices_2(false);
    setShowChoices_1(false);
    setSubject([]);

    if (!message1Displayed) {
      const message = "Veuillez selectionner un projet : ";
      displayProgressiveText(message, setProgressiveMessage_1);
      setMessage1Displayed(true); // Empêche le message de s'afficher plusieurs fois
    }

    setTimeout(() => setShowChoices_1(true), 1000);
  };

  const handleChoice_2 = async () => {
    setShowChoices_2(false);
    const message = "Que souhaitez-vous faire ?";
    displayProgressiveText(message, setProgressiveMessage_2);
    setTimeout(() => setShowChoices_2(true), 1000);
  };


  // Handlers pour chaque carte
  const handleStructurer = async () => {
    await validate_project_contributors(subject.id,session.user.id,true,"Contributeur","Pas d'accès")   
    navigateToScreen('Incipit');
  };

  const handleRaconter = async () => {
    await validate_project_contributors(subject.id,session.user.id,true,"Contributeur","Pas d'accès")   
    navigateToScreen('Incipit');
  };

  const handleReagir = async () => {
    await validate_project_contributors(subject.id,session.user.id,true,"Contributeur","Pas d'accès")   
    navigateToScreen('Incipit');
  };

  const handleRediger = async () => {
    await validate_project_contributors(subject.id,session.user.id,true,"Contributeur","Editeur")   
    navigateToScreen('Marcel');
  };

  const handleCorriger = async () => {
    await validate_project_contributors(subject.id,session.user.id,true,"Contributeur","Auditeur")   
    navigateToScreen('Marcel');
  };

  const handleLire = async () => {
    await validate_project_contributors(subject.id,session.user.id,true,"Contributeur","Lecteur")   
    navigateToScreen('Marcel');
  };

  // Associe chaque fonction à la carte correspondante
  const handlers = [handleStructurer, handleRaconter, handleReagir, handleRediger, handleCorriger, handleLire];

  const handleMouseEnter = (index) => {
    setZIndexes((prevZIndexes) => {
      const newZIndexes = [...prevZIndexes];
      newZIndexes[index] = 1; // Passe la carte au premier plan
      return newZIndexes;
    });

    Animated.timing(zoomAnimations[index], {
      toValue: 1.2, // Zoom à 1.2x
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (progressiveMessage_2 !== "") { 
    console.log('Animations started'); // Pour vérifier si l'animation démarre
    animationValues.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000 + index * 200,
        useNativeDriver: true, // Gardez cela à true pour les transformations
      }).start(() => {
        forceUpdate({}); // Forcer la mise à jour après l'animation
      });
    });
  }
  }, [progressiveMessage_2]);

  const handleMouseLeave = (index) => {
    Animated.timing(zoomAnimations[index], {
      toValue: 1, // Retour à la taille normale
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setZIndexes((prevZIndexes) => {
        const newZIndexes = [...prevZIndexes];
        newZIndexes[index] = 0; // Remet la carte à son zIndex d'origine
        return newZIndexes;
      });
    });
  };

  const renderCards = () => {
    return titles.map((title, index) => {
      const animatedStyle = {
        transform: [
          {
            rotate: animationValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: ['-70deg', `${index * 25 - 60}deg`], // Rotation calculée pour chaque carte
            }),
          },
          { translateY: -Dimensions.get('window').width * 0.1 }, // Décalage pour chaque carte
          { scale: zoomAnimations[index] },  // Animation de zoom
        ],
      };

      return (
        <>



        
 



        <TouchableOpacity
          key={`card-${index}`} 
          onPress={handlers[index]} // Exécute la fonction associée à la carte
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={() => handleMouseLeave(index)}
          style={{ zIndex: zIndexes[index] }}
        >
          <Animated.View style={[styles.card, { backgroundColor: colors[index] }, animatedStyle]}>
            <Text style={styles.title}>{title}</Text>
            <Text> </Text>
            <Text> </Text>
            <Text style={styles.details}>{details[index]}</Text>
            <View style={styles.holeContainer}>
              <View style={styles.hole} />
            </View>
          </Animated.View>
        </TouchableOpacity>
      
      
      </>
    );
    });
  };



  return (
    <View style={globalStyles.container} ref={containerRef}>
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
              <> 
              <Card style={globalStyles.QuestionBubble}>
                <Card.Content>
                  <Paragraph style={globalStyles.globalButtonText_tag}>{progressiveMessage_2}</Paragraph>
                </Card.Content>
              </Card>
   
    <View style={styles.container}>
      {renderCards()}
    </View>
    <Text> </Text>
    <Text> </Text>
    <Text> </Text>
    <Text> </Text>
    <Text> </Text>
    <Text> </Text>
    <Text> </Text>
    <Text> </Text>
    <Text> </Text>
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
    )}

</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    transform: [{ translateY: -Dimensions.get('window').height * 0.2 }],
  },
  card: {
    position: 'absolute',
    width: Dimensions.get('window').height * 0.2,
    height: Dimensions.get('window').height * 0.8,
    justifyContent: 'flex-start', // Aligne le contenu en haut
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)', // Bordure subtile
    shadowColor: '#000', // Ombre de la carte
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8, // Utilisé pour Android
  },
  title: {
    fontSize: 34,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10, // Espace entre le titre et les détails
  },
  details: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'left',
  },
  holeContainer: {
    position: 'absolute',
    bottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hole: {
    width: 20,
    height: 20,
    borderRadius: 10, // Crée un cercle
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)', // Bordure subtile pour le trou
    shadowColor: '#000', // Ombre pour le trou
    shadowOffset: { width: 0, height: -3 }, // Ombre vers le haut
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5, // Élévation pour Android
  },
});

export default OrientationScreen;