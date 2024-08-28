import React from 'react'
import { useState, useEffect,useRef } from 'react'
import { useNavigation } from '@react-navigation/native';
import { Modal, Image, View, StyleSheet, Button, Text, Alert, Keyboard, TouchableWithoutFeedback, TextInput, TouchableOpacity } from 'react-native'
import { globalStyles } from '../../global'
import { getUserStatus, deleteExistingContributor, deleteExistingLink, listSubjects, joinSubject, getSubjects, get_project, create_project, get_project_contributors, validate_project_contributors, get_project_by_id, getSubjects_pending, getExistingLink,updateExistingLink,createNewLink,remember_active_subject,get_Profile } from '../components/data_handling';
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
import settings from '../../assets/icons/accueil.png';
import LinkIcon from '../../assets/icons/link.png';
import expand_more from '../../assets/icons/expand_more_black_24dp.svg';
import expand_less from '../../assets/icons/expand_less_black_24dp.svg';
import edit from '../../assets/icons/pen-to-square-regular.svg';
import Svg, { Path } from 'react-native-svg';
import BookIcon from '../../assets/icons/book.svg';
import note from '../../assets/icons/notes.png';
import { Picker } from '@react-native-picker/picker';
import Clipboard from '@react-native-clipboard/clipboard';
import { Dimensions } from 'react-native';






