import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const UserProfileScreen: React.FC = () => {
    const { token, logout } = useSpotifyAuth();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userStats, setUserStats] = useState<any>(null);

    useEffect(() => {
        if (token) {
            fetchUserData();
            fetchUserStats();
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

    const fetchUserStats = async () => {
        setLoading(true);
        try {
            const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const playlistsData = await playlistsResponse.json();
            const totalPlaylists = playlistsData.items.length;

            const tracksResponse = await fetch('https://api.spotify.com/v1/me/top/artists', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const tracksData = await tracksResponse.json();
            const topArtists = Array.isArray(tracksData.items) ? tracksData.items.slice(0, 3).map((artist: any) => artist.name) : [];

            setUserStats({
                totalPlaylists,
                topArtists,
            });
        } catch (err: any) {
            console.error('Error fetching user stats:', err);
            setError('Failed to fetch user stats');
        } finally {
            setLoading(false);
        }
    };

    const profileImageUrl = userData?.images[0]?.url || `https://ui-avatars.com/api/?name=${userData?.display_name}&background=1DB954&color=fff`;

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
                <ActivityIndicator size="large" color="#1DB954" />
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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile Information</Text>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" style={styles.logoutIcon} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent}>
                {userData && (
                    <>
                        <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
                        <Text style={styles.name}>{userData.display_name}</Text>
                        <Text style={styles.infoText}>Email: {userData.email}</Text>
                        <Text style={styles.infoText}>Country: {userData.country}</Text>
                        <Text style={styles.infoText}>Followers: {userData.followers.total}</Text>
                    </>
                )}

                {userStats && (
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>Your Stats</Text>
                        <Text style={styles.statsText}>Playlists: {userStats.totalPlaylists}</Text>
                        <Text style={styles.statsText}>Top Artists: {userStats.topArtists.join(', ')}</Text>
                    </View>
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
        paddingTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerTitle: {
        fontSize: 24,
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
        paddingTop: 40,
        marginTop: 100,
        paddingHorizontal: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#1DB954',
    },
    name: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 10,
    },
    statsCard: {
        backgroundColor: '#1DB954',
        padding: 20,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    statsText: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 5,
    },
});

export default UserProfileScreen;
