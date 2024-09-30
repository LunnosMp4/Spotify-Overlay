# Spotify Overlay

## Overview

This project is an Electron application that provides a customizable overlay for Spotify. It displays the currently playing track information, including the song title, artist name, and album cover art, directly on your desktop. The overlay is designed to be minimalistic and unobtrusive, with support for multiple themes and easy repositioning.

## Features

- **Current Track Display**: Shows the currently playing song, artist, and album art from Spotify.
- **Multiple Themes**: Customize the look and feel by switching between different themes.
- **Easy Positioning**: Move the overlay anywhere on your screen by holding `Ctrl + Alt` and dragging.
- **Theme Switching**: Quickly switch themes using keyboard shortcuts `Ctrl + Alt + Arrow keys`.

## Setup Instructions

### Prerequisites

- **Node.js**: Make sure you have Node.js installed. [Download Node.js](https://nodejs.org/)
- **Spotify Developer Account**: You need to create a Spotify application to obtain a `Client ID` and `Client Secret`. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)

### Installation Steps

1. **Clone the Repository**

```bash
git clone https://github.com/LunnosMp4/spotify-overlay-electron.git
cd spotify-overlay-electron
```

2. **Install Dependencies**

Navigate to the project directory and install the required Node.js packages:

```bash
npm install
```
3. **Configure Environment Variables**
Create a `.env` file in the root directory of the project to store your Spotify API credentials:

```bash
touch .env
```
Open the .env file in a text editor and add the following lines:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

Replace your_spotify_client_id and your_spotify_client_secret with the values from your Spotify developer dashboard.

4. **Run the Application**

Start the Electron application:

```bash
npm start
```

The app will prompt you to authenticate with Spotify on first launch.

## Build App

To package the Electron app for distribution, you can use electron-packager or electron-builder. Below are instructions for packaging your app using electron-builder:

1. Install electron-builder

Install the electron-builder package as a dev dependency:

```bash
npm install electron-builder --save-dev
```

2. Build the Application

Once you have set up electron-builder, you can build the app for your target platform by running:

```bash
npm run build
```
This will create a distributable version of your app in the dist/ directory.

- For Windows, the app will be packaged as an installer (.exe).
- For macOS, the app will be packaged as a .dmg file.
- For Linux, the app will be packaged as an AppImage or .deb file.

## Usage Instructions
### Moving the Overlay
To move the overlay: Press `Ctrl + Alt + X` to enable drag mode and then click and drag the overlay to your desired position on the screen. When finish press `Ctrl + Alt + X` again to disable drag mode.

### Changing Themes
To switch to the next theme: Press `Ctrl + Alt + Right Arrow`.
To switch to the previous theme: Press `Ctrl + Alt + Left Arrow`.

### Reset window position
To reset the window position: Press `Ctrl + Alt + R`.

### Closing the Overlay
To close the overlay window: Press `Ctrl + Alt + Shift + C`

## Creating Custom Themes
You can customize the appearance of the overlay by creating your own themes.

### Steps to Create a New Theme

1. Navigate to the Themes Directory

```bash
cd themes
```

2. Create a New Theme File

- Create a new CSS file with the naming convention theme-name-theme.css.

- The `-theme` suffix is important for the application to recognize the file as a theme.

- Example:

```bash
touch my-custom-theme-theme.css
```

3. Design Your Theme

- Open your new theme file in a text editor.

- Use default-theme.css as a reference to understand which elements you can style.

- Customize the CSS to change colors, fonts, sizes, and other styles.

4. Update the Application to Include Your Theme

- Open renderer.js located in the root directory.

- Find the line that defines the themes array:

```javascript
const themes = ['default', 'minimalist', 'minimalist-light'];
```

- Add your theme's name to the array (without the -theme.css suffix):

```javascript
const themes = ['default', 'minimalist', 'minimalist-light', 'my-custom-theme'];
```

- Save the file.