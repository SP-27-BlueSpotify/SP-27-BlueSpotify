import React, { useEffect, useState } from 'react';
import { Button, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';

const HomeScreen: React.FC = () => {
    const { token, logout } = useSpotifyAuth();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            const fetchUserData = async () => {
                setLoading(true);
                try {
                    const response = await fetch('https://api.spotify.com/v1/me', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        setError(errorData.error.message || 'Failed to fetch user data');
                        return;
                    }

                    const data = await response.json();
                    setUserData(data);
                } catch (err: any) {
                    console.error('Error fetching user data:', err);
                    setError('Failed to fetch user data');
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
        }
    }, [token]);

    if (!token) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Loading...</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {userData ? (
                <Text style={styles.welcomeText}>Welcome, {userData.display_name}!</Text>
            ) : (
                <Text style={styles.text}>No user data available</Text>
            )}
            <Button title="Logout" onPress={logout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#121212'
    },
    text: {
        fontSize: 18,
        color: '#333',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1DB954',
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default HomeScreen;
