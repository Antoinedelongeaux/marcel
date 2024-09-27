import React, { useState, useEffect } from "react";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
  Platform,
  Alert,
  Dimensions,
  Picker,
  ActivityIndicator,
  CheckBox,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getSubject,
  getMemories_Answers,
  integration,
  getMemories_Questions,
  get_chapters,
  submitMemories_Answer,
  update_answer_text,
  deleteMemories_Answer,
  get_user_name,
  connectAnswers,
  disconnectAnswers,
  moveAnswer,
  get_project_contributors,
  update_answer_owner,
  getExistingLink,
  updateExistingLink,
  createNewLink,
  updateAnswer,
  getTheme_byProject,
  getAnswer,
} from "../components/data_handling";
import ModalComponent from "../components/ModalComponent";
import { useFocusEffect } from "@react-navigation/native";
import { getActiveSubjectId } from "../components/local_storage";
import { globalStyles } from "../../global";
import BookIcon from "../../assets/icons/book.svg";
import PersonIcon from "../../assets/icons/person.svg";
import settings from "../../assets/icons/accueil.png";
import copyIcon from "../../assets/icons/paste.png";
import noteIcon from "../../assets/icons/notes.png";
import filterIcon from "../../assets/icons/filtre.png";
import refreshIcon from "../../assets/icons/refresh_black_24dp.svg";
import sortIcon from "../../assets/icons/trier.png";
import calendarIcon from "../../assets/icons/calendar.png";
import EmptyfilterIcon from "../../assets/icons/filtre_empty.png";
import Modal from "react-native-modal"; // Ajoutez cette ligne pour importer le composant Modal
import {
  createAudioChunk,
  startRecording,
  stopRecording,
  uploadAudioToSupabase,
  delete_audio,
  playRecording_fromAudioFile,
  uploadImageToSupabase,
  handlePlayPause,
} from "../components/sound_handling"; // Ajoutez cette ligne
import { transcribeAudio } from "../components/call_to_whisper";
//import { transcribeAudio } from '../components/call_to_google';
import MicroIcon from "../../assets/icons/microphone-lines-solid.svg";
import VolumeIcon from "../../assets/icons/volume_up_black_24dp.svg";
import captionIcon from "../../assets/icons/caption.png";
import trash from "../../assets/icons/baseline_delete_outline_black_24dp.png";
import closeIcon from "../../assets/icons/close.png";
import edit from "../../assets/icons/pen-to-square-regular.svg";
import repondreIcon from "../../assets/icons/repondre.png";

import eyeIcon from "../../assets/icons/view.png";
import plusIcon from "../../assets/icons/plus.png";
import minusIcon from "../../assets/icons/minus.png";
import questionIcon from "../../assets/icons/question.png";
import linkIcon from "../../assets/icons/link.png";
import AttachIcon from "../../assets/icons/attach.png";
import { v4 as uuidv4 } from "uuid";
import Upload from "../../assets/icons/upload.png";
import * as DocumentPicker from "expo-document-picker";
import DraggableFlatList from "react-native-draggable-flatlist";
import Clipboard from "@react-native-clipboard/clipboard";
import shareIcon from "../../assets/icons/share.png";
import playIcon from "../../assets/icons/play.png";
import pauseIcon from "../../assets/icons/pause.png";
import AnswerCard from "../components/UI_components";
import {
  AnswerPanel_written,
  AnswerPanel_oral,
  AnswerPanel_AudioFile,
  AnswerPanel_imageFile,
  AnswerPanel_documentFile,
  ThemePanel,
} from "../components/save_note";

const useFetchActiveSubjectId = (setSubjectActive, setSubject, navigation) => {
  useFocusEffect(
    React.useCallback(() => {
      const fetchActiveSubjectId = async () => {
        const temp = await getActiveSubjectId();
        setSubjectActive(temp);
        if (temp != null) {
          const temp2 = await getSubject(temp);
          setSubject(temp2);
        } else {
          navigation.navigate("ManageBiographyScreen");
        }
      };
      fetchActiveSubjectId();
    }, [navigation])
  );
};

