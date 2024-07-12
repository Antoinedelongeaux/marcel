import axios from 'axios';
import AudioBufferToWav from 'audiobuffer-to-wav';

const BASE_URL = 'http://91.108.112.18:5001';  // Adresse de votre serveur
const MAX_PAYLOAD_SIZE = 10485760; // 10 MB
const SEGMENT_DURATION = 30; // Segment duration in seconds

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

const getAudioMetadata = (audioBuffer) => {
  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const duration = audioBuffer.duration;

  return {
    sampleRateHertz: sampleRate,
    audioChannelCount: numberOfChannels,
    duration: duration,
  };
};

const calculateBase64SizeInBytes = (base64String) => {
  return (base64String.length * (3 / 4)) - (base64String.indexOf('=') > 0 ? (base64String.length - base64String.indexOf('=')) : 0);
};

const splitAudioBuffer = (audioBuffer, segmentDuration) => {
  const segmentLength = segmentDuration * audioBuffer.sampleRate;
  const segments = [];
  for (let start = 0; start < audioBuffer.length; start += segmentLength) {
    const end = Math.min(start + segmentLength, audioBuffer.length);
    const segment = new AudioBuffer({
      length: end - start,
      numberOfChannels: audioBuffer.numberOfChannels,
      sampleRate: audioBuffer.sampleRate,
    });
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      segment.copyToChannel(channelData.subarray(start, end), channel, 0);
    }
    segments.push(segment);
  }
  return segments;
};

const transcribeSegment = async (audioFile) => {
  const formData = new FormData();
  formData.append('file', audioFile);

  const response = await axios.post(
    `${BASE_URL}/transcribe`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  if (response.data && response.data.transcription) {
    return response.data.transcription;
  } else {
    throw new Error("No transcription results found");
  }
};

export const transcribeAudio = async (audioFileName) => {
  try {
    // Appel au point de terminaison /test
    //const testResponse = await axios.get(`${BASE_URL}/test`);
    //console.log('Response from /test:', testResponse.data);

    const publicURL = `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/${audioFileName}`;
    console.log("Fetching audio file from:", publicURL);

    const audioBuffer = await fetchAudioBuffer(publicURL);
    const segments = splitAudioBuffer(audioBuffer, SEGMENT_DURATION);
    let fullTranscription = '';

    for (let i = 0; i < segments.length; i++) {
      const segmentBase64 = await convertAudioBufferToWavBase64(segments[i]);
      const segmentSizeInBytes = calculateBase64SizeInBytes(segmentBase64);

      if (segmentSizeInBytes > MAX_PAYLOAD_SIZE) {
        throw new Error(`Segment ${i + 1} exceeds the maximum payload size.`);
      }

      console.log(`Size of segment ${i + 1}: ${segmentSizeInBytes} bytes`);

      const audioBlob = new Blob([new Uint8Array(Buffer.from(segmentBase64, 'base64'))], { type: 'audio/wav' });
      const segmentTranscription = await transcribeSegment(audioBlob);
      fullTranscription += segmentTranscription + ' ';
    }

    return fullTranscription.trim();
  } catch (error) {
    console.error('Error in transcribeAudio:', error.message);
    if (error.response) {
      console.error('Detailed error response:', error.response.data);
    }
    return null;
  }
};
