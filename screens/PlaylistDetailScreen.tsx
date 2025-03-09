import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput, Button, Alert, RefreshControl } from 'react-native';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons'; // You can adjust the icon library as needed

const PlaylistDetailScreen: React.FC<any> = ({ route, navigation }) => {
    const { playlist } = route.params;
    const { token } = useSpotifyAuth();
    const [tracks, setTracks] = useState<any[]>([]);
    const [filteredTracks, setFilteredTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (playlist.name) {
            navigation.setOptions({ title: playlist.name });
        }
    }, [navigation, playlist.name]);

    useEffect(() => {
        if (token) {
            fetchTracks(playlist.id);
        }
    }, [token, playlist.id]);

    useEffect(() => {
        setFilteredTracks(
            tracks.filter((track) =>
                track.track.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [searchQuery, tracks]);

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
                setFilteredTracks(data.items); // Initially, show all tracks
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

    const searchSong = async () => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setSearchResults(data.tracks.items);
            } else {
                console.error('Failed to search songs:', data);
            }
        } catch (error) {
            console.error('Error searching for song:', error);
        }
    };

    const addSongToPlaylist = async (song: any) => {
        if (tracks.some((track) => track.track.id === song.id)) {
            Alert.alert('Error', 'This song is already in the playlist.');
            return;
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uris: [`spotify:track:${song.id}`],
                }),
            });

            if (response.ok) {
                fetchTracks(playlist.id);
                Alert.alert('Success', 'Song added to the playlist.');
            } else {
                console.error('Failed to add song:', await response.json());
            }
        } catch (error) {
            console.error('Error adding song:', error);
        }
    };

    const deleteSongFromPlaylist = async (song: any) => {
        if (tracks.length === 1) {
            Alert.alert('Cannot delete song', 'This is the only song in the playlist. You cannot delete it.');
            return;
        }

        Alert.alert(
            'Delete Song',
            `Are you sure you want to delete ${song.track.name}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                                method: 'DELETE',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    tracks: [
                                        {
                                            uri: `spotify:track:${song.track.id}`,
                                        },
                                    ],
                                }),
                            });

                            if (response.ok) {
                                fetchTracks(playlist.id);
                                Alert.alert('Success', 'Song deleted from the playlist.');
                            } else {
                                console.error('Failed to delete song:', await response.json());
                            }
                        } catch (error) {
                            console.error('Error deleting song:', error);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchTracks(playlist.id); // Re-fetch the tracks and playlist data
        setRefreshing(false);
    };

    const renderTrack = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.trackItem}
            onLongPress={() => deleteSongFromPlaylist(item)}>
            <Text style={styles.trackName}>{item.track.name}</Text>
            <Text style={styles.artistName}>
                {item.track.artists.map((artist: any) => artist.name).join(', ')}
            </Text>
        </TouchableOpacity>
    );

    const renderSearchResults = () => (
        <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => addSongToPlaylist(item)}>
                    <View style={styles.searchResultItem}>
                        <Text style={styles.searchResultName}>{item.name}</Text>
                        <Text style={styles.artistName}>
                            {item.artists.map((artist: any) => artist.name).join(', ')}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
            style={styles.searchResultsList}
        />
    );

    const renderAddSongInput = () => (
        <View style={styles.addSongContainer}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search for a song"
                placeholderTextColor="#aaa"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <Button title="Search" onPress={searchSong} color="#1DB954" />
        </View>
    );

    return (
        <View style={styles.container}>
            <Image source={{ uri: playlist.images[0].url }} style={styles.image} />
            <Text style={styles.name}>{playlist.name}</Text>
            <Text style={styles.description}>{playlist.description}</Text>

            {renderAddSongInput()}

            {searchQuery && renderSearchResults()}

            {loading ? (
                <Text style={styles.loadingText}>Loading tracks...</Text>
            ) : (
                <FlatList
                    data={filteredTracks}
                    keyExtractor={(item) => item.track.id}
                    renderItem={renderTrack}
                    style={styles.trackList}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
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
    addSongContainer: {
        width: '100%',
        marginVertical: 10,
    },
    searchInput: {
        width: '100%',
        height: 40,
        paddingHorizontal: 10,
        backgroundColor: '#333',
        borderRadius: 20,
        color: '#fff',
    },
    searchResultsList: {
        marginTop: 10,
        width: '100%',
    },
    searchResultItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    searchResultName: {
        fontSize: 18,
        color: '#fff',
    },
});

export default PlaylistDetailScreen;
