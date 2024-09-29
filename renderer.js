const { ipcRenderer } = require('electron');
const SpotifyWebApi = require('spotify-web-api-node');

require('dotenv').config();

const port = 8888;
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: `http://localhost:${port}/callback`
});

const scopes = ['user-read-currently-playing', 'user-read-playback-state'];

async function updateOverlay() {
  try {
    const data = await spotifyApi.getMyCurrentPlaybackState();
    
    if (data.body && data.body.is_playing) {
      const track = data.body.item;

      document.getElementById('track-name').innerText = track.name;
      document.getElementById('artist-name').innerText = track.artists.map(artist => artist.name).join(', ');
      document.getElementById('album-cover').src = track.album.images[0].url;

      overlay.style.display = 'flex';
    } else {
      overlay.style.display = 'none';
    }
  } catch (error) {
    console.error('Error updating overlay:', error);
  }

  setTimeout(updateOverlay, 5000);
}


async function authenticate() {
  const authUrl = spotifyApi.createAuthorizeURL(scopes, 'state');

  ipcRenderer.send('spotify-authenticate', authUrl);

  const http = require('http');
  const url = require('url');

  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/callback')) {
      const query = url.parse(req.url, true).query;
      const code = query.code;
  
      if (code) {
        try {
          const data = await spotifyApi.authorizationCodeGrant(code);
  
          const accessToken = data.body['access_token'];
          const refreshToken = data.body['refresh_token'];
          const expiresIn = data.body['expires_in'];
  
          spotifyApi.setAccessToken(accessToken);
          spotifyApi.setRefreshToken(refreshToken);
  
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body>
                <h1>Authentication successful! You can close this window.</h1>
                <script>
                  setTimeout(function() {
                    window.open('', '_self').close();
                  }, 500);
                </script>
              </body>
            </html>
          `);
  
          server.close();
          updateOverlay();
  
          setInterval(async () => {
            const data = await spotifyApi.refreshAccessToken();
            spotifyApi.setAccessToken(data.body['access_token']);
          }, (expiresIn / 2) * 1000);
  
        } catch (error) {
          console.error('Error during authorization code grant:', error);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>Error during authentication.</h1>');
        }
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>No code found in the callback.</h1>');
      }
    }
  });  

  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

authenticate();

/*** Front End Logic Below ***/

const { remote } = require('electron');

const themes = ['default', 'minimalist', 'minimalist-light']
let currentThemeIndex = 0;

function switchTheme(themeIndex) {
  const theme = themes[themeIndex];
  const themeLink = document.getElementById('theme-style');
  themeLink.setAttribute('href', `themes/${theme}-theme.css`);
  localStorage.setItem('theme', theme);
}

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'default';
  currentThemeIndex = themes.indexOf(savedTheme);
  if (currentThemeIndex === -1) currentThemeIndex = 0;
  switchTheme(currentThemeIndex);
});


let isDraggable = false;
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey) {
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      switchTheme(currentThemeIndex);
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      currentThemeIndex = (currentThemeIndex - 1 + themes.length) % themes.length;
      switchTheme(currentThemeIndex);
    }
  }

  if (e.ctrlKey && e.altKey && !isDraggable) {
    document.body.classList.add('draggable');
    isDraggable = true;
    ipcRenderer.send('set-ignore-mouse-events', false);
  }

  if (e.ctrlKey && e.altKey && e.shiftKey && e.code === 'KeyC') {
    const win = require('electron').remote.getCurrentWindow();
    win.close();
  }
});

window.addEventListener('keyup', (e) => {
  if (isDraggable && (!e.ctrlKey || !e.altKey)) {
    document.body.classList.remove('draggable');
    isDraggable = false;
    
    ipcRenderer.send('set-ignore-mouse-events', true);
  }
});
