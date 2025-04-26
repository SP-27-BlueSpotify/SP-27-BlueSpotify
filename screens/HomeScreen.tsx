import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';

const HomeScreen: React.FC<any> = ({ navigation }) => {
    const { token } = useSpotifyAuth();
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

    const fetchUserData = useCallback(async () => {
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
            setPlaylists(playlistsData.items.slice(0, 4));
        } catch (err: any) {
            console.error('Error fetching user data:', err);
            setError('Failed to fetch user data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);


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
                <ActivityIndicator size="large" color="#1DB954" />
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

    const renderPlaylistItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            key={item.id}
            style={styles.playlistBox}
            onPress={() => navigation.navigate('PlaylistDetail', { playlist: item })}
        >
            <Image
                source={{ uri: item.images[0]?.url || 'https://ui-avatars.com/api/?size=150&background=333&color=fff&name=Playlist' }}
                style={styles.playlistImage}
            />
            <Text style={styles.playlistName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Good Morning, {userData?.display_name}</Text>
                <Image
                    source={{ uri: profileImageUrl }}
                    style={styles.profileImage}
                />
            </View>

            <Text style={styles.playlistLabel}>Your Playlists</Text>

            <FlatList
                data={playlists}
                renderItem={renderPlaylistItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.playlistRow}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#121212',
    },
    headerText: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginLeft: 10,
    },
    playlistLabel: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    playlistRow: {
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    playlistBox: {
        backgroundColor: '#333',
        borderRadius: 10,
        width: '48%',
        marginBottom: 15,
        padding: 10,
        alignItems: 'center',
    },
    playlistImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    playlistName: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
    text: {
        fontSize: 18,
        color: '#fff',
    },
});

export default HomeScreen;
