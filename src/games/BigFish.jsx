import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BigFish.css';

const BigFish = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'gameOver'
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [player, setPlayer] = useState({
    id: 'player',
    x: 400,
    y: 300,
    size: 20,
    color: '#4ecdc4',
    name: 'You',
    score: 0,
    alive: true,
    vx: 0,
    vy: 0
  });
  const [fish, setFish] = useState([]);
  const [food, setFood] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const gameLoop = useRef(null);
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);

  // Game constants
  const MAP_SIZE = 3000;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const FOOD_SIZE = 4;
  const MAX_PLAYERS = 20;
  const SPEED_FACTOR = 0.8;
  const GROWTH_RATE = 0.5;

  // Realistic fish names
  const fishNames = [
    'Nemo', 'Dory', 'Marlin', 'Bruce', 'Gill', 'Bubbles', 'Peach', 'Gurgle',
    'Bloat', 'Jacques', 'Nigel', 'Crush', 'Squirt', 'Pearl', 'Sheldon',
    'Tad', 'Bob', 'Bill', 'Ted', 'Phil', 'Ernie', 'Bernie', 'Lenny',
    'Oscar', 'Angie', 'Lola', 'Sykes', 'Don', 'Lino', 'Frankie',
    'Giuseppe', 'Luca', 'Crazy Joe', 'Ike', 'Vinny', 'Sal', 'Lucky',
    'Shrimp', 'Kelp', 'Coral', 'Sandy', 'Finn', 'Splash', 'Aqua'
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
    // Generate initial food
    const initialFood = [];
    for (let i = 0; i < 300; i++) {
      initialFood.push({
        x: Math.random() * MAP_SIZE,
        y: Math.random() * MAP_SIZE,
        size: FOOD_SIZE,
        color: `hsl(${Math.random() * 60 + 30}, 70%, 60%)`, // Yellow-orange food
        value: 1
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
        return prev + Math.floor(Math.random() * 2) + 1;
      });
    }, 2000);

    return () => {
      clearInterval(waitTimer);
      clearInterval(joinTimer);
    };
  };

  const startGame = () => {
    setGameState('playing');
    
    // Generate AI fish
    const aiFish = [];
    const remainingPlayers = Math.min(MAX_PLAYERS - 1, playerCount - 1);
    
    for (let i = 0; i < remainingPlayers; i++) {
      const x = Math.random() * MAP_SIZE;
      const y = Math.random() * MAP_SIZE;
      const size = 15 + Math.random() * 10; // Random starting sizes
      const hue = Math.random() * 360;
      
      aiFish.push({
        id: `ai_${i}`,
        x,
        y,
        size,
        color: `hsl(${hue}, 70%, 60%)`,
        name: fishNames[i % fishNames.length],
        score: Math.floor(size - 15),
        alive: true,
        vx: 0,
        vy: 0,
        isAI: true,
        targetFood: null,
        targetFish: null,
        changeDirectionTimer: 0
      });
    }
    
    setFish(aiFish);
    startGameLoop();
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
    // Update player
    setPlayer(prevPlayer => {
      if (!prevPlayer.alive) return prevPlayer;

      let newPlayer = { ...prevPlayer };
      
      // Apply velocity
      newPlayer.x += newPlayer.vx;
      newPlayer.y += newPlayer.vy;

      // Apply friction
      newPlayer.vx *= 0.95;
      newPlayer.vy *= 0.95;

      // Keep player in bounds
      newPlayer.x = Math.max(newPlayer.size, Math.min(MAP_SIZE - newPlayer.size, newPlayer.x));
      newPlayer.y = Math.max(newPlayer.size, Math.min(MAP_SIZE - newPlayer.size, newPlayer.y));

      return newPlayer;
    });

    // Update AI fish
    setFish(prevFish => {
      return prevFish.map(fishItem => {
        if (!fishItem.alive || !fishItem.isAI) return fishItem;

        let newFish = { ...fishItem };
        newFish.changeDirectionTimer--;

        // AI behavior
        if (newFish.changeDirectionTimer <= 0) {
          // Find nearest food if small enough
          if (newFish.size < 40) {
            const nearestFood = food.reduce((nearest, f) => {
              const dist = Math.sqrt(Math.pow(f.x - newFish.x, 2) + Math.pow(f.y - newFish.y, 2));
              return !nearest || dist < nearest.distance ? { food: f, distance: dist } : nearest;
            }, null);
            
            if (nearestFood && nearestFood.distance < 150) {
              newFish.targetFood = nearestFood.food;
              newFish.changeDirectionTimer = 60 + Math.random() * 120;
            }
          }

          // Find smaller fish to eat
          const allFish = [player, ...prevFish].filter(f => f.alive && f.id !== newFish.id);
          const smallerFish = allFish.filter(f => f.size < newFish.size * 0.8);
          
          if (smallerFish.length > 0) {
            const nearestPrey = smallerFish.reduce((nearest, f) => {
              const dist = Math.sqrt(Math.pow(f.x - newFish.x, 2) + Math.pow(f.y - newFish.y, 2));
              return !nearest || dist < nearest.distance ? { fish: f, distance: dist } : nearest;
            }, null);
            
            if (nearestPrey && nearestPrey.distance < 200) {
              newFish.targetFish = nearestPrey.fish;
              newFish.changeDirectionTimer = 30 + Math.random() * 60;
            }
          }

          // Avoid larger fish
          const largerFish = allFish.filter(f => f.size > newFish.size * 1.2);
          if (largerFish.length > 0) {
            const nearestThreat = largerFish.reduce((nearest, f) => {
              const dist = Math.sqrt(Math.pow(f.x - newFish.x, 2) + Math.pow(f.y - newFish.y, 2));
              return !nearest || dist < nearest.distance ? { fish: f, distance: dist } : nearest;
            }, null);
            
            if (nearestThreat && nearestThreat.distance < 100) {
              // Run away from larger fish
              const angle = Math.atan2(newFish.y - nearestThreat.fish.y, newFish.x - nearestThreat.fish.x);
              newFish.vx = Math.cos(angle) * 3;
              newFish.vy = Math.sin(angle) * 3;
              newFish.changeDirectionTimer = 60;
            }
          }

          // Random movement if no target
          if (!newFish.targetFood && !newFish.targetFish && newFish.changeDirectionTimer <= 0) {
            const angle = Math.random() * Math.PI * 2;
            newFish.vx = Math.cos(angle) * 1.5;
            newFish.vy = Math.sin(angle) * 1.5;
            newFish.changeDirectionTimer = 120 + Math.random() * 180;
          }
        }

        // Move towards target food
        if (newFish.targetFood) {
          const dx = newFish.targetFood.x - newFish.x;
          const dy = newFish.targetFood.y - newFish.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 5) {
            newFish.vx += (dx / distance) * 0.3;
            newFish.vy += (dy / distance) * 0.3;
          } else {
            newFish.targetFood = null;
          }
        }

        // Move towards target fish
        if (newFish.targetFish && newFish.targetFish.alive) {
          const dx = newFish.targetFish.x - newFish.x;
          const dy = newFish.targetFish.y - newFish.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > newFish.size) {
            newFish.vx += (dx / distance) * 0.4;
            newFish.vy += (dy / distance) * 0.4;
          }
        }

        // Apply movement
        newFish.x += newFish.vx;
        newFish.y += newFish.vy;

        // Apply friction
        newFish.vx *= 0.95;
        newFish.vy *= 0.95;

        // Keep in bounds
        newFish.x = Math.max(newFish.size, Math.min(MAP_SIZE - newFish.size, newFish.x));
        newFish.y = Math.max(newFish.size, Math.min(MAP_SIZE - newFish.size, newFish.y));

        return newFish;
      });
    });

    // Check collisions
    checkCollisions();

    // Update camera to follow player
    setCameraX(player.x - CANVAS_WIDTH / 2);
    setCameraY(player.y - CANVAS_HEIGHT / 2);

    // Check collisions
    checkCollisions();

    // Update leaderboard
    updateLeaderboard();

    // Regenerate food
    if (food.length < 200) {
      setFood(prevFood => [
        ...prevFood,
        ...Array.from({ length: 100 }, () => ({
          x: Math.random() * MAP_SIZE,
          y: Math.random() * MAP_SIZE,
          size: FOOD_SIZE,
          color: `hsl(${Math.random() * 60 + 30}, 70%, 60%)`,
          value: 1
        }))
      ]);
    }
  };

  const checkCollisions = () => {
    // Player food collision
    setFood(prevFood => {
      return prevFood.filter(f => {
        const distance = Math.sqrt(Math.pow(f.x - player.x, 2) + Math.pow(f.y - player.y, 2));
        if (distance < player.size / 2 + f.size && player.alive) {
          setPlayer(prev => ({
            ...prev,
            size: prev.size + 0.5,
            score: prev.score + f.value
          }));
          return false;
        }
        return true;
      });
    });

    // AI fish food collision
    setFish(prevFish => {
      return prevFish.map(fishItem => {
        if (!fishItem.alive) return fishItem;
        
        let newFish = { ...fishItem };
        setFood(prevFood => {
          return prevFood.filter(f => {
            const distance = Math.sqrt(Math.pow(f.x - fishItem.x, 2) + Math.pow(f.y - fishItem.y, 2));
            if (distance < fishItem.size / 2 + f.size) {
              newFish.size += 0.5;
              newFish.score += f.value;
              if (newFish.targetFood === f) {
                newFish.targetFood = null;
              }
              return false;
            }
            return true;
          });
        });
        
        return newFish;
      });
    });

    // Fish eating fish collisions
    const allFish = [player, ...fish].filter(f => f.alive);
    
    allFish.forEach((fish1, i) => {
      allFish.forEach((fish2, j) => {
        if (i !== j && fish1.alive && fish2.alive) {
          const distance = Math.sqrt(
            Math.pow(fish1.x - fish2.x, 2) + Math.pow(fish1.y - fish2.y, 2)
          );
          
          // Check if one fish can eat the other
          if (distance < (fish1.size + fish2.size) / 3) {
            if (fish1.size > fish2.size * 1.2) {
              // fish1 eats fish2
              if (fish1.id === 'player') {
                setPlayer(prev => ({
                  ...prev,
                  size: prev.size + fish2.size * 0.3,
                  score: prev.score + Math.floor(fish2.size)
                }));
              } else {
                setFish(prev => prev.map(f => 
                  f.id === fish1.id ? { 
                    ...f, 
                    size: f.size + fish2.size * 0.3,
                    score: f.score + Math.floor(fish2.size)
                  } : f
                ));
              }
              
              if (fish2.id === 'player') {
                setPlayer(prev => ({ ...prev, alive: false }));
                setGameState('gameOver');
              } else {
                setFish(prev => prev.map(f => 
                  f.id === fish2.id ? { ...f, alive: false } : f
                ));
              }
            }
          }
        }
      });
    });
  };

  const updateLeaderboard = () => {
    const allPlayers = [player, ...fish]
      .filter(f => f.alive)
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
    
    setLeaderboard(allPlayers);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Save context for camera transform
    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // Draw water background
    const gradient = ctx.createRadialGradient(
      player.x, player.y, 0,
      player.x, player.y, 500
    );
    gradient.addColorStop(0, '#4da6ff');
    gradient.addColorStop(1, '#0066cc');
    ctx.fillStyle = gradient;
    ctx.fillRect(cameraX, cameraY, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= MAP_SIZE; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, MAP_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= MAP_SIZE; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(MAP_SIZE, y);
      ctx.stroke();
    }

    // Draw food
    food.forEach(f => {
      if (f.x >= cameraX - 50 && f.x <= cameraX + CANVAS_WIDTH + 50 &&
          f.y >= cameraY - 50 && f.y <= cameraY + CANVAS_HEIGHT + 50) {
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw fish
    const allFish = [player, ...fish].filter(f => f.alive);
    allFish.forEach(fishItem => {
      if (fishItem.x >= cameraX - fishItem.size && fishItem.x <= cameraX + CANVAS_WIDTH + fishItem.size &&
          fishItem.y >= cameraY - fishItem.size && fishItem.y <= cameraY + CANVAS_HEIGHT + fishItem.size) {
        
        // Draw fish body
        ctx.fillStyle = fishItem.color;
        ctx.beginPath();
        ctx.arc(fishItem.x, fishItem.y, fishItem.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw fish tail
        ctx.beginPath();
        ctx.moveTo(fishItem.x - fishItem.size / 2, fishItem.y);
        ctx.lineTo(fishItem.x - fishItem.size, fishItem.y - fishItem.size / 4);
        ctx.lineTo(fishItem.x - fishItem.size, fishItem.y + fishItem.size / 4);
        ctx.closePath();
        ctx.fill();

        // Draw eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(fishItem.x + fishItem.size / 4, fishItem.y - fishItem.size / 6, fishItem.size / 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(fishItem.x + fishItem.size / 4, fishItem.y - fishItem.size / 6, fishItem.size / 16, 0, Math.PI * 2);
        ctx.fill();

        // Draw name
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(12, fishItem.size / 3)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(fishItem.name, fishItem.x, fishItem.y - fishItem.size / 2 - 10);
      }
    });

    ctx.restore();

    // Draw UI
    drawUI(ctx);
  };

  const drawUI = (ctx) => {
    // Score and size
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Size: ${Math.floor(player.size)}`, 20, 30);
    ctx.fillText(`Score: ${player.score}`, 20, 55);
    
    // Alive players count
    const aliveCount = [player, ...fish].filter(f => f.alive).length;
    ctx.fillText(`Players: ${aliveCount}`, 20, 80);

    // Leaderboard
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(CANVAS_WIDTH - 200, 10, 180, Math.min(leaderboard.length * 25 + 40, 300));
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Leaderboard', CANVAS_WIDTH - 190, 30);
    
    ctx.font = '14px Arial';
    leaderboard.slice(0, 10).forEach((fishItem, index) => {
      const y = 50 + index * 20;
      const isPlayer = fishItem.id === 'player';
      ctx.fillStyle = isPlayer ? '#4ecdc4' : '#ffffff';
      ctx.fillText(`${index + 1}. ${fishItem.name}: ${Math.floor(fishItem.size)}`, CANVAS_WIDTH - 190, y);
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (gameState !== 'playing' || !player.alive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const speed = Math.max(1, 5 - player.size * 0.1) * SPEED_FACTOR;
      setPlayer(prev => ({
        ...prev,
        vx: (dx / distance) * speed,
        vy: (dy / distance) * speed
      }));
    }
  }, [gameState, player.alive, player.size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      return () => canvas.removeEventListener('mousemove', handleMouseMove);
    }
  }, [handleMouseMove]);

  const restartGame = () => {
    setGameState('waiting');
    setWaitTime(30);
    setPlayerCount(1);
    setPlayer({
      id: 'player',
      x: 400,
      y: 300,
      size: 20,
      color: '#4ecdc4',
      name: 'You',
      score: 0,
      alive: true,
      vx: 0,
      vy: 0
    });
    setFish([]);
    setCameraX(0);
    setCameraY(0);
    initializeGame();
  };

  return (
    <div className="big-fish-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🐟 Big Fish</h3>
          <div className="stats">
            <span>Size: {Math.floor(player.size)}</span>
            <span>Score: {player.score}</span>
            <span>Players: {playerCount}</span>
          </div>
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        {gameState === 'waiting' && (
          <div className="waiting-screen">
            <h2>🐟 Gathering Fish...</h2>
            <div className="wait-info">
              <p>Players joined: <strong>{playerCount}/20</strong></p>
              <p>Starting in: <strong>{waitTime}s</strong></p>
            </div>
            <div className="game-rules">
              <h3>🎯 How to Play</h3>
              <div className="rules-list">
                <div>🖱️ Move mouse to swim around</div>
                <div>🍎 Eat food pellets to grow</div>
                <div>🐟 Eat smaller fish to grow faster</div>
                <div>⚠️ Avoid bigger fish or be eaten!</div>
                <div>🏆 Become the biggest fish to win</div>
              </div>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="game-canvas"
          />
        )}
        
        {gameState === 'gameOver' && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>🐟 You Were Eaten!</h2>
              <div className="final-stats">
                <p>Final Size: <strong>{Math.floor(player.size)}</strong></p>
                <p>Final Score: <strong>{player.score}</strong></p>
                <p>Final Rank: <strong>#{leaderboard.findIndex(f => f.id === 'player') + 1}</strong></p>
              </div>
              <div className="game-over-buttons">
                <button onClick={restartGame} className="restart-btn">Swim Again</button>
                <button onClick={onClose} className="exit-btn">Exit</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <div className="controls-section">
          <h4>🎮 Controls</h4>
          <p>🖱️ Move mouse to swim</p>
          <p>🍎 Eat food to grow slowly</p>
          <p>🐟 Eat smaller fish to grow fast</p>
        </div>
        <div className="tips-section">
          <h4>💡 Strategy Tips</h4>
          <p>🎯 Start by eating food pellets</p>
          <p>🛡️ Stay away from bigger fish</p>
          <p>🏃 Speed decreases as you grow</p>
          <p>⚡ Hunt smaller fish for quick growth</p>
        </div>
      </div>
    </div>
  );
};

export default BigFish;

