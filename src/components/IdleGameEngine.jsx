import React, { useState, useEffect, useRef } from 'react';
import './IdleGameEngine.css';

const IdleGameEngine = ({ gameConfig, onClose }) => {
  const [gameState, setGameState] = useState('betting');
  const [playerBet, setPlayerBet] = useState(10);
  const [playerBalance, setPlayerBalance] = useState(1000); // This should ideally come from a global state/user profile
  const [gameProgress, setGameProgress] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [matchmakingTimer, setMatchmakingTimer] = useState(30);
  const [opponents, setOpponents] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [spectatorDelayTimer, setSpectatorDelayTimer] = useState(20 * 60); // 20 minutes in seconds
  const [isSpectatingGame, setIsSpectatingGame] = useState(false);

  const gameLoopRef = useRef(null);
  const matchmakingRef = useRef(null);
  const spectatorDelayRef = useRef(null);

  // Game configurations for different idle games
  const defaultConfig = {
    name: "Idle Game",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    icon: "🎮",
    baseMultiplier: 1.5,
    maxMultiplier: 10.0,
    progressSpeed: 0.02,
    levelProgressRequired: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200], // Progress needed for each level
    passiveGainRate: 0.1, // Points per second
    ...gameConfig
  };

  useEffect(() => {
    if (gameState === 'matchmaking') {
      startMatchmaking();
    } else if (gameState === 'spectator_delay') {
      startSpectatorDelay();
    }
    return () => {
      if (matchmakingRef.current) {
        clearInterval(matchmakingRef.current);
      }
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (spectatorDelayRef.current) {
        clearInterval(spectatorDelayRef.current);
      }
    };
  }, [gameState]);

  const startMatchmaking = () => {
    setMatchmakingTimer(30);
    matchmakingRef.current = setInterval(() => {
      setMatchmakingTimer(prev => {
        if (prev <= 1) {
          // No real players found, populate with AI
          populateWithAI();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const populateWithAI = () => {
    const aiPlayers = [];
    const numAI = Math.floor(Math.random() * 3) + 1; // 1-3 AI players
    
    for (let i = 0; i < numAI; i++) {
      aiPlayers.push({
        id: `ai_${i}`,
        name: `Player${Math.floor(Math.random() * 1000)}`,
        bet: playerBet + Math.floor(Math.random() * 20) - 10, // Similar bet range
        isAI: true,
        avatar: ['🤖', '👤', '🎭', '🎪', '🎯'][Math.floor(Math.random() * 5)]
      });
    }
    
    setOpponents(aiPlayers);
    setGameState('playing');
    startGameLoop();
  };

  const startGameLoop = () => {
    setGameProgress(0);
    setCurrentLevel(1);
    setMultiplier(1.0);
    
    gameLoopRef.current = setInterval(() => {
      setGameProgress(prev => {
        let newProgress = prev + defaultConfig.progressSpeed + defaultConfig.passiveGainRate / 100; // Passive gain
        
        // Check for level up
        if (currentLevel <= 12 && newProgress >= defaultConfig.levelProgressRequired[currentLevel - 1]) {
          setCurrentLevel(prevLevel => prevLevel + 1);
          // Optionally reset progress for next level or continue
        }

        // Update multiplier based on progress
        const newMultiplier = 1 + (newProgress * defaultConfig.baseMultiplier);
        setMultiplier(Math.min(newMultiplier, defaultConfig.maxMultiplier));
        
        // Check for game end conditions
        if (newProgress >= defaultConfig.levelProgressRequired[defaultConfig.levelProgressRequired.length - 1]) {
          endGame('completed');
          return defaultConfig.levelProgressRequired[defaultConfig.levelProgressRequired.length - 1];
        }
        
        // Random chance for early game end (crash/failure)
        if (Math.random() < 0.0005 * newProgress) { // Reduced chance
          endGame('crashed');
          return newProgress;
        }
        
        return newProgress;
      });
    }, 100);
  };

  const endGame = (result) => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    let winnings = 0;
    let houseCut = 0;
    if (result === 'completed') {
      winnings = Math.floor(playerBet * multiplier);
      houseCut = Math.floor(winnings * (gameConfig.houseCut || 0.05)); // Default 5% house cut
      winnings -= houseCut;
      setPlayerBalance(prev => prev + winnings);
    } else if (result === 'crashed') {
      winnings = -playerBet;
      setPlayerBalance(prev => prev - playerBet);
    } else if (result === 'cashed_out') {
      winnings = Math.floor(playerBet * multiplier);
      houseCut = Math.floor(winnings * (gameConfig.houseCut || 0.05));
      winnings -= houseCut;
      setPlayerBalance(prev => prev + winnings);
    }
    
    setGameResult({
      type: result,
      winnings: winnings,
      finalMultiplier: multiplier,
      houseCut: houseCut
    });
    
    setGameState('finished');
  };

  const cashOut = () => {
    if (gameState === 'playing') {
      endGame('cashed_out');
    }
  };

  const placeBet = () => {
    if (playerBalance >= playerBet) {
      setPlayerBalance(prev => prev - playerBet); // Deduct bet immediately
      setGameState('matchmaking');
    } else {
      alert('Insufficient balance!');
    }
  };

  const resetGame = () => {
    setGameState('betting');
    setGameProgress(0);
    setCurrentLevel(1);
    setMultiplier(1.0);
    setGameResult(null);
    setOpponents([]);
    setMatchmakingTimer(30);
    setIsSpectatingGame(false);
  };

  const startSpectatorDelay = () => {
    setSpectatorDelayTimer(20 * 60); // Reset to 20 minutes
    spectatorDelayRef.current = setInterval(() => {
      setSpectatorDelayTimer(prev => {
        if (prev <= 1) {
          clearInterval(spectatorDelayRef.current);
          setGameState('playing'); // Start spectating the game
          setIsSpectatingGame(true);
          startGameLoop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const enterSpectatorMode = () => {
    setGameState('spectator_delay');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="idle-game-engine" style={{ background: defaultConfig.background }}>
      <div className="game-header">
        <div className="game-info">
          <h3>{defaultConfig.icon} {defaultConfig.name}</h3>
          <div className="balance">💰 Balance: ${playerBalance}</div>
          {isSpectatingGame && (
            <div className="spectator-badge">👁️ SPECTATOR MODE</div>
          )}
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        {gameState === 'betting' && (
          <div className="betting-interface">
            <div className="bet-controls">
              <h4>Place Your Bet</h4>
              <div className="bet-input-group">
                <label>Bet Amount:</label>
                <div className="bet-input-container">
                  <button 
                    onClick={() => setPlayerBet(Math.max(1, playerBet - 10))}
                    disabled={playerBet <= 1}
                  >
                    -$10
                  </button>
                  <input 
                    type="number" 
                    value={playerBet} 
                    onChange={(e) => setPlayerBet(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={playerBalance}
                  />
                  <button 
                    onClick={() => setPlayerBet(Math.min(playerBalance, playerBet + 10))}
                    disabled={playerBet >= playerBalance}
                  >
                    +$10
                  </button>
                </div>
              </div>
              <div className="quick-bet-buttons">
                <button onClick={() => setPlayerBet(10)}>$10</button>
                <button onClick={() => setPlayerBet(50)}>$50</button>
                <button onClick={() => setPlayerBet(100)}>$100</button>
                <button onClick={() => setPlayerBet(Math.floor(playerBalance / 2))}>Half</button>
                <button onClick={() => setPlayerBet(playerBalance)}>Max</button>
              </div>
              <div className="action-buttons">
                <button className="place-bet-btn" onClick={placeBet}>
                  Place Bet (${playerBet})
                </button>
                <button className="spectator-btn" onClick={enterSpectatorMode}>
                  👁️ Watch Game (Spectator)
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'matchmaking' && (
          <div className="matchmaking-interface">
            <div className="matchmaking-content">
              <div className="loading-spinner"></div>
              <h4>Finding Players...</h4>
              <p>Looking for players with similar bets</p>
              <div className="timer">⏱️ {matchmakingTimer}s</div>
              <div className="bet-info">Your bet: ${playerBet}</div>
              {matchmakingTimer <= 10 && (
                <p className="ai-warning">⚠️ Will populate with AI players in {matchmakingTimer}s</p>
              )}
            </div>
          </div>
        )}

        {gameState === 'spectator_delay' && (
          <div className="spectator-delay-interface">
            <div className="spectator-delay-content">
              <h4>Spectator Mode Delay</h4>
              <p>To prevent cheating, there is a 20-minute delay before you can spectate.</p>
              <div className="timer">⏱️ Remaining: {formatTime(spectatorDelayTimer)}</div>
              <button className="exit-btn" onClick={resetGame}>Cancel Spectate</button>
            </div>
          </div>
        )}

        {(gameState === 'playing' || isSpectatingGame) && (
          <div className="game-play-interface">
            <div className="game-display">
              <div className="multiplier-display">
                <div className="multiplier-value">{multiplier.toFixed(2)}x</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(gameProgress / defaultConfig.levelProgressRequired[currentLevel - 1]) * 100}%` }}
                  ></div>
                </div>
                <div className="level-info">
                  Level {currentLevel} / 12
                </div>
              </div>
              
              <div className="game-visual">
                <div className="game-animation" style={{ 
                  transform: `translateX(${gameProgress * 0.5}px) scale(${1 + gameProgress * 0.01})`,
                  transition: 'transform 0.1s ease-out'
                }}>
                  {defaultConfig.icon}
                </div>
              </div>

              <div className="players-list">
                <div className="player-item you">
                  <span className="player-name">👤 You</span>
                  <span className="player-bet">${playerBet}</span>
                  <span className="player-status">
                    {isSpectatingGame ? 'Spectating' : 'Playing'}
                  </span>
                </div>
                {opponents.map(opponent => (
                  <div key={opponent.id} className="player-item">
                    <span className="player-name">{opponent.avatar} {opponent.name}</span>
                    <span className="player-bet">${opponent.bet}</span>
                    <span className="player-status">Playing</span>
                  </div>
                ))}
              </div>
            </div>

            {gameState === 'playing' && !isSpectatingGame && (
              <div className="game-controls">
                <button className="cash-out-btn" onClick={cashOut}>
                  💰 Cash Out (${Math.floor(playerBet * multiplier)})
                </button>
                <div className="auto-play-controls">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={isAutoPlaying}
                      onChange={(e) => setIsAutoPlaying(e.target.checked)}
                    />
                    Auto Cash Out at {defaultConfig.maxMultiplier}x
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {gameState === 'finished' && (
          <div className="game-result-interface">
            <div className="result-content">
              <h3>
                {gameResult.type === 'completed' && '🎉 Game Completed!'}
                {gameResult.type === 'crashed' && '💥 Game Crashed!'}
                {gameResult.type === 'cashed_out' && '💰 Cashed Out!'}
              </h3>
              <div className="result-details">
                <p>Final Multiplier: {gameResult.finalMultiplier.toFixed(2)}x</p>
                <p className={gameResult.winnings >= 0 ? 'profit' : 'loss'}>
                  {gameResult.winnings >= 0 ? '+' : ''}${gameResult.winnings}
                </p>
                {gameResult.houseCut > 0 && (
                  <p className="house-cut">House Cut: ${gameResult.houseCut}</p>
                )}
                <p>New Balance: ${playerBalance}</p>
              </div>
              <div className="result-actions">
                <button className="play-again-btn" onClick={resetGame}>
                  🎮 Play Again
                </button>
                <button className="exit-btn" onClick={onClose}>
                  🚪 Exit Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-footer">
        <div className="game-stats">
          <span>Players Online: {Math.floor(Math.random() * 500) + 100}</span>
          <span>Games Today: {Math.floor(Math.random() * 10000) + 5000}</span>
        </div>
      </div>
    </div>
  );
};

export default IdleGameEngine;


