
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { getActiveSubjectId } from './local_storage';





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

export async function getMemories_Questions_by_tags(setQuestions, tags) {
  try {

    // Construire dynamiquement la condition or en fonction des tags fournis
    const orCondition = tags.map(tag => `tags.cs.{"${tag}"}`).join(',');

    // Préparer la requête de base
    let query = supabase
      .from('Memoires_questions')
      .select('*');


    query = query.is('id_subject', null);
    

    query = query.or(orCondition);
    query = query.is('id_owner', null);
    

    
    // Exécuter la requête
    const { data: questionsWithTags, error: errorQuestionsWithTags } = await query;
   
    if (errorQuestionsWithTags) throw errorQuestionsWithTags;



    setQuestions(questionsWithTags);

  } catch (error) {
    console.error("Error", error.message);
    setQuestions({ "question": "..." });
  }
}

export async function get_Question_by_id(id_question, setMiscState) {
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


    setMiscState(prevState => ({ ...prevState, question: question }));
   

  } catch (error) {
    console.error("Error", error.message);
    setMiscState(prevState => ({ ...prevState, question: "error" }));
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
      console.log("Personal")
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



export async function getMemories_Questions_Published(subject_active, setQuestions, tags, personal) {
  try {


    setQuestions([])
    
    // Préparer la requête de base pour récupérer les questions
    let query = supabase
      .from('Memoires_questions')
      .select('*')
      .eq('published_private',true)
      .eq('id_subject', subject_active);


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

    console.log("questionsWithDetails :",questionsWithDetails)
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

export async function getMemories_Answers_to_theme(id_connection) {
  try {


    if (id_connection == null) {
      console.log("id_connection is null or undefined.");
      return []; // Retourner un tableau vide si l'ID de la question est null
    }

    const { data: answers, error } = await supabase
      .from('Memoires_answers')
      .select('*')
      .eq('id_connection', id_connection);


    if (error) {
      throw error;
    }


    return answers || []; // Retourner les réponses ou un tableau vide si aucune réponse n'est trouvée
  } catch (error) {
    console.error("Error fetching answers:", error.message);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}



export async function getMemories_Answers() {
  try {
    const id_subject = await getActiveSubjectId();
    if (id_subject == null) {
      console.log("ID subject is null or undefined.");
      return []; // Retourner un tableau vide si l'ID de la question est null
    }

    const { data: answers, error } = await supabase
      .from('Memoires_answers')
      .select('*')
      .eq('id_subject', id_subject);

    if (error) {
      throw error;
    }

    return answers || []; // Retourner les réponses ou un tableau vide si aucune réponse n'est trouvée
  } catch (error) {
    console.error("Error fetching answers:", error.message);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}


export const delete_Image = async (name) => {

  const { data, error } = await supabase
    .storage
    .from('photos')
    .remove([name])


}


export const delete_audio = async (name) => {
  const { data, error } = await supabase
    .storage
    .from('audio')
    .remove([name])

}

export async function deleteMemories_Answer(answerToDelete) {

  try {

    // Effectuer la requête de suppression sur la table 'Memoires_answers'
    if (answerToDelete.audio) {
      try {
        await delete_audio(answerToDelete.link_storage);
      } catch (error) {
        alert("Error deleting audio: " + error.message);
        return;
      }
    }

    if (answerToDelete.image) {
      try {
 
        await delete_Image(answerToDelete.link_storage);
      } catch (error) {
        alert("Error deleting document: " + error.message);
        return;
      }
    }
    
    
    
    const { data, error } = await supabase
      .from('Memoires_answers')
      .delete()
      .match({ id: answerToDelete.id }); // Utilisez 'match' pour spécifier la condition de suppression

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


export async function submitMemories_Answer(answer, question, session, audio, name, image, connectionId, resetAnswerAndFetchQuestion,question_reponse,id_connection) {
  try {

    const id_subject = await getActiveSubjectId();
    let ID_question = null;

    if (question && question.id) {
      ID_question = question.id;
    } else if (question) {
      ID_question = question;
    }

    const response = audio ? answer : (answer.trim() === '' ? 'Réponse vide' : answer);

// Obtenez le nombre actuel de réponses pour définir le rank
let rank = 0
    
if (id_answer_source) {
  const { count } = await supabase
  .from('Memoires_answers')
  .select('id', { count: 'exact' })
  .eq('id',id_answer_source);


  const { data, error } = await supabase
  .from('Memoires_answers')
  .select('*')
  .eq('id', id_answer_source);


  rank = data[0].rank + (count+1)*0.00001



}else {
const { count } = await supabase
  .from('Memoires_answers')
  .select('id', { count: 'exact' });
rank = count + 1;
}

    const { error } = await supabase
      .from('Memoires_answers')
      .insert([
        { id_question: ID_question, id_user: session?.user?.id, id_subject: id_subject, answer: response, audio: audio, link_storage: name, image: image, connection: connectionId, rank: rank,question_reponse:question_reponse,id_connection:id_connection }
      ]);

    if (error) throw error;

    // Notification de succès
    Alert.alert(audio ? 'Réponse audio enregistrée' : 'Réponse écrite enregistrée');
    resetAnswerAndFetchQuestion();
  } catch (error) {
    Alert.alert("Erreur", error.message);
  }
}

export async function submitMemories_Answer_written(answer, ID_USER, Id_question, Id_connection,question_reponse,id_answer_source) {
  try {
    const Id_subject = await getActiveSubjectId();

    let Id_user =null
    if(ID_USER) {
      Id_user = ID_USER
    }else{
      Id_user =  session?.user?.id
    }
    


    // Obtenez le nombre actuel de réponses pour définir le rank
    let rank = 0
    
    if (id_answer_source) {
      const { count } = await supabase
      .from('Memoires_answers')
      .select('id', { count: 'exact' })
      .eq('id',id_answer_source);
  

      const { data, error } = await supabase
      .from('Memoires_answers')
      .select('*')
      .eq('id', id_answer_source);

      rank = data[0].rank + (count+1)*0.00001



    }else {
    const { count } = await supabase
      .from('Memoires_answers')
      .select('id', { count: 'exact' });
    rank = count + 1;
  }




    const { error } = await supabase
      .from('Memoires_answers')
      .insert([
        { id_question: Id_question, id_user: Id_user, id_subject: Id_subject, answer: answer, audio: false, link_storage: '', image: false, id_connection: Id_connection, rank: rank,question_reponse:question_reponse,id_answer_source:id_answer_source }
      ]);

    if (error) throw error;

    // Notification de succès
    Alert.alert(audio ? 'Réponse audio enregistrée' : 'Réponse écrite enregistrée');
    resetAnswerAndFetchQuestion();
  } catch (error) {
    Alert.alert("Erreur", error.message);
  }
}

export async function submitMemories_Answer_oral(answer, ID_USER, Id_question, Id_connection,question_reponse,name,ID_answer,id_answer_source) {
  try {


    const Id_subject = await getActiveSubjectId();

    let Id_user =null
    if(ID_USER) {
      Id_user = ID_USER
    }else{
      Id_user =  session?.user?.id
    }

// Obtenez le nombre actuel de réponses pour définir le rank
let rank = 0
    
if (id_answer_source) {
  const { count } = await supabase
  .from('Memoires_answers')
  .select('id', { count: 'exact' })
  .eq('id',id_answer_source);


  const { data, error } = await supabase
  .from('Memoires_answers')
  .select('*')
  .eq('id', id_answer_source);


  rank = data[0].rank + (count+1)*0.00001



}else {
const { count } = await supabase
  .from('Memoires_answers')
  .select('id', { count: 'exact' });
rank = count + 1;
}

    const { error } = await supabase
      .from('Memoires_answers')
      .insert([
        { id:ID_answer,id_question: Id_question, id_user: Id_user, id_subject: Id_subject, answer: answer, audio: true, link_storage: name, image: false, id_connection: Id_connection, rank: rank,question_reponse:question_reponse,id_answer_source:id_answer_source }
      ]);

    if (error) throw error;

    // Notification de succès
    Alert.alert(audio ? 'Réponse audio enregistrée' : 'Réponse écrite enregistrée');
    resetAnswerAndFetchQuestion();
    return ID_answer;
  } catch (error) {
    Alert.alert("Erreur", error.message);
  }
}

export async function submitMemories_Answer_image(answer, ID_USER, Id_question, Id_connection,question_reponse,name,id_answer_source) {
  try {
    
    const Id_subject = await getActiveSubjectId();

    let Id_user =null
    if(ID_USER) {
      Id_user = ID_USER
    }else{
      Id_user =  session?.user?.id
    }

// Obtenez le nombre actuel de réponses pour définir le rank
let rank = 0
    
if (id_answer_source) {
  const { count } = await supabase
  .from('Memoires_answers')
  .select('id', { count: 'exact' })
  .eq('id',id_answer_source);


  const { data, error } = await supabase
  .from('Memoires_answers')
  .select('*')
  .eq('id', id_answer_source);

  rank = data[0].rank + (count+1)*0.00001



}else {
const { count } = await supabase
  .from('Memoires_answers')
  .select('id', { count: 'exact' });
rank = count + 1;
}

    const { error } = await supabase
      .from('Memoires_answers')
      .insert([
        { id_question: Id_question, id_user: Id_user, id_subject: Id_subject, answer: answer, audio: false, link_storage: name, image: true, id_connection: Id_connection, rank: rank,question_reponse:question_reponse,id_answer_source:id_answer_source }
      ]);

    if (error) throw error;

    // Notification de succès
    Alert.alert(audio ? 'Réponse audio enregistrée' : 'Réponse écrite enregistrée');
    resetAnswerAndFetchQuestion();
  } catch (error) {
    Alert.alert("Erreur", error.message);
  }
}

export async function save_question(question, tags, subject_active, setMiscState) {
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

      setMiscState(prevState => ({ ...prevState, question: question_full }));


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
    console.log("associatedSubjects : ", associatedSubjects);

    const associatedSubjectIds = associatedSubjects.map(subject => subject.id_subject);
    console.log("associatedSubjectIds : ", associatedSubjectIds);

    if (associatedSubjectIds.length === 0) {
      // Si aucun sujet associé, retourne une liste vide
      return [];
    }

    // Formatez correctement les IDs pour le filtre 'in'
    const filterString = `(${associatedSubjectIds.join(',')})`;

    // Utilisez le format de chaîne correcte pour le filtre 'in'
    const { data: list_subjects, error } = await supabase
      .from('Memoires_subjects')
      .select('*')
      .in('id', associatedSubjectIds); // Utilisez l'opérateur 'in' avec le tableau d'IDs

    if (error) throw error;

    console.log("list_subjects : ", list_subjects);

    return list_subjects;
  } catch (error) {
    console.error("Error in listSubjects:", error.message);
    throw error;
  }
}






export async function countSubjects(id_user) {
  
    // Récupère d'abord les sujets associés à l'utilisateur
    const associatedSubjects = await getSubjects(id_user);


    return associatedSubjects.length;
  
}


export async function joinSubject(id_subject, id_user, access,Inspirer,Raconter,Réagir,Structurer, Rédiger,Relire,Publier,Lire ) {
  try {
    // Vérifier d'abord si l'enregistrement existe
    const { data: existing, error: fetchError } = await supabase
      .from('Memoires_contributors')
      .select('*')
      .eq('id_subject', id_subject)
      .eq('id_user', id_user)
      .maybeSingle(); // Utilisez maybeSingle() pour obtenir soit un objet soit null si aucun enregistrement n'est trouvé

    if (fetchError) throw fetchError;

    // Si un enregistrement existe déjà, ne rien faire et peut-être informer l'utilisateur
    if (existing) {
      console.log('Vous avez déjà émis une demande d\'accès à ce projet. Le propriétaire doit valider votre demande');
      return; // Sortir de la fonction pour éviter d'ajouter un doublon
    }

    // Si aucun enregistrement existant n'a été trouvé, procéder à l'insertion
    const { error: insertError } = await supabase
      .from('Memoires_contributors')
      .insert([
        { id_subject: id_subject, id_user: id_user, access: access,Inspirer,Raconter,Réagir,Structurer, Rédiger,Relire,Publier,Lire  } // Assurez-vous d'inclure id_user dans l'insertion
      ]);

    if (insertError) throw insertError;

    // L'insertion a réussi
    console.log('Le contributeur a été ajouté avec succès.');
    
  } catch (error) {
    console.error('Erreur lors de la tentative d\'ajout du contributeur :', error.message);
    throw error; // Propager l'erreur pour une gestion ultérieure si nécessaire
  }
}




export async function getSubjects(id_user) {

  try {


    const { data: list_subjects, error } = await supabase
      .from('Memoires_contributors')
      .select('*')
      .eq('id_user', id_user)
      .eq('access', true);
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

export async function getSubjects_pending(id_user) {

  try {
    const { data: list_subjects, error } = await supabase
      .from('Memoires_contributors')
      .select('*')
      .eq('id_user', id_user)
      .eq('access', false);
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

export async function create_project(name,id_user) {
  // Exemple de pseudo code, à adapter selon votre logique d'application
  try {

    const id = customUUIDv4(); 


    const { data, error } = await supabase
      .from('Memoires_subjects') // Remplacez 'projects' par le nom de votre table
      .insert([
        { id: id , title: name}
      ]);

    joinSubject(id,id_user,true,true,true,true,true,true,true,true,true)
    
    
    if (error) throw error;

    Alert.alert("Le projet a bien été créé");

  } catch (error) {
    Alert.alert('Erreur lors de la création', error.message);
  } 
}

export function customUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
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

export async function get_project_contributors(id_subject) {
  try {
    const { data: contributors, error } = await supabase
      .from('Memoires_contributors')
      .select('*')
      .eq('id_subject', id_subject);

    if (error) throw error;

    // Ajout des noms des contributeurs à la liste des contributeurs
    const contributorsWithName = await Promise.all(contributors.map(async (contributor) => {
     
      const name = await get_user_name(contributor.id_user);
      return { ...contributor, name }; // Ajoute le nom au contributeur
    }));


    return contributorsWithName;

  } catch (error) {
    Alert.alert('Erreur lors de la recherche de contributeurs', error.message);
    return null;  // Assure-toi de retourner null en cas d'erreur
  }
}




export async function validate_project_contributors(id_subject,id_user,access,Inspirer,Raconter,Réagir,Structurer, Rédiger,Relire,Publier,Lire) {
  // Exemple de pseudo code, à adapter selon votre logique d'application
  try {

    const { data, error } = await supabase
      .from('Memoires_contributors') 
      .update({ access: access,Inspirer,Raconter,Réagir,Structurer, Rédiger,Relire,Publier,Lire})
      .eq('id_user', id_user)
      .eq('id_subject', id_subject); 

    if (error) throw error;

    return data
    
  } catch (error) {
    Alert.alert('Erreur lors la mise à jour du contributeur ', error.message);
  } 
}


export async function get_project_by_id(id) {
  // Exemple de pseudo code, à adapter selon votre logique d'application
  try {

    const { data, error } = await supabase
      .from('Memoires_subjects') // Remplacez 'projects' par le nom de votre table
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;

  } catch (error) {
    Alert.alert('Erreur lors de la recherche', error.message);
  } 
}


export async function delete_chapter(id_chapter) {
  // Exemple de pseudo code, à adapter selon votre logique d'application
  try {
    const { data, error } = await supabase
      .from('Memoires_chapters')
      .delete()
      .match({ id: id_chapter }); 
    
    if (error) throw error;

    Alert.alert("Le chapitre a bien été supprimé");

  } catch (error) {
    Alert.alert('Erreur lors de la suppression', error.message);
  } 
}


export async function edit_chapter(id_chapter, titre) {
  try {
    const { data, error } = await supabase
      .from('Memoires_chapters')
      .update({ title: titre })
      .eq('id', id_chapter);

    if (error) throw error;

    Alert.alert("La partie a bien été mis à jour");
  } catch (error) {
    Alert.alert('Erreur lors de la mise à jour', error.message);
  }
}

export async function edit_question(id_question, question) {
  try {

    const { data, error } = await supabase
      .from('Memoires_questions')
      .update({ question: question })
      .eq('id', id_question);

    if (error) throw error;

    Alert.alert("Le chapitre a bien été mis à jour");
  } catch (error) {
    Alert.alert('Erreur lors de la mise à jour', error.message);
  }
}


export async function delete_question(id_question) {
  // Exemple de pseudo code, à adapter selon votre logique d'application
  try {
    const { data, error } = await supabase
      .from('Memoires_questions')
      .delete()
      .match({ id: id_question }); 
    
    if (error) throw error;

    Alert.alert("La question a bien été supprimée");

  } catch (error) {
    Alert.alert('Erreur lors de la suppression', error.message);
  } 
}



export async function updateAnswer(id_answer, column_to_update, value) {
  try {
    const updates = {};
    updates[column_to_update] = value;

    const { error: errorUpdating } = await supabase
      .from('Memoires_answers')
      .update(updates)
      .match({ id: id_answer });

    if (errorUpdating) {
      throw errorUpdating;
    }
  } catch (errorUpdating) {
    Alert.alert('Erreur lors de la mise à jour : ', errorUpdating.message);
  }
}

export async function updateQuestion(id_question, column_to_update, value) {
  try {
    const updates = {};
    updates[column_to_update] = value;

    const { error: errorUpdating } = await supabase
      .from('Memoires_questions')
      .update(updates)
      .match({ id: id_question });

    if (errorUpdating) {
      throw errorUpdating;
    }
  } catch (errorUpdating) {
    Alert.alert('Erreur lors de la mise à jour : ', errorUpdating.message);
  }
}

export async function getUserStatus(id_user, id_subject) {
  try {

    
    const { data: status, error: fetchError } = await supabase
      .from('Memoires_contributors')
      .select('*')
      .eq('id_subject', id_subject)
      .eq('id_user', id_user)
      .single();


    

    if (status===null) {

      return "non trouvé";
    }
    if (fetchError) throw fetchError;

    return status;
  } catch (error) {
    Alert.alert('Erreur lors de la prise en compte de la copie : ', error.message);
    return "non trouvé";
  }
}



import { v4 as uuidv4 } from 'uuid';

// Fonction pour connecter les réponses
export async function connectAnswers(answers) {
  try {
    // Définir un nouveau UUID pour connection_new
    const connection_new = uuidv4();

    for (let answerId of answers) {
      // Chercher les answer.connection non vides dans la table answers
      const { data: answerData, error: fetchError } = await supabase
        .from('Memoires_answers')
        .select('connection')
        .eq('id', answerId);

      if (fetchError) {
        throw fetchError;
      }

      const existingConnections = answerData
        .map(answer => answer.connection)
        .filter(connection => connection !== null && connection !== '');

      // Mettre à jour les réponses existantes avec la nouvelle connexion
      const { error: updateError } = await supabase
        .from('Memoires_answers')
        .update({ connection: connection_new })
        .in('connection', existingConnections);

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour la réponse actuelle avec la nouvelle connexion
      const { error: currentUpdateError } = await supabase
        .from('Memoires_answers')
        .update({ connection: connection_new })
        .eq('id', answerId);

      if (currentUpdateError) {
        throw currentUpdateError;
      }
    }
    console.log('Answers successfully connected.');
  } catch (error) {
    console.error('Error connecting answers:', error.message);
  }
}

// Fonction pour déconnecter les réponses
export async function disconnectAnswers(answers) {
  try {
    for (let answerId of answers) {
      // Mettre answer.connection à null pour chaque id dans answers
      const { error: updateError } = await supabase
        .from('Memoires_answers')
        .update({ connection: null })
        .eq('id', answerId);

      if (updateError) {
        throw updateError;
      }
    }
    console.log('Answers successfully disconnected.');
  } catch (error) {
    console.error('Error disconnecting answers:', error.message);
  }
}

export async function moveAnswer(id_answer,new_rank) { 
  try {


    const { data, error: errorUpdating } = await supabase
      .from('Memoires_answers')
      .update({ rank: new_rank }) 
      .eq('id', id_answer);

    return
} catch (errorUpdating) {
  Alert.alert("Erreur", errorUpdating.message);
}
}



export async function linkAnalysis(suffix) { 
  try {
    // Vérification pour les questions


    if(!suffix){
      return { nature: '' }


    }

    const { data, error: errorExisting } = await supabase
      .from('Memoires_magic_link')
      .select('*')
      .eq('id', suffix)
      .eq('nature', 'question')
      .eq('expired', false)
      .single();


    if (data) {
      return { nature: 'question', id_question: data.id_question };
    }

    // Vérification pour les sujets
    const { data: data_subject, error: errorExisting_subject } = await supabase
      .from('Memoires_magic_link')
      .select('*')
      .eq('id', suffix)
      .eq('nature', 'subject')
      .eq('expired', false)
      .single();


    if (data_subject) {
      return { nature: 'subject', id_subject: data_subject.id_subject,Inspirer: data_subject.Inspirer,Raconter: data_subject.Raconter,Réagir: data_subject.Réagir,Structurer: data_subject.Structurer, Rédiger: data_subject.Rédiger,Relire: data_subject.Relire,Publier: data_subject.Publier,Lire: data_subject.Lire };
    }

    return { nature: 'normal' };
  } catch (error) {
    console.error("Erreur : ", error);
    return { nature: 'error', message: error.message };
  }
}

export async function getExistingLink(id_target,id_question_id_subject) { 
  try {
    // Vérification pour les questions
    const { data, error: errorExisting } = await supabase
      .from('Memoires_magic_link')
      .select('*')
      .eq(id_question_id_subject, id_target);


      return data;
    
  } catch (error) {
    console.error("Erreur : ", error);
    return { nature: 'error', message: error.message };
  }
}

export async function updateExistingLink(id_link, value, column) { 
  try {
    // Construction dynamique de l'objet de mise à jour
    const updateObject = {};
    updateObject[column] = value;

    const { data, error } = await supabase
      .from('Memoires_magic_link')
      .update(updateObject)
      .eq('id', id_link);

    if (error) {
      throw error; // Lance une exception pour être capturée dans le bloc catch
    }

    return data;
    
  } catch (error) {
    console.error("Erreur : ", error);
    return { nature: 'error', message: error.message };
  }
}


export async function createNewLink(id_target, id_question_id_subject) { 
  try {
    let link;
    const insertData = id_question_id_subject === 'id_question' 
      ? { nature: 'question', id_question: id_target }
      : { nature: 'subject', id_subject: id_target };

    const { data, error: errorCreatingLink } = await supabase
      .from('Memoires_magic_link')
      .insert([insertData])
      .single();

    if (errorCreatingLink) {
      throw errorCreatingLink;
    }

    link = data;
    return link;
  } catch (errorCreatingLink) {
    console.error("Erreur : ", errorCreatingLink);
    return { nature: 'error', message: errorCreatingLink.message };
  }
}


export async function getAnswer(id_answer) { 
  try {
    const { data, error }  = await supabase
    .from('Memoires_answers')
    .select(`*`)
    .eq('id', id_answer)
    .single();

    return data ;
  } catch (error) {
    console.error("Erreur : ", error);
  }
}


export async function update_answer_owner(id_answer,id_user) {
  try {



    const { data, error: errorUpdating } = await supabase
      .from('Memoires_answers')
      .update({ id_user: id_user }) // Assurez-vous que `answer` contient la nouvelle valeur de la réponse
      .eq('id', id_answer);

    return
} catch (errorUpdating) {
  Alert.alert("Erreur", errorUpdating.message);
}
}



export async function remember_active_subject(id_subject,id_user) {
  try {

    const { data, error } = await supabase
    .from('profiles')
    .update({ active_biography: id_subject })
    .eq('id', id_user);

if (error) {
    throw error;
}


    return
} catch (errorUpdating) {
  Alert.alert("Erreur", errorUpdating.message);
}
}


export async function get_Profile(id_to_be_found) {
  try {


    const { data, error} = await supabase
                .from('profiles')
                .select(`*`)
                .eq('id', id_to_be_found)
                .single()


    return data
} catch (error) {
  Alert.alert("Erreur", errorUpdating.message);
}
}


export async function deleteExistingLink(id_link) { 
  try {

    const { data, error } = await supabase
      .from('Memoires_magic_link')
      .delete()
      .match({ id: id_link }); 

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erreur : ", error);
  }
}

export async function deleteExistingContributor(id_user,id_subject) { 
  try {
    const { data, error } = await supabase
      .from('Memoires_contributors')
      .delete()
      .match({ id_user: id_user,id_subject: id_subject  });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erreur : ", error);
  }
}


export async function createTheme(theme,id_subject) { 
  try {

    const id = customUUIDv4(); 

    const { error } = await supabase
      .from('Memoires_connections')
      .insert([
        { theme: theme, id: id, id_subject:id_subject}
      ]);

      return {id:id , theme: theme} ;

  } catch (error) {
    console.error("Erreur : ", error);
  }
}

export async function deleteTheme(id_theme) { 
  try {

    const { data, error } = await supabase
    .from('Memoires_connections')
    .delete()
    .match({id: id_theme}); 

      return ;

  } catch (error) {
    console.error("Erreur : ", error);
  }
}


export async function updateTheme(id_theme,theme) { 
  try {

      const { error: errorUpdating } = await supabase
      .from('Memoires_connections')
      .update({ theme: theme })
      .match({ id: id_theme });

      return ;

  } catch (errorUpdating) {
    console.error("Erreur : ", errorUpdating);
  }
}

export async function getTheme_byProject(id_subject) { 
  try {

    const { data, error }  = await supabase
    .from('Memoires_connections')
    .select(`*`)
    .eq('id_subject', id_subject);

    return data ;
  } catch (error) {
    console.error("Erreur : ", error);
  }
}

export async function getTheme_byUser(id_user,id_subject) { 
  try {
    const { data, error }  = await supabase
    .from('Memoires_connections')
    .select(`*`)
    .eq('id_user', id_user)
    .eq('id_subject', id_subject);;

    return data ;
  } catch (error) {
    console.error("Erreur : ", error);
  }
}
