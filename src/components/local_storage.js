import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveActiveSubjectId = async (subjectId) => {
  try {
    console.log("saveActiveSubjectId en cours : ",subjectId)

    if (subjectId === null ||subjectId === '0') {
      // Si subjectId est null, effacez l'entrée du stockage
      await AsyncStorage.removeItem('activeSubjectId');
    } else {
      // Sinon, sauvegardez l'ID du sujet actif
      // Make sure to convert subjectId to a string before saving
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

export const saveActiveSubjectUserStatus = async (subjectUserStatus) => {
  try {
    console.log("saveActiveSubjectUserStatus en cours")
    if (subjectUserStatus === null ||subjectUserStatus === '0') {
      // Si subjectId est null, effacez l'entrée du stockage
      await AsyncStorage.removeItem('activeSubjectUserStatus');
    } else {
      // Sinon, sauvegardez l'ID du sujet actif
      // Make sure to convert subjectId to a string before saving
      await AsyncStorage.setItem('activeSubjectUserStatus', subjectUserStatus);
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du status de l'utiisateur du sujet actif", error);
  }
};



export const getActiveSubjectUserStatus = async () => {
  try {

    const subjectUserSatus = await AsyncStorage.getItem('activeSubjectUserStatus');
    return subjectUserSatus;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID du sujet actif', error);
  }
};