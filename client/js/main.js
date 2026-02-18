// Main application entry point
class RPSGame {
  constructor() {
    this.gameClient = null;
    this.renderer = null;
    this.soundEngine = null;
    this.gameUI = null;
    this.waitingRoomUI = null;
    this.tournamentUI = null;
  }

  async init() {
    console.log('🎮 Initializing RPS Game...');

    // Check if required libraries are loaded
    if (typeof io === 'undefined') {
      console.error('❌ Socket.io not loaded');
      this.showConnectionError();
      return;
    }

    if (typeof PIXI === 'undefined') {
      console.error('❌ PixiJS not loaded');
      this.showConnectionError();
      return;
    }

    // Initialize sound engine
    this.soundEngine = new SoundEngine();
    this.soundEngine.init();

    // Initialize renderer (will be used later)
    try {
      this.renderer = new Renderer('game-canvas', 800, 600);
    } catch (error) {
      console.error('❌ Failed to initialize renderer:', error);
      // Continue anyway, renderer will be initialized when needed
    }

    // Initialize game client
    this.gameClient = new GameClient();
    
    try {
      await this.gameClient.connect();
      console.log('✅ Connected to server');
    } catch (error) {
      console.error('❌ Failed to connect to server:', error);
      this.showConnectionError();
      return;
    }

    // Initialize UI components
    this.gameUI = new GameUI(this.gameClient, this.renderer, this.soundEngine);
    this.waitingRoomUI = new WaitingRoomUI(this.gameClient, this.soundEngine);
    this.tournamentUI = new TournamentUI(this.gameClient, this.soundEngine);

    // Setup game client event handlers
    this.setupEventHandlers();

    // Initialize game UI
    this.gameUI.init();

    console.log('✅ Game initialized');
  }

  setupEventHandlers() {
    // Waiting room updates
    this.gameClient.on('waiting_room_update', (data) => {
      this.waitingRoomUI.show(data);
    });

    // Tournament started
    this.gameClient.on('tournament_started', (data) => {
      this.soundEngine.playTournamentStart();
      this.tournamentUI.show(data);
    });

    // Tournament updates
    this.gameClient.on('tournament_update', (data) => {
      this.tournamentUI.update(data);
    });

    // Disconnect handler
    this.gameClient.on('disconnect', () => {
      this.showDisconnectError();
    });
  }

  showConnectionError() {
    document.getElementById('ui-container').innerHTML = `
      <div class="error-screen">
        <h2>❌ Connection Failed</h2>
        <p>Could not connect to the game server.</p>
        <p>Make sure the server is running and try again.</p>
        <button class="btn" onclick="location.reload()">Retry</button>
      </div>
    `;
  }

  showDisconnectError() {
    document.getElementById('ui-container').innerHTML = `
      <div class="error-screen">
        <h2>⚠️ Disconnected</h2>
        <p>Lost connection to the game server.</p>
        <button class="btn" onclick="location.reload()">Reconnect</button>
      </div>
    `;
  }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new RPSGame();
  game.init();
});
