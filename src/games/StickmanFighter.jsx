import React, { useState, useEffect, useRef, useCallback } from 'react';
import './StickmanFighter.css';

const StickmanFighter = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'gameOver'
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState([]);
  const [weapons, setWeapons] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState({});
  const [keys, setKeys] = useState({});
  const gameLoop = useRef(null);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PLAYER_SIZE = 20;
  const JUMP_STRENGTH = 8;
  const MOVE_SPEED = 3;
  const GRAVITY = 0.3;
  const MAX_PLAYERS = 4;
  const WIN_ROUNDS = 5;

  // Player names for AI
  const playerNames = [
    'StickSlayer', 'FistFury', 'ShadowStrike', 'BladeMaster', 'KickKing',
    'PunchPro', 'ArenaAce', 'CombatantX', 'WarriorSoul', 'FightMachine'
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
    }, 3000);

    return () => {
      clearInterval(waitTimer);
      clearInterval(joinTimer);
    };
  };

  const startGame = () => {
    setGameState('playing');
    setRound(1);
    setScore({});
    resetRound();
  };

  const resetRound = () => {
    const initialPlayers = [];
    const colors = ['red', 'blue', 'green', 'purple'];
    const startPositions = [
      { x: 100, y: CANVAS_HEIGHT - 50 },
      { x: CANVAS_WIDTH - 100, y: CANVAS_HEIGHT - 50 },
      { x: 100, y: 100 },
      { x: CANVAS_WIDTH - 100, y: 100 }
    ];

    for (let i = 0; i < MAX_PLAYERS; i++) {
      initialPlayers.push({
        id: `player_${i}`,
        x: startPositions[i].x,
        y: startPositions[i].y,
        vx: 0,
        vy: 0,
        color: colors[i],
        name: playerNames[i % playerNames.length],
        alive: true,
        hasWeapon: null,
        isAI: i >= playerCount // Mark as AI if not real player
      });
      setScore(prev => ({ ...prev, [`player_${i}`]: 0 }));
    }
    setPlayers(initialPlayers);
    setWeapons([]);
    setHazards([]);
    generateHazards();
    generateWeapons();
  };

  const generateHazards = () => {
    const newHazards = [];
    // Example hazards: spikes, electric floors
    if (Math.random() < 0.5) {
      newHazards.push({ type: 'spikes', x: 200, y: CANVAS_HEIGHT - 20, width: 50, height: 20 });
    }
    if (Math.random() < 0.5) {
      newHazards.push({ type: 'electric', x: 400, y: CANVAS_HEIGHT - 20, width: 100, height: 20 });
    }
    setHazards(newHazards);
  };

  const generateWeapons = () => {
    const newWeapons = [];
    const weaponTypes = ['sword', 'gun', 'staff'];
    for (let i = 0; i < 2; i++) {
      newWeapons.push({
        type: weaponTypes[Math.floor(Math.random() * weaponTypes.length)],
        x: Math.random() * (CANVAS_WIDTH - 50) + 25,
        y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
        size: 10
      });
    }
    setWeapons(newWeapons);
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
        if (!player.alive) return player;

        let newPlayer = { ...player };

        // AI behavior
        if (newPlayer.isAI) {
          // Simple AI: move towards nearest opponent or weapon
          const aliveOpponents = prevPlayers.filter(p => p.alive && p.id !== newPlayer.id);
          if (aliveOpponents.length > 0) {
            const nearestOpponent = aliveOpponents.reduce((nearest, o) => {
              const dist = Math.sqrt(Math.pow(o.x - newPlayer.x, 2) + Math.pow(o.y - newPlayer.y, 2));
              return !nearest || dist < nearest.distance ? { opponent: o, distance: dist } : nearest;
            }, null);

            if (nearestOpponent) {
              if (nearestOpponent.distance > 50) {
                newPlayer.vx = (nearestOpponent.opponent.x > newPlayer.x ? 1 : -1) * MOVE_SPEED;
              } else {
                // Attack
                if (Math.random() < 0.05) {
                  // Simulate punch/kick
                }
              }
            }
          } else if (weapons.length > 0 && !newPlayer.hasWeapon) {
            const nearestWeapon = weapons.reduce((nearest, w) => {
              const dist = Math.sqrt(Math.pow(w.x - newPlayer.x, 2) + Math.pow(w.y - newPlayer.y, 2));
              return !nearest || dist < nearest.distance ? { weapon: w, distance: dist } : nearest;
            }, null);
            if (nearestWeapon) {
              newPlayer.vx = (nearestWeapon.weapon.x > newPlayer.x ? 1 : -1) * MOVE_SPEED;
            }
          }
        }

        // Apply gravity
        newPlayer.vy += GRAVITY;

        // Apply movement
        newPlayer.x += newPlayer.vx;
        newPlayer.y += newPlayer.vy;

        // Ground collision
        if (newPlayer.y + PLAYER_SIZE > CANVAS_HEIGHT) {
          newPlayer.y = CANVAS_HEIGHT - PLAYER_SIZE;
          newPlayer.vy = 0;
        }

        // Wall collision
        if (newPlayer.x < 0) newPlayer.x = 0;
        if (newPlayer.x + PLAYER_SIZE > CANVAS_WIDTH) newPlayer.x = CANVAS_WIDTH - PLAYER_SIZE;

        // Hazard collision
        hazards.forEach(hazard => {
          if (
            newPlayer.x < hazard.x + hazard.width &&
            newPlayer.x + PLAYER_SIZE > hazard.x &&
            newPlayer.y < hazard.y + hazard.height &&
            newPlayer.y + PLAYER_SIZE > hazard.y
          ) {
            newPlayer.alive = false; // Player eliminated by hazard
          }
        });

        // Weapon pickup
        setWeapons(prevWeapons => {
          return prevWeapons.filter(weapon => {
            if (
              newPlayer.x < weapon.x + weapon.size &&
              newPlayer.x + PLAYER_SIZE > weapon.x &&
              newPlayer.y < weapon.y + weapon.size &&
              newPlayer.y + PLAYER_SIZE > weapon.y &&
              !newPlayer.hasWeapon
            ) {
              newPlayer.hasWeapon = weapon.type;
              return false; // Remove weapon from ground
            }
            return true;
          });
        });

        return newPlayer;
      });
    });

    // Check for round end
    const alivePlayers = players.filter(p => p.alive);
    if (alivePlayers.length <= 1 && gameState === 'playing') {
      if (alivePlayers.length === 1) {
        const roundWinnerId = alivePlayers[0].id;
        setScore(prev => ({ ...prev, [roundWinnerId]: (prev[roundWinnerId] || 0) + 1 }));
        if ((score[roundWinnerId] || 0) + 1 >= WIN_ROUNDS) {
          setGameState('gameOver');
        } else {
          setRound(prev => prev + 1);
          resetRound();
        }
      } else {
        // No one left, draw
        setRound(prev => prev + 1);
        resetRound();
      }
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    ctx.fillStyle = '#87CEEB'; // Sky blue background
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#333';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    if (gameState === 'waiting') {
      // Draw waiting screen content
      ctx.fillStyle = 'white';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🥊 Stickman Fighter Arena', CANVAS_WIDTH / 2, 100);
      
      ctx.font = '20px Arial';
      ctx.fillText(`Players joined: ${playerCount}/${MAX_PLAYERS}`, CANVAS_WIDTH / 2, 150);
      
      if (waitTime > 3) {
        ctx.fillText(`Game starts in: ${waitTime} seconds`, CANVAS_WIDTH / 2, 200);
      }
      
      // Draw arena preview
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 250, CANVAS_WIDTH - 100, CANVAS_HEIGHT - 300);
      
      ctx.fillStyle = '#999';
      ctx.font = '16px Arial';
      ctx.fillText('Arena Preview', CANVAS_WIDTH / 2, 280);
      
      ctx.textAlign = 'left';
    } else {
      // Draw hazards
      hazards.forEach(hazard => {
        if (hazard.type === 'spikes') {
          ctx.fillStyle = 'gray';
          ctx.beginPath();
          ctx.moveTo(hazard.x, hazard.y + hazard.height);
          ctx.lineTo(hazard.x + hazard.width / 2, hazard.y);
          ctx.lineTo(hazard.x + hazard.width, hazard.y + hazard.height);
          ctx.fill();
        } else if (hazard.type === 'electric') {
          ctx.fillStyle = 'yellow';
          ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
        }
      });

      // Draw weapons
      weapons.forEach(weapon => {
        ctx.fillStyle = 'brown';
        ctx.fillRect(weapon.x, weapon.y, weapon.size, weapon.size);
        ctx.fillStyle = 'white';
        ctx.fillText(weapon.type[0].toUpperCase(), weapon.x + weapon.size / 4, weapon.y + weapon.size * 0.75);
      });

      // Draw players
      players.forEach(player => {
        if (player.alive) {
          ctx.fillStyle = player.color;
          ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
          ctx.fillStyle = 'white';
          ctx.fillText(player.name, player.x, player.y - 5);
          if (player.hasWeapon) {
            ctx.fillText(player.hasWeapon[0].toUpperCase(), player.x + PLAYER_SIZE / 4, player.y + PLAYER_SIZE * 0.75);
          }
        }
      });

      // Draw score
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      let scoreText = '';
      Object.keys(score).forEach(playerId => {
        scoreText += `${players.find(p => p.id === playerId)?.name || playerId}: ${score[playerId]}  `;
      });
      ctx.fillText(`Round: ${round} | ${scoreText}`, 10, 30);
    }

    // Draw countdown timer for last 3 seconds
    if (gameState === 'waiting' && waitTime <= 3 && waitTime > 0) {
      ctx.font = 'bold 50px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'red';
      ctx.fillText(waitTime, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.textAlign = 'left';
    }
  }, [players, weapons, hazards, round, score, gameState, waitTime, playerCount]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
    };
    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    setPlayers(prevPlayers => {
      return prevPlayers.map(player => {
        if (!player.alive || player.isAI) return player; // Only control human players

        let newPlayer = { ...player };
        if (keys['ArrowLeft']) newPlayer.vx = -MOVE_SPEED;
        if (keys['ArrowRight']) newPlayer.vx = MOVE_SPEED;
        if (keys['ArrowUp'] && newPlayer.y + PLAYER_SIZE >= CANVAS_HEIGHT) newPlayer.vy = -JUMP_STRENGTH; // Only jump if on ground
        
        // Punch/Kick (simple implementation)
        if (keys[' ']) {
          // Simulate attack
        }

        return newPlayer;
      });
    });
  }, [keys]);

  return (
    <div className="stickman-fighter-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🥊 Stickman Fighter</h3>
          <div className="stats">
            <span>Round: {round}</span>
            {Object.keys(score).map(playerId => (
              <span key={playerId}>{players.find(p => p.id === playerId)?.name || playerId}: {score[playerId]}</span>
            ))}
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
              <p>{Object.keys(score).find(id => score[id] >= WIN_ROUNDS)} wins the match!</p>
              <button onClick={startGame} className="restart-btn">Play Again</button>
              <button onClick={onClose} className="exit-btn">Exit</button>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <h4>🎮 Controls</h4>
        <p>← → : Move</p>
        <p>↑ : Jump</p>
        <p>Space: Punch/Kick</p>
      </div>
    </div>
  );
};

export default StickmanFighter;


