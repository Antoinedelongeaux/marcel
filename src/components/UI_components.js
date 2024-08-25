// AnswerCard.js

import React, { useState, useEffect,useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, TextInput, Dimensions,  Picker,   Alert, } from 'react-native';
import Slider from '@react-native-community/slider';
import Modal from 'react-native-modal';
import { globalStyles } from '../../global';
import playIcon from '../../assets/icons/play.png';
import pauseIcon from '../../assets/icons/pause.png';
import editIcon from '../../assets/icons/pen-to-square-regular.svg';
import captionIcon from '../../assets/icons/caption.png';
import eyeIcon from '../../assets/icons/view.png';
import questionIcon from '../../assets/icons/question.png';
import copyIcon from '../../assets/icons/paste.png';
import trashIcon from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import refreshIcon from '../../assets/icons/refresh_black_24dp.svg';
import closeIcon from '../../assets/icons/close.png'; 
import { createAudioChunk, 
  startRecording, 
  stopRecording, 
  uploadAudioToSupabase, 
  delete_audio,
  delete_Image,
  playRecording_fromAudioFile, 
  uploadImageToSupabase,
  handlePlayPause
} from './sound_handling';
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
  update_answer_owner,
  getExistingLink,
  updateExistingLink,
  createNewLink,
  updateAnswer,
  getTheme_byProject,
  getAnswer,
} from './data_handling';
import Carousel from 'react-native-snap-carousel';
import PropTypes from 'prop-types';
import leftArrowIcon from '../../assets/icons/left-arrow.png';  // Remplacez par le chemin de votre icône
import rightArrowIcon from '../../assets/icons/right-arrow.png'; // Remplacez par le chemin de votre icône
import { transcribeAudio_slow,transcribeAudio_HQ } from '../components/call_to_whisper';



