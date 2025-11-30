import { useEffect, useState, useRef } from 'react'
import './menu.css'
//Assets
import queueLogo from '../../assets/icons/queuethelogo.png'
import spotiLogo from '../../assets/icons/spotiLogo.png'
import grpIcon from '../../assets/icons/groups_1.svg'

import { initiateSpotifyAuth, handleSpotifyCallback }  from '../SpotiAuth/authScript'


function Menu() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
        // Initialize state from localStorage on mount
        const storedProfile = localStorage.getItem("spotify_user_profile");
        if (storedProfile) {
            try {
                return JSON.parse(storedProfile);
            } catch (err) {
                console.error("Error parsing stored profile:", err);
                return null;
            }
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(false);
    const hasProcessedCallback = useRef(false);

    useEffect(() => {
        // Prevent duplicate processing in StrictMode
        if (hasProcessedCallback.current) return;

        // Check if we're returning from Spotify auth callback
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        
        if (code) {
            hasProcessedCallback.current = true;
            
            (async () => {
                try {
                    setIsLoading(true);
                    const profile = await handleSpotifyCallback();
                    if (profile) {
                        setUserProfile(profile);
                    }
                } catch (err) {
                    console.error("Error handling Spotify callback:", err);
                } finally {
                    setIsLoading(false);
                    // Clean up URL after successful auth
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            })();
        }
    }, []);

    const handleSpotifyLogin = async () => {
        await initiateSpotifyAuth();
    };

    const handleLogout = () => {
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_user_profile");
        setUserProfile(null);
    };

  return (
    <>
      <div>
        <a href="https://github.com/McCoffeeee/QueueTheFuck" target="_blank">
          <img src={queueLogo} className="logo_big" alt="Vite logo" />
        </a>
      </div>
      <h1>Queue The F**k!?</h1>
      <div className="card, btn_grp">
        {!userProfile ? (
          <button onClick={handleSpotifyLogin} disabled={isLoading}> 
            <span>
              <img src={spotiLogo} className="btn_icn" alt="Spotify logo" />
            </span>
            {isLoading ? 'Signing in...' : 'Sign in with Spotify'}
          </button>
        ) : (
          <button onClick={handleLogout}>
            <span>
              <img src={spotiLogo} className="btn_icn" alt="Spotify logo" />
            </span>
            Sign out
          </button>
        )}
        <button /*onClick={}*/>
          <span>
            <img src={grpIcon} className="btn_icn" alt="Spotify logo" />
          </span>
          Join Room
        </button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

{/* Placeholder for auth testing */}
        {userProfile ? (
          <>
            <h2>Display your Spotify profile data</h2>
            <section id="profile" className='profile-card'>
              <h3 className='profile-title'>Logged in as <span id="displayName">{userProfile.display_name}</span></h3>
              <span id="avatar" className='avatar_lrg'>
                {userProfile.images[0] && (
                  <img src={userProfile.images[0].url} alt="Profile" width="200" height="200" />
                )}
              </span>
              <ul className='profile-info'>
                <li>User ID: <span id="id">{userProfile.id}</span></li>
                <li>Email: <span id="email">{userProfile.email}</span></li>
                <li>Spotify URI: <a id="uri" href={userProfile.external_urls.spotify}>{userProfile.uri}</a></li>
                <li>Link: <a id="url" href={userProfile.href}>{userProfile.href}</a></li>
                <li>Profile Image: <span id="imgUrl">{userProfile.images[0]?.url ?? '(no profile image)'}</span></li>
              </ul>
            </section>
          </>
        ) : (
          <h1>Please sign in with Spotify to view your profile</h1>
        )}
    </>
  )
}

export default Menu
