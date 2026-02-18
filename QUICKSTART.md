# Quick Start Guide

## Installation & Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Start the Server**
```bash
npm start
```

The server will start on `http://localhost:3000`

3. **Open the Game**
- Open `http://localhost:3000` in your browser
- Or open `client/index.html` directly in your browser

## Game Modes

### 1. vs AI
Play against a pattern-learning AI that adapts to your play style.

- Click "vs AI" from the main menu
- Enter your name
- Choose Rock, Paper, or Scissors
- The AI learns your patterns and tries to counter them!

### 2. Quick Match
Play against another human player in real-time.

- Click "Quick Match" from the main menu
- Enter your name
- Wait for another player to join
- Both players choose their moves simultaneously

### 3. Tournament Mode

#### Creating a Tournament
1. Click "Create Tournament"
2. Enter your name
3. Share the Tournament ID with other players
4. Click "⚙️ Customize" to configure settings:
   - Elimination type (Single/Double)
   - Win condition (Best of 1/3/5)
   - Max players (4/8/16)
   - Timers and breaks
   - Chat and spectator settings
5. Click "🚀 START" when ready

#### Joining a Tournament
1. Click "Join Tournament"
2. Enter the Tournament ID
3. Enter your name
4. Wait for the host to start

## Features

### Pattern-Learning AI
The AI tracks your move history and uses:
- **Frequency Analysis**: What you play most often
- **Bigram Analysis**: What you play after specific moves
- **Trigram Analysis**: What you play after sequences of moves
- Confidence threshold: Falls back to random if patterns aren't strong enough

### Tournament Customization
- **Single/Double Elimination**: Choose your bracket style
- **Win Conditions**: Best of 1, 3, or 5 rounds per match
- **AI Fill**: Automatically fill empty slots with AI players
- **Move Timers**: 10s, 15s, 30s, or unlimited
- **Spectator Features**: Chat and reactions
- **Replay Auto-save**: Record all matches

### Visual Themes
Toggle between two themes:
- **Modern**: Clean, minimalist design with geometric shapes
- **Playful**: Cartoonish style with character faces

Click the 🎨 button to switch themes.

### Sound Effects
Dynamic audio feedback using Web Audio API:
- Menu interactions
- Move selections
- Countdown sequences
- Win/lose/tie sounds
- Special interaction sounds (cutting, crushing, wrapping)

Click the 🔊 button to toggle sound.

## Playing Over Network

### LAN Play
1. Start the server on one computer
2. Find your local IP address:
   - Mac/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`
3. Share the URL with other players: `http://YOUR_IP:3000`
4. Players open that URL in their browsers

### Using URL Parameters
You can specify the server address in the URL:
```
client/index.html?server=192.168.1.100:3000
```

## Keyboard Shortcuts
- **Enter**: Confirm in dialogs
- **Escape**: Cancel/close dialogs (when implemented)

## Tips & Tricks

### Against AI
- The AI needs a few rounds to learn your patterns
- Try to be unpredictable!
- Mix up your moves to confuse the AI
- Watch the AI's confidence level (if displayed)

### Tournaments
- Use the customize panel to set up the perfect tournament
- Enable chat for spectators to make it more engaging
- Auto-save replays to review matches later
- Double elimination gives players a second chance

## Troubleshooting

### Can't Connect to Server
- Make sure the server is running (`npm start`)
- Check that port 3000 is not in use
- Try accessing `http://localhost:3000` directly

### Game Not Loading
- Check browser console for errors (F12)
- Make sure all dependencies loaded (Socket.io, PixiJS)
- Try refreshing the page

### Multiplayer Not Working
- Ensure both players are connected to the same server
- Check firewall settings if playing over network
- Verify the server URL is correct

## Development

### Project Structure
```
/hackathon
├── server/              # Node.js backend
│   ├── server.js       # Main WebSocket server
│   ├── gameEngine.js   # Game logic
│   ├── aiOpponent.js   # Pattern-learning AI
│   ├── tournamentManager.js
│   └── replayManager.js
├── client/             # Frontend
│   ├── index.html     # Main HTML file
│   └── js/            # JavaScript modules
└── shared/            # Shared constants
```

### Adding Features
- Server logic goes in `server/`
- Client UI in `client/js/ui/`
- Shared constants in `shared/constants.js`

### Testing
- Test vs AI: Single player, no network needed
- Test multiplayer: Open two browser windows
- Test tournaments: Open multiple tabs/windows

## Credits

Built for a hackathon with:
- Node.js + Express + Socket.io (backend)
- PixiJS (rendering)
- Web Audio API (sound)
- Vanilla JavaScript (frontend)

Enjoy the game! 🎮
