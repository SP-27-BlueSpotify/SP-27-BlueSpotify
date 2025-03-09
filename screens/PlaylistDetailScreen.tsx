import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const PlaylistDetailScreen: React.FC<any> = ({ route, navigation }) => {
    const { playlist } = route.params;
    const { token } = useSpotifyAuth();
    const [tracks, setTracks] = useState<any[]>([]);
    const [filteredTracks, setFilteredTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

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
                setFilteredTracks(data.items);
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
                const newTrack = { track: song };
                setTracks((prevTracks) => [...prevTracks, newTrack]);
                setFilteredTracks((prevTracks) => [...prevTracks, newTrack]);
                Alert.alert('Success', 'Song added to the playlist.');
                setModalVisible(false);
                setSearchQuery('');
                setSearchResults([]);
                fetchTracks(playlist.id);
            } else {
                console.error('Failed to add song:', await response.json());
            }
        } catch (error) {
            console.error('Error adding song:', error);
        }
    };

    const deleteSongFromPlaylist = async (song: any) => {
        if (tracks.length === 1) {
            Alert.alert('Error', 'Cannot delete the only song in the playlist.');
            return;
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tracks: [{ uri: `spotify:track:${song.id}` }],
                }),
            });

            if (response.ok) {
                setTracks((prevTracks) => prevTracks.filter((track) => track.track.id !== song.id));
                setFilteredTracks((prevTracks) => prevTracks.filter((track) => track.track.id !== song.id));
                Alert.alert('Success', 'Song removed from the playlist.');
            } else {
                console.error('Failed to delete song:', await response.json());
            }
        } catch (error) {
            console.error('Error deleting song:', error);
        }
    };

    const renderTrack = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.trackItem}
            onLongPress={() =>
                Alert.alert('Delete song', 'Are you sure you want to delete this song?', [
                    { text: 'Cancel' },
                    { text: 'Delete', onPress: () => deleteSongFromPlaylist(item.track) },
                ])
            }
        >
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

    const renderAddSongButton = () => (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Icon name="add" size={30} color="#fff" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Image source={{ uri: playlist.images[0].url }} style={styles.image} />
            <Text style={styles.name}>{playlist.name}</Text>
            <Text style={styles.description}>{playlist.description}</Text>

            {renderAddSongButton()}

            {loading ? (
                <Text style={styles.loadingText}>Loading tracks...</Text>
            ) : (
                <FlatList
                    data={filteredTracks}
                    keyExtractor={(item) => item.track.id}
                    renderItem={renderTrack}
                    style={styles.trackList}
                />
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setModalVisible(false);
                    setSearchQuery('');
                    setSearchResults([]);
                }}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.searchWrapper}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search for a song"
                                placeholderTextColor="#aaa"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            <TouchableOpacity onPress={searchSong} style={styles.button}>
                                <Icon name="search" size={30} color="#1DB954" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setModalVisible(false);
                                setSearchQuery('');
                                setSearchResults([]);
                            }} style={styles.button}>
                                <Icon name="close" size={30} color="#ff4d4d" />
                            </TouchableOpacity>
                        </View>
                        {renderSearchResults()}
                    </View>
                </View>
            </Modal>
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
    addButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#1DB954',
        padding: 15,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%', // Increased width
        height: '60%', // Set fixed height
        padding: 20,
        backgroundColor: '#1e1e1e',
        borderRadius: 10,
    },
    searchWrapper: {
        flexDirection: 'row', // Align buttons and input horizontally
        alignItems: 'center', // Center vertically
        width: '100%',
        marginBottom: 10, // Optional: Add space between input and results
    },
    searchInput: {
        flex: 1, // Input takes most of the space
        height: 40,
        paddingHorizontal: 10,
        backgroundColor: '#333',
        borderRadius: 20,
        color: '#fff',
    },
    button: {
        marginLeft: 10, // Space between input and buttons
    },
    searchResultsList: {
        marginTop: 10,
        width: '100%',
        maxHeight: 300,
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
