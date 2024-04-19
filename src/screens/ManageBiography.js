import React from 'react'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native';
import { Image, View, StyleSheet, Button, Text, Alert, Keyboard, TouchableWithoutFeedback, TextInput, TouchableOpacity } from 'react-native'
import { globalStyles } from '../../global'
import { listSubjects, joinSubject, getSubjects, get_project, create_project, get_project_contributors,validate_project_contributors, get_project_by_id,getSubjects_pending} from '../components/data_handling';
import { saveActiveSubjectId, getActiveSubjectId } from '../components/local_storage';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ArrowLeftIcon from '../../assets/icons/arrow-left-solid.svg';
import SearchIcon from '../../assets/icons/search_black_24dp.svg';
import AddIcon from '../../assets/icons/add_circle_black_24dp.svg';
import refresh from '../../assets/icons/refresh_black_24dp.svg';
import PersonIcon from '../../assets/icons/person.svg';
import help from '../../assets/icons/help-circle.svg';
import trash from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import settings from '../../assets/icons/settings.svg';
import LinkIcon from '../../assets/icons/link.png';
import expand_more from '../../assets/icons/expand_more_black_24dp.svg';
import expand_less from '../../assets/icons/expand_less_black_24dp.svg';
import edit from '../../assets/icons/pen-to-square-regular.svg';
import Svg, { Path } from 'react-native-svg';
import BookIcon from '../../assets/icons/book.svg';




export default function ProfileScreen({ route }) {
    const session = route.params.session
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [full_name, setFull_name] = useState('')
    const navigation = useNavigation();

    const [subjects, setSubjects] = useState([]);
    const [subjects_active, setSubjects_active] = useState([]);
    
    const [subjects_pending, setSubjects_pending] = useState([]);
    const [subject_active, setSubject_active] = useState({id:0});
    const [vision, setVision] = useState('Biographies');
    const [showProjects, setShowProjects] = useState(false);
    const [showNewProject, setShowNewProject] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [newName, setNewName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [contributors, setContributors] = useState([]);
    const [showContributors, setShowContributors] = useState(false);
    const [showChangeProject, setShowChangeProject] = useState(false);



    const navigateToScreen = (screenName, params) => {
        navigation.navigate(screenName, params);
      };


    async function fetchSubjects() {

        if (session) {
            getProfile();
            try {
                console.log("session.user",session.user)
                const temp = await getSubjects(session.user.id);
                const temp_bis = await getSubjects_pending(session.user.id);
                setSubjects_active(temp);
                setSubjects_pending(temp_bis);


                // Si vous souhaitez également rafraîchir la liste des sujets disponibles à rejoindre
                console.log("session.user_bis",session.user)
                const temp2 = await listSubjects(session.user.id);
                setSubjects(temp2);


            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        }
  
    }

    useEffect(() => {

        fetchSubjects();
    }, [session]);

    useEffect(() => {
        console.log("subject_active")
        console.log(subject_active)
        saveActiveSubjectId(String(subject_active.id));

    }, [subject_active]);


    const handleJoinSubject = async (id) => {
      get_project_by_id(id).then(temp => {
        setSubject_active(temp);
    }).catch(error => {
        console.error("Une erreur s'est produite lors de la récupération du projet:", error);
        // Vous pouvez ici gérer l'erreur comme bon vous semble
    });
    

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ active_biography: id })
                .eq('id', session?.user.id);

            if (error) {
                throw error;
            }

            console.log('Mise à jour réussie', data);

            // Après une mise à jour réussie, rafraîchissez les données
            await fetchSubjects(); // Cette fonction va récupérer à nouveau les sujets actifs et disponibles
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil', error.message);
        }
    };


    const fetchContributors = async () => {
      if(subject_active) {
          try {
            console.log("subject_active_bis")
            console.log(subject_active)
              const result = await get_project_contributors(subject_active.id);
              if(result.error) {
                  throw result.error;
              }
              console.log("result :",result)
              setContributors(result);
          } catch (error) {
              console.error("Error fetching project contributors:", error);
          }
      }
  };
    

  const toggleAuthorization = async (contributor) => {
    let newAuthorization;
    switch (contributor.authorized) {
        case 'Oui':
            newAuthorization = 'Non';
            break;
        case 'Non':
            newAuthorization = 'En attente';
            break;
        case 'En attente':
            newAuthorization = 'Oui';
            break;
        default:
            newAuthorization = 'En attente'; // Valeur par défaut si aucun cas n'est correspondant
    }

    try {
        console.log("subject_active_ter")
        console.log(subject_active)
        await validate_project_contributors(subject_active.id, contributor.id_user, newAuthorization);
        // Après la validation, rafraîchir la liste des contributeurs pour afficher la mise à jour
        await fetchContributors();
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'autorisation:", error);
        Alert.alert("Erreur", "Impossible de mettre à jour l'autorisation du contributeur.");
    }
};

