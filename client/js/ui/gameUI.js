class GameUI {
  constructor(gameClient, renderer, soundEngine) {
    this.gameClient = gameClient;
    this.renderer = renderer;
    this.soundEngine = soundEngine;
    this.currentScreen = 'menu';
    this.playerMove = null;
    this.currentTheme = 'modern';
    this.playerScore = 0;
    this.opponentScore = 0;
    this.tieCount = 0;
    this.currentRound = 1;
    this.playerName = this.loadPlayerName();
  }

  loadPlayerName() {
    return localStorage.getItem('rps_player_name') || null;
  }

  savePlayerName(name) {
    localStorage.setItem('rps_player_name', name);
    this.playerName = name;
    this.updateUserProfile();
  }

  updateUserProfile() {
    const existingProfile = document.getElementById('user-profile');
    if (existingProfile) {
      existingProfile.remove();
    }

    if (this.playerName) {
      const profileHTML = `
        <div class="user-profile" id="user-profile">
          <span class="user-profile-name">👤 ${this.playerName}</span>
          <button class="user-profile-btn" id="change-name-btn">Change</button>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', profileHTML);

      document.getElementById('change-name-btn')?.addEventListener('click', () => {
        this.soundEngine.playClick();
        this.showChangeNamePrompt();
      });
    }
  }

  init() {
    this.setupEventListeners();
    this.updateUserProfile();
    this.showMainMenu();
  }

  setupEventListeners() {
    // Game state updates
    this.gameClient.on('game_state', (data) => {
      this.handleGameState(data);
    });

    this.gameClient.on('countdown', (data) => {
      this.handleCountdown(data);
    });

    this.gameClient.on('reveal', (data) => {
      this.handleReveal(data);
    });

    this.gameClient.on('match_complete', (data) => {
      this.handleMatchComplete(data);
    });

    this.gameClient.on('error', (data) => {
      this.showError(data.message);
    });

    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Sound toggle
    document.getElementById('sound-toggle')?.addEventListener('click', () => {
      const enabled = this.soundEngine.toggle();
      this.updateSoundButton(enabled);
    });
  }

  showMainMenu() {
    this.currentScreen = 'menu';
    const menuHTML = `
      <div class="main-menu">
        <h1 class="game-title">Rock Paper Scissors</h1>
        <div class="menu-buttons">
          <button class="menu-btn" id="play-ai">vs AI</button>
          <button class="menu-btn" id="play-multiplayer">Quick Match</button>
          <button class="menu-btn" id="create-tournament">Create Tournament</button>
          <button class="menu-btn" id="join-tournament">Join Tournament</button>
        </div>
        <div class="menu-footer">
          <button class="icon-btn" id="theme-toggle" title="Toggle Theme">🎨</button>
          <button class="icon-btn" id="sound-toggle" title="Toggle Sound">🔊</button>
        </div>
      </div>
    `;

    document.getElementById('ui-container').innerHTML = menuHTML;

    // Add event listeners
    document.getElementById('play-ai').addEventListener('click', () => {
      this.soundEngine.playClick();
      this.startGame('ai');
    });

    document.getElementById('play-multiplayer').addEventListener('click', () => {
      this.soundEngine.playClick();
      this.startGame('quickmatch');
    });

    document.getElementById('create-tournament').addEventListener('click', () => {
      this.soundEngine.playClick();
      this.showPlayerNamePrompt('create-tournament');
    });

    document.getElementById('join-tournament').addEventListener('click', () => {
      this.soundEngine.playClick();
      this.showTournamentIdPrompt();
    });

    // Re-attach theme and sound toggles
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    document.getElementById('sound-toggle')?.addEventListener('click', () => {
      const enabled = this.soundEngine.toggle();
      this.updateSoundButton(enabled);
    });
  }

  showPlayerNamePrompt(action) {
    const savedName = this.playerName || '';
    
    const promptHTML = `
      <div class="prompt-overlay">
        <div class="prompt-box">
          <h2>Enter Your Name</h2>
          <input type="text" id="player-name" placeholder="Player Name" maxlength="20" value="${savedName}" />
          <div class="prompt-buttons">
            <button class="btn" id="confirm-name">Continue</button>
            <button class="btn btn-secondary" id="cancel-prompt">Cancel</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('ui-container').insertAdjacentHTML('beforeend', promptHTML);

    const input = document.getElementById('player-name');
    input.focus();
    input.select();

    const confirm = () => {
      const name = input.value.trim() || 'Player';
      this.savePlayerName(name);
      this.soundEngine.playSelect();
      document.querySelector('.prompt-overlay').remove();
      
      if (action === 'create-tournament') {
        this.gameClient.createTournament(name);
      } else if (action.startsWith('join-tournament:')) {
        const tournamentId = action.split(':')[1];
        this.gameClient.joinTournament(tournamentId, name);
      } else {
        this.gameClient.joinGame(action, name);
      }
    };

    document.getElementById('confirm-name').addEventListener('click', confirm);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') confirm();
    });

    document.getElementById('cancel-prompt').addEventListener('click', () => {
      this.soundEngine.playClick();
      document.querySelector('.prompt-overlay').remove();
    });
  }

  showChangeNamePrompt() {
    const promptHTML = `
      <div class="prompt-overlay">
        <div class="prompt-box">
          <h2>Change Your Name</h2>
          <input type="text" id="new-player-name" placeholder="New Name" maxlength="20" value="${this.playerName || ''}" />
          <div class="prompt-buttons">
            <button class="btn" id="confirm-new-name">Save</button>
            <button class="btn btn-secondary" id="cancel-new-name">Cancel</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', promptHTML);

    const input = document.getElementById('new-player-name');
    input.focus();
    input.select();

    const confirm = () => {
      const name = input.value.trim();
      if (name) {
        this.savePlayerName(name);
        this.soundEngine.playSelect();
        document.querySelector('.prompt-overlay').remove();
      }
    };

    document.getElementById('confirm-new-name').addEventListener('click', confirm);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') confirm();
    });

    document.getElementById('cancel-new-name').addEventListener('click', () => {
      this.soundEngine.playClick();
      document.querySelector('.prompt-overlay').remove();
    });
  }

  showTournamentIdPrompt() {
    const promptHTML = `
      <div class="prompt-overlay">
        <div class="prompt-box">
          <h2>Join Tournament</h2>
          <input type="text" id="tournament-id" placeholder="Tournament ID" />
          <div class="prompt-buttons">
            <button class="btn" id="confirm-join">Join</button>
            <button class="btn btn-secondary" id="cancel-prompt">Cancel</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('ui-container').insertAdjacentHTML('beforeend', promptHTML);

    const input = document.getElementById('tournament-id');
    input.focus();

    const confirm = () => {
      const tournamentId = input.value.trim();
      if (!tournamentId) return;
      
      document.querySelector('.prompt-overlay').remove();
      this.showPlayerNamePrompt(`join-tournament:${tournamentId}`);
    };

    document.getElementById('confirm-join').addEventListener('click', confirm);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') confirm();
    });

    document.getElementById('cancel-prompt').addEventListener('click', () => {
      this.soundEngine.playClick();
      document.querySelector('.prompt-overlay').remove();
    });
  }

  startGame(mode) {
    this.showPlayerNamePrompt(mode);
  }

  handleGameState(data) {
    if (data.state === 'waiting') {
      this.showWaitingScreen(data.message);
    } else if (data.state === 'playing') {
      this.showGameScreen(data);
    }
  }

  showWaitingScreen(message) {
    const waitingHTML = `
      <div class="waiting-screen">
        <div class="spinner"></div>
        <p>${message}</p>
        <button class="btn btn-secondary" id="cancel-matchmaking">Cancel</button>
      </div>
    `;

    document.getElementById('ui-container').innerHTML = waitingHTML;

    document.getElementById('cancel-matchmaking').addEventListener('click', () => {
      this.soundEngine.playClick();
      this.showMainMenu();
    });
  }

  showGameScreen(gameData) {
    this.currentScreen = 'game';
    this.playerScore = 0;
    this.opponentScore = 0;
    this.tieCount = 0;
    this.currentRound = 1;
    
    const opponentName = gameData.opponent || 'Opponent';
    const yourName = gameData.yourName || 'You';
    
    const gameHTML = `
      <div class="game-screen">
        <div class="game-header">
          <div class="player-info">
            <h3>${yourName}</h3>
            <div class="score" id="player-score">0</div>
          </div>
          <div class="round-info">
            <div id="round-display">Round 1</div>
            <div id="tie-display" style="font-size: 0.9em; opacity: 0.8; margin-top: 5px;">Ties: 0</div>
          </div>
          <div class="player-info">
            <h3>${opponentName}</h3>
            <div class="score" id="opponent-score">0</div>
          </div>
        </div>
        
        <div id="game-canvas-container"></div>
        
        <div class="move-selector">
          <button class="move-btn" data-move="rock">
            <span class="move-icon">🪨</span>
            <span class="move-label">Rock</span>
          </button>
          <button class="move-btn" data-move="paper">
            <span class="move-icon">📄</span>
            <span class="move-label">Paper</span>
          </button>
          <button class="move-btn" data-move="scissors">
            <span class="move-icon">✂️</span>
            <span class="move-label">Scissors</span>
          </button>
        </div>
        
        <div id="game-message"></div>
      </div>
    `;

    document.getElementById('ui-container').innerHTML = gameHTML;

    // Setup move buttons
    document.querySelectorAll('.move-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const move = btn.dataset.move;
        this.selectMove(move);
      });

      btn.addEventListener('mouseenter', () => {
        this.soundEngine.playHover();
      });
    });

    // Initialize game canvas
    this.initGameCanvas();
  }

  initGameCanvas() {
    const container = document.getElementById('game-canvas-container');
    if (container && !container.querySelector('canvas')) {
      container.appendChild(this.renderer.app.view);
    }
  }

  selectMove(move) {
    if (this.playerMove) return; // Already selected

    this.playerMove = move;
    this.soundEngine.playMoveSelect(move);

    // Highlight selected button
    document.querySelectorAll('.move-btn').forEach(btn => {
      if (btn.dataset.move === move) {
        btn.classList.add('selected');
      } else {
        btn.disabled = true;
      }
    });

    // Send move to server
    this.gameClient.makeMove(move);

    // Show waiting message
    this.showGameMessage('Waiting for opponent...');
  }

  handleCountdown(data) {
    this.soundEngine.playCountdown(data.count);
    this.renderer.showCountdown(data.count);
  }

  handleReveal(data) {
    this.soundEngine.playReveal();
    this.playerMove = null;

    // Update scores
    if (data.winner === 'player1') {
      this.playerScore++;
    } else if (data.winner === 'player2') {
      this.opponentScore++;
    } else {
      // It's a tie
      this.tieCount++;
    }

    // Update score display
    document.getElementById('player-score').textContent = this.playerScore;
    document.getElementById('opponent-score').textContent = this.opponentScore;
    document.getElementById('tie-display').textContent = `Ties: ${this.tieCount}`;
    
    // Update round display
    this.currentRound++;
    document.getElementById('round-display').textContent = `Round ${this.currentRound}`;

    // Show moves on canvas
    this.showMoves(data.player1Move, data.player2Move);

    // Determine result and play sound
    setTimeout(() => {
      if (data.winner === 'player1') {
        this.soundEngine.playWin();
        this.showGameMessage(`You Win! (${this.playerScore}-${this.opponentScore})`);
        this.playWinAnimation(data.player1Move, data.player2Move);
      } else if (data.winner === 'player2') {
        this.soundEngine.playLose();
        this.showGameMessage(`You Lose! (${this.playerScore}-${this.opponentScore})`);
        this.playWinAnimation(data.player2Move, data.player1Move);
      } else {
        this.soundEngine.playTie();
        this.showGameMessage(`It's a Tie! (${this.playerScore}-${this.opponentScore}) - ${this.tieCount} ties total`);
      }

      // Reset buttons after delay
      setTimeout(() => {
        this.resetMoveButtons();
        this.showGameMessage('Choose your move!');
      }, 3000);
    }, 1000);
  }

  showMoves(player1Move, player2Move) {
    this.renderer.clear();
    
    const sprite1 = this.renderer.createMoveSprite(player1Move, this.currentTheme);
    sprite1.x = this.renderer.app.screen.width / 3;
    sprite1.y = this.renderer.app.screen.height / 2;
    this.renderer.app.stage.addChild(sprite1);

    const sprite2 = this.renderer.createMoveSprite(player2Move, this.currentTheme);
    sprite2.x = (this.renderer.app.screen.width / 3) * 2;
    sprite2.y = this.renderer.app.screen.height / 2;
    this.renderer.app.stage.addChild(sprite2);
  }

  playWinAnimation(winnerMove, loserMove) {
    const { WIN_CONDITIONS } = window.RPS_CONSTANTS;
    
    if (WIN_CONDITIONS[winnerMove] === loserMove) {
      if (winnerMove === 'scissors') {
        this.soundEngine.playCut();
      } else if (winnerMove === 'rock') {
        this.soundEngine.playCrush();
      } else if (winnerMove === 'paper') {
        this.soundEngine.playWrap();
      }
    }
  }

  handleMatchComplete(data) {
    const message = data.winner === 'player1' ? 
      '🎉 You won the match!' : 
      data.winner === 'player2' ?
      '😔 You lost the match' :
      '🤝 Match tied!';

    this.showGameMessage(message);

    setTimeout(() => {
      this.showMainMenu();
    }, 3000);
  }

  resetMoveButtons() {
    document.querySelectorAll('.move-btn').forEach(btn => {
      btn.classList.remove('selected');
      btn.disabled = false;
    });
  }

  showGameMessage(message) {
    const msgElement = document.getElementById('game-message');
    if (msgElement) {
      msgElement.textContent = message;
      msgElement.style.opacity = '1';
    }
  }

  showError(message) {
    this.soundEngine.playError();
    alert(message); // Simple error display for now
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'modern' ? 'playful' : 'modern';
    this.soundEngine.playSelect();
    
    // Update theme class on body
    document.body.className = `theme-${this.currentTheme}`;
    
    // Update renderer if in game
    if (this.currentScreen === 'game') {
      this.renderer.loadTheme(this.currentTheme);
    }
  }

  updateSoundButton(enabled) {
    const btn = document.getElementById('sound-toggle');
    if (btn) {
      btn.textContent = enabled ? '🔊' : '🔇';
    }
  }
}
