import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text>Calendrier</Text>
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

export default CalendarScreen;
