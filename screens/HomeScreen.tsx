import React, { useEffect, useState } from 'react';
import { Button, View, Text, ActivityIndicator, StyleSheet, Image, FlatList, RefreshControl, ScrollView } from 'react-native';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';

const HomeScreen: React.FC = () => {
    const { token, logout } = useSpotifyAuth();
    const [userData, setUserData] = useState<any>(null);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    useEffect(() => {
        if (token) {
            fetchUserData();
        }
    }, [token]);

    const fetchUserData = async () => {
        setLoading(true);
        setError(null); // Reset error on refresh
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

            const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!playlistsResponse.ok) {
                const errorData = await playlistsResponse.json();
                setError(errorData.error.message || 'Failed to fetch playlists');
                return;
            }

            const playlistsData = await playlistsResponse.json();
            setPlaylists(playlistsData.items.slice(0, 2)); // Get only the 2 most recent playlists
        } catch (err: any) {
            console.error('Error fetching user data:', err);
            setError('Failed to fetch user data');
        } finally {
            setLoading(false);
            setRefreshing(false); // Stop the refresh animation
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserData();
    };

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

    const profileImageUrl = userData?.images[0]?.url || `https://ui-avatars.com/api/?name=${userData?.display_name}&background=1DB954&color=fff`;

    const renderPlaylistItem = (item: any) => (
        <View key={item.id} style={styles.playlistBox}>
            <Image
                source={{ uri: item.images[0]?.url || 'https://ui-avatars.com/api/?size=150&background=121212&color=fff&name=Playlist' }}
                style={styles.playlistImage}
            />
            <Text style={styles.playlistName}>{item.name}</Text>
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent} // Use contentContainerStyle instead
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {userData ? (
                <>
                    <Text style={styles.welcomeText}>Welcome, {userData.display_name}!</Text>
                    <Image
                        source={{ uri: profileImageUrl }}
                        style={styles.profileImage}
                    />
                </>
            ) : (
                <Text style={styles.text}>No user data available</Text>
            )}

            <Text style={styles.text}>Recent Playlists:</Text>
            <View style={styles.playlistList}>
                {playlists.map((playlist) => renderPlaylistItem(playlist))}
            </View>

            <Button title="Logout" onPress={logout} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 80,
        backgroundColor: '#121212',
    },
    scrollContent: {
        justifyContent: 'flex-start',
        alignItems: 'center',
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
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    playlistList: {
        marginTop: 20,
        width: '100%',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    playlistBox: {
        width: 150,
        height: 200,
        marginRight: 15,
        marginBottom: 20,
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    playlistImage: {
        width: 130,
        height: 130,
        borderRadius: 8,
        marginBottom: 10,
    },
    playlistName: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default HomeScreen;
