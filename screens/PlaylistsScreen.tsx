import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput, Modal, RefreshControl } from 'react-native';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button } from 'react-native';

const PlaylistsScreen: React.FC<any> = ({ navigation }) => {
    const { token } = useSpotifyAuth();
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [newPlaylistName, setNewPlaylistName] = useState<string>('');
    const [playlistDescription, setPlaylistDescription] = useState<string>('');
    const [selectedSongUri, setSelectedSongUri] = useState<string>('');
    const [songSearchQuery, setSongSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (token !== null) {
            fetchPlaylists(token);
        }
    }, [token]);

    const fetchPlaylists = async (accessToken: string) => {
        setLoading(true);
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

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (token !== null) {
            await fetchPlaylists(token);
        }
        setIsRefreshing(false);
    };

    const handlePlaylistPress = (playlist: any) => {
        navigation.navigate('PlaylistDetails', { playlist });
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim() || !selectedSongUri) {
            alert('Please enter a playlist name and select a song.');
            return;
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/playlists', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newPlaylistName,
                    description: playlistDescription || '',
                    public: true,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Failed to create playlist:', data);
                return;
            }

            const playlistId = data.id;

            const addSongResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uris: [selectedSongUri],
                }),
            });

            const addSongData = await addSongResponse.json();

            if (addSongResponse.ok) {
                if (token != null) {
                    fetchPlaylists(token);
                }
                setNewPlaylistName('');
                setPlaylistDescription('');
                setSelectedSongUri('');
                setModalVisible(false);
            } else {
                console.error('Failed to add song to playlist:', addSongData);
            }
        } catch (error) {
            console.error('Error creating playlist or adding song:', error);
        }
    };

    const searchSongs = async () => {
        if (!songSearchQuery.trim()) return;
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${songSearchQuery}&type=track&limit=5`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            setSearchResults(data.tracks.items);
        } catch (error) {
            console.error('Error searching for songs:', error);
        }
    };

    const handleSongSelect = (song: any) => {
        setSelectedSongUri(song.uri);
        setModalVisible(false);
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

    const renderSearchResult = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => handleSongSelect(item)}>
            <View style={styles.searchResultItem}>
                {item.album.images[0] && (
                    <Image source={{ uri: item.album.images[0].url }} style={styles.songImage} />
                )}
                <Text style={styles.songName}>{item.name}</Text>
                <Text style={styles.artistName}>{item.artists.map((artist: any) => artist.name).join(', ')}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Playlists</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.createButton}>
                    <Icon name="add" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <Text style={styles.loadingText}>Loading playlists...</Text>
            ) : (
                <>
                    <FlatList
                        data={playlists}
                        keyExtractor={(item) => item.id}
                        renderItem={renderPlaylist}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                            />
                        }
                    />

                    <Modal
                        visible={modalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Playlist Name"
                                    value={newPlaylistName}
                                    onChangeText={setNewPlaylistName}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Playlist Description (Optional)"
                                    value={playlistDescription}
                                    onChangeText={setPlaylistDescription}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Search for a song"
                                    value={songSearchQuery}
                                    onChangeText={setSongSearchQuery}
                                    onSubmitEditing={searchSongs}
                                />

                                <FlatList
                                    data={searchResults}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderSearchResult}
                                />

                                <Button title="Create Playlist" onPress={handleCreatePlaylist} />
                                <Button title="Close" onPress={() => setModalVisible(false)} />
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#121212',
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    createButton: {
        backgroundColor: '#1DB954',
        borderRadius: 50,
        padding: 10,
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
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 10,
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: '#1f1f1f',
        borderRadius: 10,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    songImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    songName: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
    },
    artistName: {
        fontSize: 12,
        color: '#bbb',
    },
});

export default PlaylistsScreen;
