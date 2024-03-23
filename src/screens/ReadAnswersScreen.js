import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getMemories_Questions,getMemories_Answers_to_Question } from '../components/data_handling';
import { useFocusEffect } from '@react-navigation/native';
import { getActiveSubjectId } from '../components/local_storage';
import { globalStyles } from '../../global';

function ReadQuestionsScreen({ route }) {
  const navigation = useNavigation();
  const session = route.params.session;
  const [questions, setQuestions] = useState([]);
  const [subject_active, setSubject_active] = useState(null);
  // Assurez-vous que "posée par un proche" est un choix possible dès le départ si nécessaire
  const [tags, setTags] = useState(["Famille", "Vie professionnelle", "Vie personnelle", "Hobbies & passions", "Valeurs", "Voyages", "Autre"]);
  const allTags = ["Famille", "Vie professionnelle", "Vie personnelle", "Hobbies & passions", "Valeurs", "Voyages", "Autre","posée par un proche"];
  const [personal, setPersonal] = useState(false);
  const [activeQuestionAnswers, setActiveQuestionAnswers] = useState({});

  useEffect(() => {
    if (subject_active != null) {
      getMemories_Questions(subject_active, setQuestions, tags, personal);
    }
  }, [subject_active, tags, personal]);


  useEffect(() => {
    console.log("Test :",activeQuestionAnswers)
  }, [activeQuestionAnswers]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchActiveSubjectId = async () => {
        const temp = await getActiveSubjectId();
        setSubject_active(temp);
      };
      fetchActiveSubjectId();
      if (session && subject_active != null) {
        getMemories_Questions(subject_active, setQuestions, tags, personal);
      }
    }, [session, subject_active, tags, personal])
  );

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
      // Ajouter une vérification spécifique pour le tag "posée par un proche"
      if (tag === "posée par un proche") {
        setPersonal(!personal); // Réinitialiser à false si le tag est désélectionné
      }
    } else {
      setTags([...tags, tag]);
      // Si le tag "posée par un proche" est ajouté, ajustez setPersonal et rappelez getMemories_Question
      if (tag === "posée par un proche") {
        setPersonal(!personal); // Mettre à jour personal à true
        // Assurez-vous que les autres paramètres requis par getMemories_Question sont corrects
        getMemories_Questions(subject_active, setQuestions, tags, personal);
      }
    }
  };
  
  // Fonction pour basculer l'affichage des réponses pour une question spécifique

const toggleAnswersDisplay = async (questionId) => {
  if (activeQuestionAnswers[questionId]) {
    // Si les réponses sont déjà affichées, les masquer
    setActiveQuestionAnswers(prev => ({ ...prev, [questionId]: undefined }));
  } else {
    // Sinon, récupérer et afficher les réponses
    const answers = await getMemories_Answers_to_Question(questionId); // Assurez-vous que cette fonction renvoie les réponses
    if (answers) {
      setActiveQuestionAnswers(prev => ({ ...prev, [questionId]: answers }));
    }
  }
};


  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <Text></Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        {allTags.map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={[globalStyles.globalButton_tag, tags.includes(tag) ? {} : styles.unSelectedTag]}
            onPress={() => toggleTag(tag)}>
            <Text style={globalStyles.globalButtonText_tag}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.questionsContainer}>
      {questions.length > 0 ? questions.map((question, index) => (
  <View key={index} style={styles.questionCard}>
    <TouchableOpacity onPress={() => toggleAnswersDisplay(question.id)}>
      <Text style={styles.questionText}>{question.question}</Text>
      <Text style={styles.answersCount}>
        {question.answers_count} {question.answers_count === 1 ? 'réponse' : 'réponses'}
      </Text>
    </TouchableOpacity>
    {activeQuestionAnswers[question.id] && (
      <>
        {activeQuestionAnswers[question.id].map((answer, answerIndex) => (
          <View key={answerIndex} style={styles.answerContainer}>
            <Text style={styles.answerDateText}>
              Répondu le : {new Date(answer.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            <Text style={styles.answerText}>{answer.answer}</Text>
            {answerIndex < activeQuestionAnswers[question.id].length - 1 && (
              <View style={styles.separator} />
            )}
          </View>
        ))}
      </>
    )}
  </View>
)) : <Text>Aucune question trouvée.</Text>}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
  },
  tagButton: {
    margin: 5,
    padding: 10,
    borderRadius: 20,
  },
  selectedTag: {
    backgroundColor: 'skyblue',
  },
  unSelectedTag: {
    backgroundColor: '#dedede',
  },
  tagButtonText: {
    fontSize: 16,
  },
  questionsContainer: {
    marginTop: 20,
  },
  questionContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'lightgrey',
  },
  questionText: {
    fontSize: 18,
  },
  answersCount: {
    fontWeight: 'bold',
  },
  answerText: {
    fontSize: 16,
    marginLeft: 20, // Un peu d'indentation pour les distinguer des questions
  },
  separator: {
    height: 1,
    backgroundColor: "#CCCCCC",
    marginVertical: 10,
  },
  answerCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  answerDateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  answerContainer: {
    paddingVertical: 10,
  },
  // Autres styles restent inchangés
  
  
});

export default ReadQuestionsScreen;