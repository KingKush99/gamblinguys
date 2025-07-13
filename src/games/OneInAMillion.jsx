import React, { useState, useEffect, useRef, useCallback } from 'react';
import './OneInAMillion.css';

const OneInAMillion = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'roundEnd', 'gameOver'
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [currentScene, setCurrentScene] = useState(null);
  const [waldoPosition, setWaldoPosition] = useState({ x: 0, y: 0 });
  const [playerClicks, setPlayerClicks] = useState([]);
  const [roundResults, setRoundResults] = useState([]);
  const [eliminated, setEliminated] = useState([]);
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [clickTimer, setClickTimer] = useState(null);
  const [showWaldo, setShowWaldo] = useState(false);

  // Game constants
  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 700;
  const MAX_PLAYERS = 6;
  const MIN_PLAYERS = 2;
  const ROUND_TIME = 30; // seconds
  const WALDO_SIZE = 30;

  // Player names for AI
  const playerNames = [
    'EagleEye', 'SpotMaster', 'FinderKeeper', 'SharpSight', 'QuickSpot',
    'WaldoHunter', 'VisionAce', 'SearchPro', 'LookOut', 'ScanMaster',
    'ZoomIn', 'FocusFinder', 'DetailDetective', 'PatternPro', 'ClueSeeker'
  ];

  // Waldo scenes (simplified patterns for demo)
  const waldoScenes = [
    {
      id: 1,
      name: 'Busy Beach',
      background: '#87CEEB',
      objects: [
        { type: 'person', x: 100, y: 200, color: '#FF6B6B' },
        { type: 'person', x: 300, y: 150, color: '#4ECDC4' },
        { type: 'person', x: 500, y: 300, color: '#45B7D1' },
        { type: 'person', x: 700, y: 250, color: '#96CEB4' },
        { type: 'person', x: 200, y: 400, color: '#FFEAA7' },
        { type: 'person', x: 600, y: 450, color: '#DDA0DD' },
        { type: 'umbrella', x: 150, y: 180, color: '#FF1744' },
        { type: 'umbrella', x: 450, y: 280, color: '#00E676' },
        { type: 'umbrella', x: 750, y: 380, color: '#2196F3' },
        { type: 'ball', x: 250, y: 350, color: '#FF9800' },
        { type: 'ball', x: 550, y: 200, color: '#E91E63' },
        { type: 'towel', x: 350, y: 400, color: '#9C27B0' },
        { type: 'towel', x: 650, y: 150, color: '#795548' }
      ]
    },
    {
      id: 2,
      name: 'Crowded Market',
      background: '#F4A460',
      objects: [
        { type: 'person', x: 80, y: 180, color: '#8BC34A' },
        { type: 'person', x: 280, y: 220, color: '#FF5722' },
        { type: 'person', x: 480, y: 160, color: '#607D8B' },
        { type: 'person', x: 680, y: 280, color: '#E91E63' },
        { type: 'person', x: 180, y: 350, color: '#3F51B5' },
        { type: 'person', x: 580, y: 400, color: '#FF9800' },
        { type: 'stall', x: 120, y: 200, color: '#795548' },
        { type: 'stall', x: 320, y: 180, color: '#9E9E9E' },
        { type: 'stall', x: 520, y: 220, color: '#4CAF50' },
        { type: 'stall', x: 720, y: 160, color: '#F44336' },
        { type: 'cart', x: 200, y: 300, color: '#2196F3' },
        { type: 'cart', x: 600, y: 350, color: '#FF9800' },
        { type: 'sign', x: 400, y: 120, color: '#9C27B0' }
      ]
    },
    {
      id: 3,
      name: 'Festival Crowd',
      background: '#98FB98',
      objects: [
        { type: 'person', x: 90, y: 190, color: '#FF6347' },
        { type: 'person', x: 290, y: 240, color: '#40E0D0' },
        { type: 'person', x: 490, y: 170, color: '#DA70D6' },
        { type: 'person', x: 690, y: 290, color: '#FFD700' },
        { type: 'person', x: 190, y: 360, color: '#FF69B4' },
        { type: 'person', x: 590, y: 410, color: '#00CED1' },
        { type: 'tent', x: 140, y: 210, color: '#FF4500' },
        { type: 'tent', x: 340, y: 190, color: '#32CD32' },
        { type: 'tent', x: 540, y: 230, color: '#1E90FF' },
        { type: 'tent', x: 740, y: 170, color: '#FFD700' },
        { type: 'flag', x: 220, y: 140, color: '#DC143C' },
        { type: 'flag', x: 620, y: 120, color: '#00FF00' },
        { type: 'stage', x: 420, y: 300, color: '#8A2BE2' }
      ]
    }
  ];

  // Initialize game
  useEffect(() => {
    initializeGame();
    return () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
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

    // Simulate players joining
    const joinTimer = setInterval(() => {
      setPlayerCount(prev => {
        if (prev >= MAX_PLAYERS) {
          clearInterval(joinTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => {
      clearInterval(waitTimer);
      clearInterval(joinTimer);
    };
  };

  const startGame = () => {
    setGameState('playing');
    
    // Determine number of rounds based on player count
    const rounds = Math.min(5, Math.max(1, playerCount - 1));
    setTotalRounds(rounds);
    
    // Initialize players
    const initialPlayers = [
      {
        id: 'player1',
        name: 'You',
        color: '#ff6b6b',
        isAI: false,
        score: 0,
        eliminated: false
      }
    ];
    
    // Add AI players
    for (let i = 1; i < playerCount; i++) {
      initialPlayers.push({
        id: `player${i + 1}`,
        name: playerNames[i - 1],
        color: `hsl(${(i * 60) % 360}, 70%, 60%)`,
        isAI: true,
        score: 0,
        eliminated: false
      });
    }
    
    setPlayers(initialPlayers);
    setEliminated([]);
    setRoundResults([]);
    
    startRound();
  };

  const startRound = () => {
    setGameState('playing');
    setTimeLeft(ROUND_TIME);
    setPlayerClicks([]);
    setShowWaldo(false);
    
    // Select random scene
    const scene = waldoScenes[Math.floor(Math.random() * waldoScenes.length)];
    setCurrentScene(scene);
    
    // Place Waldo randomly
    const waldoX = Math.random() * (CANVAS_WIDTH - WALDO_SIZE * 2) + WALDO_SIZE;
    const waldoY = Math.random() * (CANVAS_HEIGHT - WALDO_SIZE * 2) + WALDO_SIZE;
    setWaldoPosition({ x: waldoX, y: waldoY });
    
    // Start round timer
    const startTime = Date.now();
    const roundTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.001) {
          clearInterval(roundTimer);
          endRound();
          return 0;
        }
        return prev - 0.001;
      });
    }, 1);

    // AI players make their clicks
    players.forEach(player => {
      if (player.isAI && !player.eliminated) {
        const delay = Math.random() * 25000 + 2000; // 2-27 seconds
        setTimeout(() => {
          if (gameState === 'playing') {
            handleAIClick(player, startTime);
          }
        }, delay);
      }
    });

    return () => {
      clearInterval(roundTimer);
    };
  };

  const handleAIClick = (player, startTime) => {
    const clickTime = Date.now();
    const timeElapsed = (clickTime - startTime) / 1000;
    
    // AI accuracy varies
    const accuracy = 0.3 + Math.random() * 0.4; // 30-70% accuracy
    const isNearWaldo = Math.random() < accuracy;
    
    let clickX, clickY;
    if (isNearWaldo) {
      // Click near Waldo
      const offsetX = (Math.random() - 0.5) * WALDO_SIZE * 2;
      const offsetY = (Math.random() - 0.5) * WALDO_SIZE * 2;
      clickX = waldoPosition.x + offsetX;
      clickY = waldoPosition.y + offsetY;
    } else {
      // Random click
      clickX = Math.random() * CANVAS_WIDTH;
      clickY = Math.random() * CANVAS_HEIGHT;
    }
    
    const distance = Math.sqrt(
      Math.pow(clickX - waldoPosition.x, 2) + 
      Math.pow(clickY - waldoPosition.y, 2)
    );
    
    const found = distance <= WALDO_SIZE;
    
    setPlayerClicks(prev => [...prev, {
      playerId: player.id,
      x: clickX,
      y: clickY,
      time: timeElapsed,
      found,
      distance
    }]);
    
    if (found) {
      endRound();
    }
  };

  const handleCanvasClick = (e) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const distance = Math.sqrt(
      Math.pow(clickX - waldoPosition.x, 2) + 
      Math.pow(clickY - waldoPosition.y, 2)
    );
    
    const found = distance <= WALDO_SIZE;
    const timeElapsed = ROUND_TIME - timeLeft;
    
    setPlayerClicks(prev => [...prev, {
      playerId: 'player1',
      x: clickX,
      y: clickY,
      time: timeElapsed,
      found,
      distance
    }]);
    
    if (found) {
      endRound();
    }
  };

  const endRound = () => {
    setGameState('roundEnd');
    setShowWaldo(true);
    
    // Calculate round results
    const roundResult = {
      round: currentRound,
      clicks: [...playerClicks],
      waldoPosition: { ...waldoPosition }
    };
    
    // Find who found Waldo (if anyone)
    const successfulClicks = playerClicks.filter(click => click.found);
    
    if (successfulClicks.length > 0) {
      // Sort by time (fastest first)
      successfulClicks.sort((a, b) => a.time - b.time);
      roundResult.winner = successfulClicks[0].playerId;
    }
    
    // Eliminate the last player to click (or random if no one found Waldo)
    const activePlayers = players.filter(p => !p.eliminated);
    if (activePlayers.length > 1) {
      let eliminatedPlayerId;
      
      if (successfulClicks.length === 0) {
        // No one found Waldo, eliminate random player
        eliminatedPlayerId = activePlayers[Math.floor(Math.random() * activePlayers.length)].id;
      } else {
        // Eliminate the player who didn't click or clicked last
        const playersWhoClicked = playerClicks.map(c => c.playerId);
        const playersWhoDidntClick = activePlayers.filter(p => !playersWhoClicked.includes(p.id));
        
        if (playersWhoDidntClick.length > 0) {
          eliminatedPlayerId = playersWhoDidntClick[0].id;
        } else {
          // All clicked, eliminate the slowest
          const allClicks = [...playerClicks];
          allClicks.sort((a, b) => b.time - a.time);
          eliminatedPlayerId = allClicks[0].playerId;
        }
      }
      
      setEliminated(prev => [...prev, eliminatedPlayerId]);
      roundResult.eliminated = eliminatedPlayerId;
    }
    
    setRoundResults(prev => [...prev, roundResult]);
    
    // Check if game should end
    setTimeout(() => {
      const remainingPlayers = players.filter(p => !eliminated.includes(p.id) && p.id !== roundResult.eliminated);
      
      if (remainingPlayers.length <= 1 || currentRound >= totalRounds) {
        endGame(remainingPlayers);
      } else {
        setCurrentRound(prev => prev + 1);
        startRound();
      }
    }, 3000);
  };

  const endGame = (remainingPlayers) => {
    setGameState('gameOver');
    if (remainingPlayers.length === 1) {
      setWinner(remainingPlayers[0]);
    } else {
      setWinner({ name: 'Draw' });
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameState === 'waiting') {
      // Draw waiting screen
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🔍 One in a Million', CANVAS_WIDTH / 2, 150);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Players joined: ${playerCount}/${MAX_PLAYERS}`, CANVAS_WIDTH / 2, 200);
      
      if (waitTime > 3) {
        ctx.fillText(`Game starts in: ${waitTime} seconds`, CANVAS_WIDTH / 2, 250);
      }
      
      ctx.fillStyle = '#feca57';
      ctx.font = '18px Arial';
      ctx.fillText('Find Waldo faster than your opponents!', CANVAS_WIDTH / 2, 300);
      ctx.fillText('Last player to click gets eliminated each round!', CANVAS_WIDTH / 2, 330);
      ctx.fillText('Timer is measured to 3 decimal places!', CANVAS_WIDTH / 2, 360);
      
      ctx.textAlign = 'left';
    } else if (currentScene) {
      // Draw scene background
      ctx.fillStyle = currentScene.background;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw scene objects
      currentScene.objects.forEach(obj => {
        ctx.fillStyle = obj.color;
        
        switch (obj.type) {
          case 'person':
            // Draw simple person
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(obj.x - 8, obj.y, 16, 25);
            break;
          case 'umbrella':
            // Draw umbrella
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, 20, 0, Math.PI, false);
            ctx.fill();
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y);
            ctx.lineTo(obj.x, obj.y + 30);
            ctx.stroke();
            break;
          case 'ball':
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, 10, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'towel':
            ctx.fillRect(obj.x, obj.y, 30, 20);
            break;
          case 'stall':
            ctx.fillRect(obj.x, obj.y, 40, 30);
            break;
          case 'cart':
            ctx.fillRect(obj.x, obj.y, 25, 15);
            ctx.beginPath();
            ctx.arc(obj.x + 5, obj.y + 15, 5, 0, Math.PI * 2);
            ctx.arc(obj.x + 20, obj.y + 15, 5, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'tent':
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y + 25);
            ctx.lineTo(obj.x + 20, obj.y);
            ctx.lineTo(obj.x + 40, obj.y + 25);
            ctx.closePath();
            ctx.fill();
            break;
          case 'flag':
            ctx.fillRect(obj.x, obj.y, 20, 15);
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y);
            ctx.lineTo(obj.x, obj.y + 40);
            ctx.stroke();
            break;
          case 'stage':
            ctx.fillRect(obj.x, obj.y, 60, 20);
            break;
          case 'sign':
            ctx.fillRect(obj.x, obj.y, 30, 20);
            break;
        }
      });
      
      // Draw Waldo (only if showing or found)
      if (showWaldo || playerClicks.some(click => click.found)) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(waldoPosition.x - 10, waldoPosition.y - 15, 20, 30);
        
        // Waldo's hat
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(waldoPosition.x - 8, waldoPosition.y - 20, 16, 8);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(waldoPosition.x - 6, waldoPosition.y - 18, 3, 6);
        ctx.fillRect(waldoPosition.x + 3, waldoPosition.y - 18, 3, 6);
        
        // Waldo's glasses
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(waldoPosition.x - 4, waldoPosition.y - 8, 3, 0, Math.PI * 2);
        ctx.arc(waldoPosition.x + 4, waldoPosition.y - 8, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Draw player clicks
      playerClicks.forEach(click => {
        const player = players.find(p => p.id === click.playerId);
        if (player) {
          ctx.fillStyle = player.color;
          ctx.beginPath();
          ctx.arc(click.x, click.y, 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw X for misses, checkmark for hits
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 3;
          if (click.found) {
            ctx.beginPath();
            ctx.moveTo(click.x - 5, click.y);
            ctx.lineTo(click.x - 2, click.y + 3);
            ctx.lineTo(click.x + 5, click.y - 3);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(click.x - 4, click.y - 4);
            ctx.lineTo(click.x + 4, click.y + 4);
            ctx.moveTo(click.x + 4, click.y - 4);
            ctx.lineTo(click.x - 4, click.y + 4);
            ctx.stroke();
          }
        }
      });
      
      // Draw UI
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 80);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Round ${currentRound}/${totalRounds}`, CANVAS_WIDTH / 2, 30);
      
      if (gameState === 'playing') {
        ctx.fillStyle = timeLeft < 5 ? '#e74c3c' : 'white';
        ctx.fillText(`Time: ${timeLeft.toFixed(3)}s`, CANVAS_WIDTH / 2, 60);
      }
      
      // Draw player list
      ctx.textAlign = 'left';
      ctx.font = '16px Arial';
      let yPos = 100;
      players.forEach(player => {
        if (!eliminated.includes(player.id)) {
          ctx.fillStyle = player.color;
          ctx.fillText(`${player.name}`, 20, yPos);
          yPos += 25;
        }
      });
      
      ctx.textAlign = 'left';
    }

    // Draw countdown timer for last 3 seconds
    if (gameState === 'waiting' && waitTime <= 3 && waitTime > 0) {
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'red';
      ctx.fillText(waitTime, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.textAlign = 'left';
    }
  }, [gameState, waitTime, playerCount, currentRound, totalRounds, currentScene, waldoPosition, playerClicks, players, eliminated, timeLeft, showWaldo]);

  // Draw loop
  useEffect(() => {
    const drawLoop = () => {
      draw();
      requestAnimationFrame(drawLoop);
    };
    drawLoop();
  }, [draw]);

  return (
    <div className="one-in-million-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🔍 One in a Million</h3>
          <div className="stats">
            {gameState === 'playing' && (
              <>
                <span>Round: {currentRound}/{totalRounds}</span>
                <span>Time: {timeLeft.toFixed(3)}s</span>
              </>
            )}
          </div>
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="game-canvas"
          onClick={handleCanvasClick}
        />

        {gameState === 'gameOver' && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>Game Over!</h2>
              <p>🏆 {winner?.name} wins the prize pool!</p>
              <p>Rounds completed: {currentRound - 1}/{totalRounds}</p>
              <button onClick={startGame} className="restart-btn">Play Again</button>
              <button onClick={onClose} className="exit-btn">Exit</button>
            </div>
          </div>
        )}

        {gameState === 'roundEnd' && (
          <div className="round-end-overlay">
            <div className="round-end-content">
              <h3>Round {currentRound} Complete!</h3>
              {roundResults[roundResults.length - 1]?.winner && (
                <p>🎯 {players.find(p => p.id === roundResults[roundResults.length - 1].winner)?.name} found Waldo!</p>
              )}
              {roundResults[roundResults.length - 1]?.eliminated && (
                <p>❌ {players.find(p => p.id === roundResults[roundResults.length - 1].eliminated)?.name} eliminated!</p>
              )}
              <p>Next round starting...</p>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <h4>🎮 How to Play</h4>
        <p>Click on Waldo as fast as possible!</p>
        <p>Last player to click gets eliminated each round!</p>
        <p>Winner takes the entire prize pool minus 7.5% house fee!</p>
      </div>
    </div>
  );
};

export default OneInAMillion;

