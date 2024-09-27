import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    backgroundColor: "#E8FFF6",
    alignItems: "stretch",
    //paddingHorizontal: 25,
    //paddingBottom: 10,
  },

  container_center: {
    flex: 1,
    justifyContent: "center",
    //paddingTop: 20,
    backgroundColor: "#E8FFF6",
    alignItems: "center",
    padding: 20,
  },
  container_spread: {
    flex: 1,
    justifyContent: "space-around",
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

  buttonWrapper: {
    marginVertical: 7,
  },

  // Ajoutez ici les styles existants pour form, input, etc.
  buttonWrapper: {
    marginVertical: 7,
  },
  // Nouveau style de bouton inspiré de appBox
  globalButton: {
    width: "90%", // Adaptation de la largeur
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#b1b3b5", // Couleur du fond
    margin: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 5, // Ombre pour Android
    shadowColor: "#000", // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  globalButton_active: {
    backgroundColor: "#7D94AF",
    alignSelf: "center",
    width: "90%",
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
  },
  globalButton_wide: {
    alignSelf: "center",
    width: "90%",
    backgroundColor: "#0b2d52", // Couleur du fond
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
  },
  container_wide: {
    alignSelf: "center",
    width: "90%",
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
  },
  globalButton_narrow: {
    width: "45%", // Adaptation de la largeur
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b2d52", // Couleur du fond
    margin: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 5, // Ombre pour Android
    shadowColor: "#000", // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  globalButtonText: {
    textAlign: "center",
    color: "#ffffff", // Texte blanc pour un meilleur contraste
    fontSize: 15,
    fontWeight: "bold",
  },
  globalButtonText_active: {
    textAlign: "left",
    color: "#ffffff", // Texte blanc pour un meilleur contraste
    fontSize: 19,
    fontWeight: "bold",
    color: "#0b2d52",
  },
  globalButtonText_narrow: {
    textAlign: "center",
    color: "#ffffff", // Texte blanc pour un meilleur contraste
    fontSize: 12,
    fontWeight: "bold",
  },

  answer_container: {
    flex: 1,
    backgroundColor: "#E8FFF6",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  answer_input: {
    width: "95%",
    backgroundColor: "#FFFFFF",
    margin: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 30, // Taille de police plus grande pour le titre
    fontWeight: "bold", // Gras pour le titre
    marginTop: 20, // Ajoute un peu d'espace au-dessus du titre
    marginBottom: 10, // Ajoute un peu d'espace en dessous du titre
    textAlign: "center", // Centre le texte horizontalement
    maxWidth: "90%",
  },
  title_chapter: {
    fontSize: 20, // Taille de police plus grande pour le titre
    fontWeight: "bold", // Gras pour le titre
    marginTop: 20, // Ajoute un peu d'espace au-dessus du titre
    marginBottom: 10, // Ajoute un peu d'espace en dessous du titre
  },

  globalButton_tag: {
    minWidth: "auto", // Permet au tag de s'adapter au texte
    paddingHorizontal: 12, // Espacement horizontal à l'intérieur du tag
    paddingVertical: 5, // Espacement vertical à l'intérieur du tag, plus petit que pour un bouton standard
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b2d52", // Couleur de fond du tag
    margin: 5, // Marge réduite pour permettre un affichage plus compact
    borderRadius: 15, // Bord arrondi pour un look de tag classique
    elevation: 3, // Ombre réduite pour Android
    shadowColor: "#000", // Ombre pour iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },

  globalButtonText_tag: {
    textAlign: "center",
    color: "#000000", // Texte blanc pour un meilleur contraste
    fontSize: 22, // Taille de police légèrement augmentée pour améliorer la lisibilité
    fontWeight: "bold",
  },

  navigationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 0,
    zIndex: 10,
    width: "100%",
  },

  navButton: {
    padding: 10,
    opacity: 0.7,
    transition: "opacity 0.3s ease",
  },

  navButton_over: {
    opacity: 1,
  },

  iconStyle: {
    width: 60, // La largeur de l'icône
    height: 60, // La hauteur de l'icône
    color: "#0b2d52",
  },
  choiceButton: {
    backgroundColor: "#bdbfbd",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  choiceButtonText: {
    color: "#00000", // Couleur du texte blanche
    fontSize: 22,
    //fontWeight: 'bold',
  },
  chatBubble: {
    marginVertical: "5px",
    backgroundColor: "#f0f0f0",
    padding: "10px",
    borderRadius: "10px",
  },
  QuestionBubble: {
    marginVertical: "5px",
    padding: "10px",
    borderRadius: "10px",
    alignSelf: "flex-start",
    backgroundColor: "#9fc4e0",
    marginTop: 50,
  },
  ResponseBubble: {
    marginVertical: "5px",
    padding: "10px",
    borderRadius: "10px",
    alignSelf: "flex-end",
    backgroundColor: "#9fe0a4",
  },
  ResponseBubble_selected: {
    marginVertical: "5px",
    padding: "10px",
    borderRadius: "10px",
    alignSelf: "flex-end",
    backgroundColor: "#0b5423",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#f9f9f9", // Légère couleur de fond pour le conteneur de recherche
    shadowColor: "#000", // Ajout d'ombre
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  input: {
    backgroundColor: "white",
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    height: 40,
  },

  modalContainer: {
    backgroundColor: "white", //changer la couleur ici
    width: "100%",
    height: "100%",
    padding: 20,
    borderRadius: 10,
  },

  modalContainer: {
    backgroundColor: "#E8FFF6",
    width: "90%",
    padding: 20,
    borderRadius: 10,
    alignSelf: "center",
    zIndex: 20,
  },

  closeButtonText: {
    color: "white",
    fontSize: 30,
  },

  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },

  closeIcon: {
    width: 24,
    height: 24,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  fullscreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },

  fullscreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  selectedToggle: {
    backgroundColor: "#008080",
  },
  toggleButtonCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    position: "absolute",
  },
  toggleTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  toggleText: {
    marginHorizontal: 10,
    fontSize: 16,
    width: 100,
  },

  navigationButton: {
    width: "30%", // Adaptation de la largeur
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#b1b3b5", // Couleur du fond
    margin: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 5, // Ombre pour Android
    shadowColor: "#000", // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginHorizontal: 0.5,
  },

  navigationButton_over: {
    backgroundColor: "#0b2d52", // Couleur du fond
  },

  navigationButtonText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "bold",
  },

  navigationButtonText_over: {
    color: "#ffffff", // Texte blanc pour un meilleur contraste
  },

  stepContainer: {
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  picker: {
    width: "60%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  textStyle: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },
});
