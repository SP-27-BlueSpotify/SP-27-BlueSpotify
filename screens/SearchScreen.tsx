import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';

const SearchScreen: React.FC<any> = ({ navigation }) => {
    const { token } = useSpotifyAuth();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

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

    const searchSong = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);

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
                Alert.alert('Error', 'Failed to search for songs');
            }
        } catch (error) {
            console.error('Error searching for song:', error);
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const renderSearchResults = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => handlePlaySong(item.uri)}
            style={styles.searchResultItem}
        >
            <Text style={styles.searchResultName}>{item.name}</Text>
            <Text style={styles.artistName}>
                {item.artists.map((artist: any) => artist.name).join(', ')}
            </Text>
        </TouchableOpacity>
    );

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        if (!text) {
            setSearchResults([]); // Clear results when input is empty
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a song"
                    placeholderTextColor="#aaa"
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                />
                <TouchableOpacity onPress={searchSong} style={styles.searchButton}>
                    <Ionicons name="search" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <Text style={styles.loadingText}>Searching...</Text>
            ) : (
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    renderItem={renderSearchResults}
                    style={styles.resultsList}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#121212',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
        marginTop: 50,
    },
    searchInput: {
        width: '80%',
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#222',
        color: '#fff',
        height: 40,
    },
    searchButton: {
        marginLeft: 10,
        backgroundColor: '#1DB954',
        borderRadius: 50,
        padding: 10,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
    },
    resultsList: {
        marginTop: 20,
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
    artistName: {
        fontSize: 14,
        color: '#bbb',
    },
});

export default SearchScreen;
