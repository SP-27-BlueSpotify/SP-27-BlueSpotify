import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuthRequest, makeRedirectUri, exchangeCodeAsync } from "expo-auth-session";
import { CLIENT_ID, CLIENT_SECRET } from '@env';
import { Alert } from 'react-native'; // Import Alert for confirmation

// Use makeRedirectUri to get the correct URI for Expo
const REDIRECT_URI = makeRedirectUri();

// The scopes required by your app
const SCOPES = [
    "user-read-private",
    "user-read-email",
    "user-read-playback-state",
    "user-modify-playback-state",
    "playlist-modify-public",
    "playlist-modify-private"
];

// Discovery document for OAuth flow
const DISCOVERY = {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
    tokenEndpoint: "https://accounts.spotify.com/api/token",
};

interface AuthContextProps {
    token: string | null;
    login: () => void;
    logout: () => void;
}

const SpotifyAuthContext = createContext<AuthContextProps | undefined>(undefined);

export const SpotifyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);

    // This will automatically handle the authorization flow
    const [request, response, promptAsync] = useAuthRequest(
        {
            clientSecret: CLIENT_SECRET,
            clientId: CLIENT_ID,
            scopes: SCOPES,
            redirectUri: REDIRECT_URI,
            // Disable PKCE for testing (remove challenge and verifier)
            usePKCE: false,
        },
        DISCOVERY
    );

    // Listen for successful responses
    useEffect(() => {
        if (response?.type === "success") {
            const { code } = response.params;
            // Exchange the code for an access token
            exchangeCodeAsync(
                {
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    code,
                    redirectUri: REDIRECT_URI,
                },
                DISCOVERY
            )
                .then((tokenRes) => {
                    setToken(tokenRes.accessToken);
                })
                .catch((error) => {
                    console.error("Error exchanging code for token:", error);
                });
        }
    }, [response]);

    const login = () => {
        promptAsync(); // Start the OAuth flow
    };

    const logout = () => {
        // Show a confirmation alert before logging out
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Logout canceled'),
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    onPress: () => setToken(null), // Clear the token on logout
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <SpotifyAuthContext.Provider value={{ token, login, logout }}>
            {children}
        </SpotifyAuthContext.Provider>
    );
};

export const useSpotifyAuth = () => {
    const context = useContext(SpotifyAuthContext);
    if (!context) {
        throw new Error("useSpotifyAuth must be used within a SpotifyAuthProvider");
    }
    return context;
};