function NoteScreen({ route }) {
  const navigation = useNavigation();
  const session = route.params?.session;
  const notesMode = route.params?.mode;
  const statut = route.params?.statut;

  const [subjectActive, setSubjectActive] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subject, setSubject] = useState([]);
  const [textFilter, setTextFilter] = useState("");
  const [dateBefore, setDateBefore] = useState(null);
  const [dateAfter, setDateAfter] = useState(null);
  const [showDateBeforePicker, setShowDateBeforePicker] = useState(false);
  const [showDateAfterPicker, setShowDateAfterPicker] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [personal, setPersonal] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [tags, setTags] = useState([
    "Famille",
    "Vie professionnelle",
    "Vie personnelle",
    "Hobbies & passions",
    "Valeurs",
    "Voyages",
    "Autre",
    "",
  ]);

  //const ID_question = route.params?.question.id || '';
  const [link, setLink] = useState([]);
  const [sort, setSort] = useState("ok");

  const question_reponse =
    route.params?.miscState?.question_reponse || "réponse";
  const [selectedQuestion, setSelectedQuestion] = useState(
    route.params?.miscState?.question || null
  );
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSorting, setShowSorting] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalAnswer_oral_Visible, setModalAnswer_oral_Visible] =
    useState(false);
  const [isModalAnswer_written_Visible, setModalAnswer_written_Visible] =
    useState(false);
  const [isModalAnswer_audio_Visible, setModalAnswer_audio_Visible] =
    useState(false);
  const [isModalAnswer_image_Visible, setModalAnswer_image_Visible] =
    useState(false);
  const [isModalAnswer_document_Visible, setModalAnswer_document_Visible] =
    useState(false);
  const [isModalQuestion_Visible, setModalQuestion_Visible] = useState(false);
  const [isModalImageVisible, setModalImageVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const [isRecording, setIsRecording] = useState(false); // Ajoutez cette ligne dans les états
  const [recording, setRecording] = useState(); // Ajoutez cette ligne dans les états
  const [note, setNote] = useState(""); // Ajoutez cette ligne dans les états
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const windowWidth = Dimensions.get("window").width;
  const isLargeScreen = windowWidth > 768;
  const [userNames, setUserNames] = useState({});
  const [themeNames, setThemeNames] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [selectedAnswerIds, setSelectedAnswerIds] = useState([]);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [userNameFilter, setUserNameFilter] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(
    route.params?.theme?.id ? route.params?.theme.id : ""
  );
  const [showAttachement, setShowAttachement] = useState(false);
  const [answer, setAnswer] = useState("");
  const [PleaseWait, setPleaseWait] = useState(false);
  const [draggedAnswer, setDraggedAnswer] = useState(null);
  const [dragOverAnswer, setDragOverAnswer] = useState(null);
  const [voirTout, setVoirTout] = useState(false);
  const [users, setUsers] = useState([]);
  const [themes, setThemes] = useState([]);
  const [delegationUserId, setDelegationUserId] = useState(null);
  const [questionReponseFilter, setQuestionReponseFilter] = useState(""); // Ajoutez cette ligne
  const [answerAndQuestion, setAnswerAndQuestion] = useState(question_reponse);
  const [transcribingId, setTranscribingId] = useState(null);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [selectedAnswerId_toAttribuate, setSelectedAnswerId_toAttribuate] =
    useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [utiliseFilter, setUtiliseFilter] = useState("tous");
  const [reluFilter, setReluFilter] = useState("relu & non_relu");
  const [imageFilter, setImageFilter] = useState(true);
  const [audioFilter, setAudioFilter] = useState(true);
  const [commentFilter, setCommentFilter] = useState(true);
  const [playbackStatus, setPlaybackStatus] = useState({});
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [isTranscriptionModalVisible, setIsTranscriptionModalVisible] =
    useState(false);
  const [answerIdToTranscribe, setAnswerIdToTranscribe] = useState(null);
  const [filteredAnswers, setFilteredAnswers] = useState([]);
  const [oldSelectedQuestion, setOldSelectedQuestion] = useState("");
  const [showExistingNotes, setShowExistingNotes] = useState(false);

  useEffect(() => {
    if (statut === "Réagir" || statut === "Relire") {
      setVoirTout(true);
    }
  }, [statut]);

  useFetchActiveSubjectId(setSubjectActive, setSubject, navigation);

  const fetchUsers = async () => {
    try {
      const data = await get_project_contributors(subjectActive);
      if (!data) {
        console.error("Failed to fetch users: No data returned");
      } else {
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };
  const fetchThemes = async () => {
    try {
      const data = await getTheme_byProject(subjectActive);
      if (!data) {
        console.error("Failed to fetch connections: No data returned");
      } else {
        setThemes(data);
      }
    } catch (error) {
      console.error("Error fetching connections: ", error);
    }
  };

  const fetchUsersAndThemes = async () => {
    if (subjectActive && !isLoading) {
      await fetchUsers();
      await fetchThemes();
    }
  };

  const fetchQuestionsAndChapters = async () => {
    if (subjectActive != null) {
      await getMemories_Questions(subjectActive, setQuestions, tags, personal);
      await get_chapters(subjectActive, setChapters);
    }
  };

  const refreshAnswer = async (id_answer) => {
    try {
      const updatedAnswer = await await getAnswer(id_answer); // Récupère la réponse spécifique par son ID
      setAnswers((prevAnswers) =>
        prevAnswers.map(
          (answer) => (answer.id === id_answer ? updatedAnswer : answer) // Met à jour la réponse correspondante
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réponse :", error);
    }
  };

  useEffect(() => {
    fetchUsersAndThemes();
    fetchQuestionsAndChapters();
  }, [subjectActive, isLoading]);

  useEffect(() => {
    if (session.user) {
      setDelegationUserId({ user: { id: session.user.id } });
    }
  }, [session]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchAnswers = async () => {
        const fetchedAnswers = await getMemories_Answers();
        const sortedAnswers = fetchedAnswers.sort((a, b) => a.rank - b.rank);
        setAnswers(sortedAnswers);
        setIsLoading(false);
      };

      fetchAnswers();
    }, [navigation])
  );

  const sortAnswerNormal = (direction) => {
    let sortedAnswers;
    if (direction === "normal") {
      sortedAnswers = answers.sort((a, b) => a.rank - b.rank);
    }
    if (direction === "inverse") {
      sortedAnswers = answers.sort((a, b) => b.rank - a.rank);
    }
    setAnswers(sortedAnswers);
  };

  const sortAnswerByDate = (direction) => {
    let sortedAnswers;
    if (direction === "normal") {
      sortedAnswers = answers.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    }
    if (direction === "inverse") {
      sortedAnswers = answers.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }
    setAnswers(sortedAnswers);
  };

  const handleAssignOwner = (answerId) => {
    setSelectedAnswerId_toAttribuate(answerId);
    setIsAssignModalVisible(true);
  };

  const handleUpdateOwner = async () => {
    if (selectedAnswerId_toAttribuate && selectedUserId) {
      await update_answer_owner(selectedAnswerId_toAttribuate, selectedUserId);
      setIsAssignModalVisible(false);
      refreshAnswers();
    } else {
      Alert.alert("Erreur", "Veuillez sélectionner un utilisateur.");
    }
  };

  const selectAnswer = (answerId) => {
    const answer = answers.find((a) => a.id === answerId);
    if (answer) {
      setSelectedAnswers([answer.id]);
      setEditingAnswerId(answer.id);
      setEditingText(answer.answer);
      Alert.alert(
        "Réponse sélectionnée",
        "Vous avez sélectionné une réponse spécifique."
      );
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      window.selectAnswer = selectAnswer;
    }
  }, [answers]);

  const copyAllToClipboard = () => {
    const combinedText = filteredAnswers
      .map((answer) => {
        const ref = "<reference>" + answer.id + "</reference>";
        return `${answer.answer}\n\n${ref}`;
      })
      .join("\n\n");
    Clipboard.setString(combinedText);
    Alert.alert(
      "Texte copié",
      "Toutes les réponses filtrées ont été copiées dans le presse-papiers."
    );
  };

  const copyToClipboard = (text, id_answer) => {
    const ref = "<reference>" + id_answer + "</reference>";
    const contentToCopy = `${text}\n\n${ref}`;
    Clipboard.setString(contentToCopy);
    Alert.alert(
      "Texte copié",
      "Le texte et la référence ont été copiés dans le presse-papiers."
    );
  };

  const refreshAnswers = async () => {
    const answers = await getMemories_Answers();
    const sortedAnswers = answers.sort((a, b) => a.rank - b.rank);
    setAnswers(sortedAnswers);
    setIsLoading(false);
  };

  useEffect(() => {
    const fetchUserNames = async () => {
      const names = {};
      for (const answer of answers) {
        if (!names[answer.id_user]) {
          names[answer.id_user] = await get_user_name(answer.id_user);
        }
      }
      setUserNames(names);
    };

    if (answers.length > 0) {
      fetchUserNames();
    }
  }, [answers]);

  useEffect(() => {
    const fetchThemeNames = async () => {
      const themeNames = {};
      for (const answer of answers) {
        if (!themeNames[answer.id_connection]) {
          const theme = themes.find(
            (theme) => theme.id === answer.id_connection
          );
          if (theme) {
            themeNames[answer.id_connection] = theme.theme;
          }
        }
      }
      setThemeNames(themeNames);
    };

    if (answers.length > 0) {
      fetchThemeNames();
    }
  }, [answers]);

  const navigateToScreen = (screenName, params) => {
    navigation.navigate(screenName, params);
  };

  const handleRemoveFilters = () => {
    setTextFilter(""); // Réinitialiser le filtre de texte
    route.params?.setReference(""); // Réinitialiser la référence du route
    setSelectedTheme(""); // Réinitialiser le thème sélectionné
    setDateBefore(null); // Réinitialiser la date avant sélectionnée
    setDateAfter(null); // Réinitialiser la date après sélectionnée
    setSelectedUserName(""); // Réinitialiser le nom d'utilisateur sélectionné
    setQuestionReponseFilter(""); // Réinitialiser le filtre question/réponse
    setReluFilter("relu & non_relu"); // Réinitialiser le filtre relu/non relu
    setUtiliseFilter("tous"); // Réinitialiser le filtre utilisé/non utilisé
    route.params?.setFilterSelectedQuestion("");
  };

  const handleAnswerMove = async (data) => {
    console.log("Drag end initiated with data:", data);
    setAnswers(data);

    // Utilisez draggedAnswer pour trouver la réponse déplacée
    const movedAnswer = draggedAnswer;
    console.log("movedAnswer:", movedAnswer);

    if (movedAnswer) {
      const newIndex = data.findIndex((answer) => answer.id === movedAnswer.id);
      const answerBefore = newIndex > 0 ? data[newIndex - 1] : null;
      const answerAfter =
        newIndex < data.length - 1 ? data[newIndex + 1] : null;

      let newRank;
      if (answerBefore && answerAfter) {
        newRank = (answerBefore.rank + answerAfter.rank) / 2;
      } else if (answerBefore) {
        newRank = answerBefore.rank + 1; // Si pas de answerAfter
      } else if (answerAfter) {
        newRank = answerAfter.rank - 1; // Si pas de answerBefore
      } else {
        newRank = 1; // Default value if there are no answers before or after
      }

      if (newRank != 1) {
        await moveAnswer(movedAnswer.id, newRank);
        refreshAnswers();
      }
    }
  };

  const handleShowDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleDeleteAnswer = async (answerToDelete) => {
    if (!answerToDelete) {
      Alert.alert("Erreur", "La réponse n'a pas été trouvée.");
      return;
    }

    try {
      const result = await deleteMemories_Answer(answerToDelete);
      if (result.success) {
        const updatedAnswers = answers.filter(
          (ans) => ans.id !== answerToDelete
        );
        setAnswers(updatedAnswers);
        Alert.alert("Réponse supprimée");
      } else {
        Alert.alert("Erreur", "La suppression de la réponse a échoué");
      }
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
    refreshAnswers();
  };

  // Créer une liste d'IDs de questions pour le chapitre sélectionné
  const [questionIdsForSelectedChapter, setQuestionIdsForSelectedChapter] =
    useState([]);

  useEffect(() => {
    // Vérifier si un chapitre est sélectionné
    if (selectedChapter) {
      // Filtrer les questions pour ne garder que celles appartenant au chapitre sélectionné
      const filteredQuestions = questions.filter(
        (q) => q.id_chapitre === selectedChapter
      );
      // Extraire les IDs des questions filtrées et les convertir en chaînes de caractères
      const ids = filteredQuestions.map((q) => q.id.toString());
      setQuestionIdsForSelectedChapter(ids);
    } else {
      setQuestionIdsForSelectedChapter("");
    }
  }, [selectedChapter, questions]);

  /*
useEffect(() => {

  if(selectedTheme!=route.params?.theme &&route.params?.setTheme ) {

      route.params?.setTheme(selectedTheme)

  }

}, [selectedTheme]);

*/

  useEffect(() => {
    if (
      route.params?.theme?.id &&
      selectedTheme != route.params?.theme?.id &&
      route.params?.setTheme
    ) {
      setSelectedTheme(route.params?.theme.id);
    }
  }, [route.params?.theme]);

  useEffect(() => {
    const updateFilteredAnswers = () => {
      const filtered = answers.filter((answer) => {
        const answerDate = new Date(answer.created_at);
        const beforeDate = dateBefore ? new Date(dateBefore) : null;
        const afterDate = dateAfter ? new Date(dateAfter) : null;

        const userName = userNames[answer.id_user];
        const theme = answer.id_connection;

        return (
          answer.id.toString() === route.params?.reference ||
          (!route.params?.reference &&
            (!route.params?.reference ||
              answer.id.toString() === route.params.reference) &&
            (!textFilter || answer.answer.includes(textFilter)) &&
            (!beforeDate || answerDate < beforeDate) &&
            (!afterDate || answerDate > afterDate) &&
            (!route.params?.filterSelectedQuestion ||
              (route.params?.filterSelectedQuestion === "none" &&
                answer.id_question === null) ||
              (answer.id_question !== null &&
                route.params?.filterSelectedQuestion?.id?.toString() ===
                  answer.id_question.toString())) &&
            (!selectedUserName ||
              (userName &&
                userName
                  .toLowerCase()
                  .includes(selectedUserName.toLowerCase()))) &&
            (!selectedTheme || (theme && theme === selectedTheme)) &&
            (questionReponseFilter === "" ||
              answer.question_reponse === questionReponseFilter) &&
            ((reluFilter === "relu" && answer.quality) ||
              (reluFilter === "non_relu" && !answer.quality) ||
              reluFilter === "relu & non_relu") &&
            ((utiliseFilter === "used" && answer.used) ||
              (utiliseFilter === "not_used" && !answer.used) ||
              utiliseFilter === "tous") &&
            (imageFilter || (!imageFilter && !answer.image)) &&
            (audioFilter || (!audioFilter && !answer.audio)) &&
            (commentFilter ||
              (!commentFilter && (answer.audio || answer.image))))
        );
      });

      setFilteredAnswers(filtered);
    };

    updateFilteredAnswers();
  }, [
    textFilter,
    route.params?.filterSelectedQuestion,
    route.params?.reference,
    selectedTheme,
    dateBefore,
    dateAfter,
    selectedUserName,
    questionReponseFilter,
    reluFilter,
    utiliseFilter,
    answers,
    userNames,
    themes,
    imageFilter,
    audioFilter,
    commentFilter,
    sort,
  ]);

  const selection = () => {
    return (
      <>
        <Text>Mon message sera enregistré au nom de :</Text>
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={delegationUserId.user.id}
            onValueChange={(itemValue) => {
              setDelegationUserId(itemValue);
              setDelegationUserId({ user: { id: itemValue } });
            }}
            style={styles.dropdown}
          >
            {users.map((user) => (
              <Picker.Item
                key={user.id_user}
                label={user.name}
                value={user.id_user}
              />
            ))}
          </Picker>
        </View>

        {selectedAnswerId ? (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "left",
                marginVertical: 30,
              }}
            >
              <Text>Mon message est une réaction à la note suivante : </Text>
              <CheckBox
                value={true}
                onValueChange={() => {
                  setSelectedAnswer(null);
                  setSelectedAnswerId(null);
                }}
              />
            </View>

            <View style={styles.answerCard}>
              <Text>
                {
                  answers.filter((answer) => answer.id === selectedAnswerId)[0]
                    ?.answer
                }
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text>Mon message sera enregistré dans le thème :</Text>
            <View style={styles.dropdownContainer}>
              <Picker
                selectedValue={selectedTheme}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedTheme(itemValue)
                }
                style={styles.dropdown}
              >
                <Picker.Item label="Aucun thème particulier" value="" />
                {themes
                  .filter((theme) =>
                    answers.some((answer) => answer.id_connection === theme.id)
                  ) // Filtrer les thèmes sans réponse
                  .map((theme, index) => (
                    <Picker.Item
                      key={index}
                      label={theme.theme}
                      value={theme.id}
                    />
                  ))}
              </Picker>
            </View>

            <Text>Mon message sera enregistré dans le chapitre :</Text>
            <View style={styles.dropdownContainer}>
              <Picker
                selectedValue={route.params?.filterSelectedQuestion}
                onValueChange={(itemValue, itemIndex) => {
                  const itemValueNumber = Number(itemValue); // Convertir itemValue en nombre
                  const selectedQuestion_temp = questions.find(
                    (question) => question.id === itemValueNumber
                  );

                  if (selectedQuestion_temp) {
                    route.params?.setFilterSelectedQuestion(
                      selectedQuestion_temp
                    );
                  } else {
                    route.params?.setFilterSelectedQuestion("");
                  }
                }}
                style={styles.dropdown}
              >
                <Picker.Item label="Aucun chapitre particulier" value="" />
                {questions.map((question, index) => (
                  <Picker.Item
                    key={index}
                    label={question.question}
                    value={question.id}
                  />
                ))}
              </Picker>
            </View>
          </>
        )}
      </>
    );
  };

  const handleSaveNote = async () => {
    const audio = isRecording ? `${Date.now()}.mp3` : null;
    if (audio) {
      const uploadedFileName = await uploadAudioToSupabase(recording, audio);
      if (!uploadedFileName) {
        Alert.alert("Erreur", "Échec du téléchargement du fichier audio");
        return;
      }
    }

    await submitMemories_Answer(
      note,
      null,
      delegationUserId,
      !!audio,
      audio,
      null,
      resetAnswerAndFetchQuestion,
      answerAndQuestion
    );
    setNote("");
    setModalVisible(false);
    // Rafraîchir les notes
  };

  const handleRecording = async () => {
    if (isRecording) {
      try {
        setIsRecording(false);
        setModalVisible(false);
        setPleaseWait(true);
        const baseName = `${Date.now()}`;
        const { uri, duration } = await stopRecording(
          recording,
          `${baseName}.mp3`
        );

        const maxDuration = 60; // Durée maximale d'un morceau en secondes
        const chunks = Math.ceil(duration / maxDuration);
        const connectionId = uuidv4();

        for (let i = 0; i < chunks; i++) {
          const start = i * maxDuration;
          const end =
            (i + 1) * maxDuration > duration ? duration : (i + 1) * maxDuration;
          const chunkName = `${baseName}_part_${i + 1}.mp3`;

          const chunkUri = await createAudioChunk(uri, chunkName, start, end);
          await handleAnswerSubmit(
            chunkName,
            true,
            chunkUri,
            false,
            connectionId
          );
        }
      } catch (error) {
        console.error("Error during handleRecording:", error);
      } finally {
        setPleaseWait(false);
      }
    } else {
      const temp = await startRecording();
      setRecording(temp);
      setIsRecording(true);
    }
  };

  const handleUpdateAnswer = async (answerId, newText) => {
    try {
      const result = await update_answer_text(answerId, newText);
      await refreshAnswers();
      setEditingAnswerId(null);
      setEditingText("");
    } catch (error) {
      Alert.alert("Erreur lors de la mise à jour", error.message);
    }
  };

  const handleTranscribe = async (answerId) => {
    const answerToUpdate = answers.find((ans) => ans.id === answerId);
    if (answerToUpdate && answerToUpdate.audio) {
      try {
        const transcribedText = await transcribeAudio(
          answerToUpdate.link_storage
        );
        await update_answer_text(answerToUpdate.id, transcribedText);
        setTimeout(async () => {
          await refreshAnswers();
        }, 1000);
      } catch (error) {
        Alert.alert("Erreur de transcription", error.message);
      }
    }
  };

  const linkAnswers = async () => {
    await connectAnswers(selectedAnswers);
    setSelectedAnswers([]);
    await refreshAnswers();
  };

  const handleAnswerSubmit = async (
    name,
    isMedia,
    uri = null,
    isImage = false,
    connectionID = null
  ) => {
    let transcribedText = isMedia ? "audio à convertir en texte" : answer;
    if (isImage) {
      transcribedText = "Ceci est une photographie";
    }

    if (isMedia && uri) {
      let uploadedFileName;
      if (name.endsWith(".mp3")) {
        uploadedFileName = await uploadAudioToSupabase(uri, name);
      } else {
        uploadedFileName = await uploadImageToSupabase(uri, name);
      }

      if (!uploadedFileName) {
        Alert.alert(
          "Erreur",
          `Échec du téléchargement du fichier ${
            name.endsWith(".mp3") ? "audio" : "image"
          }`
        );
        return;
      }
    }

    await submitMemories_Answer(
      transcribedText,
      route.params.miscState?.question?.id,
      delegationUserId,
      isMedia,
      name,
      isImage,
      connectionID,
      async () => {
        setAnswer("");
        setTimeout(async () => {
          await refreshAnswers();
        }, 1000);
      },
      answerAndQuestion
    );
  };

  const handleUploadPhoto = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*", // Accepter les fichiers image
        copyToCacheDirectory: false,
      });

      if (!result.canceled) {
        let uri, name, mimeType;

        // Gérer les différences de plateforme
        if (result.output && result.output.length > 0) {
          const file = result.output[0];

          uri = URL.createObjectURL(file);
          name = file.name;
          mimeType = file.type;
        } else if (result.assets && result.assets.length > 0) {
          console.log("Using result.assets");
          const asset = result.assets[0];
          console.log("Selected asset: ", asset);
          uri = asset.uri;
          name = asset.name;
          mimeType = asset.mimeType;
        } else {
          console.error("Invalid file selection result", result);
          throw new Error("Invalid file selection result");
        }

        if (!uri || !name) {
          console.error("Invalid file selection: URI or name is missing", {
            uri,
            name,
          });
          throw new Error("Invalid file selection: URI or name is missing");
        }

        // Vérification du type MIME
        if (mimeType && mimeType.startsWith("image/")) {
          console.log("File selected is an image file:", {
            uri,
            name,
            mimeType,
          });
        } else {
          console.error("Selected file is not an image file:", {
            uri,
            name,
            mimeType,
          });
          Alert.alert(
            "Erreur",
            "Le fichier sélectionné n'est pas un fichier image"
          );
          return;
        }

        console.log("File selected successfully:", { uri, name });
        await handleAnswerSubmit(name, true, uri, true);
      } else {
        console.error("File selection was not successful: ", result);
        Alert.alert("Erreur", "Sélection du fichier échouée");
      }
    } catch (error) {
      console.error("Error handling file upload: ", error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de la sélection du fichier"
      );
    }
  };

  const handleFiles = async () => {
    setShowAttachement(!showAttachement);
  };

  const getAudioDuration = (uri) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(uri);
      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration);
      });
      audio.addEventListener("error", (e) => {
        reject(e);
      });
    });
  };

  const handleCaptionClick = (answerId) => {
    setAnswerIdToTranscribe(answerId);
    setIsTranscriptionModalVisible(true);
  };

  const handleConfirmTranscription = async () => {
    if (answerIdToTranscribe) {
      setTranscribingId(answerIdToTranscribe);
      await update_answer_text(
        answerIdToTranscribe,
        "audio pas encore converti en texte"
      );
      await refreshAnswers();
      setTranscribingId(null);
      setIsTranscriptionModalVisible(false);
      setAnswerIdToTranscribe(null);
    }
  };

  const handleUploadAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: false,
      });

      if (!result.canceled) {
        let uri, name, mimeType;

        if (result.output && result.output.length > 0) {
          const file = result.output[0];
          uri = URL.createObjectURL(file);
          name = file.name;
          mimeType = file.type;
        } else if (result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          uri = asset.uri;
          name = asset.name;
          mimeType = asset.mimeType;
        } else {
          throw new Error("Invalid file selection result");
        }

        if (!uri || !name) {
          throw new Error("Invalid file selection: URI or name is missing");
        }

        console.log("Selected audio URI:", uri);
        if (mimeType && mimeType.startsWith("audio/")) {
          try {
            const duration = await getAudioDuration(uri); // Modifié pour récupérer directement la durée
            console.log("Audio duration:", duration);
            const maxDuration = 60; // Durée maximale d'un morceau en secondes
            const chunks = Math.ceil(duration / maxDuration);
            const connectionId = uuidv4();

            for (let i = 0; i < chunks; i++) {
              const start = i * maxDuration;
              const end =
                (i + 1) * maxDuration > duration
                  ? duration
                  : (i + 1) * maxDuration;
              const chunkName = `${name}_part_${i + 1}.mp3`;

              console.log(
                `Creating chunk: ${chunkName} from ${start} to ${end}`
              );
              const chunkUri = await createAudioChunk(
                uri,
                chunkName,
                start,
                end
              );

              if (chunkUri) {
                console.log(`Uploading chunk: ${chunkName}`);
                await handleAnswerSubmit(
                  chunkName,
                  true,
                  chunkUri,
                  false,
                  connectionId
                );
              } else {
                console.error(`Failed to create chunk: ${chunkName}`);
              }
            }
          } catch (e) {
            console.error("Error getting audio duration:", e);
            Alert.alert("Erreur", "Impossible d'obtenir la durée de l'audio");
          }
        } else {
          Alert.alert(
            "Erreur",
            "Le fichier sélectionné n'est pas un fichier audio"
          );
        }
      } else {
        Alert.alert("Erreur", "Sélection du fichier échouée");
      }
    } catch (error) {
      console.error("Error during file selection or processing:", error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de la sélection du fichier"
      );
    }
  };

  const isConnectedToSelectedAnswer = (answer) => {
    const selectedConnections = selectedAnswers
      .map((id) => {
        const selectedAnswer = answers.find((ans) => ans.id === id);
        return selectedAnswer ? selectedAnswer.connection : null;
      })
      .filter((conn) => conn !== null);

    return selectedConnections.includes(answer.connection);
  };
  useEffect(() => {
    answers.forEach((answer) => {
      if (
        answer.answer === "audio pas encore converti en texte" &&
        answer.audio
      ) {
        handleTranscribe(answer.id);
      }
    });
  }, [answers]);
  const closeFullscreenImage = () => {
    setFullscreenImage(null);
  };

  if (isLoading) {
    return <Text>Loading</Text>;
  }

  return (
    <View
      style={[
        globalStyles.container,
        { width: "100%", paddingHorizontal: isLargeScreen ? "10" : "0" },
      ]}
    >
      {/*}
      {fullscreenImage && (
  <View style={styles.fullscreenContainer}>
    <TouchableOpacity style={styles.closeButton} onPress={closeFullscreenImage}>
      <Text style={styles.closeButtonText}>X</Text>
    </TouchableOpacity>
    <Image source={{ uri: fullscreenImage }} style={styles.fullscreenImage} />
  </View>
)}

*/}

      {statut === "Lire" && <Text style={globalStyles.title}>Notes</Text>}

      {(statut === "Rédiger" || statut === "Relire") && (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={globalStyles.title}>
              {!questionReponseFilter.includes("question") && "Notes"}
              {!questionReponseFilter.includes("question") &&
                !questionReponseFilter.includes("réponse") &&
                " & "}
              {!questionReponseFilter.includes("réponse") && "Questions"}
            </Text>

            {statut != "Rédiger" && (
              <View
                style={[
                  styles.toggleTextContainer,
                  { flexDirection: "column", justifyContent: "center" },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text style={styles.toggleText}>Notes </Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      !questionReponseFilter.includes("question") &&
                        styles.selectedToggle,
                    ]}
                    onPress={() =>
                      setQuestionReponseFilter((prev) =>
                        prev.includes("question")
                          ? prev.replace("question", "")
                          : prev + "question"
                      )
                    }
                  >
                    <View
                      style={[
                        styles.toggleButtonCircle,
                        questionReponseFilter.includes("question")
                          ? { left: 2 }
                          : { right: 2 },
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.toggleText}>Questions</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      !questionReponseFilter.includes("réponse") &&
                        styles.selectedToggle,
                    ]}
                    onPress={() =>
                      setQuestionReponseFilter((prev) =>
                        prev.includes("réponse")
                          ? prev.replace("réponse", "")
                          : prev + "réponse"
                      )
                    }
                  >
                    <View
                      style={[
                        styles.toggleButtonCircle,
                        questionReponseFilter.includes("réponse")
                          ? { left: 2 }
                          : { right: 2 },
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 5,
        }}
      >
        {statut != "Lire" && statut != "Raconter" && statut != "Réagir" && (
          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
            }}
            style={globalStyles.globalButton_wide}
          >
            <Text style={globalStyles.globalButtonText}>
              {statut === "Rédiger" ? "Ajouter une note" : "Contribuer"}
            </Text>
          </TouchableOpacity>
        )}

        {statut === "Réagir" && (
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text style={globalStyles.title}>
              Choississez une note existante sur laquelle vous souhaitez réagir.
            </Text>
            <Text>
              Utilisez pour celà les boutons de filtre et de tri ci-dessous puis
              cliquez de manière continue sur la note choisie.
            </Text>
          </View>
        )}

        {statut === "Raconter" && (
          <>
            <View
              style={{
                flexDirection: isLargeScreen ? "row" : "column",
                justifyContent: "space-between",
                margin: 0,
                flexWrap: "wrap",
                zIndex: 100,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false), setModalAnswer_oral_Visible(true);
                }}
                style={{
                  backgroundColor: "#0b2d52",
                  padding: 10,
                  margin: 10,
                  borderRadius: 10,
                  maxWidth: isLargeScreen
                    ? windowWidth * 0.17
                    : windowWidth * 0.8,
                }}
              >
                <Text style={[globalStyles.globalButtonText, { fontSize: 22 }]}>
                  Enregistrer un message vocal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false), setModalAnswer_written_Visible(true);
                }}
                style={{
                  backgroundColor: "#0b2d52",
                  padding: 10,
                  margin: 10,
                  borderRadius: 10,
                  maxWidth: isLargeScreen
                    ? windowWidth * 0.17
                    : windowWidth * 0.8,
                }}
              >
                <Text style={[globalStyles.globalButtonText, { fontSize: 22 }]}>
                  Enregistrer un message écrit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false), setModalAnswer_audio_Visible(true);
                }}
                style={{
                  backgroundColor: "#0b2d52",
                  padding: 10,
                  margin: 10,
                  borderRadius: 10,
                  maxWidth: isLargeScreen
                    ? windowWidth * 0.17
                    : windowWidth * 0.8,
                }}
              >
                <Text style={[globalStyles.globalButtonText, { fontSize: 22 }]}>
                  Envoyer un fichier audio
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false), setModalAnswer_image_Visible(true);
                }}
                style={{
                  backgroundColor: "#0b2d52",
                  padding: 10,
                  margin: 10,
                  borderRadius: 10,
                  maxWidth: isLargeScreen
                    ? windowWidth * 0.17
                    : windowWidth * 0.8,
                }}
              >
                <Text style={[globalStyles.globalButtonText, { fontSize: 22 }]}>
                  Envoyer une photo ou document manuscrit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false), setModalAnswer_document_Visible(true);
                }}
                style={{
                  backgroundColor: "#0b2d52",
                  padding: 10,
                  margin: 10,
                  borderRadius: 10,
                  maxWidth: isLargeScreen
                    ? windowWidth * 0.17
                    : windowWidth * 0.8,
                }}
              >
                <Text style={[globalStyles.globalButtonText, { fontSize: 22 }]}>
                  Envoyer un document dactylographié
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <Modal isVisible={isModalVisible}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Image source={closeIcon} style={styles.closeIcon} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { marginBottom: 30 }]}>
              Ajouter une contribution
            </Text>

            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false), setModalQuestion_Visible(true);
                }}
                style={globalStyles.globalButton_wide}
              >
                <Text style={globalStyles.globalButtonText}>
                  Poser une question
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false), setModalAnswer_oral_Visible(true);
                }}
                style={globalStyles.globalButton_wide}
              >
                <Text style={globalStyles.globalButtonText}>
                  Enregistrer un message vocal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false), setModalAnswer_written_Visible(true);
                }}
                style={globalStyles.globalButton_wide}
              >
                <Text style={globalStyles.globalButtonText}>
                  Enregistrer un message écrit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false), setModalAnswer_audio_Visible(true);
                }}
                style={globalStyles.globalButton_wide}
              >
                <Text style={globalStyles.globalButtonText}>
                  Envoyer un fichier audio
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false), setModalAnswer_image_Visible(true);
                }}
                style={globalStyles.globalButton_wide}
              >
                <Text style={globalStyles.globalButtonText}>
                  Envoyer une photo ou document manuscrit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false), setModalAnswer_document_Visible(true);
                }}
                style={globalStyles.globalButton_wide}
              >
                <Text style={globalStyles.globalButtonText}>
                  Envoyer un document dactylographié
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal isVisible={isModalAnswer_oral_Visible}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setModalAnswer_oral_Visible(false)}
              style={styles.closeButton}
            >
              <Image source={closeIcon} style={styles.closeIcon} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ajouter une contribution</Text>

            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              {selection()}

              <AnswerPanel_oral
                ID_USER={
                  delegationUserId.user.id
                    ? delegationUserId.user.id
                    : session.user.id
                }
                Id_question={
                  route.params?.filterSelectedQuestion === ""
                    ? null
                    : route.params?.filterSelectedQuestion
                }
                Id_connection={selectedTheme === "" ? null : selectedTheme}
                question_reponse={"réponse"}
                refreshAnswers={() => {
                  refreshAnswers();
                  setModalAnswer_oral_Visible(false);
                }}
                id_answer_source={selectedAnswerId}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal isVisible={isModalAnswer_written_Visible}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setModalAnswer_written_Visible(false)}
              style={styles.closeButton}
            >
              <Image source={closeIcon} style={styles.closeIcon} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ajouter une contribution</Text>

            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              {selection()}

              <View
                style={{
                  padding: 10,
                  marginBottom: 10,
                  width: "90%",
                  alignSelf: "center",
                }}
              >
                <AnswerPanel_written
                  ID_USER={
                    delegationUserId.user.id
                      ? delegationUserId.user.id
                      : session.user.id
                  }
                  Id_question={
                    route.params?.filterSelectedQuestion === ""
                      ? null
                      : route.params?.filterSelectedQuestion
                  }
                  Id_connection={selectedTheme === "" ? null : selectedTheme}
                  question_reponse={"réponse"}
                  refreshAnswers={() => {
                    refreshAnswers();
                    setModalAnswer_written_Visible(false);
                  }}
                  id_answer_source={selectedAnswerId}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal isVisible={isModalQuestion_Visible}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setModalQuestion_Visible(false)}
              style={styles.closeButton}
            >
              <Image source={closeIcon} style={styles.closeIcon} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ajouter une contribution</Text>

            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              {selection()}

              <View
                style={{
                  padding: 10,
                  marginBottom: 10,
                  width: "90%",
                  alignSelf: "center",
                }}
              >
                <AnswerPanel_written
                  ID_USER={
                    delegationUserId.user.id
                      ? delegationUserId.user.id
                      : session.user.id
                  }
                  Id_question={
                    route.params?.filterSelectedQuestion === ""
                      ? null
                      : route.params?.filterSelectedQuestion
                  }
                  Id_connection={selectedTheme === "" ? null : selectedTheme}
                  question_reponse={"question"}
                  refreshAnswers={() => {
                    refreshAnswers();
                    setModalQuestion_Visible(false);
                  }}
                  id_answer_source={selectedAnswerId}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal isVisible={isModalAnswer_audio_Visible}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setModalAnswer_audio_Visible(false)}
              style={styles.closeButton}
            >
              <Image source={closeIcon} style={styles.closeIcon} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ajouter une contribution</Text>

            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              {selection()}

              <AnswerPanel_AudioFile
                ID_USER={
                  delegationUserId.user.id
                    ? delegationUserId.user.id
                    : session.user.id
                }
                Id_question={
                  route.params?.filterSelectedQuestion === ""
                    ? null
                    : route.params?.filterSelectedQuestion
                }
                Id_connection={selectedTheme === "" ? null : selectedTheme}
                question_reponse={"réponse"}
                refreshAnswers={() => {
                  refreshAnswers();
                  setModalAnswer_audio_Visible(false);
                }}
                id_answer_source={selectedAnswerId}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal isVisible={isModalAnswer_image_Visible}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setModalAnswer_image_Visible(false)}
              style={styles.closeButton}
            >
              <Image source={closeIcon} style={styles.closeIcon} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ajouter une contribution</Text>

            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              {selection()}

              <AnswerPanel_imageFile
                ID_USER={
                  delegationUserId.user.id
                    ? delegationUserId.user.id
                    : session.user.id
                }
                Id_question={
                  route.params?.filterSelectedQuestion === ""
                    ? null
                    : route.params?.filterSelectedQuestion
                }
                Id_connection={selectedTheme === "" ? null : selectedTheme}
                question_reponse={"réponse"}
                refreshAnswers={() => {
                  refreshAnswers();
                  setModalAnswer_image_Visible(false);
                }}
                id_answer_source={selectedAnswerId}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal isVisible={isModalAnswer_document_Visible}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setModalAnswer_document_Visible(false)}
              style={styles.closeButton}
            >
              <Image source={closeIcon} style={styles.closeIcon} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ajouter une contribution</Text>

            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              {selection()}

              <AnswerPanel_documentFile
                ID_USER={
                  delegationUserId.user.id
                    ? delegationUserId.user.id
                    : session.user.id
                }
                Id_question={
                  route.params?.filterSelectedQuestion === ""
                    ? null
                    : route.params?.filterSelectedQuestion
                }
                Id_connection={selectedTheme === "" ? null : selectedTheme}
                question_reponse={"réponse"}
                refreshAnswers={() => {
                  refreshAnswers();
                  setModalAnswer_document_Visible(false);
                }}
                id_answer_source={selectedAnswerId}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal isVisible={isTranscriptionModalVisible}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setIsTranscriptionModalVisible(false)}
              style={styles.closeButton}
            >
              <Image source={closeIcon} style={styles.closeIcon} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Confirmation de retranscription
            </Text>
            <Text style={styles.modalText}>
              Voulez-vous vraiment retranscrire ce message audio ? Le texte
              existant sera alors effacé et remplacé par la nouvelle
              retranscription.
            </Text>
            <TouchableOpacity
              onPress={handleConfirmTranscription}
              style={globalStyles.globalButton_wide}
            >
              <Text style={globalStyles.globalButtonText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal isVisible={isModalImageVisible}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setModalImageVisible(null)}
              style={styles.closeButton}
            >
              <Image source={closeIcon} style={styles.closeIcon} />
            </TouchableOpacity>

            <Image
              source={{ uri: fullscreenImage }}
              style={styles.fullscreenImage}
            />
          </View>
        </View>
      </Modal>

      {!showExistingNotes && statut == "Raconter" && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 5,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowExistingNotes(true)}
            style={styles.filterIcon}
          >
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                marginHorizontal: 10,
              }}
            >
              <Text> </Text>
              {isLargeScreen && (
                <Text style={globalStyles.textStyle}>
                  Afficher les notes existantes sur ce thème
                </Text>
              )}
              <Image
                source={plusIcon}
                style={{
                  width: 100,
                  height: 100,
                  opacity: 0.5,
                  marginVertical: 30,
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {(showExistingNotes || statut != "Raconter") && (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginVertical: 20,
            }}
          >
            <Text> </Text>
            {statut === "Raconter" && (
              <>
                <TouchableOpacity
                  onPress={() => setShowExistingNotes(false)}
                  style={[
                    styles.filterIcon,
                    { alignItems: "center", justifyContent: "center" },
                  ]}
                >
                  {isLargeScreen && <Text> Masquer les notes</Text>}
                  <Image
                    source={minusIcon}
                    style={{
                      width: 50,
                      height: 50,
                      opacity: 0.5,
                      marginVertical: 30,
                    }}
                  />
                </TouchableOpacity>
              </>
            )}

            {statut === "Rédiger" && (
              <>
                <TouchableOpacity
                  onPress={() => setShowDetails(!showDetails)}
                  style={styles.filterIcon}
                >
                  {isLargeScreen && (
                    <Text> Afficher / masquer les notes existantes </Text>
                  )}
                  <Image
                    source={showDetails ? minusIcon : plusIcon}
                    style={{
                      width: 50,
                      height: 50,
                      opacity: 0.5,
                      marginVertical: 30,
                    }}
                  />
                </TouchableOpacity>
              </>
            )}
            {(statut === "Rédiger" ||
              statut === "Relire" ||
              statut === "Réagir" ||
              statut === "Relire" ||
              statut === "Raconter") && (
              <>
                <TouchableOpacity
                  onPress={() => setShowFilters(!showFilters)}
                  style={[
                    styles.filterIcon,
                    { alignItems: "center", justifyContent: "center" },
                  ]}
                >
                  {isLargeScreen && <Text> Filtrer les notes affichées </Text>}
                  <Image
                    source={filterIcon}
                    style={{
                      width: 50,
                      height: 50,
                      opacity: 0.5,
                      marginVertical: 30,
                    }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowSorting(!showSorting)}
                  style={[
                    styles.filterIcon,
                    { alignItems: "center", justifyContent: "center" },
                  ]}
                >
                  {isLargeScreen && <Text> Trier les notes affichées </Text>}
                  <Image
                    source={sortIcon}
                    style={{
                      width: 50,
                      height: 50,
                      opacity: 0.5,
                      marginVertical: 30,
                    }}
                  />
                </TouchableOpacity>
              </>
            )}
            {statut === "Rédiger" && (
              <>
                <TouchableOpacity
                  onPress={() => {
                    copyAllToClipboard();
                  }}
                  style={[
                    styles.filterIcon,
                    { alignItems: "center", justifyContent: "center" },
                  ]}
                >
                  {isLargeScreen && <Text> Copier les notes affichées </Text>}
                  <Image
                    source={copyIcon}
                    style={{
                      width: 50,
                      height: 50,
                      opacity: 0.5,
                      marginVertical: 30,
                    }}
                  />
                </TouchableOpacity>
              </>
            )}
            <Text> </Text>
            {/*
  {notesMode !== 'full' &&(
  <TouchableOpacity onPress={() => setIsShareModalVisible(true)} style={styles.filterIcon}>
  <Image source={shareIcon} style={{ width: 50, height: 50, opacity: 0.5, marginVertical : 30 }} />
</TouchableOpacity>
  )}




{showDetails && (
<TouchableOpacity onPress={() => linkAnswers(answers)} style={styles.filterIcon}>
  <Image 
    source={linkIcon} 
    style={{ width: 50, height: 50, opacity: 0.5, marginVertical: 30 }} 
  />
</TouchableOpacity>
)}
*/}
          </View>

          <Modal isVisible={showFilters}>
            <View style={styles.overlay}>
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  onPress={() => setShowFilters(false)}
                  style={styles.closeButton}
                >
                  <Image source={closeIcon} style={styles.closeIcon} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { marginBottom: 30 }]}>
                  Définissez les filtres sur les notes existantes
                </Text>

                {route.params?.reference ? (
                  <View
                    style={{
                      flexDirection: isLargeScreen ? "row" : "column",
                      alignItems: "center",
                      marginTop: 20,
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>Vous avez un filtre sur une question unique</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveFilters()}
                      style={styles.filterIcon}
                    >
                      <Image
                        source={EmptyfilterIcon}
                        style={{
                          width: 50,
                          height: 50,
                          opacity: 0.5,
                          marginVertical: 30,
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View
                      style={{
                        flexDirection: isLargeScreen ? "row" : "column",
                        alignItems: "center",
                        marginTop: 20,
                        justifyContent: "space-between",
                      }}
                    >
                      <Text></Text>
                      {isLargeScreen && (
                        <>
                          <View
                            style={{
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 10,
                              }}
                            >
                              <Text style={styles.toggleText}>Audio</Text>
                              <TouchableOpacity
                                style={[
                                  styles.toggleButton,
                                  audioFilter && styles.selectedToggle,
                                ]}
                                onPress={() => setAudioFilter(!audioFilter)}
                              >
                                <View
                                  style={[
                                    styles.toggleButtonCircle,
                                    audioFilter ? { right: 2 } : { left: 2 },
                                  ]}
                                />
                              </TouchableOpacity>
                            </View>

                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 10,
                              }}
                            >
                              <Text style={styles.toggleText}>Image</Text>
                              <TouchableOpacity
                                style={[
                                  styles.toggleButton,
                                  imageFilter && styles.selectedToggle,
                                ]}
                                onPress={() => setImageFilter(!imageFilter)}
                              >
                                <View
                                  style={[
                                    styles.toggleButtonCircle,
                                    imageFilter ? { right: 2 } : { left: 2 },
                                  ]}
                                />
                              </TouchableOpacity>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 10,
                              }}
                            >
                              <Text style={styles.toggleText}>Texte</Text>
                              <TouchableOpacity
                                style={[
                                  styles.toggleButton,
                                  commentFilter && styles.selectedToggle,
                                ]}
                                onPress={() => setCommentFilter(!commentFilter)}
                              >
                                <View
                                  style={[
                                    styles.toggleButtonCircle,
                                    commentFilter ? { right: 2 } : { left: 2 },
                                  ]}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View
                            style={{
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 10,
                              }}
                            >
                              <Text style={styles.toggleText}> </Text>
                              <Text style={styles.toggleText}>Notes </Text>
                              <TouchableOpacity
                                style={[
                                  styles.toggleButton,
                                  !questionReponseFilter.includes("question") &&
                                    styles.selectedToggle,
                                ]}
                                onPress={() =>
                                  setQuestionReponseFilter((prev) =>
                                    prev.includes("question")
                                      ? prev.replace("question", "")
                                      : prev + "question"
                                  )
                                }
                              >
                                <View
                                  style={[
                                    styles.toggleButtonCircle,
                                    questionReponseFilter.includes("question")
                                      ? { left: 2 }
                                      : { right: 2 },
                                  ]}
                                />
                              </TouchableOpacity>
                            </View>

                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 10,
                              }}
                            >
                              <Text style={styles.toggleText}> </Text>
                              <Text style={styles.toggleText}>Questions</Text>
                              <TouchableOpacity
                                style={[
                                  styles.toggleButton,
                                  !questionReponseFilter.includes("réponse") &&
                                    styles.selectedToggle,
                                ]}
                                onPress={() =>
                                  setQuestionReponseFilter((prev) =>
                                    prev.includes("réponse")
                                      ? prev.replace("réponse", "")
                                      : prev + "réponse"
                                  )
                                }
                              >
                                <View
                                  style={[
                                    styles.toggleButtonCircle,
                                    questionReponseFilter.includes("réponse")
                                      ? { left: 2 }
                                      : { right: 2 },
                                  ]}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View
                            style={{
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 10,
                              }}
                            >
                              <Text style={styles.toggleText}> </Text>
                              <Text style={styles.toggleText}>Relu</Text>
                              <TouchableOpacity
                                style={[
                                  styles.toggleButton,
                                  (reluFilter === "relu" ||
                                    reluFilter === "relu & non_relu") &&
                                    styles.selectedToggle,
                                ]}
                                onPress={() =>
                                  setReluFilter((prev) =>
                                    prev === "relu"
                                      ? ""
                                      : prev === "relu & non_relu"
                                      ? "non_relu"
                                      : prev === "non_relu"
                                      ? "relu & non_relu"
                                      : "relu"
                                  )
                                }
                              >
                                <View
                                  style={[
                                    styles.toggleButtonCircle,
                                    reluFilter === "relu" ||
                                    reluFilter === "relu & non_relu"
                                      ? { right: 2 }
                                      : { left: 2 },
                                  ]}
                                />
                              </TouchableOpacity>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 10,
                              }}
                            >
                              <Text style={styles.toggleText}> </Text>
                              <Text style={styles.toggleText}>Non relu</Text>
                              <TouchableOpacity
                                style={[
                                  styles.toggleButton,
                                  (reluFilter === "non_relu" ||
                                    reluFilter === "relu & non_relu") &&
                                    styles.selectedToggle,
                                ]}
                                onPress={() =>
                                  setReluFilter((prev) =>
                                    prev === "non_relu"
                                      ? ""
                                      : prev === "relu & non_relu"
                                      ? "relu"
                                      : prev === "relu"
                                      ? "relu & non_relu"
                                      : "non_relu"
                                  )
                                }
                              >
                                <View
                                  style={[
                                    styles.toggleButtonCircle,
                                    reluFilter === "non_relu" ||
                                    reluFilter === "relu & non_relu"
                                      ? { right: 2 }
                                      : { left: 2 },
                                  ]}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View
                            style={{
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 10,
                              }}
                            >
                              <Text style={styles.toggleText}> </Text>
                              <Text style={styles.toggleText}>Utilisé</Text>
                              <TouchableOpacity
                                style={[
                                  styles.toggleButton,
                                  (utiliseFilter === "used" ||
                                    utiliseFilter === "tous") &&
                                    styles.selectedToggle,
                                ]}
                                onPress={() =>
                                  setUtiliseFilter((prev) =>
                                    prev === "used"
                                      ? ""
                                      : prev === "tous"
                                      ? "not_used"
                                      : prev === "not_used"
                                      ? "tous"
                                      : "used"
                                  )
                                }
                              >
                                <View
                                  style={[
                                    styles.toggleButtonCircle,
                                    utiliseFilter === "used" ||
                                    utiliseFilter === "tous"
                                      ? { right: 2 }
                                      : { left: 2 },
                                  ]}
                                />
                              </TouchableOpacity>
                            </View>

                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 10,
                              }}
                            >
                              <Text style={styles.toggleText}> </Text>
                              <Text style={styles.toggleText}>Non utilisé</Text>
                              <TouchableOpacity
                                style={[
                                  styles.toggleButton,
                                  (utiliseFilter === "not_used" ||
                                    utiliseFilter === "tous") &&
                                    styles.selectedToggle,
                                ]}
                                onPress={() =>
                                  setUtiliseFilter((prev) =>
                                    prev === "not_used"
                                      ? ""
                                      : prev === "tous"
                                      ? "used"
                                      : prev === "used"
                                      ? "tous"
                                      : "not_used"
                                  )
                                }
                              >
                                <View
                                  style={[
                                    styles.toggleButtonCircle,
                                    utiliseFilter === "not_used" ||
                                    utiliseFilter === "tous"
                                      ? { right: 2 }
                                      : { left: 2 },
                                  ]}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                          <Text style={styles.toggleText}> </Text>
                          <View
                            style={{
                              flexDirection: "column",
                              alignItems: "center",
                              zIndex: 2000,
                            }}
                          >
                            {Platform.OS === "web" ? (
                              <DatePicker
                                selected={dateBefore}
                                onChange={(date) => setDateBefore(date)}
                                placeholderText="Filtrer avant la date"
                                className="date-picker"
                                style={[
                                  styles.datePicker,
                                  { marginVertical: 10 },
                                ]}
                              />
                            ) : (
                              <View
                                style={[
                                  styles.datePicker,
                                  { marginVertical: 10 },
                                ]}
                              >
                                <Button
                                  title="Filtrer avant la date"
                                  onPress={() => setShowDateBeforePicker(true)}
                                />
                                {showDateBeforePicker && (
                                  <DateTimePicker
                                    value={dateBefore || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                      const currentDate =
                                        selectedDate || dateBefore;
                                      setShowDateBeforePicker(false);
                                      setDateBefore(currentDate);
                                    }}
                                    style={[
                                      styles.datePicker,
                                      { marginVertical: 10 },
                                    ]}
                                  />
                                )}
                              </View>
                            )}
                            <Text style={styles.toggleText}> </Text>
                            {Platform.OS === "web" ? (
                              <DatePicker
                                selected={dateAfter}
                                onChange={(date) => setDateAfter(date)}
                                placeholderText="Filtrer après la date"
                                className="date-picker"
                                style={[
                                  styles.datePicker,
                                  { marginVertical: 10 },
                                ]}
                              />
                            ) : (
                              <View
                                style={[
                                  styles.datePicker,
                                  { marginVertical: 10 },
                                ]}
                              >
                                <Button
                                  title="Filtrer après la date"
                                  onPress={() => setShowDateAfterPicker(true)}
                                />
                                {showDateAfterPicker && (
                                  <DateTimePicker
                                    value={dateAfter || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                      const currentDate =
                                        selectedDate || dateAfter;
                                      setShowDateAfterPicker(false);
                                      setDateAfter(currentDate);
                                    }}
                                    style={[
                                      styles.datePicker,
                                      { marginVertical: 10 },
                                    ]}
                                  />
                                )}
                              </View>
                            )}
                          </View>
                        </>
                      )}
                      <Text style={styles.toggleText}> </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveFilters()}
                        style={styles.filterIcon}
                      >
                        <Image
                          source={EmptyfilterIcon}
                          style={{
                            width: 50,
                            height: 50,
                            opacity: 0.5,
                            marginVertical: 30,
                          }}
                        />
                      </TouchableOpacity>
                      <Text></Text>
                    </View>

                    <TextInput
                      style={[styles.input, { backgroundColor: "white" }]}
                      placeholder="Filtrer par texte"
                      value={textFilter}
                      onChangeText={setTextFilter}
                    />
                    <View style={styles.dropdownContainer}>
                      <Picker
                        selectedValue={selectedUserName}
                        onValueChange={(itemValue, itemIndex) =>
                          setSelectedUserName(itemValue)
                        }
                        style={styles.dropdown}
                      >
                        <Picker.Item label="Tous les utilisateurs" value="" />
                        {Object.values(userNames).map((name, index) => (
                          <Picker.Item key={index} label={name} value={name} />
                        ))}
                      </Picker>
                    </View>
                    <View style={styles.dropdownContainer}>
                      <Picker
                        selectedValue={selectedTheme}
                        onValueChange={(itemValue, itemIndex) =>
                          setSelectedTheme(itemValue)
                        }
                        style={styles.dropdown}
                      >
                        <Picker.Item label="Tous les thèmes" value="" />
                        {themes
                          .filter((theme) =>
                            answers.some(
                              (answer) => answer.id_connection === theme.id
                            )
                          ) // Filtrer les thèmes sans réponse
                          .map((theme, index) => (
                            <Picker.Item
                              key={index}
                              label={theme.theme}
                              value={theme.id}
                            />
                          ))}
                      </Picker>
                    </View>
                    <View style={styles.dropdownContainer}>
                      <Picker
                        selectedValue={route.params?.filterSelectedQuestion}
                        onValueChange={(itemValue, itemIndex) => {
                          const itemValueNumber = Number(itemValue); // Convertir itemValue en nombre
                          const selectedQuestion_temp = questions.find(
                            (question) => question.id === itemValueNumber
                          );

                          if (selectedQuestion_temp) {
                            route.params?.setFilterSelectedQuestion(
                              selectedQuestion_temp
                            );
                          } else {
                            route.params?.setFilterSelectedQuestion(null);
                          }
                        }}
                        style={styles.dropdown}
                      >
                        <Picker.Item label="Tous les chapitres" value="" />
                        {questions
                          .filter((question) =>
                            answers.some(
                              (answer) => answer.id_question === question.id
                            )
                          ) // Filtrer les thèmes sans réponse
                          .map((question, index) => (
                            <Picker.Item
                              key={index}
                              label={question.question}
                              value={question.id}
                            />
                          ))}
                      </Picker>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
          <Modal isVisible={showSorting}>
            <View style={styles.overlay}>
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  onPress={() => setShowSorting(false)}
                  style={styles.closeButton}
                >
                  <Image source={closeIcon} style={styles.closeIcon} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { marginBottom: 30 }]}>
                  Définissez l'ordre d'affichage des notes existantes
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    {
                      sortAnswerByDate("normal");
                      setSort("date_normal");
                    }
                  }}
                  style={globalStyles.globalButton_wide}
                >
                  <Text style={globalStyles.globalButtonText}>
                    Trier par date du plus récent au plus ancien
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    {
                      sortAnswerByDate("inverse");
                      setSort("date_inverse");
                    }
                  }}
                  style={globalStyles.globalButton_wide}
                >
                  <Text style={globalStyles.globalButtonText}>
                    Trier par date du plus ancien au plus récent
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    {
                      sortAnswerNormal("normal");
                      setSort("ordre_normal");
                    }
                  }}
                  style={globalStyles.globalButton_wide}
                >
                  <Text style={globalStyles.globalButtonText}>
                    Trier par ordre défini par les utilisateurs{" "}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    {
                      sortAnswerNormal("inverse");
                      setSort("ordre_inverse");
                    }
                  }}
                  style={globalStyles.globalButton_wide}
                >
                  <Text style={globalStyles.globalButtonText}>
                    Trier par ordre inverse défini par les utilisateurs{" "}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <DraggableFlatList
            data={filteredAnswers}
            renderItem={({ item, drag, isActive }) => {
              const isSelected = selectedAnswerIds.includes(item.id); // Vérifier si la réponse est sélectionnée
              const question_temp = questions.find(
                (q) => q.id === item.id_question
              );
              let chapter;
              if (question_temp) {
                chapter = chapters.find(
                  (q) => q.id === question_temp.id_chapitre
                );
              }
              return (
                /*
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                */
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.answerCard,
                    selectedAnswerId === item.id && styles.selectedAnswerCard,
                    //isActive && styles.selectedAnswerCard,
                    selectedAnswerId &&
                      selectedAnswerId === item.id_answer_source &&
                      styles.connectedAnswerCard,

                    /*
                        {
                        maxWidth:
                          isLargeScreen && statut == "Réagir"
                            ? windowWidth * 1
                            : windowWidth * 1,
                      },
                      */
                  ]}
                  onLongPress={() => {
                    setSelectedAnswer(item);
                    setSelectedAnswerId(item.id);
                    drag();
                  }}
                  onPress={() => {
                    setSelectedAnswerId(item.id);
                    setSelectedAnswer(item);
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {/*
        {showDetails && (
          <CheckBox
            value={isSelected}
            onValueChange={(newValue) => {
              if (newValue) {
                setSelectedAnswerIds([...selectedAnswerIds, item.id]);
              } else {
                setSelectedAnswerIds(selectedAnswerIds.filter(id => id !== item.id));
              }
            }}
          />
        )}
        */}
                    <View style={{ flex: 1 }}>
                      {(showDetails || selectedAnswerId === item.id) && (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 20,
                          }}
                        >
                          <Text style={{ fontWeight: "bold" }}>
                            {new Date(item.created_at).toLocaleDateString()}{" "}
                            {new Date(item.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                          {isLargeScreen && (
                            <Text style={{ fontWeight: "bold" }}>
                              {chapter ? chapter.title + " - " : ""}{" "}
                              {question_temp ? question_temp.question : ""}
                            </Text>
                          )}
                          {route.params?.filterSelectedQuestion !==
                            route.params.miscState?.question && (
                            <TouchableOpacity
                              onPress={() => {
                                updateAnswer(
                                  item.id,
                                  "id_question",
                                  route.params.miscState?.question.id
                                );
                                refreshAnswers();
                              }}
                            >
                              <View style={{ flexDirection: "row" }}>
                                {isLargeScreen && (
                                  <Text>Joindre {"\n"} au chapitre</Text>
                                )}

                                <Image
                                  source={linkIcon}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    opacity: 0.5,
                                  }}
                                />
                              </View>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                      {item.id === editingAnswerId ? (
                        <>
                          <TextInput
                            style={globalStyles.input}
                            value={editingText}
                            onChangeText={setEditingText}
                            multiline={true}
                            numberOfLines={10}
                          />
                          <TouchableOpacity
                            onPress={() =>
                              handleUpdateAnswer(item.id, editingText)
                            }
                            style={[
                              globalStyles.globalButton_wide,
                              {
                                backgroundColor: "#b1b3b5",
                                alignItems: "center",
                                paddingVertical: 10,
                                marginRight: 5,
                              },
                            ]}
                          >
                            <Text style={globalStyles.globalButtonText}>
                              Enregistrer
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          {item.answer ===
                            "audio pas encore converti en texte" && (
                            <View style={styles.container}>
                              <ActivityIndicator size="large" color="#0b2d52" />
                            </View>
                          )}
                          {item.answer !==
                            "audio pas encore converti en texte" && (
                            <>
                              {item.image && (
                                <>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setFullscreenImage(
                                        `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${item.link_storage}`
                                      );
                                      setModalImageVisible(true);
                                    }}
                                  >
                                    <Image
                                      source={{
                                        uri: `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${item.link_storage}`,
                                      }}
                                      style={{
                                        width: "100%",
                                        height: 300,
                                        resizeMode: "contain",
                                      }}
                                    />
                                    <Text></Text>
                                    <Text
                                      style={{
                                        justifyContent: "center",
                                        textAlign: "center",
                                      }}
                                    >
                                      {item.answer}
                                    </Text>
                                  </TouchableOpacity>
                                </>
                              )}
                              {!item.image && (
                                <View style={{ flexDirection: "row" }}>
                                  {item.question_reponse == "question" && (
                                    <Image
                                      source={questionIcon}
                                      style={{
                                        width: 36,
                                        height: 36,
                                        opacity: 0.5,
                                        marginLeft: 15,
                                      }}
                                    />
                                  )}
                                  <Text style={styles.answerText}>
                                    {item.answer}
                                  </Text>
                                </View>
                              )}
                            </>
                          )}
                        </>
                      )}

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: 20,
                        }}
                      >
                        {(showDetails || selectedAnswerId === item.id) && (
                          <>
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedAnswer(item);
                                setSelectedAnswerId(item.id);
                                setModalVisible(true);
                              }}
                            >
                              <Image
                                source={repondreIcon}
                                style={{
                                  width: 28,
                                  height: 28,
                                  opacity: 0.5,
                                }}
                              />
                              {isLargeScreen && <Text>Répondre</Text>}
                            </TouchableOpacity>

                            {item.answer !==
                              "audio pas encore converti en texte" &&
                              (item.id_user == session.user.id ||
                                session.user.id ==
                                  "8a3d731c-6d40-4400-9dc5-b5926e6d5bbd") &&
                              item.id !== editingAnswerId && (
                                <TouchableOpacity
                                  onPress={() => {
                                    setEditingAnswerId(item.id);
                                    setEditingText(item.answer);
                                  }}
                                >
                                  <Image
                                    source={edit}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      opacity: 0.5,
                                    }}
                                  />
                                  {isLargeScreen && <Text>Corriger</Text>}
                                </TouchableOpacity>
                              )}

                            {item.audio &&
                              (item.id_user == session.user.id ||
                                session.user.id ==
                                  "8a3d731c-6d40-4400-9dc5-b5926e6d5bbd") && (
                                <>
                                  <TouchableOpacity
                                    onPress={() => handleCaptionClick(item.id)}
                                    style={styles.playButton}
                                  >
                                    <Image
                                      source={captionIcon}
                                      style={{
                                        width: 25,
                                        height: 25,
                                        opacity: 0.5,
                                        marginHorizontal: 15,
                                      }}
                                    />
                                    {isLargeScreen && <Text>Retranscrire</Text>}
                                  </TouchableOpacity>
                                  {/*}
                                  <TouchableOpacity
                                    onPress={() => refreshAnswer(item.id)}
                                    style={styles.playButton}
                                  >
                                    <Image
                                      source={refreshIcon}
                                      style={{
                                        width: 25,
                                        height: 25,
                                        opacity: 0.5,
                                        marginHorizontal: 15,
                                      }}
                                    />{" "}
                                    {isLargeScreen && <Text>Rafraichir</Text>}
                                  </TouchableOpacity>
                                  */}
                                </>
                              )}
                            {item.image && (
                              <TouchableOpacity
                                onPress={() =>
                                  setFullscreenImage(
                                    `https://zaqqkwecwflyviqgmzzj.supabase.co/storage/v1/object/public/photos/${item.link_storage}`
                                  )
                                }
                              >
                                <Image
                                  source={eyeIcon}
                                  style={{
                                    width: 35,
                                    height: 35,
                                    opacity: 0.5,
                                    marginHorizontal: 15,
                                  }}
                                />
                                {isLargeScreen && <Text>Voir</Text>}
                              </TouchableOpacity>
                            )}
                            {isLargeScreen && (
                              <>
                                <TouchableOpacity
                                  onPress={() => {
                                    copyToClipboard(item.answer, item.id);
                                    refreshAnswers();
                                  }}
                                >
                                  <Image
                                    source={copyIcon}
                                    style={{
                                      width: 27,
                                      height: 27,
                                      opacity: 0.5,
                                      marginHorizontal: 15,
                                    }}
                                  />
                                  {isLargeScreen && <Text>Copier</Text>}
                                </TouchableOpacity>
                              </>
                            )}
                            {statut != "Réagir" &&
                              (item.id_user == session.user.id ||
                                session.user.id ==
                                  "8a3d731c-6d40-4400-9dc5-b5926e6d5bbd") && (
                                <>
                                  {statut != "Réagir" &&
                                    statut != "Raconter" && (
                                      <View
                                        style={{
                                          flexDirection: "column",
                                          alignItems: "center",
                                        }}
                                      >
                                        <TouchableOpacity
                                          style={[
                                            styles.toggleButton,
                                            item.used && styles.selectedToggle,
                                          ]}
                                          onPress={async () => {
                                            await updateAnswer(
                                              item.id,
                                              "used",
                                              !item.used
                                            );
                                            const updatedAnswers = answers.map(
                                              (answer) =>
                                                answer.id === item.id
                                                  ? {
                                                      ...answer,
                                                      used: !answer.used,
                                                    }
                                                  : answer
                                            );
                                            setAnswers(updatedAnswers);
                                          }}
                                        >
                                          <View
                                            style={{
                                              flexDirection: "column",
                                              alignItems: "center",
                                            }}
                                          >
                                            <View
                                              style={[
                                                styles.toggleButtonCircle,
                                                {
                                                  left: item.used ? 2 : null,
                                                  right: !item.used ? 2 : null,
                                                },
                                              ]}
                                            />
                                          </View>
                                          <Text
                                            style={[
                                              styles.toggleText,
                                              { marginTop: 5 },
                                            ]}
                                          >
                                            {" "}
                                          </Text>
                                        </TouchableOpacity>
                                        <Text>
                                          {item.used
                                            ? "Utilisé"
                                            : "Non utilisé"}
                                        </Text>
                                      </View>
                                    )}
                                  <View
                                    style={{
                                      flexDirection: "column",
                                      alignItems: "center",
                                    }}
                                  >
                                    <TouchableOpacity
                                      style={[
                                        styles.toggleButton,
                                        item.quality && styles.selectedToggle,
                                      ]}
                                      onPress={async () => {
                                        await updateAnswer(
                                          item.id,
                                          "quality",
                                          !item.quality
                                        );
                                        const updatedAnswers = answers.map(
                                          (answer) =>
                                            answer.id === item.id
                                              ? {
                                                  ...answer,
                                                  quality: !answer.quality,
                                                }
                                              : answer
                                        );
                                        setAnswers(updatedAnswers);
                                      }}
                                    >
                                      <View
                                        style={{
                                          flexDirection: "column",
                                          alignItems: "center",
                                        }}
                                      >
                                        <View
                                          style={[
                                            styles.toggleButtonCircle,
                                            {
                                              left: item.quality ? 2 : null,
                                              right: !item.quality ? 2 : null,
                                            },
                                          ]}
                                        />
                                      </View>
                                      <Text
                                        style={[
                                          styles.toggleText,
                                          { marginTop: 5 },
                                        ]}
                                      >
                                        {" "}
                                      </Text>
                                    </TouchableOpacity>
                                    <Text>
                                      {item.quality ? "Relu" : "Non relu"}
                                    </Text>
                                  </View>

                                  <TouchableOpacity
                                    onPress={() => setDeleteModalVisible(true)}
                                  >
                                    <Image
                                      source={trash}
                                      style={{
                                        width: 36,
                                        height: 36,
                                        opacity: 0.5,
                                        marginLeft: 15,
                                      }}
                                    />
                                    {isLargeScreen && <Text>Supprimer</Text>}
                                  </TouchableOpacity>
                                </>
                              )}
                          </>
                        )}

                        {!showDetails && selectedAnswerId != item.id && (
                          <Text></Text>
                        )}

                        <Text
                          style={{
                            textAlign: "right",
                            marginTop: 10,
                            fontStyle: "italic",
                          }}
                          onPress={() => handleAssignOwner(item.id)}
                        >
                          {userNames[item.id_user]}
                        </Text>
                      </View>
                      {item.audio &&
                        (showDetails ||
                          selectedAnswerId === item.id ||
                          statut == "Lire") && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginTop: 10,
                            }}
                          >
                            <TouchableOpacity
                              onPress={() =>
                                handlePlayPause(
                                  item.id,
                                  item.link_storage,
                                  currentAudioId,
                                  setCurrentAudioId,
                                  playbackStatus,
                                  setPlaybackStatus
                                )
                              }
                            >
                              <Image
                                source={
                                  playbackStatus.isPlaying &&
                                  currentAudioId === item.id
                                    ? pauseIcon
                                    : playIcon
                                }
                                style={{ width: 25, height: 25 }}
                              />
                            </TouchableOpacity>
                            <Slider
                              style={{ flex: 1, marginHorizontal: 10 }}
                              value={
                                currentAudioId === item.id
                                  ? playbackStatus.positionMillis || 0
                                  : 0
                              }
                              minimumValue={0}
                              maximumValue={playbackStatus.durationMillis || 0}
                              onSlidingComplete={async (value) => {
                                if (playbackStatus.sound) {
                                  await playbackStatus.sound.setPositionAsync(
                                    value
                                  );
                                }
                              }}
                            />
                          </View>
                        )}
                    </View>
                  </View>
                </TouchableOpacity>
                /*
                  {isLargeScreen && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedAnswer(item);
                        setSelectedAnswerId(item.id);
                      }}
                    >
                      <Image
                        source={edit}
                        style={{
                          width: windowWidth * 0.05,
                          height: windowWidth * 0.05,
                          opacity: 0.5,
                        }}
                      />
                      {isLargeScreen && <Text>Réagir</Text>}
                    </TouchableOpacity>
                  )}
                </View>
                  */
              );
            }}
            keyExtractor={(item) => item.id.toString()}
            onDragEnd={({ data }) => handleAnswerMove(data)}
          />
        </>
      )}

      <Modal isVisible={isDeleteModalVisible}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setDeleteModalVisible(false)}
              style={styles.closeButton}
            >
              <Image source={closeIcon} style={styles.closeIcon} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Êtes-vous sûr de vouloir supprimer cette note ? Cette action est
              irréversible.
            </Text>

            <TouchableOpacity
              onPress={async () => {
                await handleDeleteAnswer(selectedAnswer);

                setDeleteModalVisible(false);
              }}
              style={globalStyles.globalButton_wide}
            >
              <Text style={globalStyles.globalButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal isVisible={isAssignModalVisible}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setIsAssignModalVisible(false)}
              style={styles.closeButton}
            >
              <Image source={closeIcon} style={styles.closeIcon} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Attribuer à un utilisateur</Text>
            <Picker
              selectedValue={selectedUserId}
              onValueChange={(itemValue) => setSelectedUserId(itemValue)}
            >
              {users.map((user) => (
                <Picker.Item
                  key={user.id_user}
                  label={user.name}
                  value={user.id_user}
                />
              ))}
            </Picker>
            <TouchableOpacity
              onPress={handleUpdateOwner}
              style={globalStyles.globalButton_wide}
            >
              <Text style={globalStyles.globalButtonText}>Attribuer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View>
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navButton: {
    padding: 10,
  },
  filterIcon: {
    alignSelf: "flex-end",
    margin: 10,
  },
  filterContainer: {
    width: "90%",
    alignSelf: "center",
    padding: 10,
    zIndex: 1,
    marginHorizontal: 5,
    marginVertical: 20,
    borderWidth: 1, // Ajoutez cette ligne
    borderColor: "#ccc", // Ajoutez cette ligne pour définir la couleur de la bordure
    backgroundColor: "#b1b3b5",
    position: "relative",
  },

  input: {
    height: 40,
    padding: 10,
    marginBottom: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    zIndex: 3, // Ajoutez cette ligne
  },
  datePicker: {
    zIndex: 9999, // Utilisez une valeur plus élevée
    position: "absolute", // Assurez-vous que le positionnement est absolu
    backgroundColor: "white", // Ajoutez un fond blanc pour le rendre plus visible
    top: 0, // Ajustez selon vos besoins pour la position
    left: 0, // Ajustez selon vos besoins pour la position
  },
  answerCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    width: "90%",
    alignSelf: "center",
    zIndex: 1, // Ajoutez cette ligne
  },
  answerText: {
    fontSize: 16,
    marginLeft: 20,
  },
  dropdownContainer: {
    marginVertical: 10,
  },
  dropdown: {
    height: 40,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },

  recordButton: {
    backgroundColor: "#ff0000",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  recordButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },

  fullscreenContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  fullscreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  /*
  selectedAnswerCard: {
    backgroundColor: '#93d9e6', // Couleur de fond différente pour les réponses sélectionnées
  },
  connectedAnswerCard: {
    backgroundColor: '#cce4e8', // Bleu clair pour les réponses connectées
  },
  */
  selectedAnswerCard: {
    //borderColor: 'blue', // Remplacez cette ligne par votre style personnalisé
    backgroundColor: "#93d9e6",
    //borderWidth: 2,
    zIndex: 2,
  },
  connectedAnswerCard: {
    //borderColor: 'green', // Remplacez cette ligne par votre style personnalisé
    backgroundColor: "#cce4e8",
    //borderWidth: 2,
    zIndex: 2,
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

  modalContainer: {
    backgroundColor: "#E8FFF6",
    width: "100%",
    height: "100%",
    padding: 20,
    borderRadius: 10,
    alignSelf: "center",
    zIndex: 20,
    padding: 20,
    borderRadius: 10,
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
});

export default NoteScreen;
