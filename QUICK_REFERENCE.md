# Quick Reference Card

## 🚀 Getting Started (30 seconds)

```bash
npm install && npm start
# Open http://localhost:3000
```

## 🎮 Game Modes

| Mode | Description | Players |
|------|-------------|---------|
| **vs AI** | Pattern-learning opponent | 1 |
| **Quick Match** | Real-time multiplayer | 2 |
| **Tournament** | Bracket competition | 4-16 |

## 🎯 Controls

| Action | Control |
|--------|---------|
| Select Move | Click Rock/Paper/Scissors |
| Toggle Theme | 🎨 button |
| Toggle Sound | 🔊 button |
| Confirm | Enter key |
| Copy Tournament ID | 📋 button |

## 🏆 Tournament Settings Quick Guide

### Essential Settings
- **Elimination**: Single (1 loss out) or Double (2 losses out)
- **Win Condition**: Best of 1/3/5 rounds per match
- **Max Players**: 4, 8, or 16
- **AI Fill**: Auto-populate empty slots

### Timing
- **Move Timer**: 10s / 15s / 30s / Unlimited
- **Countdown**: Fast (1.5s) / Normal (3s) / Slow (5s)
- **Break**: 0s / 5s / 10s between matches

### Spectator
- **Chat**: On/Off
- **Reactions**: On/Off
- **Replay Save**: On/Off

## 🤖 AI Behavior

| Rounds Played | AI Behavior |
|---------------|-------------|
| 0-2 | Random (learning) |
| 3-10 | Basic patterns |
| 10+ | Advanced adaptation |

**AI Confidence**: < 40% = random, > 40% = pattern-based

## 🎨 Themes

| Theme | Style | Colors |
|-------|-------|--------|
| **Modern** | Geometric, clean | Monochrome + accents |
| **Playful** | Cartoonish, faces | Bright, saturated |

## 🔊 Sound Effects

| Event | Sound |
|-------|-------|
| Menu Click | 800Hz square |
| Countdown | 440Hz rising |
| Win | C-E-G-C chord |
| Lose | Descending |
| Cut | High frequency |
| Crush | Low rumble |
| Wrap | Descending sine |

## 📡 Network Setup

### Local
```
http://localhost:3000
```

### LAN
```bash
# Find IP
ifconfig | grep inet  # Mac/Linux
ipconfig              # Windows

# Share
http://YOUR_IP:3000
```

### Custom Server
```
index.html?server=192.168.1.100:3000
```

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect | Check server is running |
| Port in use | Change PORT env variable |
| No sound | Click 🔊 to enable |
| Lag | Close other tabs |
| Won't start | Run `npm install` |

## 📊 File Locations

| What | Where |
|------|-------|
| Server | `server/server.js` |
| Client | `client/index.html` |
| Game Logic | `server/gameEngine.js` |
| AI | `server/aiOpponent.js` |
| Tournaments | `server/tournamentManager.js` |
| UI | `client/js/ui/*.js` |
| Sounds | `client/js/soundEngine.js` |
| Graphics | `client/js/renderer.js` |

## 🎪 Demo Checklist

- [ ] Server running
- [ ] Browser windows open
- [ ] Sound enabled
- [ ] Theme toggle tested
- [ ] AI game ready
- [ ] Multiplayer tested
- [ ] Tournament ID copied
- [ ] Settings customized
- [ ] Bracket generated

## 💡 Pro Tips

1. **AI Demo**: Play 5 rounds of same move to show learning
2. **Theme Demo**: Toggle during gameplay for effect
3. **Tournament**: Use AI fill for quick demo
4. **Sound**: Mute during explanation, unmute for demo
5. **Multiplayer**: Have second window ready

## 📈 Key Metrics

| Metric | Value |
|--------|-------|
| Lines of Code | ~3,500 |
| Files | 15 JS + 1 HTML |
| Features | 100+ |
| Game Modes | 3 |
| Themes | 2 |
| Sounds | 20+ |
| Settings | 15+ |
| Max Players | 16 |

## 🏆 Winning Features

1. ✨ AI that learns (not random)
2. ✨ Dual complete themes
3. ✨ Tournament customization
4. ✨ Real-time multiplayer
5. ✨ Procedural audio
6. ✨ 60fps animations
7. ✨ Spectator mode
8. ✨ No build process

## 🔗 Quick Links

- Full Docs: `README.md`
- Setup Guide: `QUICKSTART.md`
- Feature List: `FEATURES.md`
- Testing: `TESTING.md`
- Demo Script: `DEMO.md`
- Architecture: `ARCHITECTURE.md`
- Summary: `PROJECT_SUMMARY.md`

## ⚡ One-Liners

**Install & Run:**
```bash
npm i && npm start
```

**Test AI:**
```bash
node -e "const AI=require('./server/aiOpponent');const ai=new AI();console.log(ai.getMove('test'));"
```

**Check Modules:**
```bash
node -e "require('./server/gameEngine');require('./server/aiOpponent');console.log('✅ OK');"
```

**Count Lines:**
```bash
find . -name "*.js" ! -path "./node_modules/*" | xargs wc -l
```

## 🎯 Remember

- **It's complete** - all features work
- **It's polished** - smooth animations, sounds
- **It's unique** - AI learns, dual themes
- **It's impressive** - tournaments, multiplayer
- **It's ready** - demo it with confidence!

---

**Good luck! You've got this! 🚀**
