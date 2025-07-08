import React, { useState, useEffect, useRef, useCallback } from 'react';
import './LunarLaunch.css';

const LunarLaunch = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('playing');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [player, setPlayer] = useState({
    x: 400,
    y: 500,
    vx: 0,
    vy: 0,
    fuel: 100,
    alive: true
  });
  const [platforms, setPlatforms] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [coinItems, setCoinItems] = useState([]);
  const [particles, setParticles] = useState([]);
  const gameLoop = useRef(null);
  const keys = useRef({});
  const [cameraY, setCameraY] = useState(0);

  // Game constants
  const GRAVITY = 0.15;
  const THRUST_POWER = 0.3;
  const FUEL_CONSUMPTION = 0.8;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PLATFORM_HEIGHT = 20;
  const PLAYER_SIZE = 15;

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
    generateLevel(1);
    setPlayer({
      x: 400,
      y: 500,
      vx: 0,
      vy: 0,
      fuel: 100,
      alive: true
    });
    setScore(0);
    setCoins(0);
    setLevel(1);
    setCameraY(0);
    startGameLoop();
  };

  const generateLevel = (levelNum) => {
    const newPlatforms = [];
    const newObstacles = [];
    const newCoins = [];
    
    // Starting platform
    newPlatforms.push({
      x: 300,
      y: 550,
      width: 200,
      height: PLATFORM_HEIGHT,
      type: 'start'
    });

    // Generate platforms going upward
    for (let i = 1; i <= 20 + levelNum * 5; i++) {
      const y = 550 - (i * (80 + Math.random() * 40));
      const width = Math.max(80, 150 - i * 2); // Platforms get smaller as you go higher
      const x = Math.random() * (CANVAS_WIDTH - width);
      
      newPlatforms.push({
        x,
        y,
        width,
        height: PLATFORM_HEIGHT,
        type: 'normal'
      });

      // Add coins on some platforms
      if (Math.random() < 0.4) {
        newCoins.push({
          x: x + width / 2,
          y: y - 20,
          collected: false,
          value: Math.floor(i / 3) + 1
        });
      }

      // Add obstacles (exponentially more difficult)
      const obstacleChance = Math.min(0.7, 0.1 + (i * 0.03) + (levelNum * 0.05));
      if (Math.random() < obstacleChance && i > 2) {
        // Moving obstacles
        if (Math.random() < 0.6) {
          newObstacles.push({
            x: Math.random() * CANVAS_WIDTH,
            y: y - 60,
            width: 30,
            height: 30,
            type: 'moving',
            vx: (Math.random() - 0.5) * 2,
            direction: Math.random() < 0.5 ? -1 : 1,
            range: 100 + Math.random() * 100,
            startX: 0
          });
        } else {
          // Static spikes
          newObstacles.push({
            x: x + Math.random() * width,
            y: y - 15,
            width: 20,
            height: 15,
            type: 'spike'
          });
        }
      }
    }

    // Set starting positions for moving obstacles
    newObstacles.forEach(obstacle => {
      if (obstacle.type === 'moving') {
        obstacle.startX = obstacle.x;
      }
    });

    setPlatforms(newPlatforms);
    setObstacles(newObstacles);
    setCoinItems(newCoins);
  };

  const startGameLoop = () => {
    const update = () => {
      if (gameState === 'playing') {
        updateGame();
        draw();
      }
      gameLoop.current = requestAnimationFrame(update);
    };
    update();
  };

  const updateGame = () => {
    setPlayer(prevPlayer => {
      if (!prevPlayer.alive) return prevPlayer;

      let newPlayer = { ...prevPlayer };

      // Handle input
      if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
        newPlayer.vx -= 0.2;
      }
      if (keys.current['ArrowRight'] || keys.current['KeyD']) {
        newPlayer.vx += 0.2;
      }
      if ((keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['Space']) && newPlayer.fuel > 0) {
        newPlayer.vy -= THRUST_POWER;
        newPlayer.fuel -= FUEL_CONSUMPTION;
        
        // Add thrust particles
        setParticles(prev => [...prev, {
          x: newPlayer.x,
          y: newPlayer.y + PLAYER_SIZE,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 3 + 1,
          life: 20,
          color: '#ff6b00'
        }]);
      }

      // Apply gravity
      newPlayer.vy += GRAVITY;

      // Limit velocity
      newPlayer.vx = Math.max(-5, Math.min(5, newPlayer.vx));
      newPlayer.vy = Math.max(-8, Math.min(8, newPlayer.vy));

      // Apply friction
      newPlayer.vx *= 0.98;

      // Update position
      newPlayer.x += newPlayer.vx;
      newPlayer.y += newPlayer.vy;

      // Keep player in bounds horizontally
      if (newPlayer.x < 0) {
        newPlayer.x = 0;
        newPlayer.vx = 0;
      }
      if (newPlayer.x > CANVAS_WIDTH - PLAYER_SIZE) {
        newPlayer.x = CANVAS_WIDTH - PLAYER_SIZE;
        newPlayer.vx = 0;
      }

      // Check if player fell off the bottom
      if (newPlayer.y > 600) {
        newPlayer.alive = false;
        setGameState('gameOver');
        return newPlayer;
      }

      return newPlayer;
    });

    // Update camera to follow player
    setCameraY(prevCameraY => {
      const targetY = Math.max(0, player.y - CANVAS_HEIGHT / 2);
      return prevCameraY + (targetY - prevCameraY) * 0.1;
    });

    // Update obstacles
    setObstacles(prevObstacles => {
      return prevObstacles.map(obstacle => {
        if (obstacle.type === 'moving') {
          obstacle.x += obstacle.vx * obstacle.direction;
          
          // Bounce off boundaries or range limits
          if (obstacle.x <= obstacle.startX - obstacle.range || 
              obstacle.x >= obstacle.startX + obstacle.range ||
              obstacle.x <= 0 || 
              obstacle.x >= CANVAS_WIDTH - obstacle.width) {
            obstacle.direction *= -1;
          }
        }
        return obstacle;
      });
    });

    // Update particles
    setParticles(prevParticles => {
      return prevParticles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        return particle.life > 0;
      });
    });

    // Check collisions
    checkCollisions();
  };

  const checkCollisions = () => {
    // Platform collisions
    platforms.forEach(platform => {
      if (player.x < platform.x + platform.width &&
          player.x + PLAYER_SIZE > platform.x &&
          player.y < platform.y + platform.height &&
          player.y + PLAYER_SIZE > platform.y &&
          player.vy > 0) {
        
        setPlayer(prev => ({
          ...prev,
          y: platform.y - PLAYER_SIZE,
          vy: 0,
          fuel: Math.min(100, prev.fuel + 10) // Refuel on landing
        }));

        // Update score based on height
        const heightScore = Math.max(0, Math.floor((550 - platform.y) / 10));
        if (heightScore > score) {
          setScore(heightScore);
          
          // Check for level progression
          if (heightScore > level * 100) {
            setLevel(prev => prev + 1);
            generateLevel(level + 1);
          }
        }
      }
    });

    // Obstacle collisions
    obstacles.forEach(obstacle => {
      if (player.x < obstacle.x + obstacle.width &&
          player.x + PLAYER_SIZE > obstacle.x &&
          player.y < obstacle.y + obstacle.height &&
          player.y + PLAYER_SIZE > obstacle.y) {
        
        setPlayer(prev => ({ ...prev, alive: false }));
        setGameState('gameOver');
      }
    });

    // Coin collisions
    setCoinItems(prevCoins => {
      return prevCoins.map(coin => {
        if (!coin.collected &&
            player.x < coin.x + 15 &&
            player.x + PLAYER_SIZE > coin.x - 15 &&
            player.y < coin.y + 15 &&
            player.y + PLAYER_SIZE > coin.y - 15) {
          
          setCoins(prev => prev + coin.value);
          return { ...coin, collected: true };
        }
        return coin;
      });
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Save context for camera transform
    ctx.save();
    ctx.translate(0, -cameraY);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#000011');
    gradient.addColorStop(1, '#001122');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, cameraY, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    for (let i = 0; i < 100; i++) {
      const x = (i * 37) % CANVAS_WIDTH;
      const y = (i * 73) % 2000;
      if (y >= cameraY - 50 && y <= cameraY + CANVAS_HEIGHT + 50) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Draw platforms
    platforms.forEach(platform => {
      if (platform.y >= cameraY - 50 && platform.y <= cameraY + CANVAS_HEIGHT + 50) {
        ctx.fillStyle = platform.type === 'start' ? '#4ecdc4' : '#666666';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platform glow
        ctx.shadowColor = platform.type === 'start' ? '#4ecdc4' : '#666666';
        ctx.shadowBlur = 10;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.shadowBlur = 0;
      }
    });

    // Draw obstacles
    obstacles.forEach(obstacle => {
      if (obstacle.y >= cameraY - 50 && obstacle.y <= cameraY + CANVAS_HEIGHT + 50) {
        if (obstacle.type === 'moving') {
          ctx.fillStyle = '#ff6b6b';
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else if (obstacle.type === 'spike') {
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
          ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
          ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
          ctx.closePath();
          ctx.fill();
        }
      }
    });

    // Draw coins
    coinItems.forEach(coin => {
      if (!coin.collected && coin.y >= cameraY - 50 && coin.y <= cameraY + CANVAS_HEIGHT + 50) {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin glow
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Draw particles
    particles.forEach(particle => {
      if (particle.y >= cameraY - 50 && particle.y <= cameraY + CANVAS_HEIGHT + 50) {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 20;
        ctx.fillRect(particle.x, particle.y, 3, 3);
        ctx.globalAlpha = 1;
      }
    });

    // Draw player
    if (player.alive) {
      ctx.fillStyle = '#4ecdc4';
      ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
      
      // Player glow
      ctx.shadowColor = '#4ecdc4';
      ctx.shadowBlur = 10;
      ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // Draw UI (not affected by camera)
    drawUI(ctx);
  };

  const drawUI = (ctx) => {
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${score}`, 20, 40);
    
    // Coins
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`💰 ${coins}`, 20, 70);
    
    // Level
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText(`Level: ${level}`, 20, 100);
    
    // Fuel bar
    ctx.fillStyle = '#333333';
    ctx.fillRect(CANVAS_WIDTH - 120, 20, 100, 20);
    ctx.fillStyle = player.fuel > 30 ? '#00ff00' : '#ff0000';
    ctx.fillRect(CANVAS_WIDTH - 120, 20, player.fuel, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText('Fuel', CANVAS_WIDTH - 120, 15);
    
    // Height indicator
    const height = Math.max(0, Math.floor((550 - player.y) / 10));
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.fillText(`Height: ${height}m`, CANVAS_WIDTH - 150, 60);
  };

  const handleKeyDown = useCallback((e) => {
    keys.current[e.code] = true;
    e.preventDefault();
  }, []);

  const handleKeyUp = useCallback((e) => {
    keys.current[e.code] = false;
    e.preventDefault();
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const restartGame = () => {
    setGameState('playing');
    initializeGame();
  };

  return (
    <div className="lunar-launch-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🚀 Lunar Launch</h3>
          <div className="stats">
            <span>Score: {score}</span>
            <span>Coins: {coins}</span>
            <span>Level: {level}</span>
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
              <h2>🚀 Mission Complete!</h2>
              <div className="final-stats">
                <p>Final Score: <strong>{score}</strong></p>
                <p>Coins Collected: <strong>{coins}</strong></p>
                <p>Level Reached: <strong>{level}</strong></p>
                <p>Max Height: <strong>{Math.max(0, Math.floor((550 - player.y) / 10))}m</strong></p>
              </div>
              <div className="game-over-buttons">
                <button onClick={restartGame} className="restart-btn">Launch Again</button>
                <button onClick={onClose} className="exit-btn">Exit</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <div className="controls-section">
          <h4>🎮 Controls</h4>
          <p>🚀 W/↑/Space - Thrust (uses fuel)</p>
          <p>⬅️ A/← - Move Left</p>
          <p>➡️ D/→ - Move Right</p>
        </div>
        <div className="tips-section">
          <h4>💡 Tips</h4>
          <p>🛬 Land on platforms to refuel</p>
          <p>💰 Collect coins for bonus points</p>
          <p>⚠️ Avoid red obstacles</p>
          <p>📈 Higher platforms = more points</p>
        </div>
      </div>
    </div>
  );
};

export default LunarLaunch;

