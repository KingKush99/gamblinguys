import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BlobBets.css';

const BlobBets = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('playing');
  const [score, setScore] = useState(0);
  const [playerBlob, setPlayerBlob] = useState({
    x: 400,
    y: 300,
    size: 20,
    color: '#4ecdc4'
  });
  const [blobs, setBlobs] = useState([]);
  const [food, setFood] = useState([]);
  const mousePos = useRef({ x: 400, y: 300 });
  const gameLoop = useRef(null);
  const [safeZone, setSafeZone] = useState({
    x: 400,
    y: 300,
    radius: 300
  });
  const gameStartTime = useRef(Date.now());

  // Game constants
  const MAP_SIZE = 3000; // Larger map for better gameplay
  const SHRINK_RATE = 0.1; // Slower shrinking
  const MAX_PLAYERS = 50;
  const GAME_DURATION = 8 * 60 * 1000; // 8 minutes

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
    gameStartTime.current = Date.now();
    setSafeZone({
      x: MAP_SIZE / 2,
      y: MAP_SIZE / 2,
      radius: MAP_SIZE / 2
    });

    // Generate AI blobs
    const newBlobs = [];
    for (let i = 0; i < MAX_PLAYERS - 1; i++) {
      newBlobs.push({
        id: i,
        x: Math.random() * MAP_SIZE,
        y: Math.random() * MAP_SIZE,
        size: Math.random() * 20 + 10,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        name: `Player${i + 1}`
      });
    }
    setBlobs(newBlobs);

    // Generate food
    const newFood = [];
    for (let i = 0; i < 200; i++) {
      newFood.push({
        id: i,
        x: Math.random() * MAP_SIZE,
        y: Math.random() * MAP_SIZE,
        size: 3,
        color: `hsl(${Math.random() * 360}, 80%, 70%)`
      });
    }
    setFood(newFood);

    setPlayerBlob({
      x: MAP_SIZE / 2,
      y: MAP_SIZE / 2,
      size: 20,
      color: '#4ecdc4'
    });

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
    const elapsedTime = Date.now() - gameStartTime.current;
    const newRadius = Math.max(100, (MAP_SIZE / 2) - (elapsedTime / 1000) * SHRINK_RATE);
    setSafeZone(prev => ({ ...prev, radius: newRadius }));

    // Update player position
    setPlayerBlob(prev => {
      const canvas = canvasRef.current;
      if (!canvas) return prev;

      const rect = canvas.getBoundingClientRect();
      const targetX = mousePos.current.x - rect.left;
      const targetY = mousePos.current.y - rect.top;

      const viewportCenterX = canvas.width / 2;
      const viewportCenterY = canvas.height / 2;

      const dx = targetX - viewportCenterX;
      const dy = targetY - viewportCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let newX = prev.x;
      let newY = prev.y;

      if (distance > 5) {
        const speed = Math.max(1, 5 - prev.size / 20);
        newX = prev.x + (dx / distance) * speed;
        newY = prev.y + (dy / distance) * speed;
      }

      // Keep player within map bounds
      newX = Math.max(prev.size, Math.min(MAP_SIZE - prev.size, newX));
      newY = Math.max(prev.size, Math.min(MAP_SIZE - prev.size, newY));

      // Check if player is outside safe zone (gradual damage)
      const distFromCenter = Math.sqrt(
        Math.pow(newX - safeZone.x, 2) +
        Math.pow(newY - safeZone.y, 2)
      );

      let newSize = prev.size;
      if (distFromCenter > safeZone.radius) {
        // Gradual damage when outside safe zone
        newSize = Math.max(5, prev.size - 0.1);
        if (newSize <= 5) {
          setGameState('gameOver');
          return prev;
        }
      }

      return { ...prev, x: newX, y: newY, size: newSize };
    });

    // Update AI blobs
    setBlobs(prevBlobs => {
      return prevBlobs.filter(blob => {
        let newX = blob.x + blob.vx;
        let newY = blob.y + blob.vy;

        // Keep within safe zone
        const distFromCenter = Math.sqrt(
          Math.pow(newX - safeZone.x, 2) +
          Math.pow(newY - safeZone.y, 2)
        );

        if (distFromCenter > safeZone.radius) {
          // AI blobs also take damage outside safe zone
          blob.size = Math.max(5, blob.size - 0.1);
          if (blob.size <= 5) {
            return false; // Remove blob if too small
          }
          // Move towards center when outside safe zone
          const angle = Math.atan2(safeZone.y - newY, safeZone.x - newX);
          blob.vx = Math.cos(angle) * 1;
          blob.vy = Math.sin(angle) * 1;
        } else {
          // Random movement changes when inside safe zone
          if (Math.random() < 0.02) {
            blob.vx += (Math.random() - 0.5) * 0.5;
            blob.vy += (Math.random() - 0.5) * 0.5;
          }
        }

        // Limit velocity
        const maxSpeed = Math.max(0.5, 2 - blob.size / 30);
        const speed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
        if (speed > maxSpeed) {
          blob.vx = (blob.vx / speed) * maxSpeed;
          blob.vy = (blob.vy / speed) * maxSpeed;
        }

        // Keep within map bounds
        newX = Math.max(blob.size, Math.min(MAP_SIZE - blob.size, newX + blob.vx));
        newY = Math.max(blob.size, Math.min(MAP_SIZE - blob.size, newY + blob.vy));

        return { ...blob, x: newX, y: newY };
      });
    });

    // Check collisions
    checkCollisions();

    // Check win condition
    if (blobs.length === 0 && gameState === 'playing') {
      setGameState('win');
    }
  };

  const checkCollisions = () => {
    setPlayerBlob(prevPlayer => {
      let newPlayer = { ...prevPlayer };
      let newScore = score;

      // Check food collisions
      setFood(prevFood => {
        const remainingFood = prevFood.filter(foodItem => {
          const dx = foodItem.x - newPlayer.x;
          const dy = foodItem.y - newPlayer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < newPlayer.size / 2 + foodItem.size) {
            newPlayer.size += 0.3;
            newScore += 5;
            setScore(newScore);
            return false;
          }
          return true;
        });

        // Regenerate food if too few
        if (remainingFood.length < 100) {
          const newFood = [];
          for (let i = 0; i < 50; i++) {
            newFood.push({
              id: Date.now() + i,
              x: Math.random() * MAP_SIZE,
              y: Math.random() * MAP_SIZE,
              size: 3,
              color: `hsl(${Math.random() * 360}, 80%, 70%)`
            });
          }
          return [...remainingFood, ...newFood];
        }
        return remainingFood;
      });

      // Check blob collisions
      setBlobs(prevBlobs => {
        return prevBlobs.filter(blob => {
          const dx = blob.x - newPlayer.x;
          const dy = blob.y - newPlayer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < (newPlayer.size + blob.size) / 2.5) {
            if (newPlayer.size > blob.size * 1.1) {
              // Player eats blob
              newPlayer.size += blob.size * 0.2;
              newScore += Math.round(blob.size * 3);
              setScore(newScore);
              return false;
            } else if (blob.size > newPlayer.size * 1.1) {
              // Blob eats player
              setGameState('gameOver');
              return true;
            }
          }
          return true;
        });
      });

      return newPlayer;
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate zoom and offset
    const zoom = Math.min(1, 400 / playerBlob.size);
    const offsetX = canvas.width / 2 - playerBlob.x * zoom;
    const offsetY = canvas.height / 2 - playerBlob.y * zoom;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(zoom, zoom);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= MAP_SIZE; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, MAP_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= MAP_SIZE; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(MAP_SIZE, y);
      ctx.stroke();
    }

    // Draw safe zone
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(safeZone.x, safeZone.y, safeZone.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw food
    food.forEach(foodItem => {
      ctx.fillStyle = foodItem.color;
      ctx.beginPath();
      ctx.arc(foodItem.x, foodItem.y, foodItem.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw AI blobs
    blobs.forEach(blob => {
      ctx.fillStyle = blob.color;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw name
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.max(8, blob.size / 3)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(blob.name, blob.x, blob.y + 3);
    });

    // Draw player blob
    ctx.fillStyle = playerBlob.color;
    ctx.beginPath();
    ctx.arc(playerBlob.x, playerBlob.y, playerBlob.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw player name
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.max(10, playerBlob.size / 3)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('You', playerBlob.x, playerBlob.y + 3);

    ctx.restore();
  };

  const handleMouseMove = useCallback((e) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleSplit = useCallback((e) => {
    if (e.code === 'Space' && playerBlob.size > 30) {
      setPlayerBlob(prev => ({
        ...prev,
        size: prev.size * 0.7 // More significant split
      }));
      // Add visual feedback for split
      setScore(prevScore => prevScore + 20);
    }
  }, [playerBlob.size]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleSplit);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleSplit);
    };
  }, [handleMouseMove, handleSplit]);

  const restartGame = () => {
    setGameState('playing');
    setScore(0);
    initializeGame();
  };

  return (
    <div className="blob-bets-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🟢 Blob Bets</h3>
          <div className="score">Score: {score}</div>
          <div className="size">Size: {Math.round(playerBlob.size)}</div>
          <div className="players">Players: {blobs.length + 1}</div>
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="game-canvas"
        />
        
        {gameState === 'gameOver' && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>Game Over!</h2>
              <p>Final Score: {score}</p>
              <p>Final Size: {Math.round(playerBlob.size)}</p>
              <div className="game-over-buttons">
                <button onClick={restartGame} className="restart-btn">Play Again</button>
                <button onClick={onClose} className="exit-btn">Exit</button>
              </div>
            </div>
          </div>
        )}
        
        {gameState === 'win' && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>Victory Royale!</h2>
              <p>You are the last blob standing!</p>
              <p>Final Score: {score}</p>
              <p>Final Size: {Math.round(playerBlob.size)}</p>
              <div className="game-over-buttons">
                <button onClick={restartGame} className="restart-btn">Play Again</button>
                <button onClick={onClose} className="exit-btn">Exit</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <p>🖱️ Move mouse to control your blob</p>
        <p>⌨️ Press SPACEBAR to split (requires size &gt; 30)</p>
        <p>🎯 Eat smaller blobs and food to grow bigger!</p>
        <p>⚠️ Stay inside the red circle or lose mass!</p>
        <p>🏆 Be the last blob standing to win!</p>
      </div>
    </div>
  );
};

export default BlobBets;

