import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function RecepiesScreen() {
  return (
    <View style={styles.container}>
      <Text>Livre de recettes</Text>
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

export default RecepiesScreen;
