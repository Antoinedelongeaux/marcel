{/* 
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { Buffer } from 'buffer';
import { decode } from 'base64-arraybuffer'
import { Recording, RecordingOptionsPresets } from 'expo-av';

global.Buffer = Buffer; 


import { Platform } from 'react-native';

export const save_audio = async (audioFileUri, name) => {
  try {
    console.log("audioFileUri : ", audioFileUri);

    if (Platform.OS !== 'web') {
      const fileInfo = await FileSystem.getInfoAsync(audioFileUri);
      console.log("Taille du fichier avant upload: ", fileInfo.size);

      const base64 = await FileSystem.readAsStringAsync(audioFileUri, { encoding: FileSystem.EncodingType.Base64 });
      const fileName = name;

      const { error: uploadError } = await supabase.storage.from('audio').upload(fileName, decode(base64), {
        contentType: 'audio/mp3',
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        throw uploadError;
      }

      const publicURL = "https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/" + fileName;
      console.log(`File uploaded and accessible at: ${publicURL}`);
      return publicURL;
    } else {
      console.log("Handling audio upload on web...");

      // Vous devez avoir accès au Blob ou au File de l'enregistrement ici. 
      // Par exemple, si `audioFileUri` est un objet Blob ou File directement :
      const fileName = name;

      // Note: Supabase accepte l'upload de Blob/File directement, sans conversion en base64
      const { error: uploadError, data } = await supabase.storage.from('audio').upload(fileName, audioFileUri, {
        contentType: 'audio/mp3',
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        throw uploadError;
      }

      const publicURL = `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/${fileName}`;
      console.log(`File uploaded and accessible at: ${publicURL}`);
      return publicURL;
    }
  } catch (error) {
    console.error('Error in save_audio:', error);
    return null;
  }
};


export const delete_audio = async (name) => {
  const { data, error } = await supabase
    .storage
    .from('audio')
    .remove([name])

}


export const audioSetup = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    shouldDuckAndroid: true,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    playThroughEarpieceAndroid: false,
  });
};

export const requestPermissionsAsync = async () => {
  const response = await Audio.requestPermissionsAsync();
  return response.status === 'granted';
};

export const startRecording = async () => {
  try {
    const permissionGranted = await requestPermissionsAsync();
    if (!permissionGranted) {
      console.log('Permission to record audio was denied');
      return;
    }

    await audioSetup();
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();
    return recording;
  } catch (error) {
    console.error('Error starting recording', error);
  }
};

export const stopRecording = async (recording, name) => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); // Get the recorded file URI
    console.log("Recording stopped. File saved at: ", uri);


    // Directly pass the file URI to save_audio
    const publicURL = await save_audio(uri, name);
    console.log(`File uploaded and accessible at: ${publicURL}`);
    return uri;
  } catch (error) {
    console.error('Error stopping recording or uploading:', error);
  }
};


export const playRecording_fromURI = async (uri) => {
  try {

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    // Playback started
    sound.setOnPlaybackStatusUpdate((playbackStatus) => {
      if (!playbackStatus.isLoaded) {
        // Error handling
        console.log(playbackStatus.error);
      } else {
        if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
          sound.unloadAsync(); // Unload the sound from memory when playback finishes
        }
      }
    });
  } catch (error) {
    console.error('Error playing recording', error);
  }
};

export const playRecording_fromAudioFile = async (publicURL, fileName) => {
  try {
    // Construire l'URL du fichier sur Supabase
    console.log("publicURL : ", publicURL)
    console.log("fileName : ", fileName)

    // Télécharger le fichier audio dans le système de fichiers local
    const uri = FileSystem.cacheDirectory + fileName;
    const downloadResponse = await FileSystem.downloadAsync(publicURL, uri);

    if (downloadResponse.status !== 200) {
      throw new Error('Failed to download file');
    }

    // Lire le fichier audio téléchargé
    const { sound } = await Audio.Sound.createAsync(
      { uri: downloadResponse.uri },
      { shouldPlay: true }
    );

    sound.setOnPlaybackStatusUpdate((playbackStatus) => {
      if (!playbackStatus.isLoaded) {
        // Gestion des erreurs
        console.log(playbackStatus.error);
      } else {
        if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
          sound.unloadAsync(); // Décharger le son de la mémoire une fois la lecture terminée
        }
      }
    });
  } catch (error) {
    console.error('Error playing recording from Supabase file', error);
  }
};





const downloadFileToLocalFileSystem = async (fileUri) => {
  const localUri = FileSystem.documentDirectory + 'tempAudio.mp3';
  const { uri } = await FileSystem.downloadAsync(fileUri, localUri);
  return uri;
};





export const transcribeAudio = async (audioFileName) => {
  try {
    const publicURL = "https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/" + audioFileName;

    // Création de l'objet FormData
    const formData = new FormData();
    formData.append('audio', {
      uri: publicURL,
      type: 'audio/mp3', // Google Cloud Speech-to-Text peut gérer d'autres types, mais il est préférable de convertir à LINEAR16 si nécessaire.
      name: audioFileName,
    });

    const serverUrl = 'https://91.108.112.18:3000/transcript';
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error('Error during transcription:', errorResponse);
      throw new Error(`Server responded with an error: ${errorResponse}`);
    }

    // Traitement de la réponse
    const transcriptionResult = await response.json();
    console.log('Transcription:', transcriptionResult.transcription);
    return transcriptionResult.transcription;
  } catch (error) {
    console.error('Error in transcribeAudio:', error.message);
    return null;
  }
};


// Assuming startRecording, stopRecording, and playRecording are imported or defined above
export const record_answer = async (name) => {


  const recording = await startRecording();

  await new Promise(resolve => setTimeout(resolve, 3000));

  const uri = await stopRecording(recording, name);
  console.log(`Recording stopped. File saved at: ${uri}`);



};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};

const saveBlobToFileSystem = async (blob, fileName) => {
  const base64DataUrl = await blobToBase64(blob); // Cela retourne une Data URL
  const base64ContentArray = base64DataUrl.split(","); // Séparer l'en-tête du contenu proprement dit
  if (base64ContentArray.length !== 2) {
    throw new Error('Base64 content is not in the expected format');
  }
  const base64 = base64ContentArray[1]; // Obtenez la partie base64 sans l'en-tête

  const uri = FileSystem.documentDirectory + fileName;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
};



*/}



