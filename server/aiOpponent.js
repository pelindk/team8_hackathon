const { MOVES } = require('../shared/constants');

class AIOpponent {
  constructor() {
    this.playerHistories = new Map(); // playerId -> move history
    this.maxHistorySize = 50;
  }

  // Record a player's move for pattern learning
  recordMove(playerId, move) {
    if (!this.playerHistories.has(playerId)) {
      this.playerHistories.set(playerId, []);
    }

    const history = this.playerHistories.get(playerId);
    history.push(move);

    // Keep history size manageable
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  // Predict the player's next move and return the counter
  getMove(playerId) {
    const history = this.playerHistories.get(playerId);

    // Not enough data yet, play randomly
    if (!history || history.length < 3) {
      return this.getRandomMove();
    }

    // Try pattern detection with confidence threshold
    const prediction = this.predictNextMove(history);
    
    if (prediction.confidence < 0.4) {
      // Not confident enough, play randomly
      return this.getRandomMove();
    }

    // Play the counter to the predicted move
    return this.getCounter(prediction.move);
  }

  predictNextMove(history) {
    const predictions = {
      [MOVES.ROCK]: 0,
      [MOVES.PAPER]: 0,
      [MOVES.SCISSORS]: 0
    };

    // Frequency analysis (baseline)
    const frequency = this.analyzeFrequency(history);
    Object.keys(frequency).forEach(move => {
      predictions[move] += frequency[move] * 0.3; // 30% weight
    });

    // Bigram analysis (what comes after last move)
    if (history.length >= 2) {
      const bigram = this.analyzeBigram(history);
      Object.keys(bigram).forEach(move => {
        predictions[move] += bigram[move] * 0.4; // 40% weight
      });
    }

    // Trigram analysis (what comes after last 2 moves)
    if (history.length >= 3) {
      const trigram = this.analyzeTrigram(history);
      Object.keys(trigram).forEach(move => {
        predictions[move] += trigram[move] * 0.3; // 30% weight
      });
    }

    // Find the move with highest prediction score
    let maxScore = 0;
    let predictedMove = MOVES.ROCK;
    Object.keys(predictions).forEach(move => {
      if (predictions[move] > maxScore) {
        maxScore = predictions[move];
        predictedMove = move;
      }
    });

    return {
      move: predictedMove,
      confidence: maxScore
    };
  }

  // Analyze frequency of each move
  analyzeFrequency(history) {
    const counts = {
      [MOVES.ROCK]: 0,
      [MOVES.PAPER]: 0,
      [MOVES.SCISSORS]: 0
    };

    history.forEach(move => {
      counts[move]++;
    });

    // Normalize to probabilities
    const total = history.length;
    const probabilities = {};
    Object.keys(counts).forEach(move => {
      probabilities[move] = counts[move] / total;
    });

    return probabilities;
  }

  // Analyze what move typically follows the last move
  analyzeBigram(history) {
    const lastMove = history[history.length - 1];
    const transitions = {
      [MOVES.ROCK]: 0,
      [MOVES.PAPER]: 0,
      [MOVES.SCISSORS]: 0
    };

    let totalTransitions = 0;

    // Look at all instances where lastMove appeared and what followed
    for (let i = 0; i < history.length - 1; i++) {
      if (history[i] === lastMove) {
        transitions[history[i + 1]]++;
        totalTransitions++;
      }
    }

    // Normalize to probabilities
    if (totalTransitions === 0) {
      return { [MOVES.ROCK]: 0.33, [MOVES.PAPER]: 0.33, [MOVES.SCISSORS]: 0.34 };
    }

    const probabilities = {};
    Object.keys(transitions).forEach(move => {
      probabilities[move] = transitions[move] / totalTransitions;
    });

    return probabilities;
  }

  // Analyze what move typically follows the last 2 moves
  analyzeTrigram(history) {
    const lastTwo = history.slice(-2).join(',');
    const transitions = {
      [MOVES.ROCK]: 0,
      [MOVES.PAPER]: 0,
      [MOVES.SCISSORS]: 0
    };

    let totalTransitions = 0;

    // Look at all instances where this sequence appeared and what followed
    for (let i = 0; i < history.length - 2; i++) {
      const sequence = history.slice(i, i + 2).join(',');
      if (sequence === lastTwo) {
        transitions[history[i + 2]]++;
        totalTransitions++;
      }
    }

    // Normalize to probabilities
    if (totalTransitions === 0) {
      return { [MOVES.ROCK]: 0.33, [MOVES.PAPER]: 0.33, [MOVES.SCISSORS]: 0.34 };
    }

    const probabilities = {};
    Object.keys(transitions).forEach(move => {
      probabilities[move] = transitions[move] / totalTransitions;
    });

    return probabilities;
  }

  // Get the counter move to beat a predicted move
  getCounter(move) {
    switch (move) {
      case MOVES.ROCK: return MOVES.PAPER;
      case MOVES.PAPER: return MOVES.SCISSORS;
      case MOVES.SCISSORS: return MOVES.ROCK;
      default: return this.getRandomMove();
    }
  }

  // Get a random move
  getRandomMove() {
    const moves = Object.values(MOVES);
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Clear history for a player
  clearHistory(playerId) {
    this.playerHistories.delete(playerId);
  }

  // Get AI's "thinking" for display purposes
  getThinking(playerId) {
    const history = this.playerHistories.get(playerId);
    
    if (!history || history.length < 3) {
      return {
        status: 'learning',
        message: 'Observing patterns...',
        confidence: 0
      };
    }

    const prediction = this.predictNextMove(history);
    const counter = this.getCounter(prediction.move);

    return {
      status: 'analyzing',
      message: `Predicting ${prediction.move}, playing ${counter}`,
      confidence: Math.round(prediction.confidence * 100),
      predictedMove: prediction.move,
      counterMove: counter
    };
  }
}

module.exports = AIOpponent;
