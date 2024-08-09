import React, { useState, useEffect, useRef } from 'react';
import {   Image,View, Text, TouchableOpacity, TextInput, StyleSheet,Alert, Modal,  Picker,  Dimensions,} from 'react-native';
import { globalStyles } from '../../global';
import { 
    createAudioChunk, 
    startRecording, 
    stopRecording,
    uploadAudioToSupabase, 
    delete_audio,
    playRecording_fromAudioFile, 
    uploadImageToSupabase,
    handlePlayPause,
}   from '../components/sound_handling'; 
import {
    getSubject,
    getMemories_Answers,
    integration,
    getMemories_Questions,
    get_chapters,
    submitMemories_Answer,
    submitMemories_Answer_written,
    submitMemories_Answer_oral,
    submitMemories_Answer_image,
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
    createTheme,
    customUUIDv4,
  } from '../components/data_handling';
  import { v4 as uuidv4 } from 'uuid';
  import MicroIcon from '../../assets/icons/microphone-lines-solid.svg';
  import * as DocumentPicker from 'expo-document-picker';
  import Upload from '../../assets/icons/upload.png';
  import closeIcon from '../../assets/icons/close.png'; 
  import { transcribeAudio_slow } from '../components/call_to_whisper';


  

//export default AnswerPanel_written = ({ answer, id_user, id_question,id_suject,id_connection }) => {
  const windowWidth = Dimensions.get('window').width;
  const isLargeScreen = windowWidth > 768;

    
  export const AnswerPanel_written = ({ ID_USER, Id_question, Id_connection,question_reponse,refreshAnswers }) => {
      const [answer, setAnswer] = useState('');

      const handleAnswerSubmit = async ( answer, ID_USER, Id_question, Id_connection,question_reponse,refreshAnswers) => {
        await submitMemories_Answer_written(answer, ID_USER, Id_question, Id_connection,question_reponse);
        setAnswer('');
        await refreshAnswers();
      };
    
      return (
        <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginBottom: 10 }}>
          <TextInput
            style={globalStyles.input}
            value={answer}
            onChangeText={setAnswer}
            placeholder={question_reponse ==='question'? "Poser votre question ici..." : "Écrire votre contribution ici..."}
            multiline={true}
            rows={4}
          />
          <TouchableOpacity
            style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5', marginRight: 5 }]}
            onPress={() => handleAnswerSubmit(answer, ID_USER, Id_question, Id_connection,question_reponse,refreshAnswers)}
          >
            <Text style={globalStyles.globalButtonText}>{question_reponse ==='question'? "Poser la question" : "Enregistrer la note"}</Text>
          </TouchableOpacity>
        </View>
      );
    };
    
    export const AnswerPanel_oral = ({ ID_USER, Id_question, Id_connection, question_reponse, refreshAnswers }) => {
      const [isRecording, setIsRecording] = useState(false);
      const [recording, setRecording] = useState(null);
      const [namePrefix, setNamePrefix] = useState('');
      const [count, setCount] = useState(1);
      const countRef = useRef(count);
      const namePrefixRef = useRef(namePrefix);
      const isRecordingRef = useRef(isRecording);

      useEffect(() => {
          isRecordingRef.current = isRecording;
      }, [isRecording]);
      useEffect(() => {
        countRef.current = count;
      }, [count]);
      useEffect(() => {
        namePrefixRef.current = namePrefix;
      }, [namePrefix]);

      useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);
  
      const handleAnswerSubmit = async (answer, ID_USER, Id_question, Id_connection, question_reponse, name, refreshAnswers) => {
          const ID_answer= customUUIDv4()
          await submitMemories_Answer_oral(answer, ID_USER, Id_question, Id_connection, question_reponse, name,ID_answer);
          transcribeAudio_slow(name, ID_answer);
          await refreshAnswers();
      };
  
      const startNewRecording = async () => {
          try {
              console.log("On relance l'enregistrement");
              const temp = await startRecording();
              setRecording(temp);
              setIsRecording(true);
              
  
              setTimeout(async () => {
          
                  if (isRecordingRef.current) {

                    
                    
                      console.log("On stop l'enregistrement");
                            const { uri, duration } = await stopRecording(temp);
          
                            const chunkName = `${namePrefixRef.current}_part_${countRef.current}.mp3`;
                            setCount(countRef.current +1)
                            const chunkUri = await createAudioChunk(uri, chunkName, 0, duration);
                            // Start a new recording chunk immediately
                            await startNewRecording();
                            console.log(`Created chunk: ${chunkName} with URI: ${chunkUri}`);
                              await uploadAudioToSupabase(chunkUri, chunkName);
                              await handleAnswerSubmit("L'audio est en cours de transcription ...", ID_USER, Id_question, Id_connection, question_reponse, chunkName, refreshAnswers);            
                  }
              }, 60000); // Change back to 60000 for 1-minute chunks
          } catch (error) {
              console.error('Error starting new recording:', error);
          }
      };
  
      const handleRecording = async () => {
          if (isRecordingRef.current) {
              try {
                  setIsRecording(false);
                  const { uri, duration } = await stopRecording(recording);

                  const chunkName = `${namePrefix}_part_${count}.mp3`;
                  const chunkUri = await createAudioChunk(uri, chunkName, 0, duration);
                  console.log(`Created chunk: ${chunkName} with URI: ${chunkUri}`);
                    await uploadAudioToSupabase(chunkUri, chunkName);
                    await handleAnswerSubmit("L'audio est en cours de transcription ...", ID_USER, Id_question, Id_connection, question_reponse, chunkName, refreshAnswers);
                  }
               catch (error) {
                  console.error('Error during handleRecording:', error);
              }
          } else {
              setCount(1)
              setNamePrefix(Date.now())
              await startNewRecording();
          }
      };
  
      return (
          <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginBottom: 10 }}>
              <TouchableOpacity
                  style={[
                      globalStyles.globalButton_wide,
                      { backgroundColor: isRecording ? "red" : '#b1b3b5', marginHorizontal: 20, width: '80%' },
                  ]}
                  onPress={handleRecording}
              >
                  <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Image source={MicroIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
                      <Text style={globalStyles.globalButtonText}>
                          {isRecording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
                      </Text>
                  </View>
              </TouchableOpacity>
          </View>
      );
  };


  export const AnswerPanel_AudioFile = ({ ID_USER, Id_question, Id_connection, question_reponse, refreshAnswers})=> {
  
    const handleAnswerSubmit = async (answer, ID_USER, Id_question, Id_connection, question_reponse, name, refreshAnswers) => {
        const ID_answer= customUUIDv4()
        await submitMemories_Answer_oral(answer, ID_USER, Id_question, Id_connection, question_reponse, name);
        transcribeAudio_slow(name, ID_answer);
        await refreshAnswers();
    };

    const getAudioDuration = (uri) => {
      return new Promise((resolve, reject) => {
        const audio = new Audio(uri);
        audio.addEventListener('loadedmetadata', () => {
          resolve(audio.duration);
        });
        audio.addEventListener('error', (e) => {
          reject(e);
        });
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
      
            if (result.output && result.output.length > 0) {
              const file = result.output[0];
              uri = URL.createObjectURL(file);
              name = file.name;
              mimeType = file.type;
            } else if (result.assets && result.assets.length > 0) {
              const asset = result.assets[0];
              uri = asset.uri;
              name = asset.name;
              mimeType = asset.mimeType;
            } else {
              throw new Error("Invalid file selection result");
            }
      
            if (!uri || !name) {
              throw new Error("Invalid file selection: URI or name is missing");
            }
      
            if (mimeType && mimeType.startsWith('audio/')) {
              try {
                console.log("Coco")
                const duration = await getAudioDuration(uri); // Modifié pour récupérer directement la durée
                console.log("Audio duration:", duration);
                const maxDuration = 60;  // Durée maximale d'un morceau en secondes
                const chunks = Math.ceil(duration / maxDuration);
      
                for (let i = 0; i < chunks; i++) {
                  const start = i * maxDuration;
                  const end = (i + 1) * maxDuration > duration ? duration : (i + 1) * maxDuration;
                  const chunkName = `${name}_part_${i + 1}.mp3`;
      
                  console.log(`Creating chunk: ${chunkName} from ${start} to ${end}`);
                  const chunkUri = await createAudioChunk(uri, chunkName, start, end);
      
                  if (chunkUri) {
                    console.log(`Uploading chunk: ${chunkName}`);
                    await uploadAudioToSupabase(chunkUri, chunkName);
                    await handleAnswerSubmit("L'audio est en cours de transcription ...", ID_USER, Id_question, Id_connection, question_reponse, chunkName, refreshAnswers);
                  } else {
                    console.error(`Failed to create chunk: ${chunkName}`);
                  }
                }
              } catch (e) {
                console.error("Error getting audio duration:", e);
                Alert.alert("Erreur", "Impossible d'obtenir la durée de l'audio");
              }
            } else {
              Alert.alert("Erreur", "Le fichier sélectionné n'est pas un fichier audio");
            }
          } else {
            Alert.alert("Erreur", "Sélection du fichier échouée");
          }
        } catch (error) {
          console.error("Error during file selection or processing:", error);
          Alert.alert("Erreur", "Une erreur s'est produite lors de la sélection du fichier");
        }
      };

      return (
        <TouchableOpacity
        style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5', flex: 1, marginLeft: 5 }]}
        onPress={handleUploadAudio}
      >
        <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Image source={Upload} style={{ width: 60, height: 60, opacity: 0.5 }} />
          <Text style={globalStyles.globalButtonText}>
            Envoyer un enregistrement vocal
          </Text>
        </View>
        
      </TouchableOpacity>



      )


  }


  export const AnswerPanel_imageFile = ({ ID_USER, Id_question, Id_connection, question_reponse, refreshAnswers }) => {
    const [caption, setCaption] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
  
    const handleAnswerSubmit = async (answer, ID_USER, Id_question, Id_connection, question_reponse, name, refreshAnswers) => {
      await submitMemories_Answer_image(answer, ID_USER, Id_question, Id_connection, question_reponse, name);
      await refreshAnswers();
    };
  
    const handleUploadPhoto = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'image/*', // Accepter les fichiers image
          copyToCacheDirectory: false
        });
  
        if (!result.canceled) {
          let uri, name, mimeType;
  
          // Gérer les différences de plateforme
          if (result.output && result.output.length > 0) {
            const file = result.output[0];
            uri = URL.createObjectURL(file);
            name = file.name;
            mimeType = file.type;
          } else if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
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
          if (mimeType && mimeType.startsWith('image/')) {
            console.log("File selected is an image file:", { uri, name, mimeType });
          } else {
            console.error("Selected file is not an image file:", { uri, name, mimeType });
            Alert.alert("Erreur", "Le fichier sélectionné n'est pas un fichier image");
            return;
          }
  
          console.log("File selected successfully:", { uri, name });
          setSelectedFile({ uri, name }); // Enregistrer le fichier sélectionné
          setModalVisible(true); // Afficher la modale pour entrer la légende
        } else {
          console.error("File selection was not successful: ", result);
          Alert.alert("Erreur", "Sélection du fichier échouée");
        }
      } catch (error) {
        console.error("Error handling file upload: ", error);
        Alert.alert("Erreur", "Une erreur s'est produite lors de la sélection du fichier");
      }
    };
  
    const handleCaptionSubmit = async () => {
      if (caption.trim() === '') {
        Alert.alert("Erreur", "Veuillez entrer une légende pour l'image");
        return;
      }
      
      setModalVisible(false);
      
      await uploadImageToSupabase(selectedFile.uri, selectedFile.name);
      await handleAnswerSubmit(caption, ID_USER, Id_question, Id_connection, question_reponse, selectedFile.name, refreshAnswers);
    };
  
    return (
      <View>
        <TouchableOpacity
          style={[globalStyles.globalButton_wide, { backgroundColor: '#b1b3b5', flex: 1, marginLeft: 5 }]}
          onPress={handleUploadPhoto}
        >
          <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Image source={Upload} style={{ width: 60, height: 60, opacity: 0.5 }} />
            <Text style={globalStyles.globalButtonText}>
              Envoyer un document ou une photo
            </Text>
          </View>
        </TouchableOpacity>
  
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={globalStyles.overlay}>
          <View style={globalStyles.modalContainer}>

            <Text style={globalStyles.modalTitle}>Entrez la légende de l'image</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Légende"
              value={caption}
              onChangeText={setCaption}
            />
                      <TouchableOpacity
            style={[globalStyles.globalButton_wide ]}
            onPress={handleCaptionSubmit}
          >
            <Text style={globalStyles.globalButtonText}> Soumettre </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={globalStyles.closeButton}>
      <Image source={closeIcon} style={globalStyles.closeIcon} />
    </TouchableOpacity>
        
            
          </View>
          </View>
        
        
        </Modal>
      </View>
    );
  };
  
  export const ThemePanel = ({ ID_USER, ID_subject, new_theme, themes, themesAllUsers, theme, setTheme, themeText, setThemeText, closureFunction }) => {
    const [merciModalVisible, setMerciModalVisible] = useState(false);
    const [showThemeInput, setShowThemeInput] = useState(false);
    const [showModalThemeEdit, setShowModalThemeEdit] = useState(false);
    const [showModalThemeDelete, setShowModalThemeDelete] = useState(false);
  
    const handleSaveTheme = async (text) => {
      const temp = await createTheme(text, ID_subject);
      setTheme(temp);
  
      if (new_theme) {
        setMerciModalVisible(true);
      } else {
        closureFunction("Thème ok");
      }
    };


    useEffect(() => {
      if (theme) {
        closureFunction("Thème ok");
      } else {
        closureFunction("Thème not ok");
      }
      
  }, [theme]);

  
    return (
      <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginBottom: 10 }}>
        {themes.length > 0 && !new_theme && (
          <View>
            <Picker
              selectedValue={theme?.id || ""}
              onValueChange={(itemValue) => {
                const selected = themes.find(theme => theme.id === itemValue);
                setShowThemeInput(false);
                setTheme(selected);
                setThemeText(selected ? selected.theme : "");
              }}
            >
              <Picker.Item label="Choisir parmi mes thèmes existants" value="" />
              {themes.map((theme) => (
                <Picker.Item key={theme.id} label={theme.theme} value={theme.id} />
              ))}
            </Picker>
          </View>
        )}
        {themesAllUsers.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Picker
              selectedValue={theme?.id || ""}
              onValueChange={(itemValue) => {
                const selected = themesAllUsers.find(theme => theme.id === itemValue);
                setShowThemeInput(false);
                setTheme(selected);
                setThemeText(selected ? selected.theme : "");
                
              }}
            >
              <Picker.Item label="Choisir parmi tous les thèmes existants" value="" />
              {themesAllUsers.map((theme) => (
                <Picker.Item key={theme.id} label={theme.theme} value={theme.id} />
              ))}
            </Picker>
          </View>
        )}
  
        {!new_theme &&  (
          <TouchableOpacity
            style={{ backgroundColor: '#D3D3D3', padding: 10, borderRadius: 5, marginTop: 10 }}
            onPress={() => setShowThemeInput(!showThemeInput)}
          >
            <Text style={{ color: '#000' }}>Définir un nouveau thème</Text>
          </TouchableOpacity>
        )}
  
        {showThemeInput && (
          <View style={{ marginTop: 10 }}>
            <TextInput
              style={globalStyles.input}
              placeholder="Renseigner le thème"
              onChangeText={(text) => {
                setThemeText(text);
                setTheme(null);
              }}
              value={themeText}
              multiline={true}
              rows={4}
            />
          </View>
        )}
  
        {theme ? (
          !new_theme && (
            <View style={{ flexDirection: isLargeScreen ? 'row' : 'column' }}>
            <TouchableOpacity
              style={isLargeScreen ?  globalStyles.globalButton_narrow : globalStyles.globalButton_wide}
              onPress={() => {
                setShowModalThemeDelete(true);
              }}
            >
              <Text style={globalStyles.globalButtonText}>Supprimer ce thème</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={isLargeScreen ?  globalStyles.globalButton_narrow : globalStyles.globalButton_wide}
              onPress={() => {
                setShowModalThemeEdit(true)
              }}
            >
              <Text style={globalStyles.globalButtonText}>Modifier le titre de ce thème</Text>
            </TouchableOpacity>

            </View>
          )
        ) : (
          themeText && (
            <TouchableOpacity
              style={globalStyles.globalButton_wide}
              onPress={() => handleSaveTheme(themeText)}
            >
              <Text style={globalStyles.globalButtonText}>{!new_theme ? "Démarrer ce nouveau thème" : "Envoyer votre proposition"}</Text>
            </TouchableOpacity>
          )
        )}
  
        <Modal
          animationType="slide"
          transparent={true}
          visible={merciModalVisible}
          onRequestClose={() => {
            setMerciModalVisible(!merciModalVisible);
            closureFunction("Thème ok");
          }}
        >
          <View style={globalStyles.overlay}>
            <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitle}>Merci de cette proposition</Text>
              <TouchableOpacity onPress={() => { setMerciModalVisible(false); closureFunction("Thème ok") }} style={globalStyles.closeButton}>
                <Image source={closeIcon} style={globalStyles.closeIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  };
  