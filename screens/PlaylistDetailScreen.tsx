import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
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
                Alert.alert('Failed to find songs');
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
    const checkPlayerState = async () => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.device && data.is_playing) {
                console.log('Player is ready and active');
                return true;
            } else {
                console.log('No active player or music is not playing');
                return false;
            }
        } catch (error) {
            console.log('Error checking player state:', error);
            return false;
        }
    };

    const handlePlaySong = async (songUri: string) => {
        const isPlayerActive = await checkPlayerState();
        if (!isPlayerActive) {
            Alert.alert('No active player', 'Please make sure your Spotify player is ready.');
            return;
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uris: [songUri],
                }),
            });

            if (response.ok) {
                navigation.navigate('Now Playing', { songUri });
            } else {
                console.error('Failed to play song:', response.statusText);
            }
        } catch (error) {
            console.error('Error playing song:', error);
        }
    };

    const handlePlayPlaylist = async () => {
        const uris = tracks.map((track) => track.track.uri);
        const isPlayerActive = await checkPlayerState();
        if (!isPlayerActive) {
            Alert.alert('No active player', 'Please make sure your Spotify player is ready.');
            return;
        }
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uris,
                }),
            });

            if (response.ok) {
                navigation.navigate('Now Playing', { uris });
            } else {
                console.error('Failed to play playlist:', response.statusText);
            }
        } catch (error) {
            console.error('Error playing playlist:', error);
        }
    };

    const renderTrack = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.trackItem}
            onPress={() => handlePlaySong(item.track.uri)}
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

    return (
        <View style={styles.container}>
            <Image source={{ uri: playlist.images[0].url }} style={styles.image} />
            <Text style={styles.name}>{playlist.name}</Text>
            <Text style={styles.description}>{playlist.description}</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handlePlayPlaylist} style={styles.iconButton}>
                    <Icon name="play" size={30} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconButton}>
                    <Icon name="add" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

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
        color: '#bbb',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    iconButton: {
        marginHorizontal: 10,
        backgroundColor: '#1DB954',
        padding: 15,
        borderRadius: 50,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    searchInput: {
        flex: 1,
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#222',
        color: '#fff',
        height: 40,
    },
    button: {
        marginLeft: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#121212',
        padding: 20,
        borderRadius: 10,
        maxHeight: '80%',
    },

    searchResultsList: {
        marginTop: 20,
        maxHeight: '75%',
    },
    searchResultItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    searchResultName: {
        fontSize: 18,
        color: '#fff',
    },
    addButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#1DB954',
        padding: 20,
        borderRadius: 50,
    },
    loadingText: {
        color: '#fff',
    },
});


export default PlaylistDetailScreen;