export const AnswerCard = ({  item, showDetails, isLargeScreen,users,setFullscreenImage }) => {
  const [Item, setItem ] = useState(item);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [playbackStatus, setPlaybackStatus] = useState({});
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [selectedAnswerIds, setSelectedAnswerIds] = useState([]);
  const [isUsed, setIsUsed] = useState(Item.used);
  const [isQuality, setIsQuality] = useState(Item.quality);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(users.length > 0 ? users[0].id_user : '');
  const [isTranscriptionModalVisible, setIsTranscriptionModalVisible] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  



  useEffect(() => {
    const fetchUserNames = async () => {
      const names = {};
      const name = await get_user_name(Item.id_user);
      names[Item.id_user] = name;
      setUserNames(names);
    };

    fetchUserNames();
  }, [Item.id_user]);

// Actualisation de la réponse


const refreshAnswer = async () => {

  setItem(await getAnswer(Item.id));
  
};




// manipulation des réponses (texte)

const handleUpdateAnswer = async (answerId, newText) => {
  try {
    await update_answer_text(answerId, newText);
    setEditingAnswerId(null);
    setEditingText('');
    Item.answer = newText; // Mise à jour de Item.answer
  } catch (error) {
    alert("Error updating answer: " + error.message);
  }
};


  const handleUpdateOwner = async () => {
    if (Item.id && selectedUserId) {
      await update_answer_owner(Item.id, selectedUserId);
      Item.id_user = selectedUserId; 
      setIsAssignModalVisible(false);
    } else {
      Alert.alert("Erreur", "Veuillez sélectionner un utilisateur.");
    }
  };

  const handleDeleteAnswer = async (answerToDelete) => {


    try {
      await deleteMemories_Answer(answerToDelete);
      alert("Answer deleted");
    } catch (error) {
      alert("Error deleting answer: " + error.message);
    }
  };

  const handleToggleUsed = async () => {
    await updateAnswer(Item.id, 'used', !isUsed);
    setIsUsed(!isUsed);
  };
  
  
  const handleToggleQuality = async () => {
    await updateAnswer(Item.id, 'quality', !isQuality);
    setIsQuality(!isQuality);
  };
  



// manipulation des réponses (audio)

  const handlePlayPauseInternal = async (audioId, audioLink) => {
    await handlePlayPause(audioId, audioLink, currentAudioId, setCurrentAudioId, playbackStatus, setPlaybackStatus);
  };
  const handleAssignOwner = () => {
    setIsAssignModalVisible(true);
  };


  const handleCaptionClick = () => {
    setIsTranscriptionModalVisible(true);
  };

  const handleConfirmTranscription_slow = async () => {


      
      setIsTranscribing(true)
      setIsTranscriptionModalVisible(false);
      const temp = await transcribeAudio_slow(Item.link_storage, Item.id);
      setIsTranscribing(false);
      refreshAnswer();


    
  };
  const handleConfirmTranscription_hq = async () => {


      
    setIsTranscribing(true)
    setIsTranscriptionModalVisible(false);
    const temp = await transcribeAudio_HQ(Item.link_storage, Item.id);
    setIsTranscribing(false);
    refreshAnswer();


  
};

  return (
    <>


    
    <TouchableOpacity
      style={[
        styles.answerCard,
        selectedAnswerIds.includes(Item.id) && styles.selectedAnswerCard,
      ]}

    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          {showDetails && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontWeight: 'bold' }}>
                {new Date(Item.created_at).toLocaleDateString()} {new Date(Item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
          {Item.id === editingAnswerId ? (
            <>
              <TextInput
                style={globalStyles.input}
                value={editingText}
                onChangeText={setEditingText}
                multiline={true}
                numberOfLines={10}
              />
              <TouchableOpacity
                onPress={() => handleUpdateAnswer(Item.id, editingText)}
                style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5', alignItems: 'center', paddingVertical: 10, marginRight: 5 }]}
              >
                <Text style={globalStyles.globalButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {isTranscribing&& (
                <View style={styles.container}>
                  <ActivityIndicator size="large" color="#0b2d52" />
                </View>
              )}
              {!isTranscribing && (
                <>
                  {Item.image && (
                    <TouchableOpacity onPress={() => setFullscreenImage(`https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${Item.link_storage}`)} >
                      <Image source={{ uri: `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${Item.link_storage}` }} style={{ width: '100%', height: 300, resizeMode: 'contain' }} />
                      <Text></Text>
                      <Text style={{ justifyContent: 'center', textAlign: 'center' }}>{Item.answer}</Text>
                    </TouchableOpacity>
                  )}
                  <View style={{ flexDirection: 'row'}}>
                  {Item.question_reponse == "question" && (<Image source={questionIcon} style={{ width: 36, height: 36, opacity: 0.5, marginLeft: 15 }} />)}
                  {!Item.image && Item.answer !== 'audio à convertir en texte' &&(
                    <Text style={styles.answerText}>{Item.answer}</Text>
                  )}
                  </View>
                </>
              )}
            </>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            {showDetails && (
              <>
                { Item.id !== editingAnswerId && (
               
                  <TouchableOpacity onPress={() => { setEditingAnswerId(Item.id); setEditingText(Item.answer); }}>
                    <Image source={editIcon} style={{ width: 28, height: 28, opacity: 0.5 }} />
                    {isLargeScreen && <Text>Edit</Text>}
                  </TouchableOpacity>
                      
                )}
                {Item.audio && (
                  <TouchableOpacity onPress={() => alert('Transcribe')}>
                    <Image source={captionIcon} style={{ width: 25, height: 25, opacity: 0.5, marginHorizontal: 15 }} />
                    {isLargeScreen && <Text>Transcribe</Text>}
                  </TouchableOpacity>
                )}
                {Item.image && (
                  <TouchableOpacity >
                    <Image source={eyeIcon} style={{ width: 35, height: 35, opacity: 0.5, marginHorizontal: 15 }} />
                    {isLargeScreen && <Text>View</Text>}
                  </TouchableOpacity>
                )}

<View style={{ flexDirection: 'column', alignItems: 'center' }}>
  <TouchableOpacity
    style={[styles.toggleButton, isUsed && styles.selectedToggle]}
    onPress={handleToggleUsed}
  >
    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
      <View style={[
        styles.toggleButtonCircle,
        { left: isUsed ? 2 : null, right: !isUsed ? 2 : null }
      ]} />
    </View>
    <Text style={[styles.toggleText, { marginTop: 5 }]}> </Text>
  </TouchableOpacity>
  <Text>{isUsed ? 'Utilisé' : 'Non utilisé'}</Text>
</View>

<View style={{ flexDirection: 'column', alignItems: 'center' }}>
  <TouchableOpacity
    style={[styles.toggleButton, isQuality && styles.selectedToggle]}
    onPress={handleToggleQuality}
  >
    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
      <View style={[
        styles.toggleButtonCircle,
        { left: isQuality ? 2 : null, right: !isQuality ? 2 : null }
      ]} />
    </View>
    <Text style={[styles.toggleText, { marginTop: 5 }]}> </Text>
  </TouchableOpacity>
  <Text>{isQuality ? 'Relu' : 'Non relu'}</Text>
</View>




                <TouchableOpacity onPress={() => handleDeleteAnswer(Item)}>
                  <Image source={trashIcon} style={{ width: 36, height: 36, opacity: 0.5, marginLeft: 15 }} />
                  {isLargeScreen && <Text>Delete</Text>}
                </TouchableOpacity>
              </>
            )}

          {!showDetails && (<>
            {(Item.audio || Item.id === editingAnswerId) && (
              <Text> </Text>
              )}
              {!Item.audio &&Item.id !== editingAnswerId && (
                     
                     <TouchableOpacity onPress={() => { setEditingAnswerId(Item.id); setEditingText(Item.answer); }} style={{ marginRight: 30 }}>
  <Image source={editIcon} style={{ width: 28, height: 28, opacity: 0.5 }} />
  {isLargeScreen && <Text>Editer</Text>}
</TouchableOpacity>

             
               )}
 
              
              
              
              <Text style={{ textAlign: 'right', marginTop: 10, fontStyle: 'italic' }}>
               le {new Date(Item.created_at).toLocaleDateString()} à {new Date(Item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              
              </>
        
          )}

            <Text style={{ textAlign: 'right', marginTop: 10, fontStyle: 'italic' }} onPress={() => handleAssignOwner(Item.id)}>
              {userNames[Item.id_user]}
            </Text>
          </View>
          

               
          {Item.audio && (
  <View style={{ flexDirection: isLargeScreen ? 'row' : 'column', alignItems: 'center' }}>
    {!showDetails && Item.id !== editingAnswerId && (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: isLargeScreen ? 0 : 15 }}>  {/* Ajout d'une marge verticale en smallScreen */}
        <TouchableOpacity onPress={() => { setEditingAnswerId(Item.id); setEditingText(Item.answer); }} style={{ marginRight: 30 }}>
          <Image source={editIcon} style={{ width: 28, height: 28, opacity: 0.5 }} />
          {/* {isLargeScreen && <Text>Editer</Text>} */}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleCaptionClick()} style={styles.playButton}>
          <Image source={captionIcon} style={{ width: 25, height: 25, opacity: 0.5, marginHorizontal: 15 }} />
          {/* {isLargeScreen && <Text>Retranscrire</Text>} */}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => refreshAnswer()} style={styles.playButton}>
          <Image source={refreshIcon} style={{ width: 25, height: 25, opacity: 0.5, marginHorizontal: 15 }} />
          {/* {isLargeScreen && <Text>Refraichir</Text>} */}
        </TouchableOpacity>

        <Text> </Text>
      </View>
    )}

    {/* Slider and Play/Pause Button */}
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', width: isLargeScreen ? 'auto' : '100%', marginTop: isLargeScreen ? 0 : 15 }}>  {/* Ajout d'une marge verticale en smallScreen */}
      <TouchableOpacity onPress={() => handlePlayPauseInternal(Item.id, Item.link_storage)}>
        <Image source={playbackStatus.isPlaying && currentAudioId === Item.id ? pauseIcon : playIcon} style={{ width: 25, height: 25 }} />
      </TouchableOpacity>

      <Slider
        style={{ flex: 1, marginLeft: 10 }}
        value={currentAudioId === Item.id ? playbackStatus.positionMillis || 0 : 0}
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
)}


                
        </View>
      </View>
      <Modal isVisible={isAssignModalVisible}>
  <View style={globalStyles.overlay}>
    <View style={globalStyles.modalContainer}>
      <TouchableOpacity onPress={() => setIsAssignModalVisible(false)} style={globalStyles.closeButton}>
        <Image source={closeIcon} style={globalStyles.closeIcon} />
      </TouchableOpacity>
      <Text style={globalStyles.modalTitle}>Attribuer à un utilisateur</Text>
      <Picker
        selectedValue={selectedUserId || ''}
        onValueChange={(ItemValue) => setSelectedUserId(ItemValue)}
      >
        {users.map((user) => (
          <Picker.Item key={user.id_user} label={user.name} value={user.id_user} />
        ))}
      </Picker>
      <TouchableOpacity onPress={handleUpdateOwner} style={globalStyles.globalButton_wide}>
        <Text style={globalStyles.globalButtonText}>Attribuer</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal isVisible={isTranscriptionModalVisible}>
    <View style={globalStyles.overlay}>
      <View style={globalStyles.modalContainer}>
      <TouchableOpacity onPress={() => setIsTranscriptionModalVisible(false)} style={globalStyles.closeButton}>
              <Image source={closeIcon} style={globalStyles.closeIcon} />
      </TouchableOpacity>
      <Text style={globalStyles.modalTitle}>Confirmation de retranscription</Text>
      <Text style={globalStyles.modalText}>
        Voulez-vous vraiment retranscrire ce message audio ? Le texte existant sera alors effacé et remplacé par la nouvelle retranscription.
      </Text>
      <TouchableOpacity onPress={handleConfirmTranscription_slow} style={globalStyles.globalButton_wide}>
        <Text style={globalStyles.globalButtonText}>Transcrire avec le modèle le plus rapide</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleConfirmTranscription_hq} style={globalStyles.globalButton_wide}>
        <Text style={globalStyles.globalButtonText}>Transcrire avec le modèle le plus précis</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </TouchableOpacity>
   

    </>
  );
};

