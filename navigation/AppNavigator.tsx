import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import { Button } from 'react-native';
import UserProfileScreen from "../screens/UserProfileScreen";
import { TransitionSpecs} from "@react-navigation/bottom-tabs";
import MusicPlayerScreen from "../screens/MusicPlayerScreen";
import SearchScreen from "../screens/SearchScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#121212' },
                headerTintColor: '#fff',
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
            <Stack.Screen name="Now Playing" component={MusicPlayerScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function PlaylistStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#121212',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen name="Playlists" component={PlaylistsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PlaylistDetails" component={PlaylistDetailScreen} />
            <Stack.Screen name="Now Playing" component={MusicPlayerScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { token, logout } = useSpotifyAuth();

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName: string = '';

                        if (route.name === 'Playlists') {
                            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
                        } else if (route.name === 'Home') {
                            iconName = focused ? 'home' : 'home-outline';
                        }else if(route.name === 'Search'){
                            iconName = focused ? 'search' : 'search-outline';
                        }
                        else if(route.name === 'User'){
                            iconName = focused ? 'person' : 'person-outline';
                        }
                        else if (route.name === 'Login') {
                            iconName = focused ? 'log-in' : 'log-in-outline';
                        }else if (route.name === 'Now Playing') {
                            iconName = focused ? 'play' : 'play-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    headerShown: true,
                    headerStyle:{
                        backgroundColor: '#121212',
                    },
                    headerTintColor: '#fff',
                    tabBarStyle:{
                        backgroundColor: '#121212',
                    }
                })}

            >
                {token ? (
                    <>
                        <Tab.Screen
                            name="Home"
                            component={HomeStack}
                            options={{
                                headerShown: false
                            }}
                        />
                        <Tab.Screen
                            name="Search"
                            component={SearchScreen}
                            options={{
                                headerShown: false
                            }}
                        />
                        <Tab.Screen
                            name="Playlists"
                            component={PlaylistStack}
                            options={{
                                headerShown: false
                            }}
                        />
                        <Tab.Screen
                            name="Now Playing"
                            component={MusicPlayerScreen}
                            options={{
                                headerShown: false
                            }}
                        />
                        <Tab.Screen name="User" component={UserProfileScreen} options={{ headerShown: false }} />
                    </>
                ) : (
                    <Tab.Screen name="Login" component={LoginScreen} />
                )}
            </Tab.Navigator>
        </NavigationContainer>
    );
}
