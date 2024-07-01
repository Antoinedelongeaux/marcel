import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { Buffer } from 'buffer';
import { decode } from 'base64-arraybuffer';
import { Platform } from 'react-native';

global.Buffer = Buffer;



/*
export const save_audio = async (audioFile, name) => {
  try {
    const fileName = `${name}.flac`; // Nom du fichier avec extension FLAC

    // Conversion pour la plateforme web
    if (Platform.OS === 'web') {
      if (!(audioFile instanceof Blob || audioFile instanceof File)) {
        throw new Error('Expected audio file to be a Blob or File');
      }

      const flacBlob = await convertBlobToFlac(audioFile);
      const reader = new FileReader();
      reader.readAsDataURL(flacBlob);

      await new Promise((resolve) => {
        reader.onloadend = () => {
          const base64audio = reader.result.split(',')[1];
          supabase.storage.from('audio').upload(fileName, decode(base64audio), {
            contentType: 'audio/flac',
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
      // Traitement pour les plateformes mobiles, conversion en FLAC
      const base64 = await FileSystem.readAsStringAsync(audioFile, { encoding: FileSystem.EncodingType.Base64 });
      const flacBlob = await convertBase64ToFlacBlob(base64);
      const flacBase64 = await convertBlobToBase64(flacBlob);

      const { error: uploadError } = await supabase.storage.from('audio').upload(fileName, decode(flacBase64), {
        contentType: 'audio/flac',
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
*/

// Fonctions de conversion
const convertBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const convertBlobToFlac = async (blob) => {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  ffmpeg.FS('writeFile', 'input', await fetchFile(blob));
  await ffmpeg.run('-i', 'input', 'output.flac');
  const data = ffmpeg.FS('readFile', 'output.flac');

  return new Blob([data.buffer], { type: 'audio/flac' });
};

const convertBase64ToFlacBlob = async (base64) => {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  ffmpeg.FS('writeFile', 'input.mp3', await fetchFile(`data:audio/mp3;base64,${base64}`));
  await ffmpeg.run('-i', 'input.mp3', 'output.flac');
  const data = ffmpeg.FS('readFile', 'output.flac');

  return new Blob([data.buffer], { type: 'audio/flac' });
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
    // Utilisation de la nouvelle URL de Supabase pour le fichier audio
    publicURL = `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/${publicURL}`;

    // Log pour afficher l'URL et le nom du fichier audio
    console.log("Playing audio from URL:", publicURL);
    console.log("File name for non-web platforms:", fileName);

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
  
  
  

    const testPostUrl = 'https://srv495286.hstgr.cloud:3000/test-post';


const testUrl = 'https://srv495286.hstgr.cloud:3000/test';
const testResponse = await fetch(testUrl);
console.log("Requête API envoyée");

// Assure-toi d'utiliser la méthode .text() pour extraire le texte de la réponse
const testResult = await testResponse.text(); // Utilise .text() pour extraire le texte de l'objet Response
console.log('Test API Response:', testResult);




    const serverUrl = 'https://srv495286.hstgr.cloud/transcript';
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


     // Envoyer le fichier audio à l'API /test-post et recevoir la taille du fichier
     const testPostResponse = await fetch(testPostUrl, {
      method: 'POST',
      body: formData, // Envoyer le formData contenant le fichier audio
    });

    if (!testPostResponse.ok) {
      const errorTestResponse = await testPostResponse.text();
      console.error(`Error in test-post API call: ${errorTestResponse}`);
    } else {
      const testPostResult = await testPostResponse.json(); // Extraction du résultat en format JSON
      console.log("testPostResponse : ", testPostResult.transcription);
      return testPostResult.transcription; 
    }


/*
    const response = await fetch(serverUrl, {
      method: 'POST',
      body: formData,
    });

  

    

    if (!response.ok) {
      const errorResponse = await response.text();
      throw new Error(`Server responded with an error: ${errorResponse}`);
    }
*/

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


    

const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';
/*
export const uploadAudioToSupabase = async (uri, fileName) => {
  try {
    let base64;
    console.log("Coco ...")
    if (isWeb) {
      // Utiliser fetch pour convertir Blob en base64 sur le web
      const response = await fetch(uri);
      const blob = await response.blob();
      base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // Utiliser expo-file-system pour lire le fichier en tant que base64 sur mobile
      base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    }

    // Vérifier si la base64 est valide
    if (!base64) {
      throw new Error("Failed to convert audio file to base64");
    }

    // Convertir la base64 en ArrayBuffer pour l'upload
    const audioArrayBuffer = decode(base64);

    // Uploader le fichier sur Supabase
    const { error } = await supabase.storage.from('audio').upload(fileName, audioArrayBuffer, {
      contentType: 'audio/mp3',  // Assurez-vous que le contentType correspond au format désiré
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      throw error;
    }

    console.log(`File uploaded and accessible at: ${fileName}`);
    return fileName;
  } catch (error) {
    console.error('Error uploading audio to Supabase:', error);
    return null;
  }
};
*/

export const uploadAudioToSupabase = async (uri, fileName) => {
  try {
    let audioBlob;
    console.log("Uploading audio file...");

    if (Platform.OS === 'web') {
      // Utiliser fetch pour obtenir le Blob du fichier audio sur le web
      const response = await fetch(uri);
      audioBlob = await response.blob();
    } else {
      // Utiliser expo-file-system pour lire le fichier en tant que base64 sur mobile
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      audioBlob = new Blob([decode(base64)], { type: 'audio/flac' }); // Ajustez le type MIME si nécessaire
    }

    // Convertir le Blob en ArrayBuffer pour l'upload
    const arrayBuffer = await audioBlob.arrayBuffer();

    // Uploader le fichier sur Supabase
    const { error } = await supabase.storage.from('audio').upload(fileName, arrayBuffer, {
      contentType: audioBlob.type,  // Assurez-vous que le contentType correspond au format du fichier audio
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      throw error;
    }

    console.log(`File uploaded and accessible at: ${fileName}`);
    return fileName;
  } catch (error) {
    console.error('Error uploading audio to Supabase:', error);
    return null;
  }
};

export const uploadImageToSupabase = async (uri, fileName) => {
  try {
    let imageBlob;
    console.log("Uploading image file...");

    if (Platform.OS === 'web') {
      // Utiliser fetch pour obtenir le Blob du fichier image sur le web
      const response = await fetch(uri);
      imageBlob = await response.blob();
    } else {
      // Utiliser expo-file-system pour lire le fichier en tant que base64 sur mobile
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBlob = new Blob([bytes], { type: 'image/jpeg' }); // Ajustez le type MIME si nécessaire
    }

    // Convertir le Blob en ArrayBuffer pour l'upload
    const arrayBuffer = await imageBlob.arrayBuffer();

    // Uploader le fichier sur Supabase
    const { error } = await supabase.storage.from('photos').upload(fileName, arrayBuffer, {
      contentType: imageBlob.type,  // Assurez-vous que le contentType correspond au format du fichier image
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      throw error;
    }

    console.log(`File uploaded and accessible at: ${fileName}`);
    return fileName;
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    return null;
  }
};