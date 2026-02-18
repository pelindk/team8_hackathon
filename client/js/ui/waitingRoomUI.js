class WaitingRoomUI {
  constructor(gameClient, soundEngine) {
    this.gameClient = gameClient;
    this.soundEngine = soundEngine;
    this.isHost = false;
    this.tournamentId = null;
    this.players = [];
    this.settings = null;
  }

  show(data) {
    this.isHost = data.isHost;
    this.tournamentId = data.tournamentId;
    this.players = data.players;
    this.settings = data.settings;

    const waitingRoomHTML = `
      <div class="waiting-room">
        <div class="waiting-room-header">
          <h2>Tournament Waiting Room</h2>
          <div class="tournament-id">
            <span>Tournament ID:</span>
            <code id="tournament-id-display">${this.tournamentId}</code>
            <button class="btn-icon" id="copy-tournament-id" title="Copy ID">📋</button>
          </div>
        </div>

        <div class="waiting-room-content">
          <div class="players-section">
            <h3>Players (${this.players.length}/${this.settings.maxPlayers})</h3>
            <div class="players-list" id="players-list">
              ${this.renderPlayersList()}
            </div>
          </div>

          ${this.isHost ? this.renderHostControls() : ''}
        </div>

        <div class="waiting-room-footer">
          ${this.isHost ? `
            <button class="btn" id="customize-btn">⚙️ Customize</button>
            <button class="btn btn-primary" id="start-tournament-btn">🚀 START</button>
          ` : `
            <div class="waiting-message">Waiting for host to start...</div>
          `}
          <button class="btn btn-secondary" id="leave-waiting-room">Leave</button>
        </div>
      </div>
    `;

    document.getElementById('ui-container').innerHTML = waitingRoomHTML;

    this.attachEventListeners();
  }

  renderPlayersList() {
    return this.players.map((player, index) => `
      <div class="player-card ${player.isAI ? 'ai-player' : ''}">
        <div class="player-avatar">${player.isAI ? '🤖' : '👤'}</div>
        <div class="player-name">${player.name}</div>
        <div class="player-status">✓</div>
      </div>
    `).join('');
  }

  renderHostControls() {
    return `
      <div class="settings-preview">
        <h3>Tournament Settings</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <span class="setting-label">Format:</span>
            <span class="setting-value">${this.settings.eliminationType === 'single' ? 'Single Elimination' : 'Double Elimination'}</span>
          </div>
          <div class="setting-item">
            <span class="setting-label">Win Condition:</span>
            <span class="setting-value">${this.formatWinCondition(this.settings.winCondition)}</span>
          </div>
          <div class="setting-item">
            <span class="setting-label">Max Players:</span>
            <span class="setting-value">${this.settings.maxPlayers}</span>
          </div>
          <div class="setting-item">
            <span class="setting-label">Move Timer:</span>
            <span class="setting-value">${this.settings.moveTimer ? this.settings.moveTimer + 's' : 'Unlimited'}</span>
          </div>
        </div>
      </div>
    `;
  }

  formatWinCondition(condition) {
    const map = {
      'best_of_1': 'Best of 1',
      'best_of_3': 'Best of 3',
      'best_of_5': 'Best of 5'
    };
    return map[condition] || condition;
  }

  attachEventListeners() {
    // Copy tournament ID
    document.getElementById('copy-tournament-id')?.addEventListener('click', () => {
      const id = this.tournamentId;
      
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id).then(() => {
          this.soundEngine.playSelect();
          this.showToast('Tournament ID copied!');
        }).catch(err => {
          console.error('Clipboard error:', err);
          this.fallbackCopyToClipboard(id);
        });
      } else {
        // Fallback for older browsers
        this.fallbackCopyToClipboard(id);
      }
    });

    // Customize button
    document.getElementById('customize-btn')?.addEventListener('click', () => {
      this.soundEngine.playClick();
      this.showCustomizePanel();
    });

    // Start tournament button
    document.getElementById('start-tournament-btn')?.addEventListener('click', () => {
      // Validate minimum players
      if (!this.settings.aiFill && this.players.length < 2) {
        this.soundEngine.playError();
        this.showToast('Need at least 2 players to start! Enable AI Fill or wait for more players.');
        return;
      }
      
      this.soundEngine.playSelect();
      this.gameClient.startTournament();
    });

    // Leave button
    document.getElementById('leave-waiting-room')?.addEventListener('click', () => {
      this.soundEngine.playClick();
      window.location.reload();
    });
  }

  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.soundEngine.playSelect();
        this.showToast('Tournament ID copied!');
      } else {
        this.showToast('Failed to copy. ID: ' + text);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      this.showToast('Copy failed. ID: ' + text);
    }
    
    document.body.removeChild(textArea);
  }


  showCustomizePanel() {
    const customizeUI = new CustomizeUI(this.gameClient, this.soundEngine, this.settings);
    customizeUI.show((newSettings) => {
      this.settings = newSettings;
      this.show({
        isHost: this.isHost,
        tournamentId: this.tournamentId,
        players: this.players,
        settings: this.settings
      });
    });
  }

  update(data) {
    this.players = data.players;
    this.settings = data.settings;
    this.isHost = data.isHost; // Update host status
    
    // Update players list
    const playersList = document.getElementById('players-list');
    if (playersList) {
      playersList.innerHTML = this.renderPlayersList();
    }

    // Update settings preview if host
    if (this.isHost) {
      const settingsPreview = document.querySelector('.settings-preview');
      if (settingsPreview) {
        settingsPreview.outerHTML = this.renderHostControls();
      }
    }

    // Update footer buttons based on host status
    const footer = document.querySelector('.waiting-room-footer');
    if (footer) {
      footer.innerHTML = `
        ${this.isHost ? `
          <button class="btn" id="customize-btn">⚙️ Customize</button>
          <button class="btn btn-primary" id="start-tournament-btn">🚀 START</button>
        ` : `
          <div class="waiting-message">Waiting for host to start...</div>
        `}
        <button class="btn btn-secondary" id="leave-waiting-room">Leave</button>
      `;
      
      // Re-attach event listeners for the new buttons
      this.attachEventListeners();
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
}
