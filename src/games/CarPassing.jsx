import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CarPassing.css';

const CarPassing = ({ onClose }) => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const lastClickTimeRef = useRef(Date.now());
  const clickCountRef = useRef(0);
  const lastMinuteRef = useRef(Date.now());
  
  // Game state
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, paused
  const [playerData, setPlayerData] = useState({
    id: 'player1',
    name: 'You',
    speed: 10, // km/h
    position: { x: 250, y: 400, lane: 2 }, // lane 0-5
    passes: 0,
    distance: 0,
    score: 0,
    color: '#ff4444',
    isPlayer: true
  });
  
  const [otherCars, setOtherCars] = useState([]);
  const [gameStats, setGameStats] = useState({
    totalPasses: 0,
    totalDistance: 0,
    currentSpeed: 10,
    clicksPerMinute: 0,
    leaderboard: []
  });
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [isParked, setIsParked] = useState(false);

  // Initialize game
  useEffect(() => {
    initializeGame();
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  const initializeGame = () => {
    // Generate AI cars
    const aiCars = [];
    const carNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn', 'Blake', 'Cameron'];
    const carColors = ['#4444ff', '#44ff44', '#ffff44', '#ff44ff', '#44ffff', '#ff8844', '#8844ff', '#44ff88'];
    
    for (let i = 0; i < 20; i++) {
      aiCars.push({
        id: `ai_${i}`,
        name: carNames[i % carNames.length] + (i > 9 ? Math.floor(i/10) : ''),
        speed: 8 + Math.random() * 15, // 8-23 km/h
        position: { 
          x: Math.random() * 500, 
          y: Math.random() * 600 + 100, 
          lane: Math.floor(Math.random() * 6) 
        },
        passes: Math.floor(Math.random() * 50),
        distance: Math.random() * 1000,
        score: 0,
        color: carColors[i % carColors.length],
        isPlayer: false,
        aiDirection: Math.random() > 0.5 ? 1 : -1,
        aiTimer: Math.random() * 5000
      });
    }
    
    setOtherCars(aiCars);
    setGameState('playing');
    startGameLoop();
  };

  const startGameLoop = () => {
    const gameLoop = () => {
      updateGame();
      renderGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoop();
  };

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    const now = Date.now();
    const deltaTime = 16; // ~60fps

    // Update player speed based on clicks per minute
    const timeSinceLastMinute = now - lastMinuteRef.current;
    if (timeSinceLastMinute >= 60000) { // 1 minute
      const clicksThisMinute = clickCountRef.current;
      const baseSpeed = 10;
      const speedIncrease = Math.max(0, clicksThisMinute - 10) * 0.1;
      const newSpeed = baseSpeed + speedIncrease;
      
      setPlayerData(prev => ({ ...prev, speed: newSpeed }));
      setGameStats(prev => ({ ...prev, currentSpeed: newSpeed, clicksPerMinute: clicksThisMinute }));
      
      clickCountRef.current = 0;
      lastMinuteRef.current = now;
    }

    // Update player position
    setPlayerData(prev => {
      const newDistance = prev.distance + (prev.speed * deltaTime / 1000 / 3.6); // Convert km/h to m/s
      const newY = prev.position.y - (prev.speed * deltaTime / 100); // Visual movement
      
      return {
        ...prev,
        distance: newDistance,
        position: { ...prev.position, y: newY < 0 ? 600 : newY }
      };
    });

    // Update AI cars
    setOtherCars(prev => prev.map(car => {
      const newDistance = car.distance + (car.speed * deltaTime / 1000 / 3.6);
      let newY = car.position.y - (car.speed * deltaTime / 100);
      
      // AI behavior - random lane changes and speed adjustments
      car.aiTimer -= deltaTime;
      if (car.aiTimer <= 0) {
        car.speed = Math.max(5, Math.min(25, car.speed + (Math.random() - 0.5) * 2));
        if (Math.random() < 0.3) { // 30% chance to change lane
          car.position.lane = Math.max(0, Math.min(5, car.position.lane + (Math.random() > 0.5 ? 1 : -1)));
          car.position.x = 50 + car.position.lane * 75;
        }
        car.aiTimer = 2000 + Math.random() * 3000;
      }
      
      if (newY < 0) newY = 600;
      if (newY > 600) newY = 0;
      
      return {
        ...car,
        distance: newDistance,
        position: { ...car.position, y: newY }
      };
    }));

    // Check for passes
    checkPasses();
  }, [gameState]);

  const checkPasses = () => {
    setPlayerData(prevPlayer => {
      let newPasses = prevPlayer.passes;
      
      otherCars.forEach(car => {
        const playerY = prevPlayer.position.y;
        const carY = car.position.y;
        const playerLane = prevPlayer.position.lane;
        const carLane = car.position.lane;
        
        // Check if cars are in adjacent lanes and player is passing
        if (Math.abs(playerLane - carLane) <= 1 && Math.abs(playerY - carY) < 50) {
          if (prevPlayer.speed > car.speed && playerY < carY) {
            newPasses += 1;
          } else if (car.speed > prevPlayer.speed && carY < playerY) {
            newPasses -= 1;
          }
        }
      });
      
      const newScore = newPasses * prevPlayer.distance;
      
      return {
        ...prevPlayer,
        passes: Math.max(0, newPasses),
        score: newScore
      };
    });
  };

  const renderGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, width, height);
    
    // Draw highway lanes
    ctx.fillStyle = '#444';
    ctx.fillRect(25, 0, 500, height);
    
    // Draw lane dividers
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    for (let i = 1; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(25 + i * 83.33, 0);
      ctx.lineTo(25 + i * 83.33, height);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    
    // Draw side barriers
    ctx.fillStyle = '#666';
    ctx.fillRect(0, 0, 25, height);
    ctx.fillRect(525, 0, 25, height);
    
    // Draw other cars (semi-transparent)
    otherCars.forEach(car => {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = car.color;
      ctx.fillRect(car.position.x - 15, car.position.y - 25, 30, 50);
      ctx.globalAlpha = 1.0;
      
      // Car details
      ctx.fillStyle = '#000';
      ctx.fillRect(car.position.x - 12, car.position.y - 20, 24, 8);
      ctx.fillRect(car.position.x - 12, car.position.y + 12, 24, 8);
    });
    
    // Draw player car (fully opaque)
    ctx.fillStyle = playerData.color;
    ctx.fillRect(playerData.position.x - 15, playerData.position.y - 25, 30, 50);
    
    // Player car details
    ctx.fillStyle = '#000';
    ctx.fillRect(playerData.position.x - 12, playerData.position.y - 20, 24, 8);
    ctx.fillRect(playerData.position.x - 12, playerData.position.y + 12, 24, 8);
    
    // Draw player indicator
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(playerData.position.x, playerData.position.y - 35, 5, 0, Math.PI * 2);
    ctx.fill();
  }, [playerData, otherCars]);

  const handleCarClick = () => {
    if (gameState !== 'playing') return;
    
    clickCountRef.current += 1;
    lastClickTimeRef.current = Date.now();
    
    // Immediate small speed boost for feedback
    setPlayerData(prev => ({
      ...prev,
      speed: prev.speed + 0.01
    }));
  };

  const handleLaneChange = (direction) => {
    if (gameState !== 'playing') return;
    
    setPlayerData(prev => {
      const newLane = Math.max(0, Math.min(5, prev.position.lane + direction));
      return {
        ...prev,
        position: {
          ...prev.position,
          lane: newLane,
          x: 50 + newLane * 75
        }
      };
    });
  };

  const togglePark = () => {
    if (isParked) {
      setGameState('playing');
      setIsParked(false);
      startGameLoop();
    } else {
      setGameState('paused');
      setIsParked(true);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }
  };

  return (
    <div className="car-passing-game">
      <div className="game-header">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>🚗 Car Passing</h2>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Speed:</span>
            <span className="stat-value">{playerData.speed.toFixed(1)} km/h</span>
          </div>
          <div className="stat">
            <span className="stat-label">Passes:</span>
            <span className="stat-value">{playerData.passes}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Distance:</span>
            <span className="stat-value">{(playerData.distance / 1000).toFixed(2)} km</span>
          </div>
          <div className="stat">
            <span className="stat-label">Score:</span>
            <span className="stat-value">{Math.floor(playerData.score)}</span>
          </div>
        </div>
      </div>

      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={550}
          height={600}
          className="game-canvas"
          onClick={handleCarClick}
        />
        
        <div className="game-controls">
          <div className="lane-controls">
            <button 
              className="lane-btn" 
              onClick={() => handleLaneChange(-1)}
              disabled={playerData.position.lane === 0}
            >
              ← Left Lane
            </button>
            <button 
              className="lane-btn" 
              onClick={() => handleLaneChange(1)}
              disabled={playerData.position.lane === 5}
            >
              Right Lane →
            </button>
          </div>
          
          <div className="action-controls">
            <button className="park-btn" onClick={togglePark}>
              {isParked ? '🚗 Resume' : '🅿️ Park'}
            </button>
            <div className="click-info">
              <p>Click your car to accelerate!</p>
              <p>10+ clicks/min = speed boost</p>
              <p>Clicks/min: {gameStats.clicksPerMinute}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="game-info">
        <div className="rules">
          <h3>How to Play:</h3>
          <ul>
            <li>Click your car to accelerate (10+ clicks/min for speed boost)</li>
            <li>Use lane buttons to change lanes</li>
            <li>Pass other cars: +1 point per pass</li>
            <li>Getting passed: -1 point</li>
            <li>Final score = Passes × Distance traveled</li>
            <li>Top 10 players get paid out!</li>
            <li>Park your car to save progress when leaving</li>
          </ul>
        </div>
        
        <div className="leaderboard">
          <h3>Top 10 Leaderboard:</h3>
          <div className="leaderboard-list">
            {gameStats.leaderboard.slice(0, 10).map((player, index) => (
              <div key={player.id} className="leaderboard-item">
                <span className="rank">#{index + 1}</span>
                <span className="name">{player.name}</span>
                <span className="score">{Math.floor(player.score)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarPassing;

