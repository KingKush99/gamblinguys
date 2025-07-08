import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SnakesLadders.css';

const SnakesLadders = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'gameOver'
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameLog, setGameLog] = useState([]);
  const gameLoop = useRef(null);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 800;
  const BOARD_SIZE = 10;
  const CELL_SIZE = 70;
  const BOARD_OFFSET_X = 50;
  const BOARD_OFFSET_Y = 50;
  const MAX_PLAYERS = 6;

  // Player names for AI
  const playerNames = [
    'LuckyRoller', 'SnakeCharmer', 'LadderClimber', 'DiceKing', 'BoardMaster',
    'GameWinner', 'RollMaster', 'ClimbHigh', 'AvoidSnakes', 'QuickFinish'
  ];

  // Snakes and Ladders positions (start -> end)
  const snakes = {
    16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
  };
  
  const ladders = {
    1: 38, 4: 14, 9: 21, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100
  };

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
    setCurrentPlayerIndex(0);
    setWinner(null);
    setGameLog([]);
    
    // Initialize players
    const initialPlayers = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    
    for (let i = 0; i < playerCount; i++) {
      initialPlayers.push({
        id: `player_${i}`,
        name: i === 0 ? 'You' : playerNames[i - 1],
        color: colors[i % colors.length],
        position: 0,
        isAI: i > 0
      });
    }
    setPlayers(initialPlayers);
    
    addToLog('Game started! Roll the dice to begin.');
  };

  const startGameLoop = () => {
    const update = () => {
      draw();
      gameLoop.current = requestAnimationFrame(update);
    };
    update();
  };

  const addToLog = (message) => {
    setGameLog(prev => [...prev.slice(-4), message]); // Keep last 5 messages
  };

  const getPositionCoordinates = (position) => {
    if (position === 0) return { x: BOARD_OFFSET_X - 20, y: BOARD_OFFSET_Y + BOARD_SIZE * CELL_SIZE + 20 };
    
    const row = Math.floor((position - 1) / BOARD_SIZE);
    const col = (position - 1) % BOARD_SIZE;
    
    // Snake pattern - odd rows go right to left
    const actualCol = row % 2 === 0 ? col : BOARD_SIZE - 1 - col;
    const actualRow = BOARD_SIZE - 1 - row;
    
    return {
      x: BOARD_OFFSET_X + actualCol * CELL_SIZE + CELL_SIZE / 2,
      y: BOARD_OFFSET_Y + actualRow * CELL_SIZE + CELL_SIZE / 2
    };
  };

  const rollDice = () => {
    if (isRolling || gameState !== 'playing' || winner) return;
    
    setIsRolling(true);
    
    // Animate dice roll
    let rollCount = 0;
    const rollAnimation = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      
      if (rollCount >= 10) {
        clearInterval(rollAnimation);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);
        movePlayer(finalValue);
      }
    }, 100);
  };

  const movePlayer = (steps) => {
    const currentPlayer = players[currentPlayerIndex];
    let newPosition = currentPlayer.position + steps;
    
    // Check if player wins
    if (newPosition >= 100) {
      newPosition = 100;
      setWinner(currentPlayer);
      setGameState('gameOver');
      addToLog(`🏆 ${currentPlayer.name} wins the game!`);
    }
    
    // Update player position
    setPlayers(prev => prev.map((player, index) => 
      index === currentPlayerIndex 
        ? { ...player, position: newPosition }
        : player
    ));
    
    addToLog(`${currentPlayer.name} rolled ${steps} and moved to position ${newPosition}`);
    
    // Check for snakes or ladders
    setTimeout(() => {
      if (snakes[newPosition]) {
        const snakeEnd = snakes[newPosition];
        setPlayers(prev => prev.map((player, index) => 
          index === currentPlayerIndex 
            ? { ...player, position: snakeEnd }
            : player
        ));
        addToLog(`🐍 ${currentPlayer.name} hit a snake! Slid down to position ${snakeEnd}`);
      } else if (ladders[newPosition]) {
        const ladderEnd = ladders[newPosition];
        setPlayers(prev => prev.map((player, index) => 
          index === currentPlayerIndex 
            ? { ...player, position: ladderEnd }
            : player
        ));
        addToLog(`🪜 ${currentPlayer.name} climbed a ladder! Moved up to position ${ladderEnd}`);
      }
      
      // Move to next player
      if (!winner) {
        setTimeout(() => {
          setCurrentPlayerIndex(prev => (prev + 1) % playerCount);
        }, 1000);
      }
    }, 1000);
  };

  // AI player logic
  useEffect(() => {
    if (gameState === 'playing' && !winner && !isRolling) {
      const currentPlayer = players[currentPlayerIndex];
      if (currentPlayer && currentPlayer.isAI) {
        setTimeout(() => {
          rollDice();
        }, 2000); // AI waits 2 seconds before rolling
      }
    }
  }, [currentPlayerIndex, gameState, winner, isRolling, players]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameState === 'waiting') {
      // Draw waiting screen
      ctx.fillStyle = '#333';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎲 Snakes & Ladders', CANVAS_WIDTH / 2, 150);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Players joined: ${playerCount}/${MAX_PLAYERS}`, CANVAS_WIDTH / 2, 200);
      
      if (waitTime > 3) {
        ctx.fillText(`Game starts in: ${waitTime} seconds`, CANVAS_WIDTH / 2, 250);
      }
      
      // Draw board preview
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.strokeRect(BOARD_OFFSET_X, BOARD_OFFSET_Y + 100, BOARD_SIZE * CELL_SIZE, BOARD_SIZE * CELL_SIZE);
      
      ctx.fillStyle = '#999';
      ctx.font = '18px Arial';
      ctx.fillText('Game Board Preview', CANVAS_WIDTH / 2, BOARD_OFFSET_Y + 80);
      
      ctx.textAlign = 'left';
    } else {
      // Draw game board
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const x = BOARD_OFFSET_X + col * CELL_SIZE;
          const y = BOARD_OFFSET_Y + row * CELL_SIZE;
          
          // Checkerboard pattern
          ctx.fillStyle = (row + col) % 2 === 0 ? '#fff' : '#f0f0f0';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          
          // Cell border
          ctx.strokeStyle = '#ccc';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
          
          // Cell number
          const actualCol = row % 2 === 0 ? col : BOARD_SIZE - 1 - col;
          const cellNumber = (BOARD_SIZE - 1 - row) * BOARD_SIZE + actualCol + 1;
          
          ctx.fillStyle = '#666';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(cellNumber.toString(), x + CELL_SIZE / 2, y + 15);
        }
      }

      // Draw snakes
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 4;
      Object.entries(snakes).forEach(([start, end]) => {
        const startPos = getPositionCoordinates(parseInt(start));
        const endPos = getPositionCoordinates(parseInt(end));
        
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();
        
        // Snake head
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw ladders
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 6;
      Object.entries(ladders).forEach(([start, end]) => {
        const startPos = getPositionCoordinates(parseInt(start));
        const endPos = getPositionCoordinates(parseInt(end));
        
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();
        
        // Ladder rungs
        ctx.lineWidth = 2;
        const steps = 5;
        for (let i = 1; i < steps; i++) {
          const ratio = i / steps;
          const rungX1 = startPos.x + (endPos.x - startPos.x) * ratio - 10;
          const rungX2 = startPos.x + (endPos.x - startPos.x) * ratio + 10;
          const rungY = startPos.y + (endPos.y - startPos.y) * ratio;
          
          ctx.beginPath();
          ctx.moveTo(rungX1, rungY);
          ctx.lineTo(rungX2, rungY);
          ctx.stroke();
        }
        ctx.lineWidth = 6;
      });

      // Draw players
      players.forEach((player, index) => {
        const pos = getPositionCoordinates(player.position);
        const offset = (index - playerCount / 2) * 8; // Spread players out if on same cell
        
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(pos.x + offset, pos.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Player name
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, pos.x + offset, pos.y - 20);
      });

      // Draw dice
      if (diceValue) {
        const diceX = CANVAS_WIDTH - 120;
        const diceY = 100;
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(diceX, diceY, 60, 60);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(diceX, diceY, 60, 60);
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(diceValue.toString(), diceX + 30, diceY + 40);
      }

      // Draw current player indicator
      if (players[currentPlayerIndex]) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Current Turn: ${players[currentPlayerIndex].name}`, 20, 30);
      }

      // Draw game log
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      gameLog.forEach((message, index) => {
        ctx.fillText(message, 20, CANVAS_HEIGHT - 100 + index * 20);
      });
    }

    // Draw countdown timer for last 3 seconds
    if (gameState === 'waiting' && waitTime <= 3 && waitTime > 0) {
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'red';
      ctx.fillText(waitTime, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.textAlign = 'left';
    }
  }, [players, gameState, waitTime, playerCount, currentPlayerIndex, diceValue, gameLog, winner]);

  return (
    <div className="snakes-ladders-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🎲 Snakes & Ladders</h3>
          <div className="stats">
            {gameState === 'playing' && (
              <>
                <span>Players: {playerCount}</span>
                <span>Turn: {players[currentPlayerIndex]?.name}</span>
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
              <p>Congratulations on reaching position 100!</p>
              <button onClick={startGame} className="restart-btn">Play Again</button>
              <button onClick={onClose} className="exit-btn">Exit</button>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <h4>🎮 How to Play</h4>
        <p>Roll the dice to move around the board</p>
        <p>🪜 Ladders help you climb up • 🐍 Snakes slide you down</p>
        <p>First player to reach position 100 wins!</p>
        {gameState === 'playing' && !winner && players[currentPlayerIndex] && !players[currentPlayerIndex].isAI && (
          <div className="dice-controls">
            <button 
              onClick={rollDice} 
              disabled={isRolling}
              className="roll-dice-btn"
            >
              {isRolling ? 'Rolling...' : 'Roll Dice!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnakesLadders;