export default function ProfileScreen({ route }) {
    const session = route.params.session
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [full_name, setFull_name] = useState('')
    const navigation = useNavigation();

    const [subjects, setSubjects] = useState([]);
    console.log("test 1")
    const [subjects_active, setSubjects_active] = useState([]);


    const [subjects_pending, setSubjects_pending] = useState([]);
    const [subject_active, setSubject_active] = useState({ id: 0 });
    const [vision, setVision] = useState('Biographies');
    const [showProjects, setShowProjects] = useState(false);
    const [showNewProject, setShowNewProject] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [newName, setNewName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [contributors, setContributors] = useState([]);
    const [contributorStates, setContributorStates] = useState({});

    const [showContributors, setShowContributors] = useState(false);
    const [showChangeProject, setShowChangeProject] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinMessage, setJoinMessage] = useState("");
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [links, setLinks] = useState(false);
    const [userStatus, setUserStatus] = useState('');
    const prevSubjectActiveRef = useRef(subject_active);
    const prevSessionRef = useRef(session);
    




    useEffect(() => {
        const updateLayout = () => {
            const { width } = Dimensions.get('window');
            setIsLargeScreen(width > 768); // Exemple de seuil pour grand écran
        };
    
        const subscription = Dimensions.addEventListener('change', updateLayout);
        updateLayout(); // Appeler une fois pour définir l'état initial
    
        return () => {
            subscription?.remove(); // Supprimez l'abonnement pour éviter les fuites de mémoire
        };
    }, []);

const copyLinkToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Lien copié dans le presse-papier', text);
  };
  
  const toggleLinkStatus = async (index) => {
    const linkToUpdate = links[index];
    const newExpired = !linkToUpdate.expired;
    await updateExistingLink(linkToUpdate.id, newExpired);
    const updatedLinks = links.map((link, idx) => 
      idx === index ? { ...link, expired: newExpired } : link
    );
    setLinks(updatedLinks);
  };
  
  useEffect(() => {
console.log("subjects_active : ",subjects_active)
  },[subjects_active]);

  useEffect(() => {



    const fetchUserStatus = async () => {
      if (!subject_active?.id) return;
      const status = await getUserStatus(session.user.id, subject_active.id);
      console.log("UserStatus :",status)
      setUserStatus(status);
      
    };
    if(subject_active && subject_active.id){
        console.log("subject_active.id : ",subject_active.id)
      fetchUserStatus();
    }
    
    
  }, [subject_active]);



    const navigateToScreen = (screenName, params) => {
        navigation.navigate(screenName, params);
    };


    async function fetchSubjects() {

        if (session) {
            getProfile();
            try {

                const temp = await getSubjects(session.user.id);
                console.log("temp : ",temp)
                const temp_bis = await getSubjects_pending(session.user.id);
                setSubjects_active(temp);
                setSubjects_pending(temp_bis);

                

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

        if (subject_active &&subject_active.id!=0) {
        const fetchLinks = async () => {
            saveActiveSubjectId(String(subject_active.id));
            const links = await getExistingLink(subject_active.id, 'id_subject');
            setLinks(links);
        };
    
        if (subject_active.id) {
            fetchLinks();
        }
    }
    }, [subject_active]);
    


    const handleJoinSubject = async (id) => {
        get_project_by_id(id).then(temp => {
            setSubject_active(temp);
        }).catch(error => {
            console.error("Une erreur s'est produite lors de la récupération du projet:", error);
            // Vous pouvez ici gérer l'erreur comme bon vous semble
        });


        
    


        try {
            await remember_active_subject(id,session?.user.id)
            
            // Après une mise à jour réussie, rafraîchissez les données

            await fetchSubjects(); // Cette fonction va récupérer à nouveau les sujets actifs et disponibles
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil', error.message);
        }
    };

    const handleConnectSubject = (id) => {
        setSelectedSubject(id);
        setShowJoinModal(true); // Affiche la modale
    };
    

    const fetchContributors = async () => {
        if (subject_active) {
            try {
                const result = await get_project_contributors(subject_active.id);
                if (result.error) {
                    throw result.error;
                }
                const initialStates = result.reduce((acc, contributor) => {
                    acc[contributor.id_user] = {
                        access: contributor.access === true,
                        notes: contributor.notes || 'Pas d\'accès',
                        chapters: contributor.chapters || 'Pas d\'accès',
                    };
                    return acc;
                }, {});
               
                setContributors(result);
                setContributorStates(initialStates);
            } catch (error) {
                console.error("Error fetching project contributors:", error);
            }
        }
    };
    


    const toggleAuthorization = async (contributor) => {
        const state = contributorStates[contributor.id_user];
        try {
   
            await validate_project_contributors(
                subject_active.id,
                contributor.id_user,
                state.access,  // Utilise la valeur booléenne
                state.notes,
                state.chapters
            );
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

                setShowModal(true);  // Afficher la modal
   
                return fetchSubjects();  // Continuer avec la récupération des sujets si la création est réussie

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

            const data = await get_Profile(session?.user.id)
            


            if (data) {
                setUsername(data.username)
                setFull_name(data.full_name)
                if (data.active_biography != null) {
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

    const sortedSubjectsActive = subjects_active.sort((a, b) => {
        if (a.content_subject.id === subject_active.id) return -1;
        if (b.content_subject.id === subject_active.id) return 1;
        return 0;
    });




    return (
        <View style={globalStyles.container}>
            <View style={[globalStyles.navigationContainer, { position: 'fixed', bottom: '0%', alignSelf: 'center' }]}>

                <TouchableOpacity
  onPress={() => { navigateToScreen('Orientation') }}
  style={[globalStyles.navButton, isHovered && globalStyles.navButton_over]}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  <Image source={BookIcon} style={{ width: 120, height: 120, opacity: 0.5 }} />
</TouchableOpacity>
                {/* 
                <TouchableOpacity onPress={() => navigateToScreen('NoteScreen')} style={styles.navButton}>
                    <Image source={note} style={{ width: 60, height: 60, opacity: 0.5 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateToScreen('ManageBiographyScreen')} style={styles.navButton}>
                    <Image source={settings} style={{ width: 60, height: 60, opacity: 1 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateToScreen('ProfileScreen')} style={styles.navButton}>
                    <Image source={PersonIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
                </TouchableOpacity>
            */}
                </View>
    
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setShowModal(!showModal);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Le projet a bien été créé!</Text>
                        <Button
                            title="OK"
                            onPress={() => {
                                setShowModal(!showModal);
                  
                                fetchSubjects();
                            }}
                        />
                    </View>
                </View>
            </Modal>
    
            <Text style={globalStyles.title}>
                {subject_active && subject_active.title ? `Vous travaillez actuellement sur le projet : ${subject_active.title}` : "Veuillez sélectionner un projet afin de pouvoir y contribuer activement."}
            </Text>
    
            {/* Première partie */}
            {subject_active && subject_active.title && (
                <View>

                    <TouchableOpacity
                        style={showContributors ? globalStyles.globalButton_active : globalStyles.globalButton_wide}
                        onPress={() => {
                            setShowChangeProject(false);
                            setShowContributors(!showContributors);
                            fetchContributors();
                        }}
                    >
                        <Text style={globalStyles.globalButtonText}>Gérer les droits d'accès du projet actif </Text>
                    </TouchableOpacity>
                </View>
            )}
            {showContributors && (<View style={globalStyles.container_wide}> 
            {contributors?.length > 0 ? (
                <>
                    {isLargeScreen && (
                        <View style={styles.headerRow}>
                            <Text style={styles.headerText}>Utilisateur</Text>
                            <Text style={styles.headerText}>Accès au projet</Text>
                         
                        </View>
                    )}
                    {contributors.map((contributor) => (
    <View key={contributor.id_user} style={isLargeScreen ? styles.contributorRow : styles.contributorColumn}>
        <Text style={styles.contributorText}>{contributor.name}</Text>
        {!isLargeScreen && <Text style={styles.labelText}>Accès :</Text>}
        <Picker
    selectedValue={contributorStates[contributor.id_user]?.access ? 'Oui' : 'Non'}
    onValueChange={async (itemValue) => {
        const newState = {
            ...contributorStates,
            [contributor.id_user]: {
                ...contributorStates[contributor.id_user],
                access: itemValue === 'Oui'
            }
        };
        setContributorStates(newState);
        await validate_project_contributors(
            subject_active.id,
            contributor.id_user,
            newState[contributor.id_user].access,
            newState[contributor.id_user].notes,
            newState[contributor.id_user].chapters
        );
    }}
    
    style={styles.picker}
>

    <Picker.Item label="Oui" value="Oui" />
    <Picker.Item label="Non" value="Non" />
</Picker>


       

        <TouchableOpacity onPress={async () => {
    await deleteExistingContributor(contributor.id_user, subject_active.id);
    fetchContributors();
}}>
    <Image source={trash} style={{ width: 40, height: 40, opacity: 0.5 }} />
</TouchableOpacity>
    </View>
))}

                </>
            ) : (
                <Text>Aucun contributeur pour ce projet</Text>
            )}
    {links?.length > 0 && (
  <>
  <Text> </Text>
    <Text style={globalStyles.title}>Liens de partage</Text>
    <View style={styles.headerRow}>
      <Text style={styles.headerText}>Date de création</Text>
      <Text style={styles.headerText}>Lien actif</Text>
      <Text style={styles.headerText}>Actions</Text>
    </View>
    {links.map((link, index) => (
      <View key={link.id} style={styles.linkRow}>
        <Text style={styles.linkText}>{new Date(link.created_at).toLocaleString()}</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, !link.expired && styles.activeToggle]}
            onPress={() => toggleLinkStatus(index)}
          >
            <View style={[
              styles.toggleButtonCircle,
              { left: link.expired ? 2 : null, right: link.expired ? null : 2 }
            ]} />
          </TouchableOpacity>
        </View>
        <View style={styles.toggleContainer}>
          <TouchableOpacity onPress={() => copyLinkToClipboard(`https://bioscriptum.com/marcel/${link.id}`)}>
            <Text style={styles.copyButtonText}>Copier le lien de partage</Text>
          </TouchableOpacity>
   
        </View>
        <TouchableOpacity onPress={async () => {
    await deleteExistingLink(link.id);
    setLinks(await getExistingLink(subject_active.id, 'id_subject'));
}}>
    <Image source={trash} style={{ width: 40, height: 40, opacity: 0.5 }} />
</TouchableOpacity>
      </View>
    ))}

  </>
)}

<TouchableOpacity style={styles.createLinkButtonContainer} onPress={async () => {
  await createNewLink(subject_active.id, 'id_subject');
  setLinks(await getExistingLink(subject_active.id, 'id_subject'));
}}>
  <View style={styles.createLinkButton}>
    <Text style={globalStyles.globalButtonText}>Créer un nouveau lien</Text>
  </View>
</TouchableOpacity>


    </View>)}
            {/* Deuxième partie */}
            {subjects_active.length > 0 && (
                <View>

                    <TouchableOpacity
                        style={showChangeProject ? globalStyles.globalButton_active : globalStyles.globalButton_wide}
                        onPress={() => {
                            setShowContributors(false);
                            setShowChangeProject(!showChangeProject);
                        }}
                    >
                        <Text style={globalStyles.globalButtonText}>{subject_active && subject_active.title ? "Changer le projet" : "Sélectionner un projet"} </Text>
                    </TouchableOpacity>
                </View>
            )}
    
            
    
            {showChangeProject && (
                <>
                    {subjects_active.length > 0 ? (
                        <View style={globalStyles.container_wide}>
                            <Text style={globalStyles.title}>Projets auxquels vous contribuez</Text>
                            {sortedSubjectsActive.map((subject) => (
            <TouchableOpacity
                key={subject.content_subject.id}
                style={[
                    globalStyles.globalButton_tag,
                    subject_active.id === subject.content_subject.id ? styles.SelectedTag : styles.unSelectedTag
                ]}
                onPress={() => handleJoinSubject(subject.content_subject.id)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Text style={[
                        globalStyles.buttonText,
                        subject_active.id === subject.content_subject.id ? globalStyles.globalButtonText_active : globalStyles.buttonText,
                        { textAlign: 'left', flex: 1, fontWeight: subject_active.id === subject.content_subject.id ? 'bold' : 'normal' }
                    ]}>
                        {subject.content_subject.title}
                    </Text>
                    {subject_active.id === subject.content_subject.id && (
                        <Text style={[
                            globalStyles.buttonText,
                            { textAlign: 'right', fontWeight: 'bold' }
                        ]}>
                            (actif)
                        </Text>
                    )}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Text style={[
                        globalStyles.buttonText,
                        { textAlign: 'left', flex: 1 }
                    ]}>
                        {subject.content_subject.title}
                    </Text>
                    <Text style={[
                        globalStyles.buttonText,
                        { textAlign: 'right' }
                    ]}>
                        (accès en attente de validation)
                    </Text>
                </View>
            </TouchableOpacity>
        ))}
    
                        </View>
                    ) : (
                        <Text>Vous ne contribuez à aucun projet actuellement.</Text>
                    )}
                </>
            )}
    
            {/* Troisième partie */}
            <View>


                    <TouchableOpacity style={!showProjects ? globalStyles.globalButton_wide: globalStyles.globalButton_active} onPress={() => { setShowProjects(!showProjects), setShowNewProject(false) }}>
                        <Text style={globalStyles.globalButtonText}>{showProjects ? "Masquer les projets" : "Rejoindre un projet existant"}</Text>
                    </TouchableOpacity>

        
                {showProjects && (
                    <View style={globalStyles.container_wide}>

                        <View style={globalStyles.searchContainer}>
                            <TextInput
                                style={globalStyles.input}
                                placeholder="Rechercher un projet"
                                value={searchName}
                                onChangeText={(text) => setSearchName(text)}
                            />
                            <TouchableOpacity onPress={() => get_project(searchName, setLoading, setSearchResults)} style={styles.icon}>
                                <Image source={SearchIcon} style={{ width: 24, height: 24, opacity: 0.5 }} />
                            </TouchableOpacity>
                        </View>
    
                        {searchResults
                            .filter(result => !subjects_active.some(subject => subject.content_subject.id === result.id))
                            .map((result) => (
                                <TouchableOpacity
                                    key={result.id}
                                    style={[globalStyles.globalButton_tag, styles.unSelectedTag, { color: 'black' }]}
                                    onPress={() => handleConnectSubject(result.id)}
                                >
                                    <Text style={[globalStyles.globalButtonText_tag, { color: 'black' }]}>{result.title}</Text>
                                </TouchableOpacity>
                            ))}
                    </View>
                )}
    
    <TouchableOpacity style={!showNewProject ? globalStyles.globalButton_wide : globalStyles.globalButton_active} onPress={() => { setShowNewProject(!showNewProject), setShowProjects(false) }}>
                        <Text style={globalStyles.globalButtonText}>{showNewProject ? "Abandonner la création" : "Créer un nouveau projet"}</Text>
                    </TouchableOpacity>
                {showNewProject && (
                    <View style={globalStyles.container_wide}>
                    <View style={globalStyles.searchContainer}>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="Nom du nouveau projet"
                            value={newName}
                            onChangeText={(text) => setNewName(text)}
                        />
                        <TouchableOpacity onPress={handleCreateProject} style={styles.icon}>
                            <Image source={AddIcon} style={{ width: 26, height: 26, opacity: 0.5 }} />
                        </TouchableOpacity>
                    </View>
                    </View>
                )}
<TouchableOpacity style={globalStyles.globalButton_wide} onPress={() => {navigateToScreen('ProfileScreen')}}>
                        <Text style={globalStyles.globalButtonText}>Informations utilisateur</Text>
                    </TouchableOpacity>



            </View>
    
            <Modal
                animationType="slide"
                transparent={true}
                visible={showJoinModal}
                onRequestClose={() => setShowJoinModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity
                            style={[globalStyles.globalButton_wide]}
                            onPress={async () => {
                                setShowJoinModal(false);
                                await joinSubject(selectedSubject, session.user.id, false);
                                setJoinMessage("Votre demande a bien été envoyée aux contributeurs du projet pour validation.")
                            }}
                        >
                            <Text style={[globalStyles.globalButtonText]}>Envoyer la demande d'accès au projet</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[globalStyles.globalButton_wide]}
                            onPress={() => setShowJoinModal(false)}
                        >
                            <Text style={[globalStyles.globalButtonText]}>Abandonner</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
    
            <Modal
                animationType="slide"
                transparent={true}
                visible={!!joinMessage}
                onRequestClose={() => setJoinMessage("")}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>{joinMessage}</Text>
                        <TouchableOpacity
                            style={[globalStyles.globalButton_wide]}
                            onPress={() => setJoinMessage("")}
                        >
                            <Text style={[globalStyles.globalButtonText]}>Ok</Text>
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
    centeredView: {
        flex: 1, // Prend tout l'espace disponible
        justifyContent: "center",
        alignItems: "center",
        width: '100%', // Couvre toute la largeur
        height: '100%', // Couvre toute la hauteur
        backgroundColor: 'rgba(0, 0, 0, 0.5)' // Ajoute un fond semi-transparent
    },
    modalView: {
        width: '100%', // Utilise toute la largeur disponible
        height: '100%', // Utilise toute la hauteur disponible
        backgroundColor: "white",
        padding: 35,
        alignItems: "center",
        justifyContent: "center" // Centre le contenu verticalement
    },
    modalText: {
        textAlign: "center"
    },

    globalButtonText: {
        textAlign: 'left',
        color: '#ffffff', // Texte blanc pour un meilleur contraste
        fontSize: 15,
        fontWeight: 'bold',
    },
    globalButtonText_active: {
        textAlign: 'left',
        color: '#0b2d52', // Texte bleu foncé
        fontSize: 19,
        fontWeight: 'bold',
    },
    globalButtonText_tag: {
        textAlign: 'left',
        color: '#ffffff', // Texte blanc pour un meilleur contraste
        fontSize: 14, // Taille de police légèrement augmentée pour améliorer la lisibilité
        fontWeight: 'bold',
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        flex: 1, // Ajoutez cette ligne
        textAlign: 'center', // Pour centrer le texte dans chaque colonne
    },
    contributorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%', // Ajoutez cette ligne
    },
    contributorText: {
        fontSize: 16,
        color: '#333',
        flex: 1, // Ajoutez cette ligne
        textAlign: 'center', // Pour centrer le texte dans chaque colonne
    },
    labelText: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
        flex: 1, // Ajoutez cette ligne
        textAlign: 'center', // Pour centrer le texte dans chaque colonne
    },
    picker: {
        height: 50,
        width: '100%',
        marginHorizontal:5,
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        flex: 1, // Ajoutez cette ligne
    },
    updateButton: {
        color: '#007BFF',
        fontSize: 16,
        marginTop: 10,
        flex: 1, // Ajoutez cette ligne
        textAlign: 'center', // Pour centrer le texte dans chaque colonne
    },
    
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
      },
      headerText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        flex: 1,
        textAlign: 'center',
      },
      linkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
      },
      linkText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        textAlign: 'center',
      },
      toggleContainer: {
        width: '33.33%',
        alignItems: 'center',
      },
      toggleButton: {
        width: 60,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      },
      activeToggle: {
        backgroundColor: '#008080',
      },
      toggleButtonCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#fff',
        position: 'absolute',
      },
      toggleText: {
        fontSize: 12,
        color: '#333',
      },
      copyButtonText: {
        color: '#007BFF',
        textDecorationLine: 'underline',
        textAlign: 'center',
        flex: 1,
      },
      createLinkButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
      },
      createLinkButton: {
        backgroundColor: '#008080',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
      },
      createLinkButtonText: {
        color: '#fff',
        fontSize: 16,
      },

})


