import React, { useState, useEffect, useRef, useCallback } from 'react';
import './GetOnTop.css';

const GetOnTop = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('playing');
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [players, setPlayers] = useState({
    player1: {
      x: 200,
      y: 300,
      vx: 0,
      vy: 0,
      angle: 0,
      color: '#FF8C00', // Orange like in the image
      name: 'Player 1',
      headX: 200,
      headY: 280,
      bodyParts: []
    },
    player2: {
      x: 600,
      y: 300,
      vx: 0,
      vy: 0,
      angle: 0,
      color: '#4169E1', // Blue like in the image
      name: 'Player 2',
      headX: 600,
      headY: 280,
      bodyParts: []
    }
  });
  const [keys, setKeys] = useState({});
  const gameLoop = useRef(null);
  const [round, setRound] = useState(1);
  const [winner, setWinner] = useState(null);

  // Game constants
  const GRAVITY = 0.3;
  const FRICTION = 0.95;
  const GROUND_Y = 400;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

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
    // Reset players to starting positions like in wrestling
    setPlayers({
      player1: {
        x: 300,
        y: GROUND_Y - 50,
        vx: 0,
        vy: 0,
        angle: 0,
        color: '#FF8C00',
        name: 'Player 1',
        headX: 300,
        headY: GROUND_Y - 70,
        bodyParts: [
          { x: 300, y: GROUND_Y - 50, type: 'torso' },
          { x: 280, y: GROUND_Y - 30, type: 'leftArm' },
          { x: 320, y: GROUND_Y - 30, type: 'rightArm' },
          { x: 290, y: GROUND_Y - 10, type: 'leftLeg' },
          { x: 310, y: GROUND_Y - 10, type: 'rightLeg' }
        ]
      },
      player2: {
        x: 500,
        y: GROUND_Y - 50,
        vx: 0,
        vy: 0,
        angle: 0,
        color: '#4169E1',
        name: 'Player 2',
        headX: 500,
        headY: GROUND_Y - 70,
        bodyParts: [
          { x: 500, y: GROUND_Y - 50, type: 'torso' },
          { x: 480, y: GROUND_Y - 30, type: 'leftArm' },
          { x: 520, y: GROUND_Y - 30, type: 'rightArm' },
          { x: 490, y: GROUND_Y - 10, type: 'leftLeg' },
          { x: 510, y: GROUND_Y - 10, type: 'rightLeg' }
        ]
      }
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
    setPlayers(prevPlayers => {
      const newPlayers = { ...prevPlayers };

      // Update both players
      ['player1', 'player2'].forEach(playerKey => {
        const player = newPlayers[playerKey];
        
        // Apply controls
        if (playerKey === 'player1') {
          // Player 1 controls: A/D for movement, W for jump
          if (keys['KeyA']) player.vx -= 0.5;
          if (keys['KeyD']) player.vx += 0.5;
          if (keys['KeyW'] && Math.abs(player.vy) < 0.1) player.vy = -8;
        } else {
          // Player 2 controls: Arrow keys
          if (keys['ArrowLeft']) player.vx -= 0.5;
          if (keys['ArrowRight']) player.vx += 0.5;
          if (keys['ArrowUp'] && Math.abs(player.vy) < 0.1) player.vy = -8;
        }

        // Apply physics
        player.vy += GRAVITY;
        player.vx *= FRICTION;

        // Update position
        player.x += player.vx;
        player.y += player.vy;

        // Ground collision
        if (player.y > GROUND_Y - 20) {
          player.y = GROUND_Y - 20;
          player.vy = 0;
        }

        // Wall collision
        if (player.x < 20) {
          player.x = 20;
          player.vx = 0;
        }
        if (player.x > CANVAS_WIDTH - 20) {
          player.x = CANVAS_WIDTH - 20;
          player.vx = 0;
        }

        // Update head position
        player.headX = player.x;
        player.headY = player.y - 20;

        // Update body parts with physics
        player.bodyParts = player.bodyParts.map((part, index) => {
          const targetX = player.x + (index % 2 === 0 ? 0 : (index % 4 === 1 ? -20 : 20));
          const targetY = player.y + (index * 5);
          
          return {
            ...part,
            x: part.x + (targetX - part.x) * 0.1,
            y: part.y + (targetY - part.y) * 0.1
          };
        });
      });

      // Check collision between players
      const p1 = newPlayers.player1;
      const p2 = newPlayers.player2;
      const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

      if (distance < 40) {
        // Physics collision
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const force = 2;
        
        p1.vx -= Math.cos(angle) * force;
        p1.vy -= Math.sin(angle) * force;
        p2.vx += Math.cos(angle) * force;
        p2.vy += Math.sin(angle) * force;
      }

      // Check win condition (head touches ground)
      if (p1.headY >= GROUND_Y - 5) {
        setScore(prev => ({ ...prev, player2: prev.player2 + 1 }));
        setWinner('Player 2');
        setGameState('roundOver');
      } else if (p2.headY >= GROUND_Y - 5) {
        setScore(prev => ({ ...prev, player1: prev.player1 + 1 }));
        setWinner('Player 1');
        setGameState('roundOver');
      }

      return newPlayers;
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

    // Draw ground
    ctx.fillStyle = '#8B4513'; // Brown ground
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Draw players
    ['player1', 'player2'].forEach(playerKey => {
      const player = players[playerKey];
      
      // Draw body parts
      ctx.fillStyle = player.color;
      player.bodyParts.forEach(part => {
        ctx.beginPath();
        ctx.arc(part.x, part.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw main body
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Draw head
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(player.headX, player.headY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Draw eyes
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(player.headX - 4, player.headY - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(player.headX + 4, player.headY - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw score
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${score.player1} - ${score.player2}`, CANVAS_WIDTH / 2, 40);

    // Draw round
    ctx.font = '16px Arial';
    ctx.fillText(`Round ${round}`, CANVAS_WIDTH / 2, 60);
  };

  const handleKeyDown = useCallback((e) => {
    setKeys(prev => ({ ...prev, [e.code]: true }));
  }, []);

  const handleKeyUp = useCallback((e) => {
    setKeys(prev => ({ ...prev, [e.code]: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const nextRound = () => {
    setRound(prev => prev + 1);
    setGameState('playing');
    setWinner(null);
    initializeGame();
  };

  const restartGame = () => {
    setScore({ player1: 0, player2: 0 });
    setRound(1);
    setGameState('playing');
    setWinner(null);
    initializeGame();
  };

  return (
    <div className="get-on-top-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🤼 Get On Top</h3>
          <div className="score-display">
            <span className="player1-score" style={{color: '#FF8C00'}}>Player 1: {score.player1}</span>
            <span className="vs">VS</span>
            <span className="player2-score" style={{color: '#4169E1'}}>Player 2: {score.player2}</span>
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
        
        {gameState === 'roundOver' && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>{winner} Wins the Round!</h2>
              <p>Score: {score.player1} - {score.player2}</p>
              <div className="game-over-buttons">
                {Math.max(score.player1, score.player2) >= 3 ? (
                  <>
                    <h3>{score.player1 > score.player2 ? 'Player 1' : 'Player 2'} Wins the Match!</h3>
                    <button onClick={restartGame} className="restart-btn">New Game</button>
                  </>
                ) : (
                  <button onClick={nextRound} className="restart-btn">Next Round</button>
                )}
                <button onClick={onClose} className="exit-btn">Exit</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <div className="controls-section">
          <h4 style={{color: '#FF8C00'}}>Player 1 (Orange)</h4>
          <p>🎮 A/D - Move Left/Right</p>
          <p>🎮 W - Jump</p>
        </div>
        <div className="controls-section">
          <h4 style={{color: '#4169E1'}}>Player 2 (Blue)</h4>
          <p>🎮 ←/→ - Move Left/Right</p>
          <p>🎮 ↑ - Jump</p>
        </div>
        <p className="objective">🏆 Get your opponent's head to touch the ground to win!</p>
      </div>
    </div>
  );
};

export default GetOnTop;

