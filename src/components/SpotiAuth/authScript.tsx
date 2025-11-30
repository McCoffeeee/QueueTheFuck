// const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const clientId = '7df1c3cb84484abeb403d5145d5b9972'
const redirectUri = import.meta.env.VITE_REDIRECT_URI;

export async function initiateSpotifyAuth() {
    await redirectToAuthCodeFlow(clientId);
}

export async function handleSpotifyCallback(): Promise<UserProfile | null> {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
        const accessToken = await getAccessToken(clientId, code);
        const profile = await fetchProfile(accessToken);
        console.log(profile); // Profile data logs to console
        
        // Store token and profile in localStorage
        localStorage.setItem("spotify_access_token", accessToken);
        localStorage.setItem("spotify_user_profile", JSON.stringify(profile));
        
        return profile;
    }
    return null;
}

async function redirectToAuthCodeFlow(clientId: string) {
    //Generate verifier and challenge
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    //Store verifier in local storage
    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    //TODO: Update callback uri to prod url when deploying, use pipeline variable
    params.append("redirect_uri", redirectUri);
    //List of requested account data scopes
    params.append("scope", "user-read-private user-read-email");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length: number) {
    //generates a random string for verifier 
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

    for (let i = 0; i < length; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    //Generate challenge using sha256 and encode urlsafe base64
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}


async function getAccessToken(clientId: string, code: string): Promise<string> {
    //Get verifier from local storage
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    console.log('Environment:', import.meta.env.MODE); // 'development' or 'production'
    console.log('Redirect URI:', import.meta.env.VITE_REDIRECT_URI);
    params.append("code_verifier", verifier!);

    //fetch user data using token
    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    //Access token is in response, save for later use!
    const  { access_token } = await result.json();
    
    // Clear the verifier after successful token exchange
    localStorage.removeItem("verifier");
    
    return access_token;
}

async function fetchProfile(token: string): Promise<UserProfile> {
    //Fethch headers json from api using access token from api/token endpoint
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}