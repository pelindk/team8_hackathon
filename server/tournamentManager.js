const { v4: uuidv4 } = require('uuid');
const { DEFAULT_TOURNAMENT_SETTINGS, TOURNAMENT_STATES } = require('../shared/constants');

class TournamentManager {
  constructor() {
    this.tournaments = new Map(); // tournamentId -> tournament
  }

  createTournament(hostId, hostName) {
    const tournamentId = uuidv4();
    const tournament = {
      id: tournamentId,
      hostId,
      state: TOURNAMENT_STATES.WAITING_ROOM,
      settings: { ...DEFAULT_TOURNAMENT_SETTINGS },
      players: [{ id: hostId, name: hostName, isAI: false }],
      bracket: null,
      currentMatches: [],
      completedMatches: [],
      spectators: [],
      chatHistory: [],
      createdAt: Date.now()
    };

    this.tournaments.set(tournamentId, tournament);
    return tournament;
  }

  getTournament(tournamentId) {
    return this.tournaments.get(tournamentId);
  }

  joinTournament(tournamentId, playerId, playerName) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      return { error: 'Tournament not found' };
    }

    if (tournament.state !== TOURNAMENT_STATES.WAITING_ROOM) {
      return { error: 'Tournament already started' };
    }

    if (tournament.players.length >= tournament.settings.maxPlayers) {
      return { error: 'Tournament is full' };
    }

    // Check if player already joined
    if (tournament.players.find(p => p.id === playerId)) {
      return { error: 'Already in tournament' };
    }

    tournament.players.push({ id: playerId, name: playerName, isAI: false });
    return { success: true, tournament };
  }

  updateSettings(tournamentId, hostId, settings) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      return { error: 'Tournament not found' };
    }

    if (tournament.hostId !== hostId) {
      return { error: 'Only host can update settings' };
    }

    if (tournament.state !== TOURNAMENT_STATES.WAITING_ROOM) {
      return { error: 'Cannot update settings after tournament starts' };
    }

    // Validate and update settings
    tournament.settings = { ...tournament.settings, ...settings };
    return { success: true, tournament };
  }

  startTournament(tournamentId, hostId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      return { error: 'Tournament not found' };
    }

    if (tournament.hostId !== hostId) {
      return { error: 'Only host can start tournament' };
    }

    if (tournament.state !== TOURNAMENT_STATES.WAITING_ROOM) {
      return { error: 'Tournament already started' };
    }

    // Fill with AI if needed
    if (tournament.settings.aiFill) {
      this.fillWithAI(tournament);
    }

    // Generate bracket
    const bracket = this.generateBracket(tournament);
    tournament.bracket = bracket;
    tournament.state = TOURNAMENT_STATES.IN_PROGRESS;

    return { success: true, tournament, bracket };
  }

  fillWithAI(tournament) {
    const targetSize = this.getNextPowerOfTwo(tournament.players.length);
    const maxSize = Math.min(targetSize, tournament.settings.maxPlayers);

    while (tournament.players.length < maxSize) {
      const aiId = `ai_${uuidv4()}`;
      const aiName = `AI Bot ${tournament.players.filter(p => p.isAI).length + 1}`;
      tournament.players.push({ id: aiId, name: aiName, isAI: true });
    }
  }

  getNextPowerOfTwo(n) {
    if (n <= 4) return 4;
    if (n <= 8) return 8;
    return 16;
  }

  generateBracket(tournament) {
    const players = [...tournament.players];
    
    // Shuffle if random seeding
    if (tournament.settings.seeding === 'random') {
      this.shuffleArray(players);
    }

    const bracket = {
      type: tournament.settings.eliminationType,
      rounds: [],
      winnersBracket: [],
      losersBracket: tournament.settings.eliminationType === 'double' ? [] : null
    };

    // Generate first round matches
    const firstRound = [];
    for (let i = 0; i < players.length; i += 2) {
      const matchId = uuidv4();
      firstRound.push({
        id: matchId,
        round: 1,
        bracket: 'winners',
        player1: players[i],
        player2: players[i + 1],
        winner: null,
        gameId: null,
        status: 'pending'
      });
    }

    bracket.winnersBracket.push(firstRound);
    
    // Generate subsequent rounds (empty for now)
    const numRounds = Math.log2(players.length);
    for (let i = 1; i < numRounds; i++) {
      bracket.winnersBracket.push([]);
    }

    // For double elimination, generate losers bracket structure
    if (tournament.settings.eliminationType === 'double') {
      const losersRounds = (numRounds - 1) * 2;
      for (let i = 0; i < losersRounds; i++) {
        bracket.losersBracket.push([]);
      }
    }

    return bracket;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Get next matches that should be played
  getNextMatches(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament || !tournament.bracket) {
      return [];
    }

    const matches = [];

    // Check winners bracket
    for (const round of tournament.bracket.winnersBracket) {
      for (const match of round) {
        if (match.status === 'pending' && match.player1 && match.player2) {
          matches.push(match);
        }
      }
    }

    // Check losers bracket if double elimination
    if (tournament.bracket.losersBracket) {
      for (const round of tournament.bracket.losersBracket) {
        for (const match of round) {
          if (match.status === 'pending' && match.player1 && match.player2) {
            matches.push(match);
          }
        }
      }
    }

    return matches;
  }

  // Record match result and advance bracket
  recordMatchResult(tournamentId, matchId, winnerId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament || !tournament.bracket) {
      return { error: 'Tournament or bracket not found' };
    }

    // Find the match
    let match = null;
    let roundIndex = -1;
    let matchIndex = -1;
    let bracketType = null;

    // Search winners bracket
    for (let r = 0; r < tournament.bracket.winnersBracket.length; r++) {
      const idx = tournament.bracket.winnersBracket[r].findIndex(m => m.id === matchId);
      if (idx !== -1) {
        match = tournament.bracket.winnersBracket[r][idx];
        roundIndex = r;
        matchIndex = idx;
        bracketType = 'winners';
        break;
      }
    }

    // Search losers bracket if not found
    if (!match && tournament.bracket.losersBracket) {
      for (let r = 0; r < tournament.bracket.losersBracket.length; r++) {
        const idx = tournament.bracket.losersBracket[r].findIndex(m => m.id === matchId);
        if (idx !== -1) {
          match = tournament.bracket.losersBracket[r][idx];
          roundIndex = r;
          matchIndex = idx;
          bracketType = 'losers';
          break;
        }
      }
    }

    if (!match) {
      return { error: 'Match not found' };
    }

    // Update match
    match.winner = winnerId;
    match.status = 'completed';
    tournament.completedMatches.push(match);

    // Advance winner
    const winner = match.player1.id === winnerId ? match.player1 : match.player2;
    const loser = match.player1.id === winnerId ? match.player2 : match.player1;

    if (bracketType === 'winners') {
      // Advance winner to next round in winners bracket
      const nextRound = roundIndex + 1;
      if (nextRound < tournament.bracket.winnersBracket.length) {
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const nextMatch = tournament.bracket.winnersBracket[nextRound][nextMatchIndex];
        
        if (!nextMatch) {
          // Create next match
          const newMatch = {
            id: uuidv4(),
            round: nextRound + 1,
            bracket: 'winners',
            player1: matchIndex % 2 === 0 ? winner : null,
            player2: matchIndex % 2 === 1 ? winner : null,
            winner: null,
            gameId: null,
            status: 'pending'
          };
          tournament.bracket.winnersBracket[nextRound][nextMatchIndex] = newMatch;
        } else {
          if (matchIndex % 2 === 0) {
            nextMatch.player1 = winner;
          } else {
            nextMatch.player2 = winner;
          }
        }
      }

      // In double elimination, send loser to losers bracket
      if (tournament.settings.eliminationType === 'double' && tournament.bracket.losersBracket) {
        this.sendToLosersBracket(tournament, loser, roundIndex);
      }
    } else if (bracketType === 'losers') {
      // Advance winner in losers bracket
      const nextRound = roundIndex + 1;
      if (nextRound < tournament.bracket.losersBracket.length) {
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const nextMatch = tournament.bracket.losersBracket[nextRound][nextMatchIndex];
        
        if (!nextMatch) {
          const newMatch = {
            id: uuidv4(),
            round: nextRound + 1,
            bracket: 'losers',
            player1: matchIndex % 2 === 0 ? winner : null,
            player2: matchIndex % 2 === 1 ? winner : null,
            winner: null,
            gameId: null,
            status: 'pending'
          };
          tournament.bracket.losersBracket[nextRound][nextMatchIndex] = newMatch;
        } else {
          if (matchIndex % 2 === 0) {
            nextMatch.player1 = winner;
          } else {
            nextMatch.player2 = winner;
          }
        }
      }
      // Loser is eliminated
    }

    // Check if tournament is complete
    this.checkTournamentComplete(tournament);

    return { success: true, tournament };
  }

  sendToLosersBracket(tournament, player, winnersRound) {
    // Calculate which losers bracket round to send to
    const losersRound = winnersRound * 2;
    
    if (losersRound >= tournament.bracket.losersBracket.length) {
      return; // Player is eliminated
    }

    // Find or create a match in the losers bracket
    const round = tournament.bracket.losersBracket[losersRound];
    let placed = false;

    for (const match of round) {
      if (!match.player1) {
        match.player1 = player;
        placed = true;
        break;
      } else if (!match.player2) {
        match.player2 = player;
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Create new match
      round.push({
        id: uuidv4(),
        round: losersRound + 1,
        bracket: 'losers',
        player1: player,
        player2: null,
        winner: null,
        gameId: null,
        status: 'pending'
      });
    }
  }

  checkTournamentComplete(tournament) {
    const nextMatches = this.getNextMatches(tournament.id);
    
    if (nextMatches.length === 0) {
      // No more matches, tournament is complete
      tournament.state = TOURNAMENT_STATES.FINISHED;
      
      // Determine champion
      const lastWinnersMatch = tournament.bracket.winnersBracket[tournament.bracket.winnersBracket.length - 1][0];
      if (lastWinnersMatch && lastWinnersMatch.winner) {
        tournament.champion = lastWinnersMatch.winner;
      }
    }
  }

  addSpectator(tournamentId, spectatorId, spectatorName) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      return { error: 'Tournament not found' };
    }

    if (!tournament.spectators.find(s => s.id === spectatorId)) {
      tournament.spectators.push({ id: spectatorId, name: spectatorName });
    }

    return { success: true };
  }

  removeSpectator(tournamentId, spectatorId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    tournament.spectators = tournament.spectators.filter(s => s.id !== spectatorId);
  }

  addChatMessage(tournamentId, userId, userName, message) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      return { error: 'Tournament not found' };
    }

    if (!tournament.settings.chatEnabled) {
      return { error: 'Chat is disabled' };
    }

    const chatMessage = {
      id: uuidv4(),
      userId,
      userName,
      message,
      timestamp: Date.now()
    };

    tournament.chatHistory.push(chatMessage);
    return { success: true, message: chatMessage };
  }

  deleteTournament(tournamentId) {
    this.tournaments.delete(tournamentId);
  }
}

module.exports = TournamentManager;