import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { Buffer } from 'buffer';
import { decode } from 'base64-arraybuffer';
import { Recording, RecordingOptionsPresets } from 'expo-av';

global.Buffer = Buffer; 

import { Platform } from 'react-native';


export const save_audio = async (audioFile, name) => {
  try {

// Appel à l'API /test pour vérifier la connectivité
const testUrl = 'http://91.108.112.18:3000/test';

  const testResponse = await fetch(testUrl);
  const testResult = await testResponse.json();
  console.log("Coucou ! ")
  console.log('Test API Response:', testResult);



    const fileName = `${name}.mp3`; // Nom du fichier avec extension MP3

    // Conversion pour la plateforme web
    if (Platform.OS === 'web') {
      if (!(audioFile instanceof Blob || audioFile instanceof File)) {
        throw new Error('Expected audio file to be a Blob or File');
      }
      
      const audioBlob = new Blob([audioFile], { type: 'audio/mp3' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob); // Convertit Blob en Base64
      
      await new Promise((resolve) => {
        reader.onloadend = () => {
          const base64audio = reader.result.split(',')[1]; // Isoler la chaîne base64
          // Téléversement du fichier en format MP3
          supabase.storage.from('audio').upload(fileName, decode(base64audio), {
            contentType: 'audio/mp3', // Définir explicitement le type MIME en MP3
            cacheControl: '3600',
            upsert: false
          }).then(({ error }) => {
            if (error) throw error;
            console.log(`File uploaded and accessible at: ${fileName}`);
            resolve();
          });
        };
      });
    } else {
      // Traitement pour les plateformes mobiles, pas de changement
      const base64 = await FileSystem.readAsStringAsync(audioFile, { encoding: FileSystem.EncodingType.Base64 });
      const { error: uploadError } = await supabase.storage.from('audio').upload(fileName, decode(base64), {
        contentType: 'audio/mp3',
        cacheControl: '3600',
        upsert: false
      });

      if (uploadError) throw uploadError;
      console.log(`File uploaded and accessible at: ${fileName}`);
    }
    return fileName;
  } catch (error) {
    console.error('Error in save_audio:', error);
    return null;
  }
};






export const delete_audio = async (name) => {
  const { data, error } = await supabase
    .storage
    .from('audio')
    .remove([name])

}








export const audioSetup = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    shouldDuckAndroid: true,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    playThroughEarpieceAndroid: false,
  });
};

export const requestPermissionsAsync = async () => {
  const response = await Audio.requestPermissionsAsync();
  return response.status === 'granted';
};

export const startRecording = async () => {
  try {
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();
    return recording;
  } catch (error) {
    console.error('Error starting recording', error);
  }
};

export const stopRecording = async (recording, name) => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return convertAndUpload(blob, name);
    } else {
      // Supposer ici que le fichier est déjà au format correct; ajuster si nécessaire
      return convertAndUpload(uri, name);
    }
  } catch (error) {
    console.error('Error stopping recording or uploading:', error);
  }
};

export const convertAndUpload = async (audioInput, fileName) => {
  let base64;

  if (Platform.OS === 'web') {
    // Utiliser FileReader pour convertir Blob/File en base64 sur le web
    base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]); // Extraire la partie base64 de la Data URL
      reader.onerror = error => reject(error);
      reader.readAsDataURL(audioInput); // Lire le Blob ou File comme une Data URL
    });
  } else {
    // Utiliser expo-file-system pour lire le fichier en tant que base64 sur mobile
    base64 = await FileSystem.readAsStringAsync(audioInput, { encoding: FileSystem.EncodingType.Base64 });
  }

  // Upload du contenu audio en base64 à Supabase
  const { error: uploadError } = await supabase.storage.from('audio').upload(fileName, decode(base64), {
    contentType: 'audio/mp4',  // Assurer le contentType correspondant au format désiré
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    throw uploadError;
  }

  const publicURL = `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/${fileName}`;
  console.log(`File uploaded and accessible at: ${publicURL}`);
  return publicURL;
};


