const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const GameEngine = require('./gameEngine');
const AIOpponent = require('./aiOpponent');
const TournamentManager = require('./tournamentManager');
const ReplayManager = require('./replayManager');
const { MESSAGE_TYPES, GAME_MODES } = require('../shared/constants');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));
app.use('/shared', express.static(path.join(__dirname, '../shared')));

// Initialize game managers
const gameEngine = new GameEngine();
const aiOpponent = new AIOpponent();
const tournamentManager = new TournamentManager();
const replayManager = new ReplayManager();

// Track connected players and matchmaking queue
const connectedPlayers = new Map(); // socketId -> player info
const matchmakingQueue = [];

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Register player
  connectedPlayers.set(socket.id, {
    id: socket.id,
    name: null,
    currentGame: null,
    currentTournament: null
  });

  // Handle join game
  socket.on(MESSAGE_TYPES.JOIN_GAME, (data) => {
    const { mode, playerName } = data;
    const player = connectedPlayers.get(socket.id);
    player.name = playerName || `Player ${socket.id.substring(0, 4)}`;

    console.log(`${player.name} joining ${mode} mode`);

    if (mode === GAME_MODES.AI) {
      // Create game vs AI
      const gameId = uuidv4();
      const game = gameEngine.createGame(gameId, socket.id, `ai_${uuidv4()}`, true, 'best_of_3');
      player.currentGame = gameId;
      
      socket.join(gameId);
      socket.emit(MESSAGE_TYPES.GAME_STATE, {
        gameId,
        mode: GAME_MODES.AI,
        opponent: 'AI',
        state: 'playing'
      });
    } else if (mode === GAME_MODES.QUICK_MATCH) {
      // Add to matchmaking queue
      matchmakingQueue.push(socket.id);
      
      // Try to match players
      if (matchmakingQueue.length >= 2) {
        const player1Id = matchmakingQueue.shift();
        const player2Id = matchmakingQueue.shift();
        
        const gameId = uuidv4();
        const game = gameEngine.createGame(gameId, player1Id, player2Id, false, 'best_of_3');
        
        const player1 = connectedPlayers.get(player1Id);
        const player2 = connectedPlayers.get(player2Id);
        
        player1.currentGame = gameId;
        player2.currentGame = gameId;
        
        io.to(player1Id).socketsJoin(gameId);
        io.to(player2Id).socketsJoin(gameId);
        
        io.to(gameId).emit(MESSAGE_TYPES.GAME_STATE, {
          gameId,
          mode: GAME_MODES.QUICK_MATCH,
          player1: player1.name,
          player2: player2.name,
          state: 'playing'
        });

        console.log(`Match created: ${player1.name} vs ${player2.name}`);
      } else {
        socket.emit(MESSAGE_TYPES.GAME_STATE, {
          state: 'waiting',
          message: 'Searching for opponent...'
        });
      }
    }
  });

  // Handle make move
  socket.on(MESSAGE_TYPES.MAKE_MOVE, (data) => {
    const { move } = data;
    const player = connectedPlayers.get(socket.id);
    
    if (!player.currentGame) {
      socket.emit(MESSAGE_TYPES.ERROR, { message: 'Not in a game' });
      return;
    }

    const game = gameEngine.getGame(player.currentGame);
    if (!game) {
      socket.emit(MESSAGE_TYPES.ERROR, { message: 'Game not found' });
      return;
    }

    console.log(`${player.name} played ${move}`);

    // If playing vs AI, get AI move
    if (game.player2.isAI) {
      const aiMove = aiOpponent.getMove(socket.id);
      aiOpponent.recordMove(socket.id, move);
      
      // Set both moves
      gameEngine.setPlayerMove(player.currentGame, socket.id, move);
      const result = gameEngine.setPlayerMove(player.currentGame, game.player2.id, aiMove);
      
      if (result && result.roundResult) {
        // Send countdown
        io.to(player.currentGame).emit(MESSAGE_TYPES.COUNTDOWN, { count: 3 });
        setTimeout(() => {
          io.to(player.currentGame).emit(MESSAGE_TYPES.COUNTDOWN, { count: 2 });
        }, 1000);
        setTimeout(() => {
          io.to(player.currentGame).emit(MESSAGE_TYPES.COUNTDOWN, { count: 1 });
        }, 2000);
        setTimeout(() => {
          io.to(player.currentGame).emit(MESSAGE_TYPES.COUNTDOWN, { count: 0 });
        }, 3000);

        // Send reveal
        setTimeout(() => {
          io.to(player.currentGame).emit(MESSAGE_TYPES.REVEAL, {
            player1Move: result.roundResult.player1Move,
            player2Move: result.roundResult.player2Move,
            winner: result.roundResult.winner,
            result: result.roundResult.result
          });

          // If game is over, send match complete
          if (result.gameOver) {
            setTimeout(() => {
              const stats = gameEngine.getGameStats(player.currentGame);
              io.to(player.currentGame).emit(MESSAGE_TYPES.MATCH_COMPLETE, {
                winner: result.gameWinner,
                stats
              });

              // Create replay
              const replay = replayManager.createReplay(game, {
                player1Name: player.name,
                player2Name: 'AI'
              });

              // Cleanup
              gameEngine.deleteGame(player.currentGame);
              player.currentGame = null;
            }, 3000);
          }
        }, 4000);
      }
    } else {
      // Multiplayer game
      const result = gameEngine.setPlayerMove(player.currentGame, socket.id, move);
      
      if (result && result.waiting) {
        socket.emit(MESSAGE_TYPES.GAME_STATE, {
          state: 'waiting_for_opponent',
          message: 'Waiting for opponent...'
        });
      } else if (result && result.roundResult) {
        // Both players ready, send countdown
        io.to(player.currentGame).emit(MESSAGE_TYPES.COUNTDOWN, { count: 3 });
        setTimeout(() => {
          io.to(player.currentGame).emit(MESSAGE_TYPES.COUNTDOWN, { count: 2 });
        }, 1000);
        setTimeout(() => {
          io.to(player.currentGame).emit(MESSAGE_TYPES.COUNTDOWN, { count: 1 });
        }, 2000);
        setTimeout(() => {
          io.to(player.currentGame).emit(MESSAGE_TYPES.COUNTDOWN, { count: 0 });
        }, 3000);

        // Send reveal
        setTimeout(() => {
          io.to(player.currentGame).emit(MESSAGE_TYPES.REVEAL, {
            player1Move: result.roundResult.player1Move,
            player2Move: result.roundResult.player2Move,
            winner: result.roundResult.winner,
            result: result.roundResult.result
          });

          // If game is over, send match complete
          if (result.gameOver) {
            setTimeout(() => {
              const stats = gameEngine.getGameStats(player.currentGame);
              io.to(player.currentGame).emit(MESSAGE_TYPES.MATCH_COMPLETE, {
                winner: result.gameWinner,
                stats
              });

              // Get player names
              const p1 = connectedPlayers.get(game.player1.id);
              const p2 = connectedPlayers.get(game.player2.id);

              // Create replay
              const replay = replayManager.createReplay(game, {
                player1Name: p1?.name || 'Player 1',
                player2Name: p2?.name || 'Player 2'
              });

              // Cleanup
              gameEngine.deleteGame(player.currentGame);
              if (p1) p1.currentGame = null;
              if (p2) p2.currentGame = null;
            }, 3000);
          }
        }, 4000);
      }
    }
  });

  // Handle create tournament
  socket.on(MESSAGE_TYPES.CREATE_TOURNAMENT, (data) => {
    const { playerName } = data;
    const player = connectedPlayers.get(socket.id);
    player.name = playerName || `Player ${socket.id.substring(0, 4)}`;

    const tournament = tournamentManager.createTournament(socket.id, player.name);
    player.currentTournament = tournament.id;

    socket.join(tournament.id);
    socket.emit(MESSAGE_TYPES.WAITING_ROOM_UPDATE, {
      tournamentId: tournament.id,
      players: tournament.players,
      isHost: true,
      settings: tournament.settings
    });

    console.log(`Tournament created by ${player.name}: ${tournament.id}`);
  });

  // Handle join tournament
  socket.on(MESSAGE_TYPES.JOIN_TOURNAMENT, (data) => {
    const { tournamentId, playerName } = data;
    const player = connectedPlayers.get(socket.id);
    player.name = playerName || `Player ${socket.id.substring(0, 4)}`;

    const result = tournamentManager.joinTournament(tournamentId, socket.id, player.name);
    
    if (result.error) {
      socket.emit(MESSAGE_TYPES.ERROR, { message: result.error });
      return;
    }

    player.currentTournament = tournamentId;
    socket.join(tournamentId);

    // Notify all players in waiting room
    const tournament = tournamentManager.getTournament(tournamentId);
    io.to(tournamentId).emit(MESSAGE_TYPES.WAITING_ROOM_UPDATE, {
      tournamentId: tournament.id,
      players: tournament.players,
      isHost: socket.id === tournament.hostId,
      settings: tournament.settings
    });

    console.log(`${player.name} joined tournament ${tournamentId}`);
  });

  // Handle update tournament settings
  socket.on(MESSAGE_TYPES.UPDATE_TOURNAMENT_SETTINGS, (data) => {
    const { settings } = data;
    const player = connectedPlayers.get(socket.id);
    
    if (!player.currentTournament) {
      socket.emit(MESSAGE_TYPES.ERROR, { message: 'Not in a tournament' });
      return;
    }

    const result = tournamentManager.updateSettings(player.currentTournament, socket.id, settings);
    
    if (result.error) {
      socket.emit(MESSAGE_TYPES.ERROR, { message: result.error });
      return;
    }

    // Notify all players
    const tournament = tournamentManager.getTournament(player.currentTournament);
    io.to(player.currentTournament).emit(MESSAGE_TYPES.WAITING_ROOM_UPDATE, {
      tournamentId: tournament.id,
      players: tournament.players,
      isHost: socket.id === tournament.hostId,
      settings: tournament.settings
    });
  });

  // Handle start tournament
  socket.on(MESSAGE_TYPES.START_TOURNAMENT, () => {
    const player = connectedPlayers.get(socket.id);
    
    if (!player.currentTournament) {
      socket.emit(MESSAGE_TYPES.ERROR, { message: 'Not in a tournament' });
      return;
    }

    const result = tournamentManager.startTournament(player.currentTournament, socket.id);
    
    if (result.error) {
      socket.emit(MESSAGE_TYPES.ERROR, { message: result.error });
      return;
    }

    // Notify all players that tournament started
    io.to(player.currentTournament).emit(MESSAGE_TYPES.TOURNAMENT_STARTED, {
      bracket: result.bracket,
      settings: result.tournament.settings
    });

    console.log(`Tournament ${player.currentTournament} started`);

    // Start first matches
    startNextTournamentMatches(player.currentTournament);
  });

  // Handle chat message
  socket.on(MESSAGE_TYPES.CHAT_MESSAGE, (data) => {
    const { message } = data;
    const player = connectedPlayers.get(socket.id);
    
    if (!player.currentTournament) {
      return;
    }

    const result = tournamentManager.addChatMessage(
      player.currentTournament,
      socket.id,
      player.name,
      message
    );

    if (result.success) {
      io.to(player.currentTournament).emit(MESSAGE_TYPES.CHAT_MESSAGE, result.message);
    }
  });

  // Handle spectate
  socket.on(MESSAGE_TYPES.SPECTATE, (data) => {
    const { tournamentId } = data;
    const player = connectedPlayers.get(socket.id);

    const result = tournamentManager.addSpectator(tournamentId, socket.id, player.name || 'Spectator');
    
    if (result.error) {
      socket.emit(MESSAGE_TYPES.ERROR, { message: result.error });
      return;
    }

    socket.join(tournamentId);
    
    const tournament = tournamentManager.getTournament(tournamentId);
    socket.emit(MESSAGE_TYPES.TOURNAMENT_UPDATE, {
      bracket: tournament.bracket,
      state: tournament.state
    });
  });

  // Handle request replay
  socket.on(MESSAGE_TYPES.REQUEST_REPLAY, (data) => {
    const { replayId } = data;
    const replay = replayManager.getPlaybackData(replayId);
    
    if (!replay) {
      socket.emit(MESSAGE_TYPES.ERROR, { message: 'Replay not found' });
      return;
    }

    socket.emit(MESSAGE_TYPES.REPLAY_DATA, replay);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    const player = connectedPlayers.get(socket.id);
    if (player) {
      // Remove from matchmaking queue
      const queueIndex = matchmakingQueue.indexOf(socket.id);
      if (queueIndex !== -1) {
        matchmakingQueue.splice(queueIndex, 1);
      }

      // Handle game cleanup
      if (player.currentGame) {
        const game = gameEngine.getGame(player.currentGame);
        if (game) {
          io.to(player.currentGame).emit(MESSAGE_TYPES.ERROR, {
            message: 'Opponent disconnected'
          });
          gameEngine.deleteGame(player.currentGame);
        }
      }

      // Handle tournament cleanup
      if (player.currentTournament) {
        tournamentManager.removeSpectator(player.currentTournament, socket.id);
      }
    }

    connectedPlayers.delete(socket.id);
  });
});

// Helper function to start next tournament matches
function startNextTournamentMatches(tournamentId) {
  const tournament = tournamentManager.getTournament(tournamentId);
  if (!tournament) return;

  const nextMatches = tournamentManager.getNextMatches(tournamentId);
  
  // Start matches (for now, just notify - actual game logic would go here)
  nextMatches.forEach(match => {
    if (match.status === 'pending') {
      match.status = 'in_progress';
      
      // Create a game for this match
      const gameId = uuidv4();
      match.gameId = gameId;
      
      const game = gameEngine.createGame(
        gameId,
        match.player1.id,
        match.player2.id,
        match.player2.isAI,
        tournament.settings.winCondition
      );

      // Notify players
      io.to(tournamentId).emit(MESSAGE_TYPES.TOURNAMENT_UPDATE, {
        bracket: tournament.bracket,
        currentMatch: match
      });
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🎮 RPS Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 Open http://localhost:${PORT} to play`);
});
