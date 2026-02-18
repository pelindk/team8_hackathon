class GameClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl || this.getServerUrl();
    this.socket = null;
    this.connected = false;
    this.gameState = null;
    this.callbacks = {};
  }

  // Get server URL from query params or default to localhost
  getServerUrl() {
    const params = new URLSearchParams(window.location.search);
    const server = params.get('server');
    if (server) {
      return `http://${server}`;
    }
    return window.location.origin;
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log('Connecting to:', this.serverUrl);
      
      // Set a timeout for connection
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout - server not responding'));
      }, 10000); // 10 second timeout

      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 3,
        timeout: 5000
      });

      this.socket.on('connect', () => {
        clearTimeout(timeout);
        console.log('Connected to server');
        this.connected = true;
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.connected = false;
        this.trigger('disconnect');
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.error('Connection error:', error);
        reject(error);
      });

      // Register message handlers
      this.registerMessageHandlers();
    });
  }

  registerMessageHandlers() {
    const { MESSAGE_TYPES } = window.RPS_CONSTANTS;

    this.socket.on(MESSAGE_TYPES.GAME_STATE, (data) => {
      this.gameState = data;
      this.trigger('game_state', data);
    });

    this.socket.on(MESSAGE_TYPES.WAITING_ROOM_UPDATE, (data) => {
      this.trigger('waiting_room_update', data);
    });

    this.socket.on(MESSAGE_TYPES.TOURNAMENT_STARTED, (data) => {
      this.trigger('tournament_started', data);
    });

    this.socket.on(MESSAGE_TYPES.COUNTDOWN, (data) => {
      this.trigger('countdown', data);
    });

    this.socket.on(MESSAGE_TYPES.REVEAL, (data) => {
      this.trigger('reveal', data);
    });

    this.socket.on(MESSAGE_TYPES.MATCH_COMPLETE, (data) => {
      this.trigger('match_complete', data);
    });

    this.socket.on(MESSAGE_TYPES.TOURNAMENT_UPDATE, (data) => {
      this.trigger('tournament_update', data);
    });

    this.socket.on(MESSAGE_TYPES.SPECTATOR_FEED, (data) => {
      this.trigger('spectator_feed', data);
    });

    this.socket.on(MESSAGE_TYPES.REPLAY_DATA, (data) => {
      this.trigger('replay_data', data);
    });

    this.socket.on(MESSAGE_TYPES.CHAT_MESSAGE, (data) => {
      this.trigger('chat_message', data);
    });

    this.socket.on(MESSAGE_TYPES.ERROR, (data) => {
      this.trigger('error', data);
      console.error('Server error:', data.message);
    });
  }

  // Join a game
  joinGame(mode, playerName) {
    const { MESSAGE_TYPES } = window.RPS_CONSTANTS;
    this.socket.emit(MESSAGE_TYPES.JOIN_GAME, { mode, playerName });
  }

  // Make a move
  makeMove(move) {
    const { MESSAGE_TYPES } = window.RPS_CONSTANTS;
    this.socket.emit(MESSAGE_TYPES.MAKE_MOVE, { move });
  }

  // Create tournament
  createTournament(playerName) {
    const { MESSAGE_TYPES } = window.RPS_CONSTANTS;
    this.socket.emit(MESSAGE_TYPES.CREATE_TOURNAMENT, { playerName });
  }

  // Join tournament
  joinTournament(tournamentId, playerName) {
    const { MESSAGE_TYPES } = window.RPS_CONSTANTS;
    this.socket.emit(MESSAGE_TYPES.JOIN_TOURNAMENT, { tournamentId, playerName });
  }

  // Update tournament settings
  updateTournamentSettings(settings) {
    const { MESSAGE_TYPES } = window.RPS_CONSTANTS;
    this.socket.emit(MESSAGE_TYPES.UPDATE_TOURNAMENT_SETTINGS, { settings });
  }

  // Start tournament
  startTournament() {
    const { MESSAGE_TYPES } = window.RPS_CONSTANTS;
    this.socket.emit(MESSAGE_TYPES.START_TOURNAMENT);
  }

  // Send chat message
  sendChatMessage(message) {
    const { MESSAGE_TYPES } = window.RPS_CONSTANTS;
    this.socket.emit(MESSAGE_TYPES.CHAT_MESSAGE, { message });
  }

  // Send reaction
  sendReaction(emoji) {
    const { MESSAGE_TYPES } = window.RPS_CONSTANTS;
    this.socket.emit(MESSAGE_TYPES.REACTION, { emoji });
  }

  // Spectate tournament
  spectate(tournamentId) {
    const { MESSAGE_TYPES } = window.RPS_CONSTANTS;
    this.socket.emit(MESSAGE_TYPES.SPECTATE, { tournamentId });
  }

  // Request replay
  requestReplay(replayId) {
    const { MESSAGE_TYPES } = window.RPS_CONSTANTS;
    this.socket.emit(MESSAGE_TYPES.REQUEST_REPLAY, { replayId });
  }

  // Event system
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event, callback) {
    if (!this.callbacks[event]) return;
    this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
  }

  trigger(event, data) {
    if (!this.callbacks[event]) return;
    this.callbacks[event].forEach(callback => callback(data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
