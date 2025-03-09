import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const UserProfileScreen: React.FC = () => {
    const { token, logout } = useSpotifyAuth();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetchUserData();
        }
    }, [token]);

    const fetchUserData = async () => {
        setLoading(true);
        setError(null);
        try {
            const userResponse = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                setError(errorData.error.message || 'Failed to fetch user data');
                return;
            }

            const userData = await userResponse.json();
            setUserData(userData);
        } catch (err: any) {
            console.error('Error fetching user data:', err);
            setError('Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <View style={styles.container}>
                <Text style={styles.infoText}>Loading...</Text>
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
                <Text style={styles.infoText}>Error: {error}</Text>
            </View>
        );
    }

    const profileImageUrl = userData?.images[0]?.url || `https://ui-avatars.com/api/?name=${userData?.display_name}&background=1DB954&color=fff`;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile Information</Text>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" style={styles.logoutIcon} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent}>
                {userData ? (
                    <>
                        <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
                        <Text style={styles.infoText}>{userData.display_name}</Text>
                        <Text style={styles.infoText}>Email: {userData.email}</Text>
                        <Text style={styles.infoText}>Country: {userData.country}</Text>
                        <Text style={styles.infoText}>Followers: {userData.followers.total}</Text>
                    </>
                ) : (
                    <Text style={styles.infoText}>No user data available</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        backgroundColor: '#121212',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 1,
        paddingTop: 40
    },
    headerTitle: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    logoutButton: {
        padding: 10,
    },
    logoutIcon: {
        fontSize: 30,
        color: "#ff4d4d",
    },
    scrollContent: {
        marginTop: 100,
        padding: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 10,
    },
});

export default UserProfileScreen;
