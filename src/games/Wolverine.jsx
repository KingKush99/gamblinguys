import React, { useState, useEffect, useRef } from 'react';
import './Wolverine.css';

const Wolverine = ({ onClose }) => {
  const [gameState, setGameState] = useState('waiting');
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gamePhase, setGamePhase] = useState('questioning'); // 'questioning', 'voting', 'guessing'
  const [questionTarget, setQuestionTarget] = useState(null);
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [votes, setVotes] = useState({});
  const [eliminated, setEliminated] = useState([]);
  const [leader, setLeader] = useState(null);
  const [winner, setWinner] = useState(null);
  const [showRoles, setShowRoles] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // AI player names
  const playerNames = [
    'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage',
    'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Harper', 'Indigo', 'Jude',
    'Kai', 'Lane', 'Marley', 'Nova', 'Ocean', 'Phoenix', 'River', 'Skyler',
    'Taylor', 'Unity', 'Vale', 'Winter', 'Zion', 'Ash', 'Bay', 'Cedar'
  ];

  // Character portraits for Guess Who style layout
  const characterPortraits = [
    { name: 'Alex', avatar: '👨‍💼', hair: 'dark', facial: 'mustache', accessories: 'none' },
    { name: 'Alfred', avatar: '👨‍🦳', hair: 'red', facial: 'beard', accessories: 'none' },
    { name: 'Anita', avatar: '👩‍🦱', hair: 'blonde', facial: 'none', accessories: 'pigtails' },
    { name: 'Anne', avatar: '👩‍💼', hair: 'dark', facial: 'none', accessories: 'earrings' },
    { name: 'Bernard', avatar: '👨‍🎓', hair: 'dark', facial: 'none', accessories: 'hat' },
    { name: 'Bill', avatar: '👨‍🦲', hair: 'bald', facial: 'none', accessories: 'glasses' },
    { name: 'Charles', avatar: '👨‍💻', hair: 'blonde', facial: 'mustache', accessories: 'glasses' },
    { name: 'Claire', avatar: '👩‍🎨', hair: 'blonde', facial: 'none', accessories: 'hat' },
    { name: 'David', avatar: '👨‍🔬', hair: 'blonde', facial: 'beard', accessories: 'none' },
    { name: 'Eric', avatar: '👮‍♂️', hair: 'blonde', facial: 'none', accessories: 'hat' },
    { name: 'Frans', avatar: '👨‍🦰', hair: 'red', facial: 'none', accessories: 'none' },
    { name: 'George', avatar: '🤵', hair: 'gray', facial: 'none', accessories: 'hat' },
    { name: 'Herman', avatar: '👨‍🦲', hair: 'bald', facial: 'none', accessories: 'none' },
    { name: 'Joe', avatar: '👨‍🏫', hair: 'blonde', facial: 'none', accessories: 'glasses' },
    { name: 'Maria', avatar: '👩‍🎤', hair: 'brown', facial: 'none', accessories: 'beret' },
    { name: 'Max', avatar: '👨‍🍳', hair: 'dark', facial: 'mustache', accessories: 'none' },
    { name: 'Paul', avatar: '👴', hair: 'white', facial: 'none', accessories: 'glasses' },
    { name: 'Peter', avatar: '👨‍🦳', hair: 'white', facial: 'none', accessories: 'none' },
    { name: 'Philip', avatar: '👨‍🎭', hair: 'dark', facial: 'beard', accessories: 'none' },
    { name: 'Richard', avatar: '🧔', hair: 'brown', facial: 'beard', accessories: 'none' },
    { name: 'Robert', avatar: '👨‍💼', hair: 'brown', facial: 'none', accessories: 'none' },
    { name: 'Sam', avatar: '👨‍🔬', hair: 'bald', facial: 'none', accessories: 'glasses' },
    { name: 'Susan', avatar: '👵', hair: 'white', facial: 'none', accessories: 'none' },
    { name: 'Tom', avatar: '👨‍🦲', hair: 'bald', facial: 'none', accessories: 'glasses' }
  ];

  // Role definitions
  const roles = {
    // Good Roles (7)
    healer: { name: 'Healer', team: 'good', description: 'May revive one eliminated player per game' },
    goodSamaritan: { name: 'Good Samaritan', team: 'good', description: 'Must tell the truth when asked directly about a Good player' },
    wolverine: { name: 'Wolverine', team: 'good', description: 'Can protect one player per round. If that player is eliminated or guessed, Wolverine dies' },
    detective: { name: 'Detective', team: 'good', description: 'Once per game, may ask a "double question"' },
    bodyguard: { name: 'Bodyguard', team: 'good', description: 'Protects one Good or Neutral player. If that player dies or is guessed, Bodyguard dies' },
    jailor: { name: 'Jailor', team: 'good', description: 'Can jail one player per round and ask a private yes/no question' },
    mute: { name: 'Mute', team: 'good', description: 'Knows all roles but cannot speak. May vote and nod/shake when addressed directly' },
    
    // Bad Roles (4)
    arsonist: { name: 'Arsonist', team: 'bad', description: 'Once per round, can burn all conversation logs, wiping all dialogue for that round' },
    serialKiller: { name: 'Serial Killer', team: 'bad', description: 'Wins alone if only 3 players remain and all others are Good' },
    conspirator: { name: 'Conspirator', team: 'bad', description: 'Knows all Bad roles. Always lies when asked about any Good player' },
    infiltrator: { name: 'Infiltrator', team: 'bad', description: 'Appears Good to roles like Detective and Mute. Immune to detection' },
    
    // Neutral Roles (4)
    politician: { name: 'Politician', team: 'neutral', description: 'Wins if elected Leader three times in a single game' },
    gambler: { name: 'Gambler', team: 'neutral', description: 'Wins if their prediction of final game state is exactly correct' },
    hermit: { name: 'Hermit', team: 'neutral', description: 'May only speak when addressed directly. Immune to one vote. Wins if they survive to the final 4' },
    joker: { name: 'Joker', team: 'neutral', description: 'Wins if they are voted out (not guessed or killed by ability). Loses any other way' }
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Start waiting timer
    const waitTimer = setInterval(() => {
      setWaitTime(prev => {
        if (prev <= 1) {
          clearInterval(waitTimer);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate players joining (6-12 players)
    const targetPlayers = 6 + Math.floor(Math.random() * 7); // 6-12 players
    const joinTimer = setInterval(() => {
      setPlayerCount(prev => {
        if (prev >= targetPlayers) {
          clearInterval(joinTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => {
      clearInterval(waitTimer);
      clearInterval(joinTimer);
    };
  };

  const startGame = () => {
    setGameState('playing');
    
    // Create players with roles and character portraits
    const totalPlayers = playerCount;
    const shuffledPortraits = [...characterPortraits].sort(() => Math.random() - 0.5);
    
    const humanPlayer = {
      id: 'player_1',
      name: 'You',
      character: shuffledPortraits[0],
      isAI: false,
      role: null,
      isEliminated: false,
      votes: 0,
      leaderCount: 0
    };

    const aiPlayers = [];
    for (let i = 1; i < totalPlayers; i++) {
      aiPlayers.push({
        id: `ai_${i}`,
        name: playerNames[Math.floor(Math.random() * playerNames.length)],
        character: shuffledPortraits[i],
        isAI: true,
        role: null,
        isEliminated: false,
        votes: 0,
        leaderCount: 0
      });
    }

    const allPlayers = [humanPlayer, ...aiPlayers];
    
    // Assign roles
    assignRoles(allPlayers);
    setPlayers(allPlayers);
    
    // Start first round
    startRound();
  };

  const assignRoles = (playerList) => {
    const totalPlayers = playerList.length;
    const roleKeys = Object.keys(roles);
    
    // Calculate role distribution based on player count
    const goodCount = Math.ceil(totalPlayers * 0.5);
    const badCount = Math.floor(totalPlayers * 0.25);
    const neutralCount = totalPlayers - goodCount - badCount;
    
    const selectedRoles = [];
    
    // Add good roles
    const goodRoles = roleKeys.filter(key => roles[key].team === 'good');
    for (let i = 0; i < goodCount; i++) {
      selectedRoles.push(goodRoles[i % goodRoles.length]);
    }
    
    // Add bad roles
    const badRoles = roleKeys.filter(key => roles[key].team === 'bad');
    for (let i = 0; i < badCount; i++) {
      selectedRoles.push(badRoles[i % badRoles.length]);
    }
    
    // Add neutral roles
    const neutralRoles = roleKeys.filter(key => roles[key].team === 'neutral');
    for (let i = 0; i < neutralCount; i++) {
      selectedRoles.push(neutralRoles[i % neutralRoles.length]);
    }
    
    // Shuffle and assign
    for (let i = selectedRoles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedRoles[i], selectedRoles[j]] = [selectedRoles[j], selectedRoles[i]];
    }
    
    playerList.forEach((player, index) => {
      player.role = selectedRoles[index];
    });
  };

  const startRound = () => {
    setGamePhase('questioning');
    setCurrentPlayer(0);
    setVotes({});
    
    // Add round start message
    addChatMessage('system', `Round ${roundNumber} begins! Players take turns asking yes/no questions.`);
  };

  const addChatMessage = (sender, message, isPrivate = false) => {
    setChatLog(prev => [...prev, {
      id: Date.now(),
      sender,
      message,
      isPrivate,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleQuestion = (targetId, questionText) => {
    if (!questionText.trim()) return;
    
    const currentPlayerData = players[currentPlayer];
    const targetPlayer = players.find(p => p.id === targetId);
    
    addChatMessage(currentPlayerData.name, `@${targetPlayer.name}: ${questionText}`);
    
    // AI response (simplified)
    setTimeout(() => {
      const response = generateAIResponse(targetPlayer, questionText);
      addChatMessage(targetPlayer.name, response);
      
      // Move to next player
      nextPlayer();
    }, 1000);
  };

  const generateAIResponse = (player, question) => {
    // Simplified AI response logic
    const responses = ['Yes', 'No', 'I cannot answer that', 'Maybe', 'I think so'];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const nextPlayer = () => {
    const nextIndex = (currentPlayer + 1) % players.filter(p => !p.isEliminated).length;
    
    if (nextIndex === 0) {
      // All players have asked questions, move to voting
      setGamePhase('voting');
    } else {
      setCurrentPlayer(nextIndex);
    }
  };

  const handleVote = (targetId) => {
    setVotes(prev => ({
      ...prev,
      player_1: targetId
    }));
    
    // AI votes
    players.forEach(player => {
      if (player.isAI && !player.isEliminated) {
        const randomTarget = players[Math.floor(Math.random() * players.length)].id;
        setVotes(prev => ({
          ...prev,
          [player.id]: randomTarget
        }));
      }
    });
    
    // Process votes
    processVotes();
  };

  const processVotes = () => {
    const voteCount = {};
    Object.values(votes).forEach(targetId => {
      voteCount[targetId] = (voteCount[targetId] || 0) + 1;
    });
    
    // Find player with most votes
    let maxVotes = 0;
    let eliminatedPlayer = null;
    
    Object.entries(voteCount).forEach(([playerId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedPlayer = playerId;
      }
    });
    
    if (eliminatedPlayer) {
      const player = players.find(p => p.id === eliminatedPlayer);
      player.isEliminated = true;
      setEliminated(prev => [...prev, eliminatedPlayer]);
      addChatMessage('system', `${player.name} has been eliminated!`);
    }
    
    // Check win conditions
    checkWinConditions();
    
    // Next round
    setRoundNumber(prev => prev + 1);
    setTimeout(startRound, 2000);
  };

  const checkWinConditions = () => {
    const alivePlayers = players.filter(p => !p.isEliminated);
    const aliveGood = alivePlayers.filter(p => roles[p.role]?.team === 'good');
    const aliveBad = alivePlayers.filter(p => roles[p.role]?.team === 'bad');
    const aliveNeutral = alivePlayers.filter(p => roles[p.role]?.team === 'neutral');
    
    // Check bad team win
    if (aliveBad.length >= aliveGood.length + aliveNeutral.length) {
      setWinner('Bad Team');
      setGameState('gameOver');
      return;
    }
    
    // Check good team win
    if (aliveBad.length === 0) {
      setWinner('Good Team');
      setGameState('gameOver');
      return;
    }
    
    // Check neutral wins (simplified)
    aliveNeutral.forEach(player => {
      if (player.role === 'politician' && player.leaderCount >= 3) {
        setWinner(player.name);
        setGameState('gameOver');
      }
    });
  };

  const getCurrentPlayerData = () => {
    const alivePlayers = players.filter(p => !p.isEliminated);
    return alivePlayers[currentPlayer];
  };

  const getPlayerRole = () => {
    const humanPlayer = players.find(p => p.id === 'player_1');
    return humanPlayer ? roles[humanPlayer.role] : null;
  };

  return (
    <div className="wolverine-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🐺 Wolverine</h3>
          <div className="game-stats">
            <span>Round: {roundNumber}</span>
            <span>Players: {players.filter(p => !p.isEliminated).length}/{players.length}</span>
            <span>Phase: {gamePhase}</span>
          </div>
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        {gameState === 'waiting' && (
          <div className="waiting-screen">
            <h2>Waiting for Players...</h2>
            <p>Players joined: {playerCount}/12</p>
            {waitTime > 3 && <p>Game starts in: {waitTime} seconds</p>}
            {waitTime <= 3 && <p>Starting in: {waitTime}...</p>}
          </div>
        )}

        {gameState === 'playing' && (
          <div className="game-screen">
            <div className="role-info">
              <h4>Your Role: {getPlayerRole()?.name}</h4>
              <p>{getPlayerRole()?.description}</p>
              <button 
                onClick={() => setShowRoles(!showRoles)}
                className="toggle-roles-btn"
              >
                {showRoles ? 'Hide' : 'Show'} All Roles
              </button>
            </div>

            {showRoles && (
              <div className="roles-reference">
                <h4>Role Reference</h4>
                <div className="roles-grid">
                  {Object.entries(roles).map(([key, role]) => (
                    <div key={key} className={`role-card ${role.team}`}>
                      <strong>{role.name}</strong>
                      <p>{role.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="players-board">
              <h4>Players Board</h4>
              <div className="guess-who-grid">
                {players.map(player => (
                  <div 
                    key={player.id} 
                    className={`character-card ${player.isEliminated ? 'eliminated' : ''} ${getCurrentPlayerData()?.id === player.id ? 'current-turn' : ''} ${selectedPlayer === player.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPlayer(selectedPlayer === player.id ? null : player.id)}
                  >
                    <div className="character-portrait">
                      <div className="character-face">
                        {player.character?.avatar || '👤'}
                      </div>
                      {player.isEliminated && <div className="eliminated-overlay">❌</div>}
                      {getCurrentPlayerData()?.id === player.id && <div className="current-turn-indicator">⭐</div>}
                      {leader === player.id && <div className="leader-indicator">👑</div>}
                    </div>
                    <div className="character-name">{player.name}</div>
                    <div className="character-info">
                      {player.character && (
                        <div className="character-traits">
                          <span className="trait">Hair: {player.character.hair}</span>
                          <span className="trait">Facial: {player.character.facial}</span>
                          <span className="trait">Accessories: {player.character.accessories}</span>
                        </div>
                      )}
                    </div>
                    {/* Only show role for the current user */}
                    {getCurrentPlayerData()?.id === player.id && player.role && (
                      <div className="player-role-display">
                        <span className="role-badge">{player.role.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="chat-section">
              <h4>Game Chat</h4>
              <div className="chat-log">
                {chatLog.map(msg => (
                  <div key={msg.id} className={`chat-message ${msg.sender === 'system' ? 'system' : ''}`}>
                    <span className="timestamp">{msg.timestamp}</span>
                    <span className="sender">{msg.sender}:</span>
                    <span className="message">{msg.message}</span>
                  </div>
                ))}
              </div>
            </div>

            {gamePhase === 'questioning' && getCurrentPlayerData()?.id === 'player_1' && (
              <div className="question-section">
                <h4>Your Turn - Ask a Yes/No Question</h4>
                <select 
                  value={questionTarget || ''}
                  onChange={(e) => setQuestionTarget(e.target.value)}
                  className="target-select"
                >
                  <option value="">Select a player...</option>
                  {players
                    .filter(p => !p.isEliminated && p.id !== 'player_1')
                    .map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                </select>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your yes/no question..."
                  className="question-input"
                />
                <button 
                  onClick={() => handleQuestion(questionTarget, question)}
                  disabled={!questionTarget || !question.trim()}
                  className="ask-btn"
                >
                  Ask Question
                </button>
              </div>
            )}

            {gamePhase === 'voting' && (
              <div className="voting-section">
                <h4>Voting Phase - Choose someone to eliminate</h4>
                <div className="vote-options">
                  {players
                    .filter(p => !p.isEliminated)
                    .map(player => (
                      <button
                        key={player.id}
                        onClick={() => handleVote(player.id)}
                        className="vote-btn"
                        disabled={votes.player_1}
                      >
                        Vote {player.name}
                      </button>
                    ))}
                </div>
                {votes.player_1 && <p>You voted for {players.find(p => p.id === votes.player_1)?.name}</p>}
              </div>
            )}
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="game-over-screen">
            <h2>Game Over!</h2>
            <h3>🏆 {winner} Wins!</h3>
            
            <div className="final-roles">
              <h4>Player Roles Revealed</h4>
              {players.map(player => (
                <div key={player.id} className="final-role">
                  <span>{player.name}</span>
                  <span className={`role-badge ${roles[player.role]?.team}`}>
                    {roles[player.role]?.name}
                  </span>
                </div>
              ))}
            </div>

            <button onClick={() => window.location.reload()} className="restart-btn">
              Play Again
            </button>
            <button onClick={onClose} className="exit-btn">Exit</button>
          </div>
        )}
      </div>

      <div className="game-controls">
        <h4>🎮 How to Play</h4>
        <p>1. Each player has a hidden role with special abilities</p>
        <p>2. Take turns asking yes/no questions to deduce roles</p>
        <p>3. Vote to eliminate suspicious players</p>
        <p>4. Good team wins by eliminating all Bad players</p>
        <p>5. Bad team wins by outnumbering Good + Neutral</p>
      </div>
    </div>
  );
};

export default Wolverine;

