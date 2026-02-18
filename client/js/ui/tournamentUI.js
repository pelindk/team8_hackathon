class TournamentUI {
  constructor(gameClient, soundEngine) {
    this.gameClient = gameClient;
    this.soundEngine = soundEngine;
    this.bracket = null;
    this.settings = null;
  }

  show(data) {
    this.bracket = data.bracket;
    this.settings = data.settings;

    const tournamentHTML = `
      <div class="tournament-view">
        <div class="tournament-header">
          <h2>Tournament Bracket</h2>
          <div class="tournament-info">
            <span>${this.settings.eliminationType === 'single' ? 'Single' : 'Double'} Elimination</span>
            <span>•</span>
            <span>${this.formatWinCondition(this.settings.winCondition)}</span>
          </div>
        </div>

        <div class="bracket-container" id="bracket-container">
          ${this.renderBracket()}
        </div>

        <div class="tournament-footer">
          <button class="btn btn-secondary" id="leave-tournament">Leave</button>
        </div>
      </div>
    `;

    document.getElementById('ui-container').innerHTML = tournamentHTML;
    this.attachEventListeners();
  }

  renderBracket() {
    if (!this.bracket || !this.bracket.winnersBracket) {
      return '<div class="bracket-empty">Generating bracket...</div>';
    }

    let html = '<div class="bracket-wrapper">';
    
    // Render winners bracket
    html += '<div class="bracket-section winners-bracket">';
    html += '<h3>Winners Bracket</h3>';
    html += this.renderBracketRounds(this.bracket.winnersBracket);
    html += '</div>';

    // Render losers bracket if double elimination
    if (this.bracket.losersBracket && this.bracket.losersBracket.length > 0) {
      html += '<div class="bracket-section losers-bracket">';
      html += '<h3>Losers Bracket</h3>';
      html += this.renderBracketRounds(this.bracket.losersBracket);
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  renderBracketRounds(rounds) {
    let html = '<div class="bracket-rounds">';
    
    rounds.forEach((round, roundIndex) => {
      html += `<div class="bracket-round">`;
      html += `<div class="round-label">Round ${roundIndex + 1}</div>`;
      html += '<div class="round-matches">';
      
      round.forEach(match => {
        html += this.renderMatch(match);
      });
      
      html += '</div>';
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  renderMatch(match) {
    const player1Name = match.player1 ? match.player1.name : 'TBD';
    const player2Name = match.player2 ? match.player2.name : 'TBD';
    const isComplete = match.status === 'completed';
    const isInProgress = match.status === 'in_progress';

    return `
      <div class="bracket-match ${isInProgress ? 'in-progress' : ''} ${isComplete ? 'completed' : ''}">
        <div class="match-player ${match.winner === match.player1?.id ? 'winner' : ''}">
          <span class="player-name">${player1Name}</span>
          ${match.player1?.isAI ? '<span class="ai-badge">AI</span>' : ''}
        </div>
        <div class="match-vs">vs</div>
        <div class="match-player ${match.winner === match.player2?.id ? 'winner' : ''}">
          <span class="player-name">${player2Name}</span>
          ${match.player2?.isAI ? '<span class="ai-badge">AI</span>' : ''}
        </div>
        ${isInProgress ? '<div class="match-status">⚔️ Playing</div>' : ''}
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

  update(data) {
    this.bracket = data.bracket;
    
    const container = document.getElementById('bracket-container');
    if (container) {
      container.innerHTML = this.renderBracket();
    }
  }

  attachEventListeners() {
    document.getElementById('leave-tournament')?.addEventListener('click', () => {
      this.soundEngine.playClick();
      window.location.reload();
    });
  }
}
