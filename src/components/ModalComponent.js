import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView,  StyleSheet, } from 'react-native';
import { globalStyles } from '../../global';


const ModalComponent = ({ isVisible, onClose, title, inputValue, onInputChange, onSave,onConfirm, content }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{title}</Text>
          {inputValue !== undefined && onInputChange && (
            <TextInput
              style={styles.modalInput}
              onChangeText={text => onInputChange(text)}
              value={inputValue}
              placeholder={title}
            />
          )}
          {content && <ScrollView>{content}</ScrollView>}
          {onSave && (
            <TouchableOpacity style={[globalStyles.globalButton_wide]} onPress={onSave}>
              <Text style={globalStyles.globalButtonText}>Sauvegarder</Text>
            </TouchableOpacity>
          )}
          {onConfirm && (
            <TouchableOpacity style={[globalStyles.globalButton_wide]} onPress={onConfirm}>
              <Text style={globalStyles.globalButtonText}>Confirmer</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[globalStyles.globalButton_wide]} onPress={onClose}>
            <Text style={globalStyles.globalButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  contentContainer: {
    zIndex: 10,
    position: 'relative',
  },
  associateButton: {
    marginRight: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 15,
    borderWidth: 1,
    width: '100%',
    padding: 10,
    borderRadius: 5,
    borderColor: 'gray',
  },
  modalButton: {
    marginBottom: 10,
    padding: 10,
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default ModalComponent;
