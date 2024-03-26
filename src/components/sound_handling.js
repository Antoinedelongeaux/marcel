import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { Buffer } from 'buffer';
import { decode } from 'base64-arraybuffer'
import { Recording, RecordingOptionsPresets } from 'expo-av';



global.Buffer = Buffer; 





export const save_audio = async (audioFileUri, name) => {
  try {
    console.log("audioFileUri : ", audioFileUri);

    const fileInfo = await FileSystem.getInfoAsync(audioFileUri);
    console.log("Taille du fichier avant upload: ", fileInfo.size);
    // Ensure you're using the URI to read the file content as base64
    const base64 = await FileSystem.readAsStringAsync(audioFileUri, { encoding: FileSystem.EncodingType.Base64 });

    // Utiliser une extension .mp3 pour le fichier
    //const fileName = `${Date.now()}.mp3`;
    const fileName = name
    // Convertir base64 en Uint8Array. Utilisation de Buffer pour remplacer atob dans React Native
    //const buffer = Buffer.from(base64, 'base64');

    // Upload using base64 string



    const { error: uploadError } = await supabase
      .storage
      .from('audio')
      .upload(fileName, decode(base64), {
        contentType: `audio/mp3`,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }




    // Générer l'URL publique pour l'audio téléchargé
    const publicURL = "https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/" + fileName;

    console.log(`File uploaded and accessible at: ${publicURL}`);

    //const localAudioUri = await downloadFileToLocalFileSystem(audioFileUri);
    //await transcribeAudio(audioFileUri);
    

    // Retourner l'URL publique pour référence
    return publicURL;
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



//const API_KEY = '367fa81ec93e4e0581c57da28ad7b32c';
//const baseUrl = 'https://api.assemblyai.com/v2';

// Simulation de la transcription audio


// export const transcribeAudio = async (audioFileUri) => {
//   const testUrl = 'http://91.108.112.18:3000/test';

//   try {
//     const testResponse = await fetch(testUrl);
//     if (!testResponse.ok) {
//       const errorText = await testResponse.text();
//       throw new Error(`Failed to connect to the server: ${errorText}`);
//     }
//     const message = await testResponse.text();
//     console.log(message); // This should now log "Hello world!"

//     const formData = new FormData();
//     // Vous devrez ajuster cette partie pour charger le fichier correctement
//     formData.append('audio', {
//       uri: audioFileUri,
//       type: 'audio/mp3', // Ajustez le type MIME selon votre cas d'utilisation
//       name: 'upload.mp3', // Le nom du fichier peut être statique ou dynamique
//     });

//     const serverUrl = 'http://91.108.112.18:3000/transcript';
//     const response = await fetch(serverUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//       body: formData,
//     });

//     if (!response.ok) {
//       const errorResponse = await response.json();
//       console.error('Error during transcription:', errorResponse);
//       throw new Error(`Server responded with an error: ${errorResponse.error || 'Unknown error'}`);
//     }

//     // Si la réponse est OK, extraire la transcription et la renvoyer
//     const transcriptionResult = await response.json(); // Présumons que la réponse contient un champ 'transcription'
//     console.log(transcriptionResult)
//     console.log('Transcription:', transcriptionResult.transcription);
//     return transcriptionResult.transcription; // Retourner le texte transcrit

//   } catch (error) {
//     console.error('Error in transcribeAudio:', error.message);
//     return null; // Ou retourner l'erreur pour un traitement ultérieur
//   }
// };





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

    const serverUrl = 'http://91.108.112.18:3000/transcript';
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

  // Convert the recording to text
  //await convertSpeechToText(uri);


  //console.log("Première lecture")
  //await playRecording(uri);

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
