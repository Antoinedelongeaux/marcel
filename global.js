import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    //flex: 1,
    //justifyContent: 'flex-start',
    //paddingTop: 20,
    backgroundColor: "#E8FFF6",
    //alignItems:"center",
    padding: 20,
    //paddingBottom: 10, 
  },

  container_center: {
    flex: 1,
    justifyContent: 'center',
    //paddingTop: 20,
    backgroundColor: "#E8FFF6",
    alignItems:"center",
    padding: 20,
  },
  container_spread: {
    flex: 1,
    justifyContent: 'space-around',
    paddingTop: 20,
    backgroundColor: "#E8FFF6",
    //alignItems:"center",
  },


  form: {
    // backgroundColor: "purple",
    justifyContent: "space-between",
    alignItems: "stretch",
    width: "100%",
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonWrapper: {
    marginVertical: 7,
  },
  
  // Ajoutez ici les styles existants pour form, input, etc.
  buttonWrapper: {
    marginVertical: 7,
  },
  // Nouveau style de bouton inspiré de appBox
  globalButton: {
    width: '90%', // Adaptation de la largeur
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b1b3b5', // Couleur du fond
    margin: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 5, // Ombre pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  globalButton_active: {
    width: '90%', // Adaptation de la largeur
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b2d52', // Couleur du fond
    margin: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 5, // Ombre pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  globalButton_wide: {
    width: '90%', // Adaptation de la largeur
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b2d52', // Couleur du fond
    margin: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 5, // Ombre pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  globalButton_narrow: {
    width: '45%', // Adaptation de la largeur
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b1b3b5', // Couleur du fond
    margin: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 5, // Ombre pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  globalButtonText: {
    textAlign: 'center',
    color: '#ffffff', // Texte blanc pour un meilleur contraste
    fontSize: 15,
    fontWeight: 'bold',
  },
  globalButtonText_active: {
    textAlign: 'center',
    color: '#ffffff', // Texte blanc pour un meilleur contraste
    fontSize: 19,
    fontWeight: 'bold',
  },
  globalButtonText_narrow: {
    textAlign: 'center',
    color: '#ffffff', // Texte blanc pour un meilleur contraste
    fontSize: 12,
    fontWeight: 'bold',
  },


  answer_container: {
    flex: 1,
    backgroundColor: "#E8FFF6",
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  answer_input: {
    width: '95%',
    backgroundColor: "#FFFFFF",
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',

  },
  title: {
    fontSize: 30, // Taille de police plus grande pour le titre
    fontWeight: 'bold', // Gras pour le titre
    marginTop: 20, // Ajoute un peu d'espace au-dessus du titre
    marginBottom: 10, // Ajoute un peu d'espace en dessous du titre
    textAlign: 'center', // Centre le texte horizontalement
},
title_chapter: {
  fontSize: 20, // Taille de police plus grande pour le titre
  fontWeight: 'bold', // Gras pour le titre
  marginTop: 20, // Ajoute un peu d'espace au-dessus du titre
  marginBottom: 10, // Ajoute un peu d'espace en dessous du titre

},



  globalButton_tag: {
    minWidth: 'auto', // Permet au tag de s'adapter au texte
    paddingHorizontal: 12, // Espacement horizontal à l'intérieur du tag
    paddingVertical: 5, // Espacement vertical à l'intérieur du tag, plus petit que pour un bouton standard
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b2d52', // Couleur de fond du tag
    margin: 5, // Marge réduite pour permettre un affichage plus compact
    borderRadius: 15, // Bord arrondi pour un look de tag classique
    elevation: 3, // Ombre réduite pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  
  globalButtonText_tag: {
    textAlign: 'center',
    color: '#ffffff', // Texte blanc pour un meilleur contraste
    fontSize: 14, // Taille de police légèrement augmentée pour améliorer la lisibilité
    fontWeight: 'bold',
  },
  
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  navButton: {
    padding: 10,
  },

 
})