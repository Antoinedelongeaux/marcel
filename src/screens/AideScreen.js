import React from 'react'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { Image, View, Platform, StyleSheet, Button, Text, Alert, Keyboard, TouchableWithoutFeedback, TextInput, TouchableOpacity } from 'react-native'
import { globalStyles } from '../../global'
import { listSubjects, joinSubject, getSubjects, get_project } from '../components/data_handling';
import { saveActiveSubjectId, getActiveSubjectId } from '../components/local_storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
//import ArrowLeftIcon from '../../assets/icons/arrow-left-solid.svg';
import refresh from '../../assets/icons/refresh_black_24dp.svg';
import PersonIcon from '../../assets/icons/person.svg';
import BookIcon from '../../assets/icons/book.svg';
import HelpIcon from '../../assets/icons/help-circle.svg';
import trash from '../../assets/icons/baseline_delete_outline_black_24dp.png';
import SettingsIcon from '../../assets/icons/settings.svg';
import LinkIcon from '../../assets/icons/link-solid.svg';
import expand_more from '../../assets/icons/expand_more_black_24dp.svg';
import expand_less from '../../assets/icons/expand_less_black_24dp.svg';
import edit from '../../assets/icons/pen-to-square-regular.svg';
import Svg, { Path } from 'react-native-svg';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import ReactQuill from 'react-quill'; // Importer ReactQuill
import 'react-quill/dist/quill.snow.css'; // Importer les styles CSS pour ReactQuill
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