export const playRecording_fromURI = async (uri) => {
  try {

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    // Playback started
    sound.setOnPlaybackStatusUpdate((playbackStatus) => {
      if (!playbackStatus.isLoaded) {
        // Error handling
        console.log(playbackStatus.error);
      } else {
        if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
          sound.unloadAsync(); // Unload the sound from memory when playback finishes
        }
      }
    });
  } catch (error) {
    console.error('Error playing recording', error);
  }
};

export const playRecording_fromAudioFile = async (publicURL, fileName) => {
  try {
    // Sur les plateformes Web, créer un URL Object et le jouer
    if (Platform.OS === 'web') {
      const { sound } = await Audio.Sound.createAsync(
        { uri: publicURL },
        { shouldPlay: true }
      );
  
      sound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (!playbackStatus.isLoaded) {
          console.error("Playback status: ", playbackStatus.error);
        } else if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
          sound.unloadAsync(); // Décharger le son de la mémoire une fois la lecture terminée
        }
      });
    } else {
      // Télécharger le fichier audio dans le système de fichiers local
      const uri = FileSystem.cacheDirectory + fileName;
      const downloadResponse = await FileSystem.downloadAsync(publicURL, uri);

      if (downloadResponse.status !== 200) {
        throw new Error('Failed to download file');
      }

      // Lire le fichier audio téléchargé
      const { sound } = await Audio.Sound.createAsync(
        { uri: downloadResponse.uri },
        { shouldPlay: true }
      );

      sound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (!playbackStatus.isLoaded) {
          // Gestion des erreurs
          console.log(playbackStatus.error);
        } else {
          if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
            sound.unloadAsync(); // Décharger le son de la mémoire une fois la lecture terminée
          }
        }
      });
    }
  } catch (error) {
    console.error('Error playing recording from Supabase file', error);
  }
};






const downloadFileToLocalFileSystem = async (fileUri) => {
  const localUri = FileSystem.documentDirectory + 'tempAudio.mp3';
  const { uri } = await FileSystem.downloadAsync(fileUri, localUri);
  return uri;
};




export const transcribeAudio = async (audioFileName) => {
  try {
    const publicURL = `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/${audioFileName}`;

    const serverUrl = 'http://91.108.112.18:3000/transcript';
    let formData = new FormData();

    if (Platform.OS === 'web') {
      // Pour les navigateurs web, récupérez le Blob et utilisez-le directement
      const responseBlob = await fetch(publicURL);
      const audioBlob = await responseBlob.blob();
      formData.append('audio', audioBlob, audioFileName);
    } else {
      // Sur mobile, utilisez l'URL directement ou ajustez selon votre gestion de fichier sur mobile
      formData.append('audio', {
        uri: publicURL,
        type: 'audio/mp3', // Assurez-vous que le type est correct
        name: audioFileName,
      });
    }

    const response = await fetch(serverUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      throw new Error(`Server responded with an error: ${errorResponse}`);
    }

    const transcriptionResult = await response.json();
    console.log('Transcription:', transcriptionResult.transcription);
    return transcriptionResult.transcription;
  } catch (error) {
    console.error('Error in transcribeAudio:', error.message);
    return null;
  }
};









// Assuming startRecording, stopRecording, and playRecording are imported or defined above
export const record_answer = async (name) => {


  const recording = await startRecording();

  await new Promise(resolve => setTimeout(resolve, 3000));

  const uri = await stopRecording(recording, name);
  console.log(`Recording stopped. File saved at: ${uri}`);

 

};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};

const saveBlobToFileSystem = async (blob, fileName) => {
  const base64DataUrl = await blobToBase64(blob); // Cela retourne une Data URL
  const base64ContentArray = base64DataUrl.split(","); // Séparer l'en-tête du contenu proprement dit
  if (base64ContentArray.length !== 2) {
    throw new Error('Base64 content is not in the expected format');
  }
  const base64 = base64ContentArray[1]; // Obtenez la partie base64 sans l'en-tête

  const uri = FileSystem.documentDirectory + fileName;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
};

async function adjustSampleRate(originalBlob) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 48000, // Le taux d'échantillonnage source
    });

    const response = await fetch(URL.createObjectURL(originalBlob));
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const targetSampleRate = 8000; // Le taux d'échantillonnage cible pour la transcription
    const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, targetSampleRate);
    const bufferSource = offlineContext.createBufferSource();
    bufferSource.buffer = audioBuffer;

    bufferSource.connect(offlineContext.destination);
    bufferSource.start(0);
    const renderedBuffer = await offlineContext.startRendering();

    const wav = audioBufferToWav(renderedBuffer); // Convertir AudioBuffer rendu en WAV
    const blob = new Blob([wav], { type: 'audio/wav' });

    return blob;
}