export const CarrousselThemes = ({ themes, isLargeScreen, setTheme }) => {
  const SLIDER_WIDTH = Dimensions.get('window').width;
  const ITEM_WIDTH = SLIDER_WIDTH * (isLargeScreen ? 0.6 : 0.7); // Ajuste la taille des éléments en fonction de l'écran
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderItem = ({ Item }) => (
    <TouchableOpacity onPress={() => {console.log("Theme : ", Item), setTheme(Item)}} style={styles.carouselItem}>
      <Text style={styles.carouselText}>{Item.theme}</Text>
    </TouchableOpacity>
  );

  // Fonction pour faire défiler vers la gauche
  const scrollLeft = () => {
    if (carouselRef.current) {
      const prevIndex = currentIndex - 1 < 0 ? themes.length - 1 : currentIndex - 1;
      carouselRef.current.snapToItem(prevIndex);
      setCurrentIndex(prevIndex);  // Mise à jour de l'index actuel
    }
  };

  // Fonction pour faire défiler vers la droite
  const scrollRight = () => {
    if (carouselRef.current) {
      const nextIndex = (currentIndex + 1) % themes.length;
      carouselRef.current.snapToItem(nextIndex);
      setCurrentIndex(nextIndex);  // Mise à jour de l'index actuel
    }
  };

  return (
    <View style={styles.carouselWrapper}>
      {isLargeScreen && (
        <TouchableOpacity onPress={scrollLeft} style={styles.arrowButtonLeft}>
          <Image source={leftArrowIcon} style={styles.arrowIcon} />
        </TouchableOpacity>
      )}

      <View style={styles.carouselContainer}>
        <Carousel
          ref={carouselRef}
          data={themes}
          renderItem={renderItem}
          sliderWidth={SLIDER_WIDTH}  // Ajuste le slider à la largeur d'un seul élément
          itemWidth={ITEM_WIDTH}    // La largeur de chaque élément
          inactiveSlideScale={isLargeScreen ? 0.0 : 0.9}  // Masque complètement les éléments inactifs sur grand écran
          inactiveSlideOpacity={isLargeScreen ? 0.0 : 0.7} // Rend les éléments inactifs invisibles sur grand écran
          loop={true}
          enableMomentum={true}
          decelerationRate={0.9}
          useScrollView={true}
          onSnapToItem={(index) => setCurrentIndex(index)}  // Mets à jour l'index actuel à chaque défilement
        />
      </View>

      {isLargeScreen && (
        <TouchableOpacity onPress={scrollRight} style={styles.arrowButtonRight}>
          <Image source={rightArrowIcon} style={styles.arrowIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

CarrousselThemes.propTypes = {
  themes: PropTypes.arrayOf(
    PropTypes.shape({
      theme: PropTypes.string.isRequired,
    })
  ).isRequired,
  isLargeScreen: PropTypes.bool.isRequired,
  setTheme: PropTypes.func.isRequired,
};


const styles = StyleSheet.create({
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
    zIndex: 1,
  },
  answerText: {
    fontSize: 16,
    marginLeft: 20,
  },
  selectedAnswerCard: {
    backgroundColor: '#93d9e6',
    zIndex: 2,
  },
  connectedAnswerCard: {
    backgroundColor: '#cce4e8',
    zIndex: 2,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  selectedToggle: {
    backgroundColor: '#008080',
  },
  toggleButtonCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    position: 'absolute',
  },
  toggleTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  toggleText: {
    marginHorizontal: 10,
    fontSize: 16,
    width: 100,
  },



  carouselWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',  // Pour s'assurer que les flèches sont bien positionnées de chaque côté
    width: '100%',
  },
  carouselContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
  },
  carouselItem: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0c2d48',
    borderRadius: 10,
    height: 150,
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)', // Bordure subtile
    shadowColor: '#000', // Ombre de la carte
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8, // Utilisé pour Android
    paddingHorizontal: 20,
  },
  carouselText: {
    fontSize: 18,
    fontWeight:'bold',
    color: '#fff',
  },
  arrowButtonLeft: {
    padding: 20,  // Augmente la surface cliquable
    position: 'absolute',
    left: 0,
    zIndex: 100,  // Assurez-vous que l'icône de gauche est bien au-dessus des autres éléments
  },
  arrowButtonRight: {
    padding: 20,  // Augmente la surface cliquable
    position: 'absolute',
    right: 0,
    zIndex: 100,  // Assurez-vous que l'icône de droite est bien au-dessus des autres éléments
  },
  arrowIcon: {
    width: 60,
    height: 60,
  },

});


