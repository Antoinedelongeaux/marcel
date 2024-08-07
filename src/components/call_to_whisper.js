import axios from 'axios';
import AudioBufferToWav from 'audiobuffer-to-wav';

const BASE_URL = 'https://srv495286.hstgr.cloud:5000';  // Adresse de votre serveur
const MAX_PAYLOAD_SIZE = 10485760 * 2; // 10 MB
const SEGMENT_DURATION = 60; // Segment duration in seconds

const convertAudioBufferToWavBase64 = async (audioBuffer) => {
  console.log('Converting audio buffer to WAV Base64');
  const wavBuffer = AudioBufferToWav(audioBuffer);
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  return convertBlobToBase64(blob);
};

const convertBlobToBase64 = (blob) => {
  console.log('Converting blob to Base64');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const fetchAudioBuffer = async (url) => {
  console.log('Fetching audio buffer from URL:', url);
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext.decodeAudioData(arrayBuffer);
};

const getAudioMetadata = (audioBuffer) => {
  console.log('Getting audio metadata');
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
  console.log('Calculating Base64 size in bytes');
  return (base64String.length * (3 / 4)) - (base64String.indexOf('=') > 0 ? (base64String.length - base64String.indexOf('=')) : 0);
};

const splitAudioBuffer = (audioBuffer, segmentDuration) => {
  console.log('Splitting audio buffer into segments');
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
    console.log(`Segment ${segments.length + 1} - Start: ${start}, End: ${end}, Length: ${segment.length}`);
    segments.push(segment);
  }
  return segments;
};

const transcribeSegment = async (audioFile) => {
  console.log('Transcribing audio segment');
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
    console.log("Ceci prouve que l'on passe bien par Whisper");
    console.log('Transcribing audio:', audioFileName);
    const publicURL = `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/${audioFileName}`;
    console.log("Fetching audio file from:", publicURL);

    const audioBuffer = await fetchAudioBuffer(publicURL);
    const segments = splitAudioBuffer(audioBuffer, SEGMENT_DURATION);
    let fullTranscription = '';

    console.log(`Total segments to transcribe: ${segments.length}`);

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

    console.log('Full transcription:', fullTranscription.trim());
    return fullTranscription.trim();
  } catch (error) {
    console.error('Error in transcribeAudio:', error.message);
    if (error.response) {
      console.error('Detailed error response:', error.response.data);
    }
    return null;
  }
};


const transcribeSegmentSlow = async (audioFile, id_answer) => {
  console.log('Transcribing audio segment slowly');
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('id_answer', id_answer);

  const response = await axios.post(
    `${BASE_URL}/transcribe_slow`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  if (response.data && response.data.message) {
    return response.data.message;
  } else {
    throw new Error("No transcription results found");
  }
};

export const transcribeAudio_slow = async (audioFileName, id_answer) => {
  try {
    console.log('Transcribing audio slowly:', audioFileName, ', id_answer : ', id_answer);

    const publicURL = `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/${audioFileName}`;
    console.log('Fetching audio file from:', publicURL);

    const audioBuffer = await fetchAudioBuffer(publicURL);
    const segments = splitAudioBuffer(audioBuffer, SEGMENT_DURATION);

    console.log(`Total segments to transcribe: ${segments.length}`);

    for (let i = 0; i < segments.length; i++) {
      const segmentBase64 = await convertAudioBufferToWavBase64(segments[i]);
      const segmentSizeInBytes = calculateBase64SizeInBytes(segmentBase64);

      if (segmentSizeInBytes > MAX_PAYLOAD_SIZE) {
        throw new Error(`Segment ${i + 1} exceeds the maximum payload size.`);
      }

      console.log(`Size of segment ${i + 1}: ${segmentSizeInBytes} bytes`);

      const audioBlob = new Blob([new Uint8Array(Buffer.from(segmentBase64, 'base64'))], { type: 'audio/wav' });
      await transcribeSegmentSlow(audioBlob, id_answer);
    }

    console.log('Transcription process initiated successfully');
    return 'Transcription process initiated successfully';
  } catch (error) {
    console.error('Error in transcribeAudio_slow:', error.message);
    if (error.response) {
      console.error('Detailed error response:', error.response.data);
    }
    return null;
  }
};