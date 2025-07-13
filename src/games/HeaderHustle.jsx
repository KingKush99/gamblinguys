import React, { useState, useEffect, useRef, useCallback } from 'react';
import './HeaderHustle.css';

const HeaderHustle = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'gameOver'
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState([]);
  const [ball, setBall] = useState({ x: 400, y: 300, vx: 0, vy: 0 });
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [gameTime, setGameTime] = useState(120); // 2 minutes
  const [winner, setWinner] = useState(null);
  const [powerUps, setPowerUps] = useState([]);
  const [keys, setKeys] = useState({});
  const gameLoop = useRef(null);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;
  const PLAYER_SIZE = 40;
  const BALL_SIZE = 20;
  const GOAL_WIDTH = 20;
  const GOAL_HEIGHT = 120;
  const JUMP_STRENGTH = 12;
  const MOVE_SPEED = 4;
  const GRAVITY = 0.5;
  const BALL_BOUNCE = 0.8;
  const WIN_SCORE = 5;

  // Player names for AI
  const playerNames = [
    'HeaderKing', 'SoccerHead', 'GoalGetter', 'BallMaster', 'KickChamp',
    'HeadHunter', 'FieldAce', 'ScoreHero', 'FootyPro', 'NetBuster'
  ];

  // Power-up types
  const powerUpTypes = [
    { type: 'speed', color: '#ff6b6b', icon: '⚡', duration: 5000 },
    { type: 'jump', color: '#4ecdc4', icon: '🦘', duration: 5000 },
    { type: 'bighead', color: '#ffe66d', icon: '🎈', duration: 8000 },
    { type: 'freeze', color: '#a8e6cf', icon: '❄️', duration: 3000 }
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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    };

    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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
    setScore({ player1: 0, player2: 0 });
    setGameTime(120);
    setWinner(null);
    
    // Initialize players
    const initialPlayers = [
      {
        id: 'player1',
        name: 'You',
        x: 150,
        y: CANVAS_HEIGHT - 100,
        vx: 0,
        vy: 0,
        color: '#ff6b6b',
        isAI: false,
        powerUp: null,
        powerUpEnd: 0,
        size: PLAYER_SIZE
      },
      {
        id: 'player2',
        name: playerNames[0],
        x: CANVAS_WIDTH - 150,
        y: CANVAS_HEIGHT - 100,
        vx: 0,
        vy: 0,
        color: '#4ecdc4',
        isAI: true,
        powerUp: null,
        powerUpEnd: 0,
        size: PLAYER_SIZE
      }
    ];
    setPlayers(initialPlayers);
    
    // Reset ball
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 0, vy: 0 });
    
    // Start game timer
    const gameTimer = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          clearInterval(gameTimer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawn power-ups periodically
    const powerUpTimer = setInterval(() => {
      if (gameState === 'playing') {
        spawnPowerUp();
      }
    }, 10000);

    return () => {
      clearInterval(gameTimer);
      clearInterval(powerUpTimer);
    };
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
    const currentTime = Date.now();
    
    setPlayers(prevPlayers => {
      return prevPlayers.map(player => {
        let newPlayer = { ...player };

        // Remove expired power-ups
        if (newPlayer.powerUpEnd && currentTime > newPlayer.powerUpEnd) {
          newPlayer.powerUp = null;
          newPlayer.powerUpEnd = 0;
          newPlayer.size = PLAYER_SIZE;
        }

        // AI behavior
        if (newPlayer.isAI) {
          // Simple AI: move towards ball and try to hit it towards goal
          const ballDistance = Math.abs(ball.x - newPlayer.x);
          const goalDirection = newPlayer.x > CANVAS_WIDTH / 2 ? -1 : 1;
          
          if (ballDistance < 100) {
            // Move towards ball
            if (ball.x < newPlayer.x) {
              newPlayer.vx = -MOVE_SPEED;
            } else if (ball.x > newPlayer.x) {
              newPlayer.vx = MOVE_SPEED;
            }
            
            // Jump if ball is above
            if (ball.y < newPlayer.y && newPlayer.y >= CANVAS_HEIGHT - 100) {
              newPlayer.vy = -JUMP_STRENGTH;
            }
          } else {
            // Move towards center
            if (newPlayer.x > CANVAS_WIDTH * 0.75) {
              newPlayer.vx = -MOVE_SPEED * 0.5;
            } else if (newPlayer.x < CANVAS_WIDTH * 0.25) {
              newPlayer.vx = MOVE_SPEED * 0.5;
            } else {
              newPlayer.vx *= 0.8;
            }
          }
        } else {
          // Human player controls
          newPlayer.vx = 0;
          if (keys['a'] || keys['arrowleft']) {
            newPlayer.vx = -MOVE_SPEED;
          }
          if (keys['d'] || keys['arrowright']) {
            newPlayer.vx = MOVE_SPEED;
          }
          if ((keys['w'] || keys['arrowup'] || keys[' ']) && newPlayer.y >= CANVAS_HEIGHT - 100) {
            newPlayer.vy = -JUMP_STRENGTH;
          }
        }

        // Apply power-up effects
        if (newPlayer.powerUp === 'speed') {
          newPlayer.vx *= 1.5;
        } else if (newPlayer.powerUp === 'jump' && newPlayer.vy < 0) {
          newPlayer.vy *= 1.3;
        } else if (newPlayer.powerUp === 'bighead') {
          newPlayer.size = PLAYER_SIZE * 1.5;
        }

        // Apply gravity
        newPlayer.vy += GRAVITY;

        // Apply movement
        newPlayer.x += newPlayer.vx;
        newPlayer.y += newPlayer.vy;

        // Ground collision
        if (newPlayer.y + newPlayer.size > CANVAS_HEIGHT - 20) {
          newPlayer.y = CANVAS_HEIGHT - 20 - newPlayer.size;
          newPlayer.vy = 0;
        }

        // Wall collision
        if (newPlayer.x < 0) {
          newPlayer.x = 0;
        } else if (newPlayer.x + newPlayer.size > CANVAS_WIDTH) {
          newPlayer.x = CANVAS_WIDTH - newPlayer.size;
        }

        return newPlayer;
      });
    });

    // Update ball physics
    setBall(prevBall => {
      let newBall = { ...prevBall };
      
      // Apply gravity to ball
      newBall.vy += GRAVITY * 0.3;
      
      // Apply movement
      newBall.x += newBall.vx;
      newBall.y += newBall.vy;
      
      // Ball collision with ground
      if (newBall.y + BALL_SIZE > CANVAS_HEIGHT - 20) {
        newBall.y = CANVAS_HEIGHT - 20 - BALL_SIZE;
        newBall.vy *= -BALL_BOUNCE;
        newBall.vx *= 0.9;
      }
      
      // Ball collision with ceiling
      if (newBall.y < 0) {
        newBall.y = 0;
        newBall.vy *= -BALL_BOUNCE;
      }
      
      // Ball collision with walls (goals)
      if (newBall.x < 0) {
        // Check if it's a goal
        if (newBall.y > CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2 && 
            newBall.y < CANVAS_HEIGHT / 2 + GOAL_HEIGHT / 2) {
          // Goal for player 2
          setScore(prev => ({ ...prev, player2: prev.player2 + 1 }));
          resetBall();
        } else {
          newBall.x = 0;
          newBall.vx *= -BALL_BOUNCE;
        }
      } else if (newBall.x + BALL_SIZE > CANVAS_WIDTH) {
        // Check if it's a goal
        if (newBall.y > CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2 && 
            newBall.y < CANVAS_HEIGHT / 2 + GOAL_HEIGHT / 2) {
          // Goal for player 1
          setScore(prev => ({ ...prev, player1: prev.player1 + 1 }));
          resetBall();
        } else {
          newBall.x = CANVAS_WIDTH - BALL_SIZE;
          newBall.vx *= -BALL_BOUNCE;
        }
      }
      
      return newBall;
    });

    // Ball collision with players
    players.forEach(player => {
      const dx = ball.x - (player.x + player.size / 2);
      const dy = ball.y - (player.y + player.size / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < (BALL_SIZE + player.size) / 2) {
        // Calculate collision response
        const angle = Math.atan2(dy, dx);
        const force = 8;
        setBall(prev => ({
          ...prev,
          vx: Math.cos(angle) * force,
          vy: Math.sin(angle) * force - 2
        }));
      }
    });

    // Power-up collection
    setPowerUps(prevPowerUps => {
      return prevPowerUps.filter(powerUp => {
        let collected = false;
        players.forEach(player => {
          const dx = powerUp.x - (player.x + player.size / 2);
          const dy = powerUp.y - (player.y + player.size / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 30) {
            // Apply power-up
            setPlayers(prev => prev.map(p => 
              p.id === player.id 
                ? { ...p, powerUp: powerUp.type, powerUpEnd: currentTime + powerUp.duration }
                : p
            ));
            collected = true;
          }
        });
        return !collected;
      });
    });

    // Check win condition
    if (score.player1 >= WIN_SCORE || score.player2 >= WIN_SCORE) {
      endGame();
    }
  };

  const resetBall = () => {
    setBall({ 
      x: CANVAS_WIDTH / 2, 
      y: CANVAS_HEIGHT / 2, 
      vx: (Math.random() - 0.5) * 4, 
      vy: -3 
    });
  };

  const spawnPowerUp = () => {
    const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    const newPowerUp = {
      ...powerUpType,
      x: Math.random() * (CANVAS_WIDTH - 60) + 30,
      y: Math.random() * (CANVAS_HEIGHT - 200) + 100,
      id: Date.now()
    };
    setPowerUps(prev => [...prev, newPowerUp]);
  };

  const endGame = () => {
    setGameState('gameOver');
    if (score.player1 > score.player2) {
      setWinner(players.find(p => p.id === 'player1'));
    } else if (score.player2 > score.player1) {
      setWinner(players.find(p => p.id === 'player2'));
    } else {
      setWinner({ name: 'Draw' });
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background (soccer field)
    ctx.fillStyle = '#228b22';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw field lines
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
    
    // Goals
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2, GOAL_WIDTH, GOAL_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - GOAL_WIDTH, CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2, GOAL_WIDTH, GOAL_HEIGHT);
    
    // Ground
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    if (gameState === 'waiting') {
      // Draw waiting screen
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚽ Header Hustle', CANVAS_WIDTH / 2, 150);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Players joined: ${playerCount}/2`, CANVAS_WIDTH / 2, 200);
      
      if (waitTime > 3) {
        ctx.fillText(`Game starts in: ${waitTime} seconds`, CANVAS_WIDTH / 2, 250);
      }
      
      ctx.fillStyle = '#feca57';
      ctx.font = '18px Arial';
      ctx.fillText('First to 5 goals wins!', CANVAS_WIDTH / 2, 300);
      ctx.fillText('Use WASD or Arrow Keys to move and jump', CANVAS_WIDTH / 2, 330);
      
      ctx.textAlign = 'left';
    } else {
      // Draw power-ups
      powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.color;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(powerUp.icon, powerUp.x, powerUp.y + 5);
      });

      // Draw players
      players.forEach(player => {
        // Player body
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
        
        // Player head (bigger for header game)
        ctx.beginPath();
        ctx.arc(player.x + player.size / 2, player.y - 10, player.size / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Player name
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.x + player.size / 2, player.y - 25);
        
        // Power-up indicator
        if (player.powerUp) {
          const powerUpInfo = powerUpTypes.find(p => p.type === player.powerUp);
          ctx.fillStyle = powerUpInfo.color;
          ctx.font = '12px Arial';
          ctx.fillText(powerUpInfo.icon, player.x + player.size / 2, player.y + player.size + 15);
        }
      });

      // Draw ball
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Ball pattern
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw score
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${score.player1} - ${score.player2}`, CANVAS_WIDTH / 2, 40);
      
      // Draw time
      ctx.font = '18px Arial';
      ctx.fillText(`Time: ${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}`, CANVAS_WIDTH / 2, 70);
      
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
  }, [gameState, waitTime, playerCount, players, ball, score, gameTime, powerUps]);

  return (
    <div className="header-hustle-game">
      <div className="game-header">
        <div className="game-info">
          <h3>⚽ Header Hustle</h3>
          <div className="stats">
            {gameState === 'playing' && (
              <>
                <span>Score: {score.player1} - {score.player2}</span>
                <span>Time: {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</span>
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
        <p>WASD or Arrow Keys: Move and Jump</p>
        <p>Collect power-ups for special abilities!</p>
        <p>First to 5 goals wins the match!</p>
      </div>
    </div>
  );
};

export default HeaderHustle;

