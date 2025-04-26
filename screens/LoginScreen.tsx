import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';

const LoginScreen: React.FC = () => {
    const { login } = useSpotifyAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.promptText}>Log in to your Spotify account</Text>
            <TouchableOpacity style={styles.loginButton} onPress={login}>
                <Text style={styles.loginButtonText}>Log in with Spotify</Text>
            </TouchableOpacity>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#121212',
    },
    promptText: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 40,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: '#1DB954',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