const handleCreateProject = () => {
    if (!newName.trim()) {
        Alert.alert("Validation Error", "Please enter a valid project name.");
        return;
    }
    setLoading(true);

    create_project(newName, session.user.id)
        .then(creationResult => {
            if (creationResult.success) {
                return fetchSubjects();  // Continuer avec la récupération des sujets si la création est réussie
            } else {
                throw new Error(creationResult.error.message); // Lancer une erreur si la création a échoué
            }
        })
        .then(() => {
            setNewName(''); // Réinitialiser le nom du projet après le rafraîchissement des sujets
        })
        .catch(error => {
            Alert.alert("Failed to create project", error.message || "An unknown error occurred."); // Gérer les erreurs de création ou de récupération des sujets
        })
        .finally(() => {
            setLoading(false); // Arrêter l'indicateur de chargement peu importe le résultat
        });
};





    async function getProfile() {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`*`)
                .eq('id', session?.user.id)
                .single()
            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setUsername(data.username)
                setFull_name(data.full_name)
                if(data.active_biography != null){
                const temp = await get_project_by_id(data.active_biography)
                setSubject_active(temp)
            }
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    




    return (

<View style={{ flex: 1, backgroundColor: "#E8FFF6" }}>
            <View style={globalStyles.container}>
            <View style={globalStyles.navigationContainer}>
      
            <TouchableOpacity onPress={() => navigateToScreen('ReadAnswersScreen')} style={styles.navButton}>
      <Image source={BookIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
      </TouchableOpacity>
  <TouchableOpacity onPress={() => navigateToScreen('ProfileScreen')} style={styles.navButton}>

  <Image source={PersonIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />

      </TouchableOpacity>
  <TouchableOpacity onPress={() => navigateToScreen('AideScreen')} style={styles.navButton}>
  <Image source={help} style={{ width: 60, height: 60, opacity: 0.5 }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToScreen('ManageBiographyScreen')} style={styles.navButton}>
      <Image source={settings} style={{ width: 80, height: 80, opacity: 1 }} />
      </TouchableOpacity>
    </View>




                     
                                <Text style={globalStyles.title}>Vous travaillez actuellement sur le projet : {subject_active && ` ${subject_active.title}`}</Text>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>

<TouchableOpacity
    style={showContributors ?  globalStyles.globalButton_active : globalStyles.globalButton_narrow}
    onPress={() => {
        setShowChangeProject(false);
        setShowContributors(!showContributors);
        fetchContributors();
    }}
>
    <Text style={globalStyles.globalButtonText}>Gérer les droits d'accès au projet </Text>
</TouchableOpacity>

<TouchableOpacity
    style={showChangeProject ? globalStyles.globalButton_active : globalStyles.globalButton_narrow}
    onPress={() => {
        setShowContributors(false);
        setShowChangeProject(!showChangeProject);
   
    }}
>
    <Text style={globalStyles.globalButtonText}>Changer le projet </Text>
</TouchableOpacity>
</View>


{showContributors && (
    <View>
        {contributors?.length > 0 ? (
            contributors.map((contributor) => (
                <View key={contributor.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                    <Text>{contributor.name} - Accès au projet : </Text>
                    <TouchableOpacity onPress={() => toggleAuthorization(contributor)}>
                        <Text style={{color: '#007BFF'}}>{contributor.authorized}</Text>
                    </TouchableOpacity>
                </View>
            ))
        ) : (
            <Text>Aucun contributeur pour ce projet</Text>
        )}
    </View>
)}



{showChangeProject && (

<> 
{subjects_active.length > 0 ? (
                            <>


                                <Text style={globalStyles.title}>Projets auxquels vous contribuez</Text>
                                {subjects_active.map((subject) => (
    <TouchableOpacity key={subject.content_subject.id} 
        style={[globalStyles.globalButton_tag, subject_active === subject.content_subject.id ? styles.SelectedTag : styles.unSelectedTag]} 
        onPress={() => handleJoinSubject(subject.content_subject.id)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
           
            <Text style={[
                globalStyles.buttonText, 
                subject_active.id === subject.content_subject.id ? globalStyles.globalButtonText_active : globalStyles.globalButtonText, 
                { color: 'black' }]}>

                {subject.content_subject.title} {subject_active.id === subject.content_subject.id ? "(actif)" : ""}
            </Text>
        </View>
    </TouchableOpacity>
))}

            
{subjects_pending.map((subject) => (
    <TouchableOpacity 
        key={subject.content_subject.id} 
        style={[
            globalStyles.globalButton_tag, 
            subject_active.id === subject.content_subject.id ? styles.SelectedTag : styles.unSelectedTag
        ]}>
        <Text style={[
            globalStyles.buttonText, 
            subject_active.id === subject.content_subject.id ? globalStyles.globalButtonText_active : globalStyles.globalButtonText,
            { color: 'black' }]}>
            {subject.content_subject.title} - accès en attente de validation
        </Text>
    </TouchableOpacity>
))}

 </>
                        ) : (
                            <Text>Vous ne contribuez à aucune biographie actuellement.</Text>
                        )}
                                
                        <Text style={globalStyles.title}>Vous souhaitez contribuer à une autre projet ? </Text>

<View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
<TouchableOpacity style={showProjects ? globalStyles.globalButton_narrow : globalStyles.globalButton_active} onPress={() => {setShowProjects(!showProjects),setShowNewProjects(false)}}>
    <Text style={globalStyles.globalButtonText}>{showProjects ? "Masquer les projets" : "Rejoindre un projet existant"}</Text>
</TouchableOpacity>
<TouchableOpacity style={showNewProject? globalStyles.globalButton_narrow : globalStyles.globalButton_active} onPress={() => {setShowNewProject(!showNewProject),setShowProjects(false)}}>
    <Text style={globalStyles.globalButtonText}>{showNewProject ? "Abandonner la création" : "Créer un nouveau projet"}</Text>
</TouchableOpacity>
</View>
{showProjects && (
<>

<View style={styles.searchContainer}>
<TextInput
style={styles.input}
placeholder="Rechercher un projet"
value={searchName}
onChangeText={(text) => setSearchName(text)}
/>
<TouchableOpacity onPress={() => get_project(searchName, setLoading, setSearchResults)} style={styles.icon}>
<Image source={SearchIcon} style={{ width: 24, height: 24, opacity: 0.5 }} />
</TouchableOpacity>
</View>

{searchResults.map((result) => (
<TouchableOpacity
key={result.id}
style={[globalStyles.globalButton_tag, styles.unSelectedTag]}
onPress={async () => {
await joinSubject(result.id,session.user.id);
fetchSubjects();
}}
>
<Text style={globalStyles.globalButtonText_tag}>{result.title}</Text>
</TouchableOpacity>
))}
</>
)}



{showNewProject && (
<>

<View style={styles.searchContainer}>
<TextInput
style={styles.input}
placeholder="Nom du nouveau projet"
value={newName}
onChangeText={(text) => setNewName(text)}
/>
<TouchableOpacity onPress={handleCreateProject} style={styles.icon}>
<Image source={AddIcon} style={{ width: 26, height: 26, opacity: 0.5 }} />
</TouchableOpacity>
</View>


</>
)}

</>)}

                            

                      







            </View>
            </View>
    )


}

const styles = StyleSheet.create({
    navigationContainer: {
        flexDirection: 'row', // Organise les éléments enfants en ligne
        justifyContent: 'space-between', // Distribue l'espace entre les éléments enfants
        padding: 10, // Ajoute un peu de padding autour pour éviter que les éléments touchent les bords
      },
      navButton: {
        // Style pour les boutons de navigation
        padding: 10, // Ajoute un peu de padding pour rendre le touchable plus grand
        // Ajoutez d'autres styles ici selon le design souhaité
        alignItems: 'center', // Centre le contenu (l'icône) du bouton
      },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: '#f9f9f9', // Légère couleur de fond pour le conteneur de recherche
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
        flex: 1,
        height: 40,
        padding: 10,
      },
      icon: {
        marginLeft: 10,
      },
      unSelectedTag: {
        backgroundColor: 'transparent', // Couleur de fond plus douce pour les tags non sélectionnés
        marginVertical: 5, // Ajoute un peu d'espace verticalement autour de chaque tag
        borderRadius: 5, // Bords arrondis pour les tags
        borderWidth: 0.5, // Légère bordure pour définir les tags
        borderColor: 'transparent', // Couleur de la bordure
        padding: 10, // Espace intérieur pour rendre le tag plus grand
    },
    SelectedTag: {
        backgroundColor: 'transparent',// Couleur de fond plus douce pour les tags non sélectionnés
        marginVertical: 5, // Ajoute un peu d'espace verticalement autour de chaque tag
        borderRadius: 5, // Bords arrondis pour les tags
        borderWidth: 0.5, // Légère bordure pour définir les tags
        borderColor: 'transparent', // Couleur de la bordure
        padding: 10, // Espace intérieur pour rendre le tag plus grand

    },
    



})


