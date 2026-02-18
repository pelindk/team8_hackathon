const { v4: uuidv4 } = require('uuid');

class ReplayManager {
  constructor() {
    this.replays = new Map(); // replayId -> replay data
    this.maxReplays = 1000; // Limit stored replays
  }

  // Create a replay from a completed game
  createReplay(gameData, metadata = {}) {
    const replayId = uuidv4();
    
    const replay = {
      id: replayId,
      gameId: gameData.id,
      player1: {
        id: gameData.player1.id,
        name: metadata.player1Name || 'Player 1',
        finalScore: gameData.player1.score
      },
      player2: {
        id: gameData.player2.id,
        name: metadata.player2Name || 'Player 2',
        finalScore: gameData.player2.score,
        isAI: gameData.player2.isAI
      },
      moves: gameData.history,
      winCondition: gameData.winCondition,
      winner: this.determineWinner(gameData),
      duration: Date.now() - gameData.startTime,
      timestamp: Date.now(),
      tournamentId: metadata.tournamentId || null,
      matchId: metadata.matchId || null
    };

    this.replays.set(replayId, replay);

    // Cleanup old replays if we exceed max
    if (this.replays.size > this.maxReplays) {
      this.cleanupOldReplays();
    }

    return replay;
  }

  determineWinner(gameData) {
    if (gameData.player1.score > gameData.player2.score) {
      return 'player1';
    } else if (gameData.player2.score > gameData.player1.score) {
      return 'player2';
    }
    return 'tie';
  }

  // Get a replay by ID
  getReplay(replayId) {
    return this.replays.get(replayId);
  }

  // Get all replays for a tournament
  getTournamentReplays(tournamentId) {
    const replays = [];
    for (const [id, replay] of this.replays) {
      if (replay.tournamentId === tournamentId) {
        replays.push(replay);
      }
    }
    return replays.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get recent replays
  getRecentReplays(limit = 10) {
    const replays = Array.from(this.replays.values());
    return replays
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Delete a replay
  deleteReplay(replayId) {
    this.replays.delete(replayId);
  }

  // Cleanup old replays (keep most recent ones)
  cleanupOldReplays() {
    const replays = Array.from(this.replays.entries());
    replays.sort((a, b) => b[1].timestamp - a[1].timestamp);

    // Keep only the most recent maxReplays
    const toDelete = replays.slice(this.maxReplays);
    toDelete.forEach(([id]) => {
      this.replays.delete(id);
    });
  }

  // Get replay data formatted for playback
  getPlaybackData(replayId) {
    const replay = this.replays.get(replayId);
    if (!replay) {
      return null;
    }

    return {
      id: replay.id,
      player1: replay.player1,
      player2: replay.player2,
      rounds: replay.moves.map(move => ({
        round: move.round,
        player1Move: move.player1Move,
        player2Move: move.player2Move,
        winner: move.winner,
        timestamp: move.timestamp
      })),
      winner: replay.winner,
      duration: replay.duration
    };
  }

  // Get replay statistics
  getReplayStats(replayId) {
    const replay = this.replays.get(replayId);
    if (!replay) {
      return null;
    }

    // Calculate move distribution
    const p1Moves = { rock: 0, paper: 0, scissors: 0 };
    const p2Moves = { rock: 0, paper: 0, scissors: 0 };

    replay.moves.forEach(move => {
      p1Moves[move.player1Move]++;
      p2Moves[move.player2Move]++;
    });

    return {
      totalRounds: replay.moves.length,
      player1: {
        ...replay.player1,
        moves: p1Moves,
        winRate: replay.player1.finalScore / replay.moves.length
      },
      player2: {
        ...replay.player2,
        moves: p2Moves,
        winRate: replay.player2.finalScore / replay.moves.length
      },
      duration: replay.duration
    };
  }
}

module.exports = ReplayManager;
