class CustomizeUI {
  constructor(gameClient, soundEngine, currentSettings) {
    this.gameClient = gameClient;
    this.soundEngine = soundEngine;
    this.settings = { ...currentSettings };
    this.onSave = null;
  }

  show(onSave) {
    this.onSave = onSave;

    const customizeHTML = `
      <div class="modal-overlay">
        <div class="customize-panel">
          <div class="customize-header">
            <h2>Tournament Settings</h2>
            <button class="btn-close" id="close-customize">×</button>
          </div>

          <div class="customize-content">
            <div class="settings-section">
              <h3>Format Settings</h3>
              
              <div class="setting-group">
                <label>Elimination Type</label>
                <select id="elimination-type" class="setting-input">
                  <option value="single" ${this.settings.eliminationType === 'single' ? 'selected' : ''}>Single Elimination</option>
                  <option value="double" ${this.settings.eliminationType === 'double' ? 'selected' : ''}>Double Elimination</option>
                </select>
              </div>

              <div class="setting-group">
                <label>Win Condition</label>
                <select id="win-condition" class="setting-input">
                  <option value="best_of_1" ${this.settings.winCondition === 'best_of_1' ? 'selected' : ''}>Best of 1</option>
                  <option value="best_of_3" ${this.settings.winCondition === 'best_of_3' ? 'selected' : ''}>Best of 3</option>
                  <option value="best_of_5" ${this.settings.winCondition === 'best_of_5' ? 'selected' : ''}>Best of 5</option>
                </select>
              </div>

              <div class="setting-group">
                <label>Max Players</label>
                <select id="max-players" class="setting-input">
                  <option value="4" ${this.settings.maxPlayers === 4 ? 'selected' : ''}>4 Players</option>
                  <option value="8" ${this.settings.maxPlayers === 8 ? 'selected' : ''}>8 Players</option>
                  <option value="16" ${this.settings.maxPlayers === 16 ? 'selected' : ''}>16 Players</option>
                </select>
              </div>

              <div class="setting-group">
                <label>
                  <input type="checkbox" id="ai-fill" ${this.settings.aiFill ? 'checked' : ''} />
                  Auto-fill with AI
                </label>
              </div>
            </div>

            <div class="settings-section">
              <h3>Timing Settings</h3>
              
              <div class="setting-group">
                <label>Move Timer</label>
                <select id="move-timer" class="setting-input">
                  <option value="10" ${this.settings.moveTimer === 10 ? 'selected' : ''}>10 seconds</option>
                  <option value="15" ${this.settings.moveTimer === 15 ? 'selected' : ''}>15 seconds</option>
                  <option value="30" ${this.settings.moveTimer === 30 ? 'selected' : ''}>30 seconds</option>
                  <option value="null" ${this.settings.moveTimer === null ? 'selected' : ''}>Unlimited</option>
                </select>
              </div>

              <div class="setting-group">
                <label>Countdown Speed</label>
                <select id="countdown-speed" class="setting-input">
                  <option value="1.5" ${this.settings.countdownSpeed === 1.5 ? 'selected' : ''}>Fast (1.5s)</option>
                  <option value="3" ${this.settings.countdownSpeed === 3 ? 'selected' : ''}>Normal (3s)</option>
                  <option value="5" ${this.settings.countdownSpeed === 5 ? 'selected' : ''}>Slow (5s)</option>
                </select>
              </div>

              <div class="setting-group">
                <label>Break Between Matches</label>
                <select id="break-between" class="setting-input">
                  <option value="0" ${this.settings.breakBetweenMatches === 0 ? 'selected' : ''}>None</option>
                  <option value="5" ${this.settings.breakBetweenMatches === 5 ? 'selected' : ''}>5 seconds</option>
                  <option value="10" ${this.settings.breakBetweenMatches === 10 ? 'selected' : ''}>10 seconds</option>
                </select>
              </div>
            </div>

            <div class="settings-section">
              <h3>Spectator Settings</h3>
              
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="chat-enabled" ${this.settings.chatEnabled ? 'checked' : ''} />
                  Enable Chat
                </label>
              </div>

              <div class="setting-group">
                <label>
                  <input type="checkbox" id="reactions-enabled" ${this.settings.reactionsEnabled ? 'checked' : ''} />
                  Enable Reactions
                </label>
              </div>

              <div class="setting-group">
                <label>
                  <input type="checkbox" id="replay-autosave" ${this.settings.replayAutoSave ? 'checked' : ''} />
                  Auto-save Replays
                </label>
              </div>
            </div>

            <div class="settings-section">
              <h3>Advanced Options</h3>
              
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="grand-finals-reset" ${this.settings.grandFinalsReset ? 'checked' : ''} />
                  Grand Finals Reset (Double Elim)
                </label>
              </div>

              <div class="setting-group">
                <label>Seeding</label>
                <select id="seeding" class="setting-input">
                  <option value="random" ${this.settings.seeding === 'random' ? 'selected' : ''}>Random</option>
                  <option value="manual" ${this.settings.seeding === 'manual' ? 'selected' : ''}>Manual</option>
                </select>
              </div>
            </div>
          </div>

          <div class="customize-footer">
            <button class="btn btn-secondary" id="cancel-customize">Cancel</button>
            <button class="btn btn-primary" id="save-settings">Save Settings</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', customizeHTML);
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Close button
    document.getElementById('close-customize')?.addEventListener('click', () => {
      this.soundEngine.playClick();
      this.close();
    });

    // Cancel button
    document.getElementById('cancel-customize')?.addEventListener('click', () => {
      this.soundEngine.playClick();
      this.close();
    });

    // Save button
    document.getElementById('save-settings')?.addEventListener('click', () => {
      this.soundEngine.playSelect();
      this.saveSettings();
    });

    // Add sound effects to inputs
    document.querySelectorAll('.setting-input').forEach(input => {
      input.addEventListener('change', () => {
        this.soundEngine.playHover();
      });
    });
  }

  saveSettings() {
    // Collect all settings
    this.settings.eliminationType = document.getElementById('elimination-type').value;
    this.settings.winCondition = document.getElementById('win-condition').value;
    this.settings.maxPlayers = parseInt(document.getElementById('max-players').value);
    this.settings.aiFill = document.getElementById('ai-fill').checked;
    
    const moveTimer = document.getElementById('move-timer').value;
    this.settings.moveTimer = moveTimer === 'null' ? null : parseInt(moveTimer);
    
    this.settings.countdownSpeed = parseFloat(document.getElementById('countdown-speed').value);
    this.settings.breakBetweenMatches = parseInt(document.getElementById('break-between').value);
    this.settings.chatEnabled = document.getElementById('chat-enabled').checked;
    this.settings.reactionsEnabled = document.getElementById('reactions-enabled').checked;
    this.settings.replayAutoSave = document.getElementById('replay-autosave').checked;
    this.settings.grandFinalsReset = document.getElementById('grand-finals-reset').checked;
    this.settings.seeding = document.getElementById('seeding').value;

    // Send to server
    this.gameClient.updateTournamentSettings(this.settings);

    // Call callback
    if (this.onSave) {
      this.onSave(this.settings);
    }

    this.close();
  }

  close() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}
