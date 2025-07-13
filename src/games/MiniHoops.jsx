import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MiniHoops.css';

const MiniHoops = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'overtime', 'gameOver'
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameTime, setGameTime] = useState(30);
  const [overtimeTime, setOvertimeTime] = useState(2);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [streak, setStreak] = useState({ player1: 0, player2: 0 });
  const [multiplier, setMultiplier] = useState({ player1: 1, player2: 1 });
  const [ball, setBall] = useState({ x: 0, y: 0, vx: 0, vy: 0, shooting: false });
  const [power, setPower] = useState(0);
  const [angle, setAngle] = useState(45);
  const [charging, setCharging] = useState(false);
  const [winner, setWinner] = useState(null);
  const [lastShot, setLastShot] = useState({ player: null, made: false });
  const gameLoop = useRef(null);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const HOOP_X = 650;
  const HOOP_Y = 150;
  const HOOP_WIDTH = 80;
  const HOOP_HEIGHT = 10;
  const BALL_SIZE = 20;
  const PLAYER_X = 100;
  const PLAYER_Y = 500;
  const MAX_POWER = 20;
  const GRAVITY = 0.4;

  // Player names for AI
  const playerNames = [
    'ShotMaster', 'HoopKing', 'NetSwisher', 'BallSniper', 'CourtAce',
    'BasketBoss', 'SlamDunk', 'ThreePoint', 'HoopStar', 'NetBuster'
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
        if (prev >= 2) {
          clearInterval(joinTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => {
      clearInterval(waitTimer);
      clearInterval(joinTimer);
    };
  };

  const startGame = () => {
    setGameState('playing');
    setGameTime(30);
    setScore({ player1: 0, player2: 0 });
    setStreak({ player1: 0, player2: 0 });
    setMultiplier({ player1: 1, player2: 1 });
    setCurrentPlayer(0);
    setWinner(null);
    
    // Initialize players
    const initialPlayers = [
      {
        id: 'player1',
        name: 'You',
        color: '#ff6b6b',
        isAI: false
      },
      {
        id: 'player2',
        name: playerNames[0],
        color: '#4ecdc4',
        isAI: true
      }
    ];
    setPlayers(initialPlayers);
    
    resetBall();
    
    // Start game timer
    const gameTimer = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          clearInterval(gameTimer);
          checkGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(gameTimer);
    };
  };

  const startOvertime = () => {
    setGameState('overtime');
    setOvertimeTime(2);
    setCurrentPlayer(0);
    
    const overtimeTimer = setInterval(() => {
      setOvertimeTime(prev => {
        if (prev <= 0.1) {
          clearInterval(overtimeTimer);
          // Miss if time runs out
          handleShotResult(false);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => {
      clearInterval(overtimeTimer);
    };
  };

  const startGameLoop = () => {
    const update = () => {
      if (ball.shooting) {
        updateBall();
      }
      if (gameState === 'playing' && players[currentPlayer]?.isAI && !ball.shooting) {
        handleAIShot();
      }
      draw();
      gameLoop.current = requestAnimationFrame(update);
    };
    update();
  };

  const updateBall = () => {
    setBall(prevBall => {
      let newBall = { ...prevBall };
      
      // Apply gravity
      newBall.vy += GRAVITY;
      
      // Apply movement
      newBall.x += newBall.vx;
      newBall.y += newBall.vy;
      
      // Check if ball reached hoop area
      if (newBall.x >= HOOP_X - 20 && newBall.x <= HOOP_X + HOOP_WIDTH + 20 &&
          newBall.y >= HOOP_Y - 20 && newBall.y <= HOOP_Y + 40) {
        
        // Check if it's a successful shot
        if (newBall.x >= HOOP_X && newBall.x <= HOOP_X + HOOP_WIDTH &&
            newBall.y >= HOOP_Y && newBall.y <= HOOP_Y + HOOP_HEIGHT &&
            newBall.vy > 0) {
          handleShotResult(true);
        }
      }
      
      // Check if ball is out of bounds
      if (newBall.x > CANVAS_WIDTH || newBall.y > CANVAS_HEIGHT || 
          (newBall.x < HOOP_X - 50 && newBall.y > HOOP_Y + 100)) {
        handleShotResult(false);
      }
      
      return newBall;
    });
  };

  const handleShotResult = (made) => {
    const currentPlayerId = players[currentPlayer].id;
    setLastShot({ player: currentPlayerId, made });
    
    if (made) {
      // Calculate points with multiplier
      const currentMultiplier = multiplier[currentPlayerId];
      const points = 1 * currentMultiplier;
      
      setScore(prev => ({
        ...prev,
        [currentPlayerId]: prev[currentPlayerId] + points
      }));
      
      // Increase streak and multiplier
      setStreak(prev => ({
        ...prev,
        [currentPlayerId]: prev[currentPlayerId] + 1
      }));
      
      setMultiplier(prev => ({
        ...prev,
        [currentPlayerId]: Math.min(prev[currentPlayerId] + 0.5, 5) // Max 5x multiplier
      }));
    } else {
      // Reset streak and multiplier on miss
      setStreak(prev => ({
        ...prev,
        [currentPlayerId]: 0
      }));
      
      setMultiplier(prev => ({
        ...prev,
        [currentPlayerId]: 1
      }));
    }
    
    // Handle overtime logic
    if (gameState === 'overtime') {
      if (!made) {
        // Player missed in overtime
        const otherPlayer = currentPlayer === 0 ? 1 : 0;
        setWinner(players[otherPlayer]);
        setGameState('gameOver');
        return;
      } else {
        // Player made shot, switch to other player
        setCurrentPlayer(prev => prev === 0 ? 1 : 0);
        setOvertimeTime(2);
      }
    } else {
      // Regular game, switch players
      setCurrentPlayer(prev => prev === 0 ? 1 : 0);
    }
    
    resetBall();
  };

  const resetBall = () => {
    setBall({
      x: PLAYER_X,
      y: PLAYER_Y,
      vx: 0,
      vy: 0,
      shooting: false
    });
    setPower(0);
    setAngle(45);
    setCharging(false);
  };

  const handleAIShot = () => {
    // Simple AI that shoots with random accuracy
    setTimeout(() => {
      const aiAccuracy = 0.7; // 70% accuracy
      const randomAngle = 35 + Math.random() * 20; // 35-55 degrees
      const randomPower = 12 + Math.random() * 6; // 12-18 power
      
      setAngle(randomAngle);
      setPower(randomPower);
      shootBall(randomAngle, randomPower);
    }, 1000);
  };

  const shootBall = (shootAngle, shootPower) => {
    const radians = (shootAngle * Math.PI) / 180;
    const vx = Math.cos(radians) * shootPower;
    const vy = -Math.sin(radians) * shootPower;
    
    setBall(prev => ({
      ...prev,
      vx,
      vy,
      shooting: true
    }));
  };

  const handleMouseDown = () => {
    if (gameState === 'playing' && !players[currentPlayer].isAI && !ball.shooting) {
      setCharging(true);
    }
  };

  const handleMouseUp = () => {
    if (charging && !ball.shooting) {
      shootBall(angle, power);
      setCharging(false);
    }
  };

  const handleMouseMove = (e) => {
    if (!players[currentPlayer]?.isAI && !ball.shooting) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate angle based on mouse position
      const dx = mouseX - PLAYER_X;
      const dy = PLAYER_Y - mouseY;
      const newAngle = Math.max(10, Math.min(80, (Math.atan2(dy, dx) * 180) / Math.PI));
      setAngle(newAngle);
    }
  };

  // Power charging effect
  useEffect(() => {
    let powerInterval;
    if (charging) {
      powerInterval = setInterval(() => {
        setPower(prev => {
          const newPower = prev + 0.5;
          return newPower > MAX_POWER ? 0 : newPower; // Reset if max reached
        });
      }, 50);
    }
    return () => clearInterval(powerInterval);
  }, [charging]);

  const checkGameEnd = () => {
    if (score.player1 === score.player2) {
      startOvertime();
    } else {
      const winnerId = score.player1 > score.player2 ? 'player1' : 'player2';
      setWinner(players.find(p => p.id === winnerId));
      setGameState('gameOver');
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background (basketball court)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw court lines
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    
    // Free throw line
    ctx.beginPath();
    ctx.moveTo(0, PLAYER_Y - 50);
    ctx.lineTo(300, PLAYER_Y - 50);
    ctx.stroke();
    
    // Three point arc (simplified)
    ctx.beginPath();
    ctx.arc(PLAYER_X, PLAYER_Y, 200, -Math.PI/3, -Math.PI*2/3, true);
    ctx.stroke();

    // Draw hoop
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(HOOP_X, HOOP_Y, HOOP_WIDTH, HOOP_HEIGHT);
    
    // Hoop rim
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(HOOP_X, HOOP_Y);
    ctx.lineTo(HOOP_X + HOOP_WIDTH, HOOP_Y);
    ctx.stroke();
    
    // Net
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const x = HOOP_X + (i * HOOP_WIDTH / 5);
      ctx.beginPath();
      ctx.moveTo(x, HOOP_Y);
      ctx.lineTo(x + 5, HOOP_Y + 30);
      ctx.stroke();
    }
    
    // Backboard
    ctx.fillStyle = 'white';
    ctx.fillRect(HOOP_X + HOOP_WIDTH, HOOP_Y - 40, 10, 80);

    if (gameState === 'waiting') {
      // Draw waiting screen
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏀 Mini Hoops', CANVAS_WIDTH / 2, 150);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Players joined: ${playerCount}/2`, CANVAS_WIDTH / 2, 200);
      
      if (waitTime > 3) {
        ctx.fillText(`Game starts in: ${waitTime} seconds`, CANVAS_WIDTH / 2, 250);
      }
      
      ctx.fillStyle = '#feca57';
      ctx.font = '18px Arial';
      ctx.fillText('30 seconds to score as many baskets as possible!', CANVAS_WIDTH / 2, 300);
      ctx.fillText('Consecutive shots increase your multiplier!', CANVAS_WIDTH / 2, 330);
      ctx.fillText('If tied, overtime: first to miss loses!', CANVAS_WIDTH / 2, 360);
      
      ctx.textAlign = 'left';
    } else {
      // Draw player
      const currentPlayerData = players[currentPlayer];
      if (currentPlayerData) {
        ctx.fillStyle = currentPlayerData.color;
        ctx.beginPath();
        ctx.arc(PLAYER_X, PLAYER_Y - 30, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Player name
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(currentPlayerData.name, PLAYER_X, PLAYER_Y + 10);
        
        // Current player indicator
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('SHOOTING', PLAYER_X, PLAYER_Y + 30);
      }

      // Draw trajectory line when aiming
      if (!ball.shooting && !players[currentPlayer]?.isAI) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(PLAYER_X, PLAYER_Y - 30);
        
        const radians = (angle * Math.PI) / 180;
        const trajectoryLength = 200;
        const endX = PLAYER_X + Math.cos(radians) * trajectoryLength;
        const endY = PLAYER_Y - 30 - Math.sin(radians) * trajectoryLength;
        
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw power meter
      if (charging) {
        const meterWidth = 100;
        const meterHeight = 20;
        const meterX = PLAYER_X - meterWidth / 2;
        const meterY = PLAYER_Y - 80;
        
        // Meter background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Power fill
        const powerPercent = power / MAX_POWER;
        ctx.fillStyle = powerPercent > 0.8 ? '#e74c3c' : powerPercent > 0.5 ? '#f39c12' : '#2ecc71';
        ctx.fillRect(meterX, meterY, meterWidth * powerPercent, meterHeight);
        
        // Meter border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);
      }

      // Draw ball
      if (ball.shooting || ball.x !== PLAYER_X || ball.y !== PLAYER_Y) {
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball lines
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ball.x - BALL_SIZE / 2, ball.y);
        ctx.lineTo(ball.x + BALL_SIZE / 2, ball.y);
        ctx.moveTo(ball.x, ball.y - BALL_SIZE / 2);
        ctx.lineTo(ball.x, ball.y + BALL_SIZE / 2);
        ctx.stroke();
      }

      // Draw scores and stats
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${players[0]?.name}: ${score.player1}`, 20, 40);
      ctx.fillText(`${players[1]?.name}: ${score.player2}`, 20, 70);
      
      // Draw multipliers
      ctx.font = '16px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`Multiplier: ${multiplier.player1.toFixed(1)}x`, 20, 100);
      ctx.fillText(`Streak: ${streak.player1}`, 20, 120);
      
      ctx.textAlign = 'right';
      ctx.fillText(`Multiplier: ${multiplier.player2.toFixed(1)}x`, CANVAS_WIDTH - 20, 100);
      ctx.fillText(`Streak: ${streak.player2}`, CANVAS_WIDTH - 20, 120);
      
      // Draw time
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px Arial';
      if (gameState === 'overtime') {
        ctx.fillStyle = '#e74c3c';
        ctx.fillText(`OVERTIME: ${overtimeTime.toFixed(1)}s`, CANVAS_WIDTH / 2, 40);
      } else {
        ctx.fillText(`Time: ${gameTime}s`, CANVAS_WIDTH / 2, 40);
      }
      
      // Show last shot result
      if (lastShot.player) {
        ctx.font = '20px Arial';
        ctx.fillStyle = lastShot.made ? '#2ecc71' : '#e74c3c';
        ctx.fillText(lastShot.made ? 'SWISH! 🎯' : 'MISS! ❌', CANVAS_WIDTH / 2, 80);
      }
      
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
  }, [gameState, waitTime, playerCount, players, currentPlayer, ball, score, streak, multiplier, gameTime, overtimeTime, angle, power, charging, lastShot]);

  return (
    <div className="mini-hoops-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🏀 Mini Hoops</h3>
          <div className="stats">
            {gameState === 'playing' && (
              <>
                <span>Score: {score.player1} - {score.player2}</span>
                <span>Time: {gameTime}s</span>
              </>
            )}
            {gameState === 'overtime' && (
              <span>OVERTIME: {overtimeTime.toFixed(1)}s</span>
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
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        />

        {gameState === 'gameOver' && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>Game Over!</h2>
              <p>🏆 {winner?.name} wins!</p>
              <p>Final Score: {score.player1} - {score.player2}</p>
              <button onClick={startGame} className="restart-btn">Play Again</button>
              <button onClick={onClose} className="exit-btn">Exit</button>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <h4>🎮 Controls</h4>
        <p>Move mouse to aim, hold and release to shoot</p>
        <p>Consecutive shots increase your multiplier!</p>
        <p>30 seconds to score as many as possible!</p>
      </div>
    </div>
  );
};

export default MiniHoops;

