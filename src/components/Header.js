import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SelectList } from 'react-native-dropdown-select-list'

export default function Header({ userGroups }) {

    return (
        <View style={styles.header}>
            <Text>hey</Text>
        </View>
    )
}


const styles = StyleSheet.create({
    header: {
        backgroundColor: "pink",
        height: 80,
    },
})