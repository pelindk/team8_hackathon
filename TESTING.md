# Testing Guide

## Quick Test Checklist

### ✅ Server Startup
```bash
npm start
```
Expected: Server starts on port 3000 without errors

### ✅ Basic Connection
1. Open `http://localhost:3000` in browser
2. Should see main menu with 4 buttons
3. Theme toggle (🎨) and sound toggle (🔊) should be visible

### ✅ vs AI Mode
1. Click "vs AI"
2. Enter name "TestPlayer"
3. Should see game screen with:
   - Score displays (0-0)
   - Three move buttons (Rock, Paper, Scissors)
   - Game canvas area
4. Click any move
5. Should see:
   - Countdown (3-2-1-GO)
   - Move reveal animation
   - Win/lose/tie message
6. Play 5+ rounds to test AI learning

### ✅ Quick Match Mode
**Setup**: Open two browser windows/tabs

Window 1:
1. Click "Quick Match"
2. Enter name "Player1"
3. Should see "Searching for opponent..."

Window 2:
1. Click "Quick Match"
2. Enter name "Player2"
3. Both windows should show game screen

Both Windows:
1. Select moves simultaneously
2. Should see countdown and reveal
3. Verify scores update correctly
4. Play best of 3 to completion

### ✅ Tournament Creation
1. Click "Create Tournament"
2. Enter name "Host"
3. Should see waiting room with:
   - Tournament ID
   - Copy button
   - Player list (1 player)
   - Customize button
   - START button
4. Click "⚙️ Customize"
5. Verify all settings are editable:
   - Elimination type
   - Win condition
   - Max players
   - Timers
   - Chat/spectator options
6. Click "Save Settings"
7. Click "🚀 START"
8. Should see tournament bracket

### ✅ Tournament Join
**Setup**: Create tournament in one window, get Tournament ID

Window 2:
1. Click "Join Tournament"
2. Enter Tournament ID
3. Enter name "Player2"
4. Should appear in waiting room
5. Host window should update player list

### ✅ AI Fill & Tournament Play
1. Create tournament with "AI Fill" enabled
2. Set max players to 4
3. Click START with only 1-2 human players
4. Verify AI players fill remaining slots
5. Verify bracket is generated correctly
6. Verify matches start automatically

### ✅ Sound Effects
1. Enable sound (🔊 button)
2. Test sounds:
   - Menu clicks (hover, click)
   - Move selection
   - Countdown (3-2-1-GO)
   - Win/lose/tie sounds
   - Special sounds (cut, crush, wrap)
3. Toggle sound off
4. Verify sounds stop

### ✅ Theme Toggle
1. Click 🎨 button
2. Should switch between Modern and Playful themes
3. Background gradient should change
4. In-game sprites should change style
5. Toggle back and forth several times

### ✅ Error Handling
1. Stop the server
2. Try to connect
3. Should see connection error message
4. Restart server
5. Click "Retry" or refresh
6. Should connect successfully

### ✅ Disconnect Handling
1. Start a quick match
2. Close one player's window
3. Other player should see disconnect message
4. Should be able to return to menu

### ✅ Tournament Settings Validation
Test each setting:
- **Elimination**: Single vs Double
- **Win Condition**: Best of 1, 3, 5
- **Max Players**: 4, 8, 16
- **Move Timer**: 10s, 15s, 30s, Unlimited
- **Countdown Speed**: Fast, Normal, Slow
- **Break Between**: 0s, 5s, 10s
- **Chat**: On/Off
- **Reactions**: On/Off
- **Replay Save**: On/Off
- **Grand Finals Reset**: On/Off
- **Seeding**: Random/Manual

### ✅ Responsive Design
Test on different screen sizes:
1. Desktop (1920x1080)
2. Tablet (768x1024)
3. Mobile (375x667)

Verify:
- Layout adjusts properly
- Buttons remain clickable
- Text is readable
- Canvas scales appropriately

## Advanced Testing

### Pattern Learning AI
Test AI adaptation:
1. Play 10 rounds always choosing Rock
2. AI should start playing Paper more frequently
3. Switch to always Paper
4. AI should adapt and play Scissors more
5. Play randomly
6. AI confidence should decrease

### Tournament Bracket Logic
Test bracket advancement:
1. Create 4-player tournament
2. Track winners through rounds
3. Verify correct players advance
4. Verify final champion is correct

### Double Elimination
1. Create tournament with Double Elimination
2. Verify losers bracket is created
3. Lose first match, verify drop to losers bracket
4. Win in losers bracket, verify advancement
5. Test grand finals

### Replay System
1. Complete a game vs AI
2. Check server logs for replay creation
3. Verify replay data is stored
4. (Future) Test replay playback

### Spectator Mode
1. Create tournament
2. In another window, join as spectator
3. Verify bracket is visible
4. Test chat functionality
5. Test reaction buttons
6. Verify animations appear

### Network Play (LAN)
1. Find your local IP: `ifconfig | grep inet`
2. Start server
3. On another device, open `http://YOUR_IP:3000`
4. Test quick match between devices
5. Test tournament creation/joining

### URL Parameters
1. Test: `index.html?server=localhost:3000`
2. Verify connection to specified server
3. Test with different IPs/ports

## Performance Testing

### Load Testing
1. Open 8 browser tabs
2. Join same tournament from all tabs
3. Start tournament
4. Verify all matches run smoothly
5. Check for memory leaks (F12 > Performance)

### Animation Performance
1. Play multiple rounds quickly
2. Monitor FPS in PixiJS
3. Should maintain 60fps
4. Check for animation glitches

### WebSocket Stability
1. Play 50+ rounds in a row
2. Verify no disconnections
3. Check for message delays
4. Monitor server console for errors

## Bug Testing

### Edge Cases
- [ ] Join tournament that doesn't exist
- [ ] Start tournament with 0 players
- [ ] Disconnect during countdown
- [ ] Disconnect during move selection
- [ ] Rapid clicking move buttons
- [ ] Spam chat messages
- [ ] Invalid tournament settings
- [ ] Browser back button during game
- [ ] Refresh during active game
- [ ] Multiple windows same player

### Browser Compatibility
Test on:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Known Limitations
- No authentication system
- No persistent storage (games lost on server restart)
- No reconnection after disconnect
- No manual seeding for tournaments
- No replay playback UI (backend ready)
- No spectator view for quick matches

## Automated Testing (Future)

Potential test scripts:
```javascript
// Example: Test AI opponent
const ai = new AIOpponent();
for (let i = 0; i < 100; i++) {
  ai.recordMove('player1', 'rock');
}
const prediction = ai.predictNextMove(ai.playerHistories.get('player1'));
assert(prediction.move === 'rock'); // Should predict rock
assert(ai.getMove('player1') === 'paper'); // Should counter with paper
```

## Performance Benchmarks

Target metrics:
- Server startup: < 2 seconds
- Client connection: < 500ms
- Move latency: < 100ms
- Animation frame rate: 60fps
- Memory usage: < 100MB per client
- Concurrent games: 50+ without degradation

## Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/OS information
5. Console errors (F12)
6. Network tab (if connection issues)
7. Server logs

## Success Criteria

✅ All basic features work
✅ No critical bugs
✅ Smooth animations (60fps)
✅ Low latency (< 100ms)
✅ Stable connections
✅ Responsive design works
✅ Sound effects play correctly
✅ AI learns patterns
✅ Tournaments complete successfully
✅ Error messages are clear
✅ Can play over LAN

Ready for hackathon demo! 🎉
