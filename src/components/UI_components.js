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

export const AnswerCard = ({  item, showDetails, isLargeScreen,users,setFullscreenImage }) => {
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [playbackStatus, setPlaybackStatus] = useState({});
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [selectedAnswerIds, setSelectedAnswerIds] = useState([]);
  const [isUsed, setIsUsed] = useState(item.used);
  const [isQuality, setIsQuality] = useState(item.quality);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(users.length > 0 ? users[0].id_user : '');



  useEffect(() => {
    const fetchUserNames = async () => {
      const names = {};
      const name = await get_user_name(item.id_user);
      names[item.id_user] = name;
      setUserNames(names);
    };

    fetchUserNames();
  }, [item.id_user]);

// Actualisation de la réponse






// manipulation des réponses (texte)

const handleUpdateAnswer = async (answerId, newText) => {
  try {
    await update_answer_text(answerId, newText);
    setEditingAnswerId(null);
    setEditingText('');
    item.answer = newText; // Mise à jour de item.answer
  } catch (error) {
    alert("Error updating answer: " + error.message);
  }
};


  const handleUpdateOwner = async () => {
    if (item.id && selectedUserId) {
      await update_answer_owner(item.id, selectedUserId);
      item.id_user = selectedUserId; 
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
    await updateAnswer(item.id, 'used', !isUsed);
    setIsUsed(!isUsed);
  };
  
  
  const handleToggleQuality = async () => {
    await updateAnswer(item.id, 'quality', !isQuality);
    setIsQuality(!isQuality);
  };
  



// manipulation des réponses (audio)

  const handlePlayPauseInternal = async (audioId, audioLink) => {
    await handlePlayPause(audioId, audioLink, currentAudioId, setCurrentAudioId, playbackStatus, setPlaybackStatus);
  };
  const handleAssignOwner = () => {
    setIsAssignModalVisible(true);
  };






  return (
    <>


    
    <TouchableOpacity
      style={[
        styles.answerCard,
        selectedAnswerIds.includes(item.id) && styles.selectedAnswerCard,
      ]}

    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          {showDetails && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontWeight: 'bold' }}>
                {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
          {item.id === editingAnswerId ? (
            <>
              <TextInput
                style={globalStyles.input}
                value={editingText}
                onChangeText={setEditingText}
                multiline={true}
                numberOfLines={10}
              />
              <TouchableOpacity
                onPress={() => handleUpdateAnswer(item.id, editingText)}
                style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5', alignItems: 'center', paddingVertical: 10, marginRight: 5 }]}
              >
                <Text style={globalStyles.globalButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {item.answer === "audio not yet transcribed" && (
                <View style={styles.container}>
                  <ActivityIndicator size="large" color="#0b2d52" />
                </View>
              )}
              {item.answer !== "audio not yet transcribed" && (
                <>
                  {item.image && (
                    <TouchableOpacity onPress={() => setFullscreenImage(`https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${item.link_storage}`)} >
                      <Image source={{ uri: `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${item.link_storage}` }} style={{ width: '100%', height: 300, resizeMode: 'contain' }} />
                      <Text></Text>
                      <Text style={{ justifyContent: 'center', textAlign: 'center' }}>{item.answer}</Text>
                    </TouchableOpacity>
                  )}
                  <View style={{ flexDirection: 'row'}}>
                  {item.question_reponse == "question" && (<Image source={questionIcon} style={{ width: 36, height: 36, opacity: 0.5, marginLeft: 15 }} />)}
                  {!item.image && item.answer !== 'audio à convertir en texte' &&(
                    <Text style={styles.answerText}>{item.answer}</Text>
                  )}
                  </View>
                </>
              )}
            </>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            {showDetails && (
              <>
                { item.id !== editingAnswerId && (
                  <TouchableOpacity onPress={() => { setEditingAnswerId(item.id); setEditingText(item.answer); }}>
                    <Image source={editIcon} style={{ width: 28, height: 28, opacity: 0.5 }} />
                    {isLargeScreen && <Text>Edit</Text>}
                  </TouchableOpacity>
                )}
                {item.audio && (
                  <TouchableOpacity onPress={() => alert('Transcribe')}>
                    <Image source={captionIcon} style={{ width: 25, height: 25, opacity: 0.5, marginHorizontal: 15 }} />
                    {isLargeScreen && <Text>Transcribe</Text>}
                  </TouchableOpacity>
                )}
                {item.image && (
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




                <TouchableOpacity onPress={() => handleDeleteAnswer(item)}>
                  <Image source={trashIcon} style={{ width: 36, height: 36, opacity: 0.5, marginLeft: 15 }} />
                  {isLargeScreen && <Text>Delete</Text>}
                </TouchableOpacity>
              </>
            )}

          {!showDetails && (<>
            {(item.audio || item.id === editingAnswerId) && (
              <Text> </Text>
              )}
              {!item.audio &&item.id !== editingAnswerId && (
                     
                     <TouchableOpacity onPress={() => { setEditingAnswerId(item.id); setEditingText(item.answer); }} style={{ marginRight: 30 }}>
  <Image source={editIcon} style={{ width: 28, height: 28, opacity: 0.5 }} />
  {isLargeScreen && <Text>Editer</Text>}
</TouchableOpacity>

             
               )}
 
              
              
              
              <Text style={{ textAlign: 'right', marginTop: 10, fontStyle: 'italic' }}>
               le {new Date(item.created_at).toLocaleDateString()} à {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              
              </>
        
          )}

            <Text style={{ textAlign: 'right', marginTop: 10, fontStyle: 'italic' }} onPress={() => handleAssignOwner(item.id)}>
              {userNames[item.id_user]}
            </Text>
          </View>
          

               
          {item.audio  && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               {!showDetails &&item.id !== editingAnswerId && (
                     
                     <TouchableOpacity onPress={() => { setEditingAnswerId(item.id); setEditingText(item.answer); }} style={{ marginRight: 30 }}>
  <Image source={editIcon} style={{ width: 28, height: 28, opacity: 0.5 }} />
  {isLargeScreen && <Text>Editer</Text>}
</TouchableOpacity>

             
               )}
              
              <TouchableOpacity onPress={() => handlePlayPauseInternal(item.id, item.link_storage)}>
                <Image source={playbackStatus.isPlaying && currentAudioId === item.id ? pauseIcon : playIcon} style={{ width: 25, height: 25 }} />
              </TouchableOpacity>
              
              <Slider
                style={{ flex: 1, marginHorizontal: 10 }}
                value={currentAudioId === item.id ? playbackStatus.positionMillis || 0 : 0}
                minimumValue={0}
                maximumValue={playbackStatus.durationMillis || 0}
                onSlidingComplete={async (value) => {
                  if (playbackStatus.sound) {
                    await playbackStatus.sound.setPositionAsync(value);
                  }
                }}
              />
              
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
        onValueChange={(itemValue) => setSelectedUserId(itemValue)}
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

    </TouchableOpacity>
    </>
  );
};

export const CarrousselThemes = ({ themes, isLargeScreen, theme, setTheme }) => {
  const SLIDER_WIDTH = Dimensions.get('window').width;
  const ITEM_WIDTH = Dimensions.get('window').width * (isLargeScreen ? 0.6 : 0.7);
  const ITEM_HEIGHT = 150;
  const SELECTED_ITEM_HEIGHT = ITEM_HEIGHT * 1.5;
  const carouselRef = useRef(null);
  const initialIndex = themes.findIndex(item => item.theme === theme);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const renderItem = ({ item, index }) => (
    <View style={[
      styles.carouselItem,
      index === currentIndex ? styles.selectedCarouselItem : null
    ]}>
      <Text style={styles.carouselText}>{item.theme}</Text>
    </View>
  );

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.snapToItem(initialIndex, false, false);
    }
    //if (typeof setTheme === 'function') {
    //  setTheme(themes[initialIndex].theme); // Mettre à jour le thème initial
    //}
  }, [initialIndex]);
  
  const handleSnapToItem = (index) => {
    setCurrentIndex(index);
    if (typeof setTheme === 'function') {
      setTheme(themes[index].theme); // Mettre à jour le thème lors du défilement
    }
  };


  
  const handlePrev = () => {
    if (carouselRef.current) {
      const newIndex = (currentIndex - 1 + themes.length) % themes.length;
 
      setCurrentIndex(newIndex);
      if (newIndex === 0) {
        carouselRef.current._carouselRef.scrollToOffset({ offset: 0, animated: true });
      } else {
        carouselRef.current.snapToItem(newIndex, true, false);
      }

      if (typeof setTheme === 'function') {

        setTheme(themes[newIndex]); // Mettre à jour le thème
      }
    }
  };
  
  const handleNext = () => {
    if (carouselRef.current) {
      const newIndex = (currentIndex + 1) % themes.length;
      setCurrentIndex(newIndex);
      if (newIndex === 0) {
        carouselRef.current._carouselRef.scrollToOffset({ offset: 0, animated: true });
      } else {
        carouselRef.current.snapToItem(newIndex, true, false);
      }

      if (typeof setTheme === 'function') {
        setTheme(themes[newIndex]); // Mettre à jour le thème
      }
    }
  };
  
  
  return (
    <View style={[styles.carouselContainer, { height: SELECTED_ITEM_HEIGHT + 20 }]}>
      <TouchableOpacity onPress={handlePrev} style={styles.arrowButton}>
        <Text style={styles.arrowText}>{'<'}</Text>
      </TouchableOpacity>
      <Carousel
        ref={carouselRef}
        data={themes}
        renderItem={renderItem}
        sliderWidth={SLIDER_WIDTH}
        itemWidth={ITEM_WIDTH}
        onSnapToItem={handleSnapToItem}
        inactiveSlideScale={(isLargeScreen? 0.7 : 0)}
        inactiveSlideOpacity={0.7}
        firstItem={initialIndex}
        contentContainerStyle={{ justifyContent: 'center', paddingHorizontal: Dimensions.get('window').width * 0.1 }}
      />

      <TouchableOpacity onPress={handleNext} style={styles.arrowButton}>
        <Text style={styles.arrowText}>{'>'}</Text>
      </TouchableOpacity>
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

  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 30,
    color: '#000',
  },
  carouselItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  carouselText: {
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});


