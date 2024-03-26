import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function TravelBookScreen() {
  return (
    <View style={styles.container}>
      <Text>Carnet de voyage</Text>
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

export default TravelBookScreen;