export default function AideScreen({ route }) {
    //const session = route.params.session
    const navigation = useNavigation();
    const [content, setContent] = useState('<p>Commencez à écrire ici...</p>'); // État initial du contenu
    const [isEditorReady, setEditorReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);



    const navigateToScreen = (screenName, params) => {
        navigation.navigate(screenName, params);
    };

    
    useEffect(() => {
      if (editor.current && content && content.ops) {
        const quillInstance = editor.current.getEditor();
        quillInstance.setContents(content.ops);
      }
    }, [editor, content]);
    

    useEffect(() => {
      const loadData = async () => {
          const { data, error } = await supabase
              .from('Memoires_questions')
              .select('full_text')
              .eq('id', "513151576162")
              .single();

          if (error) {
              console.error('Error loading data:', error);
              setIsLoading(false); // En cas d'erreur, arrêtez le chargement
          } else if (data && data.full_text && data.full_text.ops) {
              
              const converter = new QuillDeltaToHtmlConverter(data.full_text.ops, {});
              const html = converter.convert();
              setContent(html);
              
              //setContent(data.full_text);
              setIsLoading(false); // Arrêtez le chargement une fois que le contenu est prêt
              //console.log("HTML Output:", html);
          } else {
              console.error("Data is not in the expected format:", data.full_text);
              setIsLoading(false); // En cas de données non conformes, arrêtez le chargement
          }
      };

      loadData();
  }, []);
  

  /*
useEffect(() => {
    const loadData = async () => {
        const { data, error } = await supabase
            .from('Memoires_questions')
            .select('full_text')
            .eq('id', "513151576162" )
            .single();

        if (error) {
            console.error('Error loading data:', error);
        } else if (data && data.full_text) {
            // Supposons que `full_text` contient déjà du HTML pur
            setContent(data.full_text);
            console.log("test : ",data.full_text)
        } else {
            console.error("Data is not in the expected format:", data.full_text);
        }
    };

    loadData();
}, []);

  */



  useEffect(() => {
    console.log("isEditorReady : ",isEditorReady)
      if (editor.current && isEditorReady) {
          // Assurez-vous que l'éditeur est prêt avant de tenter de mettre à jour son contenu
          if (Platform.OS === 'web') {
            console.log("Coucou, on est tout frais ! ")
            console.log("Content bis : ",content)
              editor.current.getEditor().setContents(content);
          } else {
              editor.current.setContent(content);
          }
      }
  }, [content, isEditorReady]);  // Dépend de `content` et `isEditorReady`
  


    const handleSaving = async () => {
      if (Platform.OS === 'web') {
        try {
          // Accès à l'instance de Quill pour obtenir le contenu
          const quillInstance = editor.current.getEditor();
          const content = quillInstance.getContents();  // Obtient le contenu au format Delta
          console.log('Saving content:', content);
    
          // Enregistrement des données au format JSONB dans Supabase
          const { error: errorUpdating } = await supabase
              .from('Memoires_questions')
              .update({ full_text: content })  // Assurez-vous que la colonne 'full_text' accepte le format JSONB
              .match({ id: "513151576162" });
    
          // Gestion des erreurs potentielles de la requête
          if (errorUpdating) {
            console.error('Error updating:', errorUpdating);
          } else {
            console.log('Content successfully saved to Supabase');
          }
        } catch (error) {
          console.error('Failed to save content:', error);
        }
      } else {
        // Supposons que RichEditor a une méthode similaire pour obtenir le contenu
        const content = editor.current.getContent(); // Méthode fictive, à remplacer par la méthode réelle
        console.log('Saving content:', content);
        // Ajouter le code pour enregistrer `content` dans la base de données ou autre
      }
    };
    
    

  // Custom toolbar pour ReactQuill
  const quillModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{'header': '1'}, {'header': '2'}, {'font': []}],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link', 'image', 'video'],
        ['clean'],
        [{'color': []}, {'background': []}],
        ['save']
      ],
      handlers: {
        'save': handleSaving  // Gestionnaire pour le bouton save
      }
    }
  };




    const editor = React.useRef();

    const handleEditorReady = () => {
      setEditorReady(true);
  };

    // Afficher RichEditor pour les plateformes mobiles et ReactQuill pour le web
    const EditorComponent = Platform.OS === 'web' ? ReactQuill : RichEditor;
    const ToolbarComponent = Platform.OS === 'web' ? () => null : RichToolbar; // Pas de barre d'outils pour ReactQuill dans cet exemple simple
  
    if (isLoading) {
      return <View style={globalStyles.container}><Text>Loading...</Text></View>; // Afficher un indicateur de chargement
  }


    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.navigationContainer}>
                <TouchableOpacity onPress={() => navigateToScreen('ReadAnswersScreen')} style={globalStyles.navButton}>
                    <Image source={BookIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateToScreen('ProfileScreen')} style={globalStyles.navButton}>
                    <Image source={PersonIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateToScreen('AideScreen')} style={globalStyles.navButton}>
                    <Image source={HelpIcon} style={{ width: 60, height: 60, opacity: 1 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateToScreen('ManageBiographyScreen')} style={globalStyles.navButton}>
                    <Image source={SettingsIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
                </TouchableOpacity>
            </View>
            <View style={globalStyles.container}>
            
            <View style={styles.container}>
                {Platform.OS === 'web' ? (
                    <>
                        <div id="toolbar"></div> {/* S'assurer que cet élément est chargé */}
                        <View style={styles.toolbarContainer}>
                        <Button title="Save" onPress={handleSaving} style={styles.saveButton} />
                        <ReactQuill
                            ref={editor}
                            theme="snow"
                            modules={quillModules}
                            bounds={"#toolbar"}
                            value={content}
                            
                        />
                        
                        </View>
                    </>
                ) : (
                    <>
                        <RichEditor
                            ref={editor}
                            style={styles.editor}
                            initialContentHTML={content}
                        />
                        <RichToolbar
                            editor={editor}
                            style={styles.toolbar}
                            iconTint="#000000"
                            selectedIconTint="#209cee"
                            selectedButtonStyle={{ backgroundColor: 'transparent' }}
                            actions={[
                                'bold', 'italic', 'underline', 'unorderedList', 'orderedList',
                                'insertLink', 'insertImage', 'blockQuote', 'undo', 'redo', 'save'
                            ]}
                            onSave={handleSaving}
                        />
                    </>
                )}
            </View>
        </View>




        </View>


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

    container: {
      flex: 1,
      padding: 10,
    },
    editor: {
      flex: 1,
      backgroundColor: 'white',
    },
    toolbarContainer: {
      position: 'relative',
      marginBottom: 10,
  },
    saveButton: {
      position: 'absolute',
      right: 0,
      top: 0,
      padding: 10,
      zIndex: 1  // Ensure the button is above the toolbar
  }

})





