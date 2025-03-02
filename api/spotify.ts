const BASE_URL = "https://api.spotify.com/v1";

export const fetchPlaylists = async (token: string) => {
    const res = await fetch(`${BASE_URL}/me/playlists`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};

export const fetchNowPlaying = async (token: string) => {
    const res = await fetch(`${BASE_URL}/me/player/currently-playing`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};
