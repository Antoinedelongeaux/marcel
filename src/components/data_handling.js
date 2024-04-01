
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid'; // Importez la fonction v4 et renommez-la en uuidv4




export async function getMemories_Question(subject_active, setQuestion, setAnswers, setOwner, index, setIndex, tags, personal) {
  try {

    // Construire dynamiquement la condition or en fonction des tags fournis
    const orCondition = tags.map(tag => `tags.cs.{"${tag}"}`).join(',');

    // Préparer la requête de base
    let query = supabase
      .from('Memoires_questions')
      .select('*');

    if (subject_active !== null) {
      // Appliquer le filtre id_subject seulement si subject_active n'est pas null
      query = query.eq('id_subject', subject_active);
    }else {
      query = query.is('id_subject', null);
    }

    query = query.or(orCondition);

    if (personal) {
      // Ajouter un filtre pour exclure les questions avec id_owner null
      query = query.not('id_owner', 'is', null);
    } else {
      query = query.is('id_owner', null);
    }

    
    // Exécuter la requête
    const { data: questionsWithTags, error: errorQuestionsWithTags } = await query;
   
    if (errorQuestionsWithTags) throw errorQuestionsWithTags;

    // Vérifier si l'index est hors de portée
    
    if (index >= questionsWithTags.length && questionsWithTags.length>0) {
      if (index > 0) {
        // Réinitialiser l'index à 0 et relancer la fonction
        
        setIndex(0);
        return getMemories_Question(subject_active, setQuestion, setAnswers, setOwner, 0, setIndex, tags, personal);
      } else {
        // Index déjà à 0 et hors de portée, pas de questions disponibles
        setQuestion({ "question": "End" });
        setAnswers([]);
        return "Pas de question disponible avec ces filtres";
      }
    }

    // Sélectionner la question à l'index spécifié
    const selectedQuestion = questionsWithTags[index];

    // Récupérer toutes les réponses pour cette question spécifique
    const { data: answersForSelectedQuestion, error: errorAnswersForSelectedQuestion } = await supabase
      .from('Memoires_answers')
      .select('*')
      .eq('id_question', selectedQuestion.id);

    if (errorAnswersForSelectedQuestion) throw errorAnswersForSelectedQuestion;

    // Mettre à jour l'état avec la question sélectionnée et ses réponses
    const ownerName = await get_user_name(selectedQuestion.id_owner);
    setOwner(ownerName);

    setQuestion(selectedQuestion);
    setAnswers(answersForSelectedQuestion || []); // Assurez-vous que setAnswers reçoit un tableau, même si aucune réponse n'est trouvée ou en cas d'erreur
  } catch (error) {
    console.error("Error", error.message);
    setQuestion({ "question": "..." });
    setAnswers([]); // Assurez-vous de réinitialiser les réponses en cas d'erreur
  }
}


export async function getMemories_Question_by_id(id_question,setQuestion, setAnswers, setOwner) {
  try {

  

    // Préparer la requête de base
    let query = supabase
      .from('Memoires_questions')
      .select('*')
      .eq('id', id_question)
      .single();


    // Exécuter la requête
    const { data: question, error: errorQuestion } = await query;

    if (errorQuestion) throw errorQuestion;



    // Récupérer toutes les réponses pour cette question spécifique
    const { data: answersForSelectedQuestion, error: errorAnswersForSelectedQuestion } = await supabase
      .from('Memoires_answers')
      .select('*')
      .eq('id_question', id_question);

    if (errorAnswersForSelectedQuestion) throw errorAnswersForSelectedQuestion;

    // Mettre à jour l'état avec la question sélectionnée et ses réponses
    const ownerName = await get_user_name(question.id_owner);
    setOwner(ownerName);

    setQuestion(question);
    setAnswers(answersForSelectedQuestion || []); // Assurez-vous que setAnswers reçoit un tableau, même si aucune réponse n'est trouvée ou en cas d'erreur
  } catch (error) {
    console.error("Error", error.message);
    setQuestion({ "question": "Error" });
    setAnswers([]); // Assurez-vous de réinitialiser les réponses en cas d'erreur
  }
}

