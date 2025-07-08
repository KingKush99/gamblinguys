import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PixelPython.css';

const PixelPython = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('waiting');
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [player, setPlayer] = useState({
    id: 'player',
    x: 10000,
    y: 10000,
    segments: [{ x: 10000, y: 10000 }],
    direction: { x: 1, y: 0 },
    length: 3,
    color: '#4ecdc4',
    name: 'You',
    score: 0,
    alive: true
  });
  const [snakes, setSnakes] = useState([]);
  const [food, setFood] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const gameLoop = useRef(null);
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);
  const [keys, setKeys] = useState({});

  // Game constants
  const MAP_SIZE = 20000;
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;
  const SEGMENT_SIZE = 8;
  const FOOD_SIZE = 6;
  const MAX_PLAYERS = 50;

  const playerNames = [
    'SnakeKing', 'PytonMaster', 'Viper99', 'CobraStrike', 'SlitherPro',
    'NagaWarrior', 'SerpentLord', 'BoaConstrictor', 'RattleSnake', 'Anaconda',
    'PythonHunter', 'ViperVenom', 'CobraCommander', 'SnakeCharmer', 'Sidewinder',
    'BlackMamba', 'GreenTree', 'CopperHead', 'DiamondBack', 'KingCobra',
    'BushViper', 'SeaSnake', 'GarterSnake', 'MilkSnake', 'CornSnake',
    'BallPython', 'RoyalPython', 'ReticPython', 'BurmesePython', 'RockPython',
    'WaterMoccasin', 'Cottonmouth', 'Adder', 'Viper', 'Asp',
    'Krait', 'Taipan', 'DeathAdder', 'TigerSnake', 'BrownSnake',
    'Fer-de-Lance', 'Bushmaster', 'Gaboon', 'Puff', 'Hognose'
  ];

  useEffect(() => {
    initializeGame();
    return () => {
      if (gameLoop.current) {
        cancelAnimationFrame(gameLoop.current);
      }
    };
  }, []);

  const initializeGame = () => {
    // Generate initial food (more food for better visibility)
    const initialFood = [];
    for (let i = 0; i < 3000; i++) {
      initialFood.push({
        x: Math.random() * MAP_SIZE,
        y: Math.random() * MAP_SIZE,
        color: `hsl(${Math.random() * 360}, 80%, 65%)`,
        value: 1,
        size: 4 + Math.random() * 4 // Variable food sizes
      });
    }
    setFood(initialFood);

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
        return prev + Math.floor(Math.random() * 3) + 1;
      });
    }, 2000);

    return () => {
      clearInterval(waitTimer);
      clearInterval(joinTimer);
    };
  };

  const startGame = () => {
    setGameState('playing');
    
    // Create AI snakes
    const aiSnakes = [];
    for (let i = 1; i < playerCount; i++) {
      const x = Math.random() * MAP_SIZE;
      const y = Math.random() * MAP_SIZE;
      aiSnakes.push({
        id: `snake_${i}`,
        x: x,
        y: y,
        segments: [{ x: x, y: y }],
        direction: { 
          x: Math.random() > 0.5 ? 1 : -1, 
          y: Math.random() > 0.5 ? 1 : -1 
        },
        length: 3,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        name: playerNames[Math.floor(Math.random() * playerNames.length)],
        score: 0,
        alive: true,
        isAI: true
      });
    }
    setSnakes(aiSnakes);
    
    // Start game loop
    gameLoop.current = requestAnimationFrame(updateGame);
  };

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    // Update player position
    setPlayer(prevPlayer => {
      if (!prevPlayer.alive) return prevPlayer;
      
      const newX = prevPlayer.x + prevPlayer.direction.x * 2;
      const newY = prevPlayer.y + prevPlayer.direction.y * 2;
      
      // Keep player within bounds
      const boundedX = Math.max(0, Math.min(MAP_SIZE, newX));
      const boundedY = Math.max(0, Math.min(MAP_SIZE, newY));
      
      const newSegments = [{ x: boundedX, y: boundedY }, ...prevPlayer.segments];
      if (newSegments.length > prevPlayer.length) {
        newSegments.pop();
      }
      
      return {
        ...prevPlayer,
        x: boundedX,
        y: boundedY,
        segments: newSegments
      };
    });

    // Update AI snakes
    setSnakes(prevSnakes => {
      return prevSnakes.map(snake => {
        if (!snake.alive) return snake;
        
        // Simple AI movement
        if (Math.random() < 0.1) {
          const directions = [
            { x: 1, y: 0 }, { x: -1, y: 0 },
            { x: 0, y: 1 }, { x: 0, y: -1 }
          ];
          snake.direction = directions[Math.floor(Math.random() * directions.length)];
        }
        
        const newX = snake.x + snake.direction.x * 2;
        const newY = snake.y + snake.direction.y * 2;
        
        // Keep snake within bounds
        const boundedX = Math.max(0, Math.min(MAP_SIZE, newX));
        const boundedY = Math.max(0, Math.min(MAP_SIZE, newY));
        
        const newSegments = [{ x: boundedX, y: boundedY }, ...snake.segments];
        if (newSegments.length > snake.length) {
          newSegments.pop();
        }
        
        return {
          ...snake,
          x: boundedX,
          y: boundedY,
          segments: newSegments
        };
      });
    });

    // Update camera to follow player
    setCameraX(player.x - CANVAS_WIDTH / 2);
    setCameraY(player.y - CANVAS_HEIGHT / 2);

    // Check food collisions
    setFood(prevFood => {
      return prevFood.filter(foodItem => {
        const distance = Math.sqrt(
          Math.pow(player.x - foodItem.x, 2) + Math.pow(player.y - foodItem.y, 2)
        );
        
        if (distance < SEGMENT_SIZE + (foodItem.size || FOOD_SIZE)) {
          // Player ate food
          setPlayer(prev => ({
            ...prev,
            length: prev.length + 1,
            score: prev.score + foodItem.value
          }));
          return false; // Remove food
        }
        return true;
      });
    });

    // Spawn new food randomly (more frequently)
    if (Math.random() < 0.3) {
      setFood(prevFood => [
        ...prevFood,
        {
          x: Math.random() * MAP_SIZE,
          y: Math.random() * MAP_SIZE,
          color: `hsl(${Math.random() * 360}, 80%, 65%)`,
          value: 1,
          size: 4 + Math.random() * 4
        }
      ]);
    }

    // Update leaderboard
    const allPlayers = [player, ...snakes].filter(p => p.alive);
    const sortedPlayers = allPlayers.sort((a, b) => b.score - a.score);
    setLeaderboard(sortedPlayers.slice(0, 10));

    // Continue game loop
    gameLoop.current = requestAnimationFrame(updateGame);
  }, [gameState, player, snakes, food]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameState === 'playing') {
      // Draw hexagonal grid background (more prominent)
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      
      const hexSize = 40;
      const startX = Math.floor(cameraX / hexSize) * hexSize;
      const startY = Math.floor(cameraY / hexSize) * hexSize;
      
      for (let x = startX; x < cameraX + CANVAS_WIDTH + hexSize; x += hexSize) {
        for (let y = startY; y < cameraY + CANVAS_HEIGHT + hexSize; y += hexSize) {
          const screenX = x - cameraX;
          const screenY = y - cameraY;
          
          if (screenX >= -hexSize && screenX <= CANVAS_WIDTH + hexSize &&
              screenY >= -hexSize && screenY <= CANVAS_HEIGHT + hexSize) {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const hexX = screenX + Math.cos(angle) * hexSize / 3;
              const hexY = screenY + Math.sin(angle) * hexSize / 3;
              if (i === 0) ctx.moveTo(hexX, hexY);
              else ctx.lineTo(hexX, hexY);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
      }

      // Draw food with variable sizes
      food.forEach(foodItem => {
        const screenX = foodItem.x - cameraX;
        const screenY = foodItem.y - cameraY;
        const foodSize = foodItem.size || FOOD_SIZE;
        
        if (screenX >= -foodSize && screenX <= CANVAS_WIDTH + foodSize &&
            screenY >= -foodSize && screenY <= CANVAS_HEIGHT + foodSize) {
          ctx.fillStyle = foodItem.color;
          ctx.beginPath();
          ctx.arc(screenX, screenY, foodSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Add glow effect
          ctx.shadowColor = foodItem.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(screenX, screenY, foodSize * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw all snakes with enhanced visuals
      const allSnakes = [player, ...snakes].filter(snake => snake.alive);
      allSnakes.forEach(snake => {
        snake.segments.forEach((segment, index) => {
          const screenX = segment.x - cameraX;
          const screenY = segment.y - cameraY;
          
          if (screenX >= -SEGMENT_SIZE && screenX <= CANVAS_WIDTH + SEGMENT_SIZE &&
              screenY >= -SEGMENT_SIZE && screenY <= CANVAS_HEIGHT + SEGMENT_SIZE) {
            
            // Calculate segment size (head is larger)
            const segmentSize = index === 0 ? SEGMENT_SIZE * 1.2 : SEGMENT_SIZE * (1 - index / snake.segments.length * 0.3);
            
            // Draw segment with gradient
            const alpha = Math.max(0.3, 1 - index / snake.segments.length);
            ctx.fillStyle = index === 0 ? snake.color : 
              `${snake.color}${Math.floor(255 * alpha).toString(16).padStart(2, '0')}`;
            
            // Add border for better visibility
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.arc(screenX, screenY, segmentSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Draw name above head with better styling
            if (index === 0) {
              ctx.fillStyle = '#fff';
              ctx.strokeStyle = '#000';
              ctx.lineWidth = 2;
              ctx.font = 'bold 14px Arial';
              ctx.textAlign = 'center';
              ctx.strokeText(snake.name, screenX, screenY - 20);
              ctx.fillText(snake.name, screenX, screenY - 20);
              
              // Draw score below name
              ctx.font = '12px Arial';
              ctx.fillStyle = '#ffa502';
              ctx.strokeText(`${snake.score}`, screenX, screenY - 5);
              ctx.fillText(`${snake.score}`, screenX, screenY - 5);
            }
          }
        });
      });
    }
  }, [gameState, player, snakes, food, cameraX, cameraY]);

  // Handle mouse movement for player direction
  const handleMouseMove = useCallback((e) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
    
    setPlayer(prev => ({
      ...prev,
      direction: {
        x: Math.cos(angle),
        y: Math.sin(angle)
      }
    }));
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      return () => canvas.removeEventListener('mousemove', handleMouseMove);
    }
  }, [handleMouseMove]);

  if (gameState === 'waiting') {
    return (
      <div className="pixel-python-game">
        <div className="game-header">
          <h2>🐍 Pixel Python Arena</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="waiting-screen">
          <h3>Waiting for Players...</h3>
          <div className="player-count">{playerCount}/{MAX_PLAYERS} players</div>
          <div className="countdown">Starting in {waitTime}s</div>
          <div className="game-info">
            <p>🎯 Eat food to grow your snake</p>
            <p>🏆 Top 5 players win prizes</p>
            <p>🎮 Use mouse to control direction</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pixel-python-game">
      <div className="game-header">
        <div className="game-stats">
          <span>Score: {player.score}</span>
          <span>Length: {player.length}</span>
          <span>Players: {snakes.filter(s => s.alive).length + 1}</span>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="game-canvas"
        />
        
        {/* Leaderboard */}
        <div className="leaderboard">
          <h3>🏆 Leaderboard</h3>
          {leaderboard.map((player, index) => (
            <div key={player.id} className="leaderboard-item">
              <span className="rank">#{index + 1}</span>
              <span className="name">{player.name}</span>
              <span className="score">{player.score}</span>
            </div>
          ))}
        </div>

        {/* Minimap */}
        <div className="minimap">
          <div className="minimap-content">
            <div 
              className="minimap-player"
              style={{
                left: `${(player.x / MAP_SIZE) * 100}%`,
                top: `${(player.y / MAP_SIZE) * 100}%`
              }}
            />
            {snakes.filter(s => s.alive).map(snake => (
              <div
                key={snake.id}
                className="minimap-snake"
                style={{
                  left: `${(snake.x / MAP_SIZE) * 100}%`,
                  top: `${(snake.y / MAP_SIZE) * 100}%`,
                  backgroundColor: snake.color
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="game-controls">
        <p>🖱️ Move your mouse to control your snake</p>
      </div>
    </div>
  );
};

export default PixelPython;

