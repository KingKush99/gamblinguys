import React, { useState, useEffect, useRef, useCallback } from 'react';
import './StickmanRacer.css';

const StickmanRacer = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'gameOver'
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState([]);
  const [currentSequence, setCurrentSequence] = useState('up'); // 'up' or 'down'
  const [clickCounts, setClickCounts] = useState({});
  const [winner, setWinner] = useState(null);
  const gameLoop = useRef(null);

  // Game constants
  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 600;
  const TRACK_LENGTH = 800;
  const FINISH_LINE = TRACK_LENGTH - 50;
  const MAX_PLAYERS = 6;
  const TOTAL_CLICKS_NEEDED = 200; // 100 up + 100 down

  // Player names for AI
  const playerNames = [
    'SpeedStick', 'RushRunner', 'QuickClick', 'FastFinger', 'RapidRacer',
    'TurboTapper', 'SwiftStick', 'BlazingBot', 'ZoomZapper', 'FlashFinger'
  ];

  // Initialize game
  useEffect(() => {
    initializeGame();
    return () => {
      if (gameLoop.current) {
        cancelAnimationFrame(gameLoop.current);
      }
    };
  }, []);

  const initializeGame = () => {
    // Start drawing immediately
    startGameLoop();
    
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
    setCurrentSequence('up');
    setWinner(null);
    
    // Initialize players
    const initialPlayers = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    
    for (let i = 0; i < playerCount; i++) {
      const playerId = `player_${i}`;
      initialPlayers.push({
        id: playerId,
        name: i === 0 ? 'You' : playerNames[i - 1],
        color: colors[i % colors.length],
        position: 0,
        isAI: i > 0,
        upClicks: 0,
        downClicks: 0,
        totalClicks: 0,
        currentPose: 'standing', // 'standing' or 'spread'
        animationFrame: 0
      });
      setClickCounts(prev => ({ ...prev, [playerId]: { up: 0, down: 0, total: 0 } }));
    }
    setPlayers(initialPlayers);
  };

  const startGameLoop = () => {
    const update = () => {
      if (gameState === 'playing') {
        updateGame();
      }
      draw();
      gameLoop.current = requestAnimationFrame(update);
    };
    update();
  };

  const updateGame = () => {
    setPlayers(prevPlayers => {
      return prevPlayers.map(player => {
        let newPlayer = { ...player };

        // AI behavior
        if (newPlayer.isAI && !winner) {
          // AI clicks at random intervals
          if (Math.random() < 0.15) { // 15% chance per frame to click
            handlePlayerClick(newPlayer.id);
          }
        }

        // Update position based on total clicks
        const progress = newPlayer.totalClicks / TOTAL_CLICKS_NEEDED;
        newPlayer.position = Math.min(progress * TRACK_LENGTH, TRACK_LENGTH);

        // Check for winner
        if (newPlayer.position >= FINISH_LINE && !winner) {
          setWinner(newPlayer);
          setGameState('gameOver');
        }

        // Update animation frame
        newPlayer.animationFrame = (newPlayer.animationFrame + 1) % 60;

        return newPlayer;
      });
    });
  };

  const handlePlayerClick = (playerId) => {
    if (gameState !== 'playing' || winner) return;

    setPlayers(prevPlayers => {
      return prevPlayers.map(player => {
        if (player.id === playerId) {
          let newPlayer = { ...player };
          
          if (currentSequence === 'up' && newPlayer.upClicks < 100) {
            newPlayer.upClicks++;
            newPlayer.totalClicks++;
            newPlayer.currentPose = 'spread';
            
            if (newPlayer.upClicks === 100) {
              setCurrentSequence('down');
            }
          } else if (currentSequence === 'down' && newPlayer.downClicks < 100) {
            newPlayer.downClicks++;
            newPlayer.totalClicks++;
            newPlayer.currentPose = 'standing';
          }

          setClickCounts(prev => ({
            ...prev,
            [playerId]: {
              up: newPlayer.upClicks,
              down: newPlayer.downClicks,
              total: newPlayer.totalClicks
            }
          }));

          return newPlayer;
        }
        return player;
      });
    });
  };

  const handleUserClick = () => {
    if (gameState === 'playing' && !winner) {
      handlePlayerClick('player_0');
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#90EE90'; // Light green
    ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);

    if (gameState === 'waiting') {
      // Draw waiting screen
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏃 Stickman Racer', CANVAS_WIDTH / 2, 150);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Players joined: ${playerCount}/${MAX_PLAYERS}`, CANVAS_WIDTH / 2, 200);
      
      if (waitTime > 3) {
        ctx.fillText(`Race starts in: ${waitTime} seconds`, CANVAS_WIDTH / 2, 250);
      }
      
      // Draw track preview
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 3;
      ctx.strokeRect(100, 350, TRACK_LENGTH, 150);
      
      ctx.fillStyle = '#999';
      ctx.font = '18px Arial';
      ctx.fillText('Race Track Preview', CANVAS_WIDTH / 2, 380);
      
      ctx.textAlign = 'left';
    } else {
      // Draw race track
      const trackY = CANVAS_HEIGHT - 200;
      
      // Draw track lanes
      for (let i = 0; i < playerCount; i++) {
        const laneY = trackY + (i * 25);
        ctx.fillStyle = i % 2 === 0 ? '#ddd' : '#eee';
        ctx.fillRect(100, laneY, TRACK_LENGTH, 25);
        
        // Lane dividers
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(100, laneY);
        ctx.lineTo(100 + TRACK_LENGTH, laneY);
        ctx.stroke();
      }

      // Draw finish line
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(100 + FINISH_LINE, trackY, 5, playerCount * 25);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('FINISH', 100 + FINISH_LINE + 2, trackY - 10);

      // Draw players
      players.forEach((player, index) => {
        const laneY = trackY + (index * 25) + 12;
        const playerX = 100 + player.position;
        
        // Draw stickman
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 3;
        
        // Head
        ctx.beginPath();
        ctx.arc(playerX, laneY - 15, 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Body
        ctx.beginPath();
        ctx.moveTo(playerX, laneY - 10);
        ctx.lineTo(playerX, laneY + 5);
        ctx.stroke();
        
        // Arms and legs based on pose
        if (player.currentPose === 'spread') {
          // Spread pose (running)
          ctx.beginPath();
          ctx.moveTo(playerX, laneY - 5);
          ctx.lineTo(playerX - 8, laneY - 8);
          ctx.moveTo(playerX, laneY - 5);
          ctx.lineTo(playerX + 8, laneY + 2);
          ctx.stroke();
          
          // Legs spread
          ctx.beginPath();
          ctx.moveTo(playerX, laneY + 5);
          ctx.lineTo(playerX - 6, laneY + 15);
          ctx.moveTo(playerX, laneY + 5);
          ctx.lineTo(playerX + 6, laneY + 15);
          ctx.stroke();
        } else {
          // Standing pose
          ctx.beginPath();
          ctx.moveTo(playerX, laneY - 5);
          ctx.lineTo(playerX - 5, laneY);
          ctx.moveTo(playerX, laneY - 5);
          ctx.lineTo(playerX + 5, laneY);
          ctx.stroke();
          
          // Legs together
          ctx.beginPath();
          ctx.moveTo(playerX, laneY + 5);
          ctx.lineTo(playerX - 3, laneY + 15);
          ctx.moveTo(playerX, laneY + 5);
          ctx.lineTo(playerX + 3, laneY + 15);
          ctx.stroke();
        }
        
        // Player name
        ctx.fillStyle = player.color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, playerX, laneY + 30);
      });

      // Draw UI
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Current: Click ${currentSequence.toUpperCase()}`, 20, 50);
      
      const userPlayer = players.find(p => p.id === 'player_0');
      if (userPlayer) {
        ctx.font = '18px Arial';
        ctx.fillText(`Up Clicks: ${userPlayer.upClicks}/100`, 20, 80);
        ctx.fillText(`Down Clicks: ${userPlayer.downClicks}/100`, 20, 105);
        ctx.fillText(`Total: ${userPlayer.totalClicks}/200`, 20, 130);
      }
    }

    // Draw countdown timer for last 3 seconds
    if (gameState === 'waiting' && waitTime <= 3 && waitTime > 0) {
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'red';
      ctx.fillText(waitTime, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.textAlign = 'left';
    }
  }, [players, gameState, waitTime, playerCount, currentSequence, winner]);

  return (
    <div className="stickman-racer-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🏃 Stickman Racer</h3>
          <div className="stats">
            {gameState === 'playing' && (
              <>
                <span>Current: Click {currentSequence.toUpperCase()}</span>
                <span>Players: {playerCount}</span>
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
          onClick={handleUserClick}
        />

        {gameState === 'gameOver' && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>Race Finished!</h2>
              <p>🏆 {winner?.name} wins the race!</p>
              <p>Final position: {Math.round((winner?.position / TRACK_LENGTH) * 100)}% complete</p>
              <button onClick={startGame} className="restart-btn">Race Again</button>
              <button onClick={onClose} className="exit-btn">Exit</button>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <h4>🎮 How to Play</h4>
        <p>Click the screen to make your stickman run!</p>
        <p>First click UP 100 times, then DOWN 100 times</p>
        <p>First to reach the finish line wins!</p>
        {gameState === 'playing' && (
          <div className="click-button">
            <button onClick={handleUserClick} className="race-click-btn">
              CLICK TO RUN! ({currentSequence.toUpperCase()})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickmanRacer;

