import React, { useState, useEffect, useRef  } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator,  Platform, } from 'react-native';
import { globalStyles } from '../../global';
import { get_Question_by_id,getMemories_Question_by_id, getMemories_Question, submitMemories_Answer, deleteMemories_Answer, get_user_name, update_answer_text } from '../components/data_handling'; // Assurez-vous d'implémenter deleteMemories_Answer
import { record_answer, playRecording_fromAudioFile, delete_audio, startRecording, stopRecording, uploadAudioToSupabase } from '../components/sound_handling';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { saveActiveSubjectId, getActiveSubjectId } from '../components/local_storage';
import { useFocusEffect } from '@react-navigation/native';
import ArrowLeftIcon from '../../assets/icons/arrow-left-solid.svg';
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
import MicroIcon from '../../assets/icons/microphone-lines-solid.svg';
import VolumeIcon from '../../assets/icons/volume_up_black_24dp.svg';
import Upload from '../../assets/icons/upload.png';
import Svg, { Path } from 'react-native-svg';
import * as DocumentPicker from 'expo-document-picker';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import copyIcon from '../../assets/icons/paste.png';
import save from '../../assets/icons/save.png';
import note from '../../assets/icons/notes.png';
import { supabase } from '../lib/supabase';

function EditChapterScreen({ route }) {
  const navigation = useNavigation();
  console.log("Route : ",route.params)
  const id_question = route.params.questionId;
  const session = route.params.session;
  const [question, setQuestion] = useState(null);
  const [owner, setOwner] = useState(null);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [subject_active, setSubject_active] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState();
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [content, setContent] = useState('<p>Commencez à écrire ici...</p>');
  const [isEditorReady, setEditorReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useRef();
  const [isContentModified, setIsContentModified] = useState(false);


  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };



  useFocusEffect(
    React.useCallback(() => {
      const fetchActiveSubjectId = async () => {
        var temp = await getActiveSubjectId();
        setSubject_active(temp);
      };
      fetchActiveSubjectId();
  
      if (session && subject_active !== null) {
        getMemories_Question_by_id(id_question, setQuestion, setAnswers, setOwner);
      }
    }, [session, subject_active])
  );
  
  

 
  const quillModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: '1' }, { header: '2' }, { font: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        ['clean'],
        [{ color: [] }, { background: [] }],
        ['save'],
      ],
      handlers: {
        save: handleSaving,
      },
    },
  };
  

  
  
  
  

  const refreshAnswers = async () => {
    await getMemories_Question_by_id(id_question, setQuestion, setAnswers, setOwner);
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("id_question : ",id_question)
      const temp = await get_Question_by_id(id_question,setQuestion);
      setQuestion(temp);
    };
    fetchData();
  }, [id_question]);
  


  useEffect(() => {
    if (editor.current && isEditorReady) {
      if (Platform.OS === 'web') {
        editor.current.getEditor().setContents(content);
      } else {
        editor.current.setContent(content);
      }
      setIsInitialLoad(false);
    }
  }, [content, isEditorReady]);
  
  
  

  useEffect(() => {
  
if(question) {
      const loadData = async () => {


        if (question && question.full_text && question.full_text.ops) {
          const converter = new QuillDeltaToHtmlConverter(question.full_text.ops, {});
          const html = converter.convert();
          setContent(html);
        } else {
          console.error('Data is not in the expected format:', question.full_text);
        }
        setIsLoading(false);
      };

      loadData();
    
    setIsLoading(false);
  }
  }, [question]);

  const handleSaving = async () => {
    setIsSaving(true);
    try {
      if (Platform.OS === 'web') {
        const quillInstance = editor.current.getEditor();
        const content = quillInstance.getContents();
        setContent(content);
  
        const { error: errorUpdating } = await supabase
          .from('Memoires_questions')
          .update({ full_text: content })
          .match({ id: id_question});
  
        if (errorUpdating) {
          console.error('Error updating:', errorUpdating);
        } else {
          console.log('Content successfully saved to Supabase');
          setIsContentModified(false);
        }
      } else {
        const content = editor.current.getContent();
        console.log('Saving content:', content);
        setIsContentModified(false);
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setIsSaving(false);
    }
  };
  

  if (isLoading || !question) {
    return (
      <View style={globalStyles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#E8FFF6" }}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.navigationContainer}>
          <TouchableOpacity onPress={() => navigateToScreen('ReadAnswersScreen')} style={styles.navButton}>
            <Image source={ArrowLeftIcon} style={{ width: 60, height: 60, opacity: 0.5 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={refreshAnswers} style={styles.navButton}>
            <Image source={refresh} style={{ width: 60, height: 60, opacity: 0.5 }} />
          </TouchableOpacity>
        </View>

     

        <View style={{ ...styles.MiddlePanel }}>
  <Text style={globalStyles.title}>
    {question && question.question ? question.question : 'Veuillez sélectionner un chapitre à éditer'}
    {isContentModified && (
      <TouchableOpacity style={{ marginLeft: 10 }} onPress={handleSaving}>
        <Image source={save} style={{ width: 20, height: 20, opacity: 0.5 }} />
      </TouchableOpacity>
    )}
  </Text>

  <Text> </Text>

  <View style={{ width: '100%' }}> {/* Assurez-vous que cette vue occupe 100% de la largeur */}
    {Platform.OS === 'web' ? (
      <>
        <div id="toolbar"></div>
        <View style={styles.toolbarContainer}>
          <ReactQuill
            ref={editor}
            theme="snow"
            modules={quillModules}
            bounds={'#toolbar'}
            value={content}
            onChange={() => {
              if (!isSaving && !isInitialLoad) setIsContentModified(true);
            }}
            onChangeSelection={() => setIsInitialLoad(false)}
          />
        </View>
      </>
    ) : (
      <>
        <RichEditor
          ref={editor}
          style={styles.editor}
          initialContentHTML={content}
          onChange={() => {
            if (!isSaving && !isInitialLoad) setIsContentModified(true);
          }}
          onSelectionChange={() => setIsInitialLoad(false)}
        />

        <RichToolbar
          editor={editor}
          style={styles.toolbar}
          iconTint="#000000"
          selectedIconTint="#209cee"
          selectedButtonStyle={{ backgroundColor: 'transparent' }}
          actions={[
            'bold',
            'italic',
            'underline',
            'unorderedList',
            'orderedList',
            'insertLink',
            'insertImage',
            'blockQuote',
            'undo',
            'redo',
            'save',
          ]}
          onSave={handleSaving}
        />
      </>
    )}
  </View>
</View>

 
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
  



      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ajoutez ou ajustez vos styles existants ici
  deleteButton: {
    marginTop: 5,
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: "#E8FFF6",
    paddingTop: 60,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingRight: 10,
    paddingLeft: 10,
  },
  questionContainer: {
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 10,
  },
  questionText: {
    marginBottom: 10,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  navButton: {
    padding: 10,
  },
  unSelectedTag: {
    backgroundColor: '#dedede',
  },
  recordingButton: {
    backgroundColor: '#ffcccc',
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  answerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    marginTop: 5,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  editButton: {
    marginRight: 5,
    backgroundColor: 'lightblue',
    padding: 5,
    borderRadius: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  middlePanelContainer: {
    width:'90%',
    flexDirection: 'row',
    flex: 1,
  },
  
  editor: {
    flex: 1,
    height: 400,
    width: '90%', // Définir la largeur à 95%
    alignSelf: 'center', // Centrer l'élément
  },
});

export default EditChapterScreen;
