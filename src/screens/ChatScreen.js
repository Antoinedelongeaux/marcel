import React from 'react'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { View, StyleSheet, Button, Text, Alert, Keyboard, TouchableWithoutFeedback, TextInput, TouchableOpacity } from 'react-native'
import { globalStyles } from '../../global'
import { listSubjects, joinSubject, getSubjects } from '../components/data_handling';

export default function ProfileScreen({ route }) {
    const session = route.params.session
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [full_name, setFull_name] = useState('')

    const [subjects, setSubjects] = useState([]);
    const [subjects_active, setSubjects_active] = useState([]);
    const [subject_active, setSubject_active] = useState(null);


    useEffect(() => {
        async function fetchSubjects() {
            if (session) {
                getProfile();
                try {
                    const temp = await getSubjects(session.user.id);
                    setSubjects_active(temp);
                    console.log("Temp :", temp);
                } catch (error) {
                    console.error("Error fetching subjects:", error);
                }
            }
        }

        fetchSubjects();
    }, [session]);

    const handleJoinSubject = (id) => {
        setSubject_active(id);


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
            const subjectsList = await listSubjects(); // Assurez-vous que cette fonction existe et fonctionne correctement


            setSubjects(subjectsList);
        } catch (error) {
            Alert.alert("Erreur lors de la récupération des sujets", error.message);
        }
    };


    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={globalStyles.container}>
                <Text>Biographies auxquelles vous contribuez</Text>
                <Text></Text>
                {subjects_active.map((subject) => (

                    <TouchableOpacity key={subject.content_subject.id} style={[global.button, subject_active === subject.content_subject.id ? globalStyles.globalButton_active : globalStyles.globalButton]} onPress={() => handleJoinSubject(subject.content_subject.id)} >
                        <Text style={[global.button, subject_active === subject.content_subject.id ? globalStyles.globalButtonText_active : globalStyles.globalButtonText]}>{subject.content_subject.title}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={globalStyles.globalButton} onPress={() => handleSubjects()} >
                    <Text style={globalStyles.globalButtonText} >Rejoindre un projet biographique  </Text>
                </TouchableOpacity>
                <Text>                    </Text>
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
                {subjects.map((subject) => (
                    <View key={subject.id} style={globalStyles.buttonWrapper}>
                        <Button
                            title={subject.title}
                            onPress={() => joinSubject(subject.id)}
                        />
                    </View>
                ))}
            </View>
        </TouchableWithoutFeedback>
    )
}



