import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFocusEffect} from "@react-navigation/native";

const MusicPlayerScreen: React.FC<any> = ({ navigation }) => {
    const { token } = useSpotifyAuth();
    const [currentTrack, setCurrentTrack] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useFocusEffect(
        React.useCallback(() => {
            if (token) {
                fetchCurrentPlayback();
            }
        }, [token])
    );
    const fetchCurrentPlayback = async () => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok && response.status !== 204) {
                const data = await response.json();

                if (data && data.item) {
                    setCurrentTrack(data.item);
                    setIsPlaying(data.is_playing);
                } else {
                    setCurrentTrack(null);
                    setIsPlaying(false);
                }
            } else {
                setCurrentTrack(null);
                setIsPlaying(false);
            }
        } catch (error) {
            setCurrentTrack(null);
            setIsPlaying(false);
            console.error('Error fetching current playback:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshCurrentTrack = async () => {
        setTimeout(() => {
            fetchCurrentPlayback();
        }, 250);
    };

    const handlePlayPause = async () => {
        try {
            const response = isPlaying
                ? await fetch('https://api.spotify.com/v1/me/player/pause', {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                : await fetch('https://api.spotify.com/v1/me/player/play', {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

            if (response.ok) {
                setIsPlaying(!isPlaying);
                refreshCurrentTrack();
            }
        } catch (error) {
            console.error('Error controlling playback:', error);
        }
    };

    const handleNext = async () => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/next', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                refreshCurrentTrack(); // Refresh track info after switching
            }
        } catch (error) {
            console.error('Error skipping track:', error);
        }
    };

    const handlePrevious = async () => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                refreshCurrentTrack(); // Refresh track info after going back
            }
        } catch (error) {
            console.error('Error going to previous track:', error);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#1DB954" />
            ) : currentTrack ? (
                <View style={styles.trackInfo}>
                    <Image source={{ uri: currentTrack.album.images[0].url }} style={styles.albumArt} />
                    <Text style={styles.trackTitle}>{currentTrack.name}</Text>
                    <Text style={styles.trackArtist}>{currentTrack.artists.map((artist: any) => artist.name).join(', ')}</Text>
                    <Text style={styles.trackAlbum}>{currentTrack.album.name}</Text>
                    <Text style={styles.trackDuration}>
                        {`${Math.floor(currentTrack.duration_ms / 60000)}:${String(Math.floor((currentTrack.duration_ms % 60000) / 1000)).padStart(2, '0')}`}
                    </Text>
                </View>
            ) : (
                <View style={styles.trackInfo}>
                    <View style={styles.emptyCoverArt}></View>
                    <Text style={styles.noTrackText}>No track is currently playing.</Text>
                </View>
            )}

            <View style={styles.controlContainer}>
                <Ionicons
                    name="play-skip-back"
                    size={40}
                    color="#fff"
                    onPress={handlePrevious}
                    style={styles.controlButton}
                />
                <Ionicons
                    name={isPlaying ? 'pause-circle' : 'play-circle'}
                    size={80}
                    color="#fff"
                    onPress={handlePlayPause}
                    style={styles.controlButton}
                />
                <Ionicons
                    name="play-skip-forward"
                    size={40}
                    color="#fff"
                    onPress={handleNext}
                    style={styles.controlButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    trackInfo: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 120,
    },
    albumArt: {
        width: 300,
        height: 300,
        borderRadius: 10,
    },
    emptyCoverArt: {
        width: 300,
        height: 300,
        backgroundColor: '#333',
        borderRadius: 10,
    },
    trackTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
    },
    trackArtist: {
        color: '#bbb',
        fontSize: 18,
    },
    trackAlbum: {
        color: '#bbb',
        fontSize: 14,
    },
    trackDuration: {
        color: '#bbb',
        fontSize: 14,
        marginTop: 10,
    },
    controlContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingVertical: 20,
        backgroundColor: '#121212',
    },
    controlButton: {
        alignSelf: 'center',
    },
    noTrackText: {
        color: '#bbb',
        fontSize: 18,
    },
});

export default MusicPlayerScreen;
