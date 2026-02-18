class SpectatorUI {
  constructor(gameClient, soundEngine) {
    this.gameClient = gameClient;
    this.soundEngine = soundEngine;
    this.tournamentId = null;
    this.chatMessages = [];
  }

  show(tournamentId) {
    this.tournamentId = tournamentId;
    this.gameClient.spectate(tournamentId);

    const spectatorHTML = `
      <div class="spectator-view">
        <div class="spectator-header">
          <h2>👁️ Spectator Mode</h2>
          <button class="btn btn-secondary" id="leave-spectator">Leave</button>
        </div>

        <div class="spectator-content">
          <div class="bracket-view" id="spectator-bracket">
            <!-- Bracket will be populated here -->
          </div>

          <div class="spectator-sidebar">
            <div class="chat-section">
              <h3>Chat</h3>
              <div class="chat-messages" id="chat-messages">
                <!-- Chat messages -->
              </div>
              <div class="chat-input-container">
                <input type="text" id="chat-input" placeholder="Type a message..." />
                <button class="btn" id="send-chat">Send</button>
              </div>
            </div>

            <div class="reactions-section">
              <h3>Quick Reactions</h3>
              <div class="reaction-buttons">
                <button class="reaction-btn" data-emoji="👏">👏</button>
                <button class="reaction-btn" data-emoji="🔥">🔥</button>
                <button class="reaction-btn" data-emoji="😮">😮</button>
                <button class="reaction-btn" data-emoji="💪">💪</button>
                <button class="reaction-btn" data-emoji="🎉">🎉</button>
                <button class="reaction-btn" data-emoji="😱">😱</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('ui-container').innerHTML = spectatorHTML;
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Leave spectator mode
    document.getElementById('leave-spectator')?.addEventListener('click', () => {
      this.soundEngine.playClick();
      window.location.reload();
    });

    // Send chat message
    const sendChat = () => {
      const input = document.getElementById('chat-input');
      const message = input.value.trim();
      if (message) {
        this.gameClient.sendChatMessage(message);
        input.value = '';
        this.soundEngine.playClick();
      }
    };

    document.getElementById('send-chat')?.addEventListener('click', sendChat);
    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendChat();
    });

    // Reaction buttons
    document.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.dataset.emoji;
        this.gameClient.sendReaction(emoji);
        this.soundEngine.playSelect();
        this.showReactionAnimation(emoji);
      });
    });
  }

  updateBracket(bracket) {
    const container = document.getElementById('spectator-bracket');
    if (container) {
      // Reuse tournament UI rendering logic
      const tournamentUI = new TournamentUI(this.gameClient, this.soundEngine);
      tournamentUI.bracket = bracket;
      container.innerHTML = tournamentUI.renderBracket();
    }
  }

  addChatMessage(message) {
    this.chatMessages.push(message);
    const container = document.getElementById('chat-messages');
    if (container) {
      const messageEl = document.createElement('div');
      messageEl.className = 'chat-message';
      messageEl.innerHTML = `
        <span class="chat-user">${message.userName}:</span>
        <span class="chat-text">${message.message}</span>
      `;
      container.appendChild(messageEl);
      container.scrollTop = container.scrollHeight;
    }
    this.soundEngine.playChatNotification();
  }

  showReactionAnimation(emoji) {
    const animation = document.createElement('div');
    animation.className = 'reaction-animation';
    animation.textContent = emoji;
    animation.style.left = Math.random() * 80 + 10 + '%';
    document.body.appendChild(animation);

    setTimeout(() => animation.remove(), 2000);
  }
}
