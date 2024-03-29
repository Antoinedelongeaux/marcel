import React from 'react'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { View, StyleSheet, Button, Text, Alert, Keyboard, TouchableWithoutFeedback, TextInput, TouchableOpacity } from 'react-native'
import { globalStyles } from '../../global'
import { listSubjects, joinSubject, getSubjects, get_project } from '../components/data_handling';
import { saveActiveSubjectId, getActiveSubjectId } from '../components/local_storage';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ route }) {
    const session = route.params.session
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [full_name, setFull_name] = useState('')

    const [subjects, setSubjects] = useState([]);
    const [subjects_active, setSubjects_active] = useState([]);
    const [subject_active, setSubject_active] = useState(null);
    const [vision, setVision] = useState('Biographies');
    const [showProjects, setShowProjects] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    

    async function fetchSubjects() {

        if (session) {
            getProfile();
            try {
                const temp = await getSubjects(session.user.id);
                setSubjects_active(temp);

                // Si vous souhaitez également rafraîchir la liste des sujets disponibles à rejoindre
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

        saveActiveSubjectId(subject_active);

    }, [subject_active]);


    const handleJoinSubject = async (id) => {
        setSubject_active(id);
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


    const SearchBar = ({ searchName, setSearchName, onSearch }) => {
        return (
            <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Rechercher un projet"
              value={searchName}
              onChangeText={(text) => setSearchName(text)}
            />
            <TouchableOpacity onPress={onSearch} style={styles.icon}>
              <Ionicons name="ios-search" size={24} color="black" />
            </TouchableOpacity>
          </View>
        );
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
                setSubject_active(data.active_biography)
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    async function updateProfile({
        username,
        full_name,
    }) {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const updates = {
                id: session?.user.id,
                username,
                full_name,
                updated_at: new Date(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)

            if (error) {
                throw error
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    const joinGroup = async (groupID) => {
        const userID = session.user?.id
        try {
            const { data: existingMembership, error: existingMembershipError } = await supabase
                .from('users_in_groups')
                .select('*')
                .eq('id_user', userID)
                .eq('id_group', groupID);

            if (existingMembershipError) {
                throw existingMembershipError;
            }

            if (existingMembership.length > 0) {
                console.log("L'utilisateur est déjà membre de ce groupe.");
                return;
            }

            const { data: newMembership, error: newMembershipError } = await supabase
                .from('users_in_groups')
                .insert({
                    id_user: userID,
                    id_group: groupID,
                    status: 'active',
                    created_at: new Date()
                });

            if (newMembershipError) {
                throw newMembershipError;
            }

            console.log("L'utilisateur a rejoint le groupe avec succès.");
        } catch (error) {
            console.error('Erreur lors de la tentative de rejoindre le groupe :', error.message);
        }
    };

    const handleSubjects = async () => {
        try {
            const subjectsList = await listSubjects(session.user.id); // Assurez-vous que cette fonction existe et fonctionne correctement

            setSubjects(subjectsList);
        } catch (error) {
            Alert.alert("Erreur lors de la récupération des sujets", error.message);
        }
    };


    return (


            <View style={globalStyles.container}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        key={1}
                        style={[
                            globalStyles.globalButton_narrow,
                            vision === 'Biographies' ? { backgroundColor: '#0b2d52' } : {}
                        ]}
                        onPress={() => setVision('Biographies')}
                    >
                        <Text style={globalStyles.globalButtonText}>Biographies</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        key={2}
                        style={[
                            globalStyles.globalButton_narrow,
                            vision === 'Profil' ? { backgroundColor: '#0b2d52' } : {}
                        ]}
                        onPress={() => setVision('Profil')}
                    >
                        <Text style={globalStyles.globalButtonText}>Profil</Text>
                    </TouchableOpacity>
                </View>


                {vision == 'Biographies' && (
                    <>
                        {subjects_active.length > 0 ? (
                            <>
                                <Text style={globalStyles.title}>Biographies auxquelles vous contribuez</Text>
                                {subjects_active.map((subject) => (
                                    <TouchableOpacity key={subject.content_subject.id} style={[globalStyles.button, subject_active === subject.content_subject.id ? globalStyles.globalButton_active : globalStyles.globalButton]} onPress={() => handleJoinSubject(subject.content_subject.id)}>
                                        <Text style={[globalStyles.buttonText, subject_active === subject.content_subject.id ? globalStyles.globalButtonText_active : globalStyles.globalButtonText]}>
                                            {subject.content_subject.title} {subject_active === subject.content_subject.id ? "(actif)" : ""}
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

                        <TouchableOpacity style={globalStyles.globalButton} onPress={() => setShowProjects(!showProjects)}>
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
              <Ionicons name="ios-search" size={24} color="black" />
            </TouchableOpacity>
          </View>

    {searchResults.map((result) => (
      <TouchableOpacity
        key={result.id}
        style={[globalStyles.globalButton_tag, styles.unSelectedTag]}
        onPress={async () => {
          await joinSubject(result.id);
          fetchSubjects();
        }}
      >
        <Text style={globalStyles.globalButtonText_tag}>{result.title}</Text>
      </TouchableOpacity>
    ))}
  </>
)}

                    </>
                )}

                {vision == 'Profil' && (<>
                    <Text></Text>
                    <Text style={globalStyles.title}>Vos informations de profil</Text>
                    <Text></Text>
                    <View style={globalStyles.form}>
                        <Text>Adresse email</Text>
                        <TextInput
                            style={globalStyles.input}
                            value={session?.user?.email}
                            editable={!session}
                        />
                        <Text>Nom affiché</Text>
                        <TextInput
                            style={globalStyles.input}
                            value={username || ''}
                            onChangeText={(text) => setUsername(text)}
                        />

                        <Text>Nom complet</Text>
                        <TextInput
                            style={globalStyles.input}
                            value={full_name || ''}
                            onChangeText={(text) => setUsername(text)}
                        />

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                            <TouchableOpacity style={globalStyles.globalButton_narrow} onPress={() => updateProfile({ username, full_name })} >
                                <Text style={globalStyles.globalButtonText}>{loading ? 'Chargement ...' : 'Mettre à jour'}</Text>
                            </TouchableOpacity>




                            <TouchableOpacity style={globalStyles.globalButton_narrow} onPress={() => supabase.auth.signOut()} >
                                <Text style={globalStyles.globalButtonText}>Se déconnecter</Text>
                            </TouchableOpacity>

                        </View>
                        {/*}
                    <View style={globalStyles.buttonWrapper}>
                        <Button title="Rejoindre un groupe" onPress={() => joinGroup('582d1c79-bc29-4765-a5d1-755b82105029')} />
                    </View>
    */}

                    </View>
                </>)}
            </View>
        //</TouchableWithoutFeedback>
    )


}

const styles = StyleSheet.create({
    unSelectedTag: {
        backgroundColor: '#b1b3b5', // Changez la couleur selon votre thème
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
      },
      input: {
        flex: 1,
        height: 40,
        padding: 10,
      },
      icon: {
        marginLeft: 10,
      },

})


