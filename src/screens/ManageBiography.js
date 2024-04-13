import React from 'react'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, Button, Text, Alert, Keyboard, TouchableWithoutFeedback, TextInput, TouchableOpacity } from 'react-native'
import { globalStyles } from '../../global'
import { listSubjects, joinSubject, getSubjects, get_project, create_project, get_project_contributors,validate_project_contributors, get_project_by_id,getSubjects_pending} from '../components/data_handling';
import { saveActiveSubjectId, getActiveSubjectId } from '../components/local_storage';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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



    const navigateToScreen = (screenName, params) => {
        navigation.navigate(screenName, params);
      };


    async function fetchSubjects() {

        if (session) {
            getProfile();
            try {
                const temp = await getSubjects(session.user.id);
                const temp_bis = await getSubjects_pending(session.user.id);
                setSubjects_active(temp);
                setSubjects_pending(temp_bis);


                // Si vous souhaitez également rafraîchir la liste des sujets disponibles à rejoindre
                const temp2 = await listSubjects(session.user.id);
                setSubjects(temp2);


            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        }
        console.log("Coucou !")
    }

    useEffect(() => {

        fetchSubjects();
    }, [session]);

    useEffect(() => {
        console.log(subject_active.id)
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
        await validate_project_contributors(subject_active.id, contributor.id_user, newAuthorization);
        // Après la validation, rafraîchir la liste des contributeurs pour afficher la mise à jour
        await fetchContributors();
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'autorisation:", error);
        Alert.alert("Erreur", "Impossible de mettre à jour l'autorisation du contributeur.");
    }
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
                const temp = await get_project_by_id(data.active_biography)
                setSubject_active(temp)
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
<View style={styles.navigationContainer}>
      <TouchableOpacity onPress={() => navigateToScreen('ReadAnswersScreen')} style={styles.navButton}>
        <FontAwesome name="arrow-left" size={28} color="black" />
      </TouchableOpacity>
      
    </View>
                        {subjects_active.length > 0 ? (
                            <>
                                <Text style={globalStyles.title}>Biographies auxquelles vous contribuez</Text>
                                {subjects_active.map((subject) => (
                                    <TouchableOpacity key={subject.content_subject.id} style={[globalStyles.globalButton_tag, subject_active.id === subject.content_subject.id ? styles.SelectedTag : styles.unSelectedTag]} onPress={() => handleJoinSubject(subject.content_subject.id)}>
                                        <Text style={[globalStyles.buttonText, subject_active.id === subject.content_subject.id ? globalStyles.globalButtonText_active : globalStyles.globalButtonText]}>
                                            {subject.content_subject.title} {subject_active.id === subject.content_subject.id ? "(actif)" : ""}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                {subjects_pending.map((subject) => (
                                    <TouchableOpacity key={subject.content_subject.id} style={[globalStyles.globalButton_tag, subject_active.id === subject.content_subject.id ? styles.SelectedTag : styles.unSelectedTag]}>
                                        <Text style={[globalStyles.buttonText, subject_active.id === subject.content_subject.id ? globalStyles.globalButtonText_active : globalStyles.globalButtonText]}>
                                            {subject.content_subject.title} - accès en attente de validation
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </>
                        ) : (
                            <Text>Vous ne contribuez à aucune biographie actuellement.</Text>
                        )}

                        <Text></Text>
                        <Text></Text>
                        <Text></Text>
                        <Text></Text>
                        <Text></Text>


                        <Text style={globalStyles.title}>Vous souhaitez contribuer à une autre projet ? </Text>
                        <TouchableOpacity style={showProjects ? globalStyles.globalButton : globalStyles.globalButton_active} onPress={() => setShowProjects(!showProjects)}>
                            <Text style={globalStyles.globalButtonText}>{showProjects ? "Masquer les projets" : "Rejoindre un nouveau projet biographique"}</Text>
                        </TouchableOpacity>

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
              <MaterialIcons name="search" size={24} color="black" />
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

        
<TouchableOpacity style={showNewProject? globalStyles.globalButton : globalStyles.globalButton_active} onPress={() => setShowNewProject(!showNewProject)}>
                            <Text style={globalStyles.globalButtonText}>{showNewProject ? "Abandonner la création" : "Créer un nouveau projet"}</Text>
                        </TouchableOpacity>
                        {showNewProject && (
  <>

<View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nom du nouveau projet"
              value={newName}
              onChangeText={(text) => setNewName(text)}
            />
            <TouchableOpacity onPress={async () => {await create_project(newName,session.user.id,"En attente");await fetchSubjects();}} style={styles.icon}>
              <Ionicons name="add-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

    
  </>
)}
<TouchableOpacity
    style={showContributors ? globalStyles.globalButton : globalStyles.globalButton_active}
    onPress={() => {
        setShowContributors(!showContributors);
        fetchContributors();
    }}
>
    <Text style={globalStyles.globalButtonText}>Gestion des accès au projet {subject_active && `: ${subject_active.title}`}</Text>
</TouchableOpacity>

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
        backgroundColor: '#b1b3b5', // Couleur de fond plus douce pour les tags non sélectionnés
        marginVertical: 5, // Ajoute un peu d'espace verticalement autour de chaque tag
        borderRadius: 5, // Bords arrondis pour les tags
        borderWidth: 0.5, // Légère bordure pour définir les tags
        borderColor: '#d0d0d0', // Couleur de la bordure
        padding: 10, // Espace intérieur pour rendre le tag plus grand
    },
    SelectedTag: {
        backgroundColor: '#0b2d52',// Couleur de fond plus douce pour les tags non sélectionnés
        marginVertical: 5, // Ajoute un peu d'espace verticalement autour de chaque tag
        borderRadius: 5, // Bords arrondis pour les tags
        borderWidth: 0.5, // Légère bordure pour définir les tags
        borderColor: '#d0d0d0', // Couleur de la bordure
        padding: 10, // Espace intérieur pour rendre le tag plus grand
        shadowColor: '#000', // Ombre pour iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    



})


