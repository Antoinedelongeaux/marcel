import axios from 'axios';

const GOOGLE_CLOUD_API_KEY = 'AIzaSyCQye35kHVHXEKLAzp2MMgxv2R1U7whsJM';

const fetchAudioFile = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
};

const convertBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const transcribeAudio = async (audioFileName) => {
  try {
    const publicURL = `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/audio/${audioFileName}`;
    console.log("Fetching audio file from:", publicURL);

    const audioBlob = await fetchAudioFile(publicURL);
    const audioBase64 = await convertBlobToBase64(audioBlob);

    const requestData = {
      audio: { content: audioBase64 },
      config: {
        enableAutomaticPunctuation: true,
        languageCode: 'fr-FR',
      },
    };

    console.log("Request data:", requestData);

    const response = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`,
      requestData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log("API Response:", response.data);

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