export async function getMemories_Questions(subject_active, setQuestions, tags, personal) {
  try {

    setQuestions([])
    const orCondition = tags.length > 0 ? tags.map(tag => `tags.cs.{"${tag}"}`).join(',') : 'true';

    // Préparer la requête de base pour récupérer les questions
    let query = supabase
      .from('Memoires_questions')
      .select('*, Memoires_answers(*)')
      //.select('*, Memoires_answers!inner(*)') pour exckure les questions sans réponses
      .eq('id_subject', subject_active);

    if (orCondition !== 'true') {
      query = query.or(orCondition);
    }

    if (personal) {
      query = query.not('id_owner', 'is', null);
    }

    // Exécuter la requête pour récupérer les questions
    const { data: questions, error: errorQuestions } = await query;
    if (errorQuestions) throw errorQuestions;

    // Pour chaque question, compter le nombre de réponses et conditionnellement récupérer le nom d'utilisateur du propriétaire
    const questionsWithDetails = await Promise.all(questions.map(async (question) => {
      const answersCount = question.Memoires_answers?.length || 0;


      let username = 'Marcel'; // Valeur par défaut si id_owner est null
      if (question.id_owner) {
        const { data: ownerData, error: errorOwner } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', question.id_owner)
          .single();

        if (!errorOwner && ownerData) {
          username = ownerData.username;
        }
      }

      return {
        ...question,
        answers_count: answersCount, // Ajouter le nombre de réponses à l'objet de la question
        username: username, // Utiliser la variable username qui peut être "Marcel" par défaut ou un nom d'utilisateur récupéré
      };
    }));


    setQuestions(questionsWithDetails);
  } catch (error) {
    Alert.alert("Error", error.message);
    setQuestions([]);
  }
}





