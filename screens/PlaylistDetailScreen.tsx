import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';

const PlaylistDetailScreen: React.FC<any> = ({ route, navigation }) => {
    const { playlist } = route.params;
    const { token } = useSpotifyAuth();
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (token) {
            fetchTracks(playlist.id);
        }
    }, [token, playlist.id]);

    const fetchTracks = async (playlistId: string) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setTracks(data.items);
                setLoading(false);
            } else {
                console.error('Failed to fetch tracks:', data);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching tracks:', error);
            setLoading(false);
        }
    };

    const renderTrack = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.trackItem}>
            <Text style={styles.trackName}>{item.track.name}</Text>
            <Text style={styles.artistName}>{item.track.artists.map((artist: any) => artist.name).join(', ')}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Image source={{ uri: playlist.images[0].url }} style={styles.image} />
            <Text style={styles.name}>{playlist.name}</Text>
            <Text style={styles.description}>{playlist.description}</Text>

            {loading ? (
                <Text style={styles.loadingText}>Loading tracks...</Text>
            ) : (
                <FlatList
                    data={tracks}
                    keyExtractor={(item) => item.track.id}
                    renderItem={renderTrack}
                    style={styles.trackList}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#fff',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
        color: '#fff',
    },
    trackList: {
        marginTop: 20,
        width: '100%',
    },
    trackItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    trackName: {
        fontSize: 18,
        color: '#fff',
    },
    artistName: {
        fontSize: 14,
        color: '#aaa',
    },
    loadingText: {
        fontSize: 16,
        color: '#fff',
    },
});

export default PlaylistDetailScreen;
