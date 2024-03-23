import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveActiveSubjectId = async (subjectId) => {
  try {
    if (subjectId === null) {
      // Si subjectId est null, effacez l'entrée du stockage
      await AsyncStorage.removeItem('activeSubjectId');
    } else {
      // Sinon, sauvegardez l'ID du sujet actif
      await AsyncStorage.setItem('activeSubjectId', subjectId);
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'ID du sujet actif', error);
  }
};


// Pour récupérer l'ID du sujet actif
export const getActiveSubjectId = async () => {
  try {
    const subjectId = await AsyncStorage.getItem('activeSubjectId');
    return subjectId;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID du sujet actif', error);
  }
};