export async function getMemories_Answers_to_Question(questionId) {
  try {
    if (questionId == null) {
      console.log("Question ID is null or undefined.");
      return []; // Retourner un tableau vide si l'ID de la question est null
    }

    const { data: answers, error } = await supabase
      .from('Memoires_answers')
      .select('*')
      .eq('id_question', questionId);

    if (error) {
      throw error;
    }

    return answers || []; // Retourner les réponses ou un tableau vide si aucune réponse n'est trouvée
  } catch (error) {
    console.error("Error fetching answers:", error.message);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}



export async function deleteMemories_Answer(answerId) {
  try {
    // Effectuer la requête de suppression sur la table 'Memoires_answers'
    const { data, error } = await supabase
      .from('Memoires_answers')
      .delete()
      .match({ id: answerId }); // Utilisez 'match' pour spécifier la condition de suppression

    if (error) {
      throw error; // Si une erreur survient, la propager pour la gérer plus tard
    }

    return { success: true, data: data }; // Retourner un objet indiquant le succès et les données supprimées
  } catch (error) {
    // Gérer l'erreur (par exemple, en affichant une alerte ou en la renvoyant pour une gestion externe)
    console.error("Error deleting answer:", error.message);
    return { success: false, error: error.message }; // Retourner un objet indiquant l'échec et le message d'erreur
  }
}


export async function submitMemories_Answer(answer, question, session, audio, name, resetAnswerAndFetchQuestion) {
  try {
    const response = audio ? answer : (answer.trim() === '' ? 'Réponse vide' : answer);
    const { error } = await supabase
      .from('Memoires_answers')
      .insert([
        { id_question: question.id, id_user: session?.user?.id, answer: response, audio: audio, link_storage: name }
      ]);
    if (error) throw error;
    // Notification de succès
    Alert.alert(audio ? 'Réponse audio enregistrée' : 'Réponse écrite enregistrée');
    resetAnswerAndFetchQuestion();
  } catch (error) {
    Alert.alert("Erreur", error.message);
  }
};


export async function save_question(question, tags, subject_active, setQuestion) {
  const id_question = [...Array(12)].map(() => Math.floor(Math.random() * 10)).join('');

  return new Promise(async (resolve, reject) => {
    if (question.trim() === '') {
      Alert.alert('Veuillez renseigner une question');
      return reject(new Error('La question est vide.'));
    }

    try {
      const { error } = await supabase
        .from('Memoires_questions')
        .insert([
          { id: id_question, id_subject: subject_active, question: question, tags: tags }
        ]);

      if (error) throw error;

      const question_full = {
        id: id_question, id_subject: subject_active, question: question, tags: tags
      };

      setQuestion(question_full); // Mise à jour de l'état avec la nouvelle question

      resolve(question_full); // Résolution de la promesse avec l'objet question
    } catch (error) {
      Alert.alert('Erreur', error.message);
      reject(error); // Rejet de la promesse en cas d'erreur
    }
  });
}




export async function get_personal_questions_with_answers(target) {
  try {
    const { data: questions, error: errorQuestions } = await supabase
      .from('Messages_personnels_questions')
      .select(`
          *,
          Messages_personnels_answers (answer, id_question)
        `)
      .eq('id_target', target);
    if (errorQuestions) throw errorQuestions;

    return questions.map(question => {
      const answerObj = question.Messages_personnels_answers[0]; // Supposons qu'il y a au maximum une réponse par question pour un utilisateur donné
      return {
        ...question,
        existingAnswer: answerObj ? answerObj.answer : '',
      };
    });
  } catch (error) {
    Alert.alert("Erreur", error.message);
  }
}



export async function save_or_update_personal_answer(answer, question, owner) {
  if (answer.trim() === '') {
    Alert.alert('Veuillez entrer une réponse');
    return;
  }
  try {
    // Vérifiez d'abord si une réponse existe déjà pour cette question et cet utilisateur
    const { data: existingAnswers, error: errorFetching } = await supabase
      .from('Messages_personnels_answers')
      .select('id')
      .eq('id_question', question)
      .eq('id_owner', owner);

    if (errorFetching) throw errorFetching;

    if (existingAnswers.length > 0) {
      // Mettre à jour la réponse existante
      const { error: errorUpdating } = await supabase
        .from('Messages_personnels_answers')
        .update({ answer: answer })
        .match({ id: existingAnswers[0].id });

      if (errorUpdating) throw errorUpdating;
    } else {
      // Insérer une nouvelle réponse
      const { error: errorInserting } = await supabase
        .from('Messages_personnels_answers')
        .insert([{ id_question: question, id_owner: owner, answer: answer }]);

      if (errorInserting) throw errorInserting;
    }

    Alert.alert('Réponse enregistrée');
  } catch (error) {
    Alert.alert("Erreur", error.message);
  }
}

export async function listSubjects(id_user) {
  try {
    // Récupère d'abord les sujets associés à l'utilisateur
    const associatedSubjects = await getSubjects(id_user);
    const associatedSubjectIds = associatedSubjects.map(subject => subject.id_subject);

    // Ensuite, récupère tous les sujets et exclut ceux associés à l'utilisateur
    const { data: list_subjects, error } = await supabase
      .from('Memoires_subjects')
      .select('*')
      .not('id', 'in', `(${associatedSubjectIds.join(',')})`); // Assurez-vous que la syntaxe correspond à celle attendue par votre base de données

    if (error) throw error;


    return list_subjects;
  } catch (error) {
    console.error("Error in listSubjects:", error.message);
    throw error;
  }
}




export async function joinSubject(id_subject) {

  const { error } = await supabase
    .from('Memoires_contributors')
    .insert([
      { id_subject: id_subject }
    ]);
  if (error) throw error;
  return

}


export async function getSubjects(id_user) {

  try {
    const { data: list_subjects, error } = await supabase
      .from('Memoires_contributors')
      .select('*')
      .eq('id_user', id_user);
    if (error) throw error;


    // Utilisez Promise.all pour attendre que toutes les requêtes soient terminées
    const subjectsWithContent = await Promise.all(list_subjects.map(async (element) => {
      const { data: content_subject, error: error_content } = await supabase
        .from('Memoires_subjects')
        .select('*')
        .eq('id', element.id_subject);
      if (error_content) throw error_content;

      // Ajoutez content_subject au bon élément de list_subjects
      // Assumant que content_subject est un tableau avec un seul élément
      return { ...element, content_subject: content_subject[0] };
    }));

    return subjectsWithContent;
  } catch (error) {
    console.error("Error in getSubject:", error.message);
    throw error; // Ou gérer l'erreur d'une manière qui a du sens pour votre application
  }
}

export async function getSubject(id_subject) {

  try {
    const { data: subject, error } = await supabase
      .from('Memoires_subjects')
      .select('*')
      .eq('id', id_subject)
      .single();
    if (error) throw error;


    return subject;
  } catch (error) {
    console.error("Error in getSubject:", error.message);
    throw error;
  }

}

export async function get_user_name(id_user) {
  try {

    // Ajout de la condition pour renvoyer "Marcel" si id_user est "nbull"
    if (id_user === null) {
      return "Marcel";
    }

    const { data: user, error: errorUser } = await supabase
      .from('profiles')
      .select(`*`)
      .eq('id', id_user)
      .single();

    if (errorUser) throw errorUser;

    return user.username;

  } catch (error) {
    Alert.alert("Erreur", error.message);
  }
}



export async function update_answer_text(id_answer,answer) {
  try {


    const { data, error: errorUpdating } = await supabase
      .from('Memoires_answers')
      .update({ answer: answer }) // Assurez-vous que `answer` contient la nouvelle valeur de la réponse
      .eq('id', id_answer);

    return
} catch (errorUpdating) {
  Alert.alert("Erreur", errorUpdating.message);
}
}


export async function get_project(name,setLoading, setSearchResults) {
  // Exemple de pseudo code, à adapter selon votre logique d'application
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('Memoires_subjects') // Remplacez 'projects' par le nom de votre table
      .select('*')
      .ilike('title', `%${name}%`); // Recherche insensible à la casse contenant `name`

    if (error) throw error;

    setSearchResults(data); // Mettez à jour les résultats de recherche
  } catch (error) {
    Alert.alert('Erreur lors de la recherche', error.message);
  } finally {
    setLoading(false);
  }
}

