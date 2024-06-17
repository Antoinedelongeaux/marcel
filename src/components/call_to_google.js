
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import AudioBufferToWav from 'audiobuffer-to-wav';

const GOOGLE_CLOUD_API_KEY = 'AIzaSyCQye35kHVHXEKLAzp2MMgxv2R1U7whsJM';

const convertAudioBufferToWavBase64 = async (audioBuffer) => {
  const wavBuffer = AudioBufferToWav(audioBuffer);
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  return convertBlobToBase64(blob);
};

const convertBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const fetchAudioBuffer = async (url) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext.decodeAudioData(arrayBuffer);
};

export const transcribeAudio = async (audioFileName) => {
  try {
    const publicURL = `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/${audioFileName}`;
    console.log("Fetching audio file from:", publicURL);

    const audioBuffer = await fetchAudioBuffer(publicURL);
    const audioBase64 = await convertAudioBufferToWavBase64(audioBuffer);

    const config = {
      enableAutomaticPunctuation: true,
      encoding: 'LINEAR16',
      sampleRateHertz: 48000,
      languageCode: 'fr-FR',
      audio_channel_count: 2,
    };

    const requestData = {
      audio: { content: audioBase64 },
      config: config,
    };

    const response = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`,
      requestData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.data && response.data.results) {
      const transcription = response.data.results.map(result => result.alternatives[0].transcript).join('\n');
      return transcription;
    } else {
      throw new Error("No transcription results found");
    }
  } catch (error) {
    console.error('Error in transcribeAudio:', error.message);
    if (error.response) {
      console.error('Detailed error response:', error.response.data);
    }
    return null;
  }
};
