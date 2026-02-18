// Shared constants between client and server
// This file can be used in both Node.js and browser environments

const MOVES = {
  ROCK: 'rock',
  PAPER: 'paper',
  SCISSORS: 'scissors'
};

const GAME_MODES = {
  QUICK_MATCH: 'quickmatch',
  AI: 'ai',
  TOURNAMENT: 'tournament'
};

const GAME_STATES = {
  WAITING: 'waiting',
  COUNTDOWN: 'countdown',
  PLAYING: 'playing',
  REVEAL: 'reveal',
  RESULT: 'result',
  FINISHED: 'finished'
};

const TOURNAMENT_STATES = {
  WAITING_ROOM: 'waiting_room',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished'
};

const MESSAGE_TYPES = {
  // Client -> Server
  JOIN_GAME: 'join_game',
  MAKE_MOVE: 'make_move',
  CREATE_TOURNAMENT: 'create_tournament',
  JOIN_TOURNAMENT: 'join_tournament',
  UPDATE_TOURNAMENT_SETTINGS: 'update_tournament_settings',
  START_TOURNAMENT: 'start_tournament',
  SPECTATE: 'spectate',
  CHAT_MESSAGE: 'chat_message',
  REACTION: 'reaction',
  REQUEST_REPLAY: 'request_replay',
  
  // Server -> Client
  GAME_STATE: 'game_state',
  WAITING_ROOM_UPDATE: 'waiting_room_update',
  TOURNAMENT_STARTED: 'tournament_started',
  COUNTDOWN: 'countdown',
  REVEAL: 'reveal',
  MATCH_COMPLETE: 'match_complete',
  TOURNAMENT_UPDATE: 'tournament_update',
  SPECTATOR_FEED: 'spectator_feed',
  REPLAY_DATA: 'replay_data',
  ERROR: 'error'
};

const DEFAULT_TOURNAMENT_SETTINGS = {
  eliminationType: 'single',        // 'single' or 'double'
  winCondition: 'best_of_3',       // 'best_of_1', 'best_of_3', 'best_of_5'
  maxPlayers: 8,                   // 4, 8, or 16
  aiFill: true,                    // Auto-fill with AI
  moveTimer: 15,                   // seconds (10, 15, 30, or null for unlimited)
  countdownSpeed: 3,               // seconds total (1.5, 3, or 5)
  breakBetweenMatches: 5,          // seconds (0, 5, or 10)
  chatEnabled: true,
  reactionsEnabled: true,
  replayAutoSave: true,
  grandFinalsReset: false,         // Double elim bracket reset
  seeding: 'random'                // 'random' or 'manual'
};

const TIMING = {
  COUNTDOWN_STEP: 1000,            // 1 second per countdown step
  REVEAL_DURATION: 2000,           // 2 seconds for win animation
  RESULT_DISPLAY: 1000,            // 1 second to show result
  MOVE_TIMEOUT: 15000              // 15 seconds default move timer
};

const WIN_CONDITIONS = {
  [MOVES.ROCK]: MOVES.SCISSORS,
  [MOVES.PAPER]: MOVES.ROCK,
  [MOVES.SCISSORS]: MOVES.PAPER
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MOVES,
    GAME_MODES,
    GAME_STATES,
    TOURNAMENT_STATES,
    MESSAGE_TYPES,
    DEFAULT_TOURNAMENT_SETTINGS,
    TIMING,
    WIN_CONDITIONS
  };
}

// Export for browser
if (typeof window !== 'undefined') {
  window.RPS_CONSTANTS = {
    MOVES,
    GAME_MODES,
    GAME_STATES,
    TOURNAMENT_STATES,
    MESSAGE_TYPES,
    DEFAULT_TOURNAMENT_SETTINGS,
    TIMING,
    WIN_CONDITIONS
  };
}