export async function create_project(name) {
  // Exemple de pseudo code, à adapter selon votre logique d'application
  try {

    const id = uuidv4(); 


    const { data, error } = await supabase
      .from('Memoires_subjects') // Remplacez 'projects' par le nom de votre table
      .insert([
        { id: id , title: name}
      ]);

    joinSubject(id)
    
    
    if (error) throw error;

    Alert.alert("Le projet a bien été créé");

  } catch (error) {
    Alert.alert('Erreur lors de la création', error.message);
  } 
}


export async function get_chapters(id_subject, setChapters) {
  // Exemple de pseudo code, à adapter selon votre logique d'application
  try {

    const { data, error } = await supabase
    .from('Memoires_chapters') 
    .select('*')
    .eq('id_subject', id_subject); 
 
    if (error) throw error;

    setChapters(data)
  

  } catch (error) {
    Alert.alert('Erreur lors de la création', error.message);
  } 
}


export async function join_question_to_chapter(id_question, id_chapter) {
  // Exemple de pseudo code, à adapter selon votre logique d'application
  try {

    const { data, error } = await supabase
    .from('Memoires_questions') 
    .update({ id_chapitre: id_chapter})
    .eq('id', id_question); 
 
    if (error) throw error;

  

  } catch (error) {
    Alert.alert('Erreur lors du chapitrage', error.message);
  } 
}


export async function create_chapter(title,id_subject) {
  // Exemple de pseudo code, à adapter selon votre logique d'application
  try {


    const { data, error } = await supabase
      .from('Memoires_chapters') // Remplacez 'projects' par le nom de votre table
      .insert([
        { title: title, id_subject: id_subject}
      ]);

    
    if (error) throw error;

    Alert.alert("Le chapitre a bien été créé");

  } catch (error) {
    Alert.alert('Erreur lors de la création', error.message);
  } 
}

