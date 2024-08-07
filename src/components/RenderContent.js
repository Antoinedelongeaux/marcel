import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback,StyleSheet, } from 'react-native';
import ReactHtmlParser from 'react-html-parser';

const RenderContent = memo(({ content, onReferencePress }) => {
  const transformNode = useCallback((node, index) => {
    if (node.type === 'tag' && node.name === 'reference') {
      const temp = node.children && node.children[0] ? (node.children[0].children ? node.children[0].children[0]?.data : node.children[0]?.data) : '';

      return (
        <TouchableOpacity key={index} onPress={() => onReferencePress(temp)} style={[styles.associateButton, { pointerEvents: 'auto' }]}>
          <Text style={{ color: 'blue' }}>
            (note)
          </Text>
        </TouchableOpacity>
      );
    }

    if (node.type === 'tag' && node.name === 'div' && node.parent && node.parent.name === 'p') {
      return (
        <View key={index} style={{ display: 'inline' }}>
          {ReactHtmlParser(node.children, { transform: transformNode })}
        </View>
      );
    }

    return undefined;
  }, [onReferencePress]);

  const transformedContent = useMemo(() => {
    return ReactHtmlParser(content, { transform: transformNode });
  }, [content, transformNode]);

  return (
    <TouchableWithoutFeedback>
      <View style={styles.contentContainer}>
        {transformedContent}
      </View>
    </TouchableWithoutFeedback>
  );
}, (prevProps, nextProps) => {
  return prevProps.content === nextProps.content && prevProps.onReferencePress === nextProps.onReferencePress;
});



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

export default RenderContent;


