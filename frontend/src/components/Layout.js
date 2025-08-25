import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Footer from './Footer';
import Navbar from './Navbar';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Layout({ children, navigation }) {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Navbar style={styles.navbar} />
            <View style={styles.content}>{children}</View>
            <Footer navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    navbar: { height: 60 },
    content: { flex: 1 },
    backButton: {
        padding: 10,
    },
});
