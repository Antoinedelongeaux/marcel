import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function FamilyStoriesScreen() {
  return (
    <View style={styles.container}>
      <Text>Histoires et annecdotes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FamilyStoriesScreen;
