import React, { useState, useEffect, useRef } from 'react';
import './CastleSiege.css';

const CastleSiege = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('playing');
  const [playerGold, setPlayerGold] = useState(100);
  const [playerCastle, setPlayerCastle] = useState({ health: 100, maxHealth: 100 });
  const [enemyCastle, setEnemyCastle] = useState({ health: 100, maxHealth: 100 });
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('soldier');
  const gameLoop = useRef(null);

  const unitTypes = {
    soldier: { cost: 20, health: 30, damage: 10, speed: 1, range: 50, icon: '⚔️' },
    archer: { cost: 30, health: 20, damage: 15, speed: 0.8, range: 150, icon: '🏹' },
    siege: { cost: 50, health: 50, damage: 25, speed: 0.5, range: 200, icon: '🏰' }
  };

  useEffect(() => {
    startGameLoop();
    return () => {
      if (gameLoop.current) {
        cancelAnimationFrame(gameLoop.current);
      }
    };
  }, []);

  const startGameLoop = () => {
    const update = () => {
      updateGame();
      draw();
      gameLoop.current = requestAnimationFrame(update);
    };
    update();
  };

  const updateGame = () => {
    // Generate enemy units
    if (Math.random() < 0.01) {
      spawnEnemyUnit();
    }

    // Update units
    setUnits(prevUnits => {
      const updatedUnits = prevUnits.map(unit => {
        let newUnit = { ...unit };
        
        if (unit.team === 'player') {
          // Move towards enemy castle
          if (newUnit.x < 700) {
            newUnit.x += unit.speed;
          } else {
            // Attack enemy castle
            setEnemyCastle(prev => ({
              ...prev,
              health: Math.max(0, prev.health - unit.damage)
            }));
            return null; // Remove unit after attacking castle
          }
        } else {
          // Enemy unit - move towards player castle
          if (newUnit.x > 100) {
            newUnit.x -= unit.speed;
          } else {
            // Attack player castle
            setPlayerCastle(prev => ({
              ...prev,
              health: Math.max(0, prev.health - unit.damage)
            }));
            return null; // Remove unit after attacking castle
          }
        }

        // Check for combat with enemy units
        const enemies = prevUnits.filter(u => u.team !== unit.team);
        const nearestEnemy = enemies.find(enemy => 
          Math.abs(enemy.x - newUnit.x) < unit.range
        );

        if (nearestEnemy) {
          // Attack enemy
          nearestEnemy.health -= unit.damage;
          if (nearestEnemy.health <= 0) {
            // Enemy defeated
            if (unit.team === 'player') {
              setPlayerGold(prev => prev + 10);
            }
          }
        }

        return newUnit;
      }).filter(unit => unit && unit.health > 0);

      return updatedUnits;
    });

    // Check win/lose conditions
    if (enemyCastle.health <= 0) {
      setGameState('victory');
    } else if (playerCastle.health <= 0) {
      setGameState('defeat');
    }

    // Generate gold over time
    setPlayerGold(prev => prev + 0.5);
  };

  const spawnEnemyUnit = () => {
    const unitTypeKeys = Object.keys(unitTypes);
    const randomType = unitTypeKeys[Math.floor(Math.random() * unitTypeKeys.length)];
    const unitData = unitTypes[randomType];

    const newUnit = {
      id: Date.now() + Math.random(),
      type: randomType,
      team: 'enemy',
      x: 750,
      y: 250 + Math.random() * 100,
      health: unitData.health,
      maxHealth: unitData.health,
      damage: unitData.damage,
      speed: unitData.speed,
      range: unitData.range,
      color: '#ff6b6b'
    };

    setUnits(prev => [...prev, newUnit]);
  };

  const spawnPlayerUnit = (unitType) => {
    const unitData = unitTypes[unitType];
    
    if (playerGold >= unitData.cost) {
      setPlayerGold(prev => prev - unitData.cost);
      
      const newUnit = {
        id: Date.now() + Math.random(),
        type: unitType,
        team: 'player',
        x: 50,
        y: 250 + Math.random() * 100,
        health: unitData.health,
        maxHealth: unitData.health,
        damage: unitData.damage,
        speed: unitData.speed,
        range: unitData.range,
        color: '#4ecdc4'
      };

      setUnits(prev => [...prev, newUnit]);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 400);

    // Draw background
    ctx.fillStyle = '#2c5530';
    ctx.fillRect(0, 300, 800, 100);
    
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, 800, 300);

    // Draw player castle
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(10, 200, 60, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏰', 40, 230);
    
    // Player castle health bar
    const playerHealthPercent = playerCastle.health / playerCastle.maxHealth;
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(10, 180, 60, 10);
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(10, 180, 60 * playerHealthPercent, 10);

    // Draw enemy castle
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(730, 200, 60, 100);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🏰', 760, 230);
    
    // Enemy castle health bar
    const enemyHealthPercent = enemyCastle.health / enemyCastle.maxHealth;
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(730, 180, 60, 10);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(730, 180, 60 * enemyHealthPercent, 10);

    // Draw units
    units.forEach(unit => {
      const unitData = unitTypes[unit.type];
      
      // Draw unit
      ctx.fillStyle = unit.color;
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw unit icon
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(unitData.icon, unit.x, unit.y + 4);
      
      // Draw health bar
      const healthPercent = unit.health / unit.maxHealth;
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(unit.x - 10, unit.y - 15, 20, 3);
      ctx.fillStyle = '#4ecdc4';
      ctx.fillRect(unit.x - 10, unit.y - 15, 20 * healthPercent, 3);
    });
  };

  const restartGame = () => {
    setGameState('playing');
    setPlayerGold(100);
    setPlayerCastle({ health: 100, maxHealth: 100 });
    setEnemyCastle({ health: 100, maxHealth: 100 });
    setUnits([]);
  };

  return (
    <div className="castle-siege-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🏰 Castle Siege</h3>
          <div className="gold">💰 Gold: {Math.floor(playerGold)}</div>
          <div className="castle-health">
            🏰 Your Castle: {Math.floor(playerCastle.health)}/100
          </div>
          <div className="enemy-health">
            🔥 Enemy Castle: {Math.floor(enemyCastle.health)}/100
          </div>
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="game-canvas"
        />
        
        {(gameState === 'victory' || gameState === 'defeat') && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>{gameState === 'victory' ? '🎉 Victory!' : '💀 Defeat!'}</h2>
              <p>
                {gameState === 'victory' 
                  ? 'You have successfully destroyed the enemy castle!' 
                  : 'Your castle has been destroyed!'}
              </p>
              <div className="game-over-buttons">
                <button onClick={restartGame} className="restart-btn">Play Again</button>
                <button onClick={onClose} className="exit-btn">Exit</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <div className="unit-selection">
          <h4>Train Units:</h4>
          <div className="unit-buttons">
            {Object.entries(unitTypes).map(([type, data]) => (
              <button
                key={type}
                className={`unit-btn ${selectedUnit === type ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedUnit(type);
                  spawnPlayerUnit(type);
                }}
                disabled={playerGold < data.cost}
              >
                <span className="unit-icon">{data.icon}</span>
                <span className="unit-name">{type}</span>
                <span className="unit-cost">💰{data.cost}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="game-instructions">
          <p>🎯 Destroy the enemy castle to win!</p>
          <p>⚔️ Train units to attack the enemy</p>
          <p>💰 Earn gold by defeating enemies</p>
        </div>
      </div>
    </div>
  );
};

export default CastleSiege;

