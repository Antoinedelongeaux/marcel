import React from 'react'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { Image, View, StyleSheet, Button, Text, Alert, Keyboard, TouchableWithoutFeedback, TextInput, TouchableOpacity } from 'react-native'
import { globalStyles } from '../../global'
import { listSubjects, joinSubject, getSubjects, get_project } from '../components/data_handling';
import { saveActiveSubjectId, getActiveSubjectId } from '../components/local_storage';
import { useNavigation } from '@react-navigation/native';
import PersonIcon from '../../assets/icons/person.svg';
import BookIcon from '../../assets/icons/book.svg';
import HelpIcon from '../../assets/icons/help-circle.svg';
import SettingsIcon from '../../assets/icons/settings.svg';
import note from '../../assets/icons/notes.png';


export default function ProfileScreen({ route }) {
    const session = route.params.session
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [full_name, setFull_name] = useState('')
    const [isHovered1, setIsHovered1] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const [subject_active, setSubject_active] = useState(null);
    
    const navigateToScreen = (screenName, params) => {
        navigation.navigate(screenName, params);
    };

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




    return (
        <View style={globalStyles.container}>
            <View style={[globalStyles.navigationContainer, { position: 'fixed', bottom: '0%', width: '100%' }]}>
                <TouchableOpacity onPress={() => navigateToScreen('ReadAnswersScreen')} 
                    style={[globalStyles.navButton, isHovered1 && globalStyles.navButton_over]}
                    onMouseEnter={() => setIsHovered1(true)}
                    onMouseLeave={() => setIsHovered1(false)}>

                    <Image source={BookIcon} style={{ width: 120, height: 120, opacity: 0.5 }} />
                </TouchableOpacity>
     
                
                <TouchableOpacity onPress={() => navigateToScreen('ManageBiographyScreen')}  style={[globalStyles.navButton, isHovered && globalStyles.navButton_over]}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}>
                    <Image source={SettingsIcon} style={{ width: 120, height: 120, opacity: 0.5 }} />
                </TouchableOpacity>

            </View>




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


