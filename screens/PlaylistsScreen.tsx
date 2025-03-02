import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';

const PlaylistsScreen: React.FC<any> = ({ navigation }) => {
    const { token } = useSpotifyAuth();
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (token) {
            fetchPlaylists(token);
        }
    }, [token]);

    const fetchPlaylists = async (accessToken: string) => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/playlists', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setPlaylists(data.items);
                setLoading(false);
            } else {
                console.error('Failed to fetch playlists:', data);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
            setLoading(false);
        }
    };

    const handlePlaylistPress = (playlist: any) => {
        navigation.navigate('PlaylistDetails', { playlist });
    };

    const renderPlaylist = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => handlePlaylistPress(item)}>
            <View style={styles.playlistItem}>
                {item.images[0] && (
                    <Image source={{ uri: item.images[0].url }} style={styles.playlistImage} />
                )}
                <Text style={styles.playlistName}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <Text style={styles.loadingText}>Loading playlists...</Text>
            ) : (
                <FlatList
                    data={playlists}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPlaylist}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#121212',  // Dark background
    },
    playlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    playlistImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    playlistName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default PlaylistsScreen;
