import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from '../../global';



const applications = [
  { name: 'Mémoires', route: 'MemoiresScreen' },
  { name: 'Recettes', route: 'RecepiesScreen' },
  { name: 'Carnet de voyage', route: 'TravelBookScreen' },
  { name: 'Calendrier', route: 'CalendarScreen' },
  { name: 'Biographie', route: 'BiographyScreen' },
  { name: 'Histoires & anecdotes', route: 'FamilyStoriesScreen' },
];

export default function AppsGridScreen({ route }) {
  const navigation = useNavigation();

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={globalStyles.container}>
        <ScrollView contentContainerStyle={styles.appWrapper}>
          {applications.map((app, index) => (
            <TouchableOpacity
              key={index}
              style={globalStyles.globalButton}
              onPress={() => { console.log("Navigating to:", app.route); navigation.navigate(app.route, { session: route.params?.session }) }}
            >
              <Text style={globalStyles.globalButtonText}>{app.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
  appWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  appBox: {
    width: '40%', // Réduit pour assurer deux éléments par ligne
    aspectRatio: 1, // Assurez-vous que les boîtes restent carrées
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b2d52', // Couleur plus foncée pour un meilleur contraste
    margin: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 5, // Ajoute une ombre sous Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  appText: {
    textAlign: 'center',
    color: '#ffffff', // Texte blanc pour un meilleur contraste
    fontSize: 18,
    fontWeight: 'bold',
  },
});

