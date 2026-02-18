# Team Setup Guide

## 🚀 Quick Setup for Team Members

### 1. Clone the Repository

```bash
git clone git@github.com:pelindk/team8_hackathon.git
cd team8_hackathon
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 4. Open the Game

Open your browser to: **http://localhost:3000**

## 🎮 Testing the Game

### Quick Test Checklist
- [ ] Click "vs AI" and play a few rounds
- [ ] Try theme toggle (🎨 button)
- [ ] Try sound toggle (🔊 button)
- [ ] Play 5+ rounds of the same move to see AI learn
- [ ] Check that scores and tie counter work

### Multiplayer Test
1. Open two browser windows/tabs
2. Both click "Quick Match"
3. Enter different names
4. Play against each other

### Tournament Test
1. Click "Create Tournament"
2. Click "⚙️ Customize" to see settings
3. Enable "AI Fill" and set max players to 4
4. Click "🚀 START" to generate bracket

## 📁 Project Structure

```
team8_hackathon/
├── server/              # Backend (Node.js + Socket.io)
│   ├── server.js       # Main WebSocket server
│   ├── gameEngine.js   # Game logic
│   ├── aiOpponent.js   # Pattern-learning AI
│   ├── tournamentManager.js
│   └── replayManager.js
├── client/             # Frontend (HTML/JS)
│   ├── index.html     # Main game page
│   └── js/            # JavaScript modules
├── shared/            # Shared constants
└── docs/              # Documentation (8 files)
```

## 🎯 Key Features Implemented

✅ Pattern-learning AI (learns your moves!)
✅ Real-time multiplayer
✅ Tournament system (single/double elimination)
✅ Dual themes (Modern & Playful)
✅ Sound effects (20+ sounds)
✅ Score tracking with tie counter
✅ Spectator mode
✅ Replay recording

## 📚 Documentation

- **README.md** - Project overview
- **QUICKSTART.md** - Detailed setup guide
- **FEATURES.md** - Complete feature list (100+)
- **DEMO.md** - Hackathon presentation script
- **TESTING.md** - Testing guide
- **ARCHITECTURE.md** - Technical details
- **QUICK_REFERENCE.md** - Quick reference card

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill existing process
pkill -f "node server/server.js"
# Or use a different port
PORT=3001 npm start
```

### Can't Connect
- Make sure server is running (`npm start`)
- Check browser console for errors (F12)
- Try refreshing the page

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🎪 For Hackathon Demo

1. **Review DEMO.md** for presentation script
2. **Practice the demo** (5 minutes)
3. **Key talking points**:
   - AI that actually learns patterns
   - Real-time multiplayer
   - Tournament customization
   - Dual theme system
   - 3,500+ lines of code

## 🤝 Team Workflow

### Making Changes
```bash
# Pull latest changes
git pull origin main

# Make your changes
# ...

# Commit and push
git add .
git commit -m "Description of changes"
git push origin main
```

### Running on Different Machines
- Server runs on one machine
- Others connect via: `http://SERVER_IP:3000`
- Find your IP: `ifconfig | grep inet` (Mac/Linux)

## 🏆 Game Modes

### vs AI
- Best for testing AI learning
- Play 5+ rounds of same move to see adaptation
- AI uses Markov chain analysis

### Quick Match
- Real-time 1v1 multiplayer
- Automatic matchmaking
- Best of 3 rounds

### Tournament
- Up to 16 players
- Single or double elimination
- 15+ customizable settings
- AI auto-fill for empty slots

## 💡 Tips

- **Theme Toggle**: Click 🎨 to switch between Modern/Playful
- **Sound Toggle**: Click 🔊 to enable/disable sounds
- **AI Learning**: Play predictably to see AI adapt
- **Multiplayer**: Open multiple tabs to test locally

## 📞 Need Help?

Check the documentation files or ask the team!

---

**Status**: ✅ Ready for Hackathon
**Repository**: https://github.com/pelindk/team8_hackathon
**Last Updated**: Feb 18, 2026

Good luck team! 🚀
