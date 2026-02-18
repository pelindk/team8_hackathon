const { MOVES, WIN_CONDITIONS } = require('../shared/constants');

class GameEngine {
  constructor() {
    this.games = new Map(); // gameId -> game state
  }

  createGame(gameId, player1Id, player2Id, isAI = false, winCondition = 'best_of_1') {
    const game = {
      id: gameId,
      player1: {
        id: player1Id,
        move: null,
        score: 0,
        ready: false
      },
      player2: {
        id: player2Id,
        move: null,
        score: 0,
        ready: false,
        isAI
      },
      winCondition,
      currentRound: 1,
      maxRounds: this.getMaxRounds(winCondition),
      state: 'waiting',
      history: [],
      startTime: Date.now()
    };

    this.games.set(gameId, game);
    return game;
  }

  getMaxRounds(winCondition) {
    switch (winCondition) {
      case 'best_of_1': return 1;
      case 'best_of_3': return 3;
      case 'best_of_5': return 5;
      default: return 1;
    }
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }

  setPlayerMove(gameId, playerId, move) {
    const game = this.games.get(gameId);
    if (!game) return null;

    // Validate move
    if (!Object.values(MOVES).includes(move)) {
      return { error: 'Invalid move' };
    }

    // Set the move
    if (game.player1.id === playerId) {
      game.player1.move = move;
      game.player1.ready = true;
    } else if (game.player2.id === playerId) {
      game.player2.move = move;
      game.player2.ready = true;
    } else {
      return { error: 'Player not in game' };
    }

    // Check if both players are ready
    if (game.player1.ready && game.player2.ready) {
      return this.resolveRound(gameId);
    }

    return { waiting: true };
  }

  resolveRound(gameId) {
    const game = this.games.get(gameId);
    if (!game) return null;

    const p1Move = game.player1.move;
    const p2Move = game.player2.move;

    // Determine winner
    let winner = null;
    let result = 'tie';

    if (p1Move === p2Move) {
      result = 'tie';
    } else if (WIN_CONDITIONS[p1Move] === p2Move) {
      winner = 'player1';
      game.player1.score++;
      result = 'player1_wins';
    } else {
      winner = 'player2';
      game.player2.score++;
      result = 'player2_wins';
    }

    // Record in history
    const roundResult = {
      round: game.currentRound,
      player1Move: p1Move,
      player2Move: p2Move,
      winner,
      result,
      timestamp: Date.now()
    };
    game.history.push(roundResult);

    // Check if game is over
    const gameOver = this.isGameOver(game);
    
    // Reset for next round
    game.player1.move = null;
    game.player1.ready = false;
    game.player2.move = null;
    game.player2.ready = false;

    if (!gameOver) {
      game.currentRound++;
    } else {
      game.state = 'finished';
    }

    return {
      roundResult,
      gameOver,
      gameWinner: gameOver ? this.getGameWinner(game) : null,
      game
    };
  }

  isGameOver(game) {
    const maxRounds = game.maxRounds;
    const roundsToWin = Math.ceil(maxRounds / 2);

    // Check if either player has won enough rounds
    if (game.player1.score >= roundsToWin || game.player2.score >= roundsToWin) {
      return true;
    }

    // Check if we've played all rounds (for best_of_1 or ties)
    if (game.currentRound >= maxRounds) {
      return true;
    }

    return false;
  }

  getGameWinner(game) {
    if (game.player1.score > game.player2.score) {
      return 'player1';
    } else if (game.player2.score > game.player1.score) {
      return 'player2';
    }
    return 'tie';
  }

  deleteGame(gameId) {
    this.games.delete(gameId);
  }

  // Get stats for a completed game
  getGameStats(gameId) {
    const game = this.games.get(gameId);
    if (!game) return null;

    return {
      totalRounds: game.history.length,
      player1Score: game.player1.score,
      player2Score: game.player2.score,
      winner: this.getGameWinner(game),
      duration: Date.now() - game.startTime,
      history: game.history
    };
  }
}

module.exports = GameEngine;
