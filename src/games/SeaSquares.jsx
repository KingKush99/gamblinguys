import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SeaSquares.css';

const SeaSquares = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'gameOver'
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [board, setBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per round
  const [winner, setWinner] = useState(null);
  const [animating, setAnimating] = useState(false);
  const gameLoop = useRef(null);

  // Game constants
  const CANVAS_WIDTH = 700;
  const CANVAS_HEIGHT = 700;
  const GRID_SIZE = 7;
  const CELL_SIZE = 80;
  const BOARD_OFFSET_X = 70;
  const BOARD_OFFSET_Y = 70;
  const MAX_PLAYERS = 4;

  // Sea animals (emojis)
  const seaAnimals = ['🐠', '🐟', '🦈', '🐙', '🦀', '🐡', '🦞'];

  // Player names for AI
  const playerNames = [
    'SeaMaster', 'OceanKing', 'WaveRider', 'DeepDiver', 'CoralCrusher',
    'TideBreaker', 'AquaAce', 'MarineMatch', 'SplashStar', 'BlueWhale'
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
    setCurrentPlayerIndex(0);
    setWinner(null);
    setScore(0);
    setMoves(30);
    setTimeLeft(120);
    
    // Initialize players
    const initialPlayers = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
    
    for (let i = 0; i < playerCount; i++) {
      initialPlayers.push({
        id: `player_${i}`,
        name: i === 0 ? 'You' : playerNames[i - 1],
        color: colors[i % colors.length],
        score: 0,
        isAI: i > 0
      });
    }
    setPlayers(initialPlayers);
    
    // Initialize board
    initializeBoard();
    
    // Start game timer
    const gameTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(gameTimer);
          endPlayerTurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const initializeBoard = () => {
    const newBoard = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      const boardRow = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        boardRow.push({
          animal: seaAnimals[Math.floor(Math.random() * seaAnimals.length)],
          row,
          col,
          selected: false,
          matched: false
        });
      }
      newBoard.push(boardRow);
    }
    setBoard(newBoard);
    
    // Remove initial matches
    setTimeout(() => {
      removeMatches(newBoard);
    }, 100);
  };

  const startGameLoop = () => {
    const update = () => {
      draw();
      gameLoop.current = requestAnimationFrame(update);
    };
    update();
  };

  const handleCanvasClick = (event) => {
    if (gameState !== 'playing' || animating || winner) return;
    
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer && currentPlayer.isAI) return; // Don't allow clicks during AI turn
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const col = Math.floor((x - BOARD_OFFSET_X) / CELL_SIZE);
    const row = Math.floor((y - BOARD_OFFSET_Y) / CELL_SIZE);
    
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      handleCellClick(row, col);
    }
  };

  const handleCellClick = (row, col) => {
    if (selectedCell) {
      // Check if this is a valid swap
      const { row: selectedRow, col: selectedCol } = selectedCell;
      const isAdjacent = 
        (Math.abs(row - selectedRow) === 1 && col === selectedCol) ||
        (Math.abs(col - selectedCol) === 1 && row === selectedRow);
      
      if (isAdjacent) {
        // Perform swap
        swapCells(selectedRow, selectedCol, row, col);
      }
      
      // Clear selection
      setSelectedCell(null);
      setBoard(prev => prev.map(boardRow => 
        boardRow.map(cell => ({ ...cell, selected: false }))
      ));
    } else {
      // Select cell
      setSelectedCell({ row, col });
      setBoard(prev => prev.map((boardRow, r) => 
        boardRow.map((cell, c) => ({
          ...cell,
          selected: r === row && c === col
        }))
      ));
    }
  };

  const swapCells = (row1, col1, row2, col2) => {
    setAnimating(true);
    
    setBoard(prev => {
      const newBoard = prev.map(row => row.map(cell => ({ ...cell })));
      const temp = newBoard[row1][col1].animal;
      newBoard[row1][col1].animal = newBoard[row2][col2].animal;
      newBoard[row2][col2].animal = temp;
      return newBoard;
    });
    
    setTimeout(() => {
      const hasMatches = checkForMatches();
      if (hasMatches) {
        setMoves(prev => prev - 1);
        removeMatches();
      } else {
        // Swap back if no matches
        setBoard(prev => {
          const newBoard = prev.map(row => row.map(cell => ({ ...cell })));
          const temp = newBoard[row1][col1].animal;
          newBoard[row1][col1].animal = newBoard[row2][col2].animal;
          newBoard[row2][col2].animal = temp;
          return newBoard;
        });
      }
      setAnimating(false);
    }, 300);
  };

  const checkForMatches = () => {
    let hasMatches = false;
    
    setBoard(prev => {
      const newBoard = prev.map(row => row.map(cell => ({ ...cell, matched: false })));
      
      // Check horizontal matches
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE - 2; col++) {
          const animal = newBoard[row][col].animal;
          if (animal === newBoard[row][col + 1].animal && 
              animal === newBoard[row][col + 2].animal) {
            newBoard[row][col].matched = true;
            newBoard[row][col + 1].matched = true;
            newBoard[row][col + 2].matched = true;
            hasMatches = true;
          }
        }
      }
      
      // Check vertical matches
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const animal = newBoard[row][col].animal;
          if (animal === newBoard[row + 1][col].animal && 
              animal === newBoard[row + 2][col].animal) {
            newBoard[row][col].matched = true;
            newBoard[row + 1][col].matched = true;
            newBoard[row + 2][col].matched = true;
            hasMatches = true;
          }
        }
      }
      
      return newBoard;
    });
    
    return hasMatches;
  };

  const removeMatches = (boardToCheck = null) => {
    const currentBoard = boardToCheck || board;
    let matchCount = 0;
    
    setBoard(prev => {
      const newBoard = prev.map(row => row.map(cell => ({ ...cell })));
      
      // Count and remove matched cells
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (newBoard[row][col].matched) {
            matchCount++;
            newBoard[row][col].animal = '';
          }
        }
      }
      
      return newBoard;
    });
    
    if (matchCount > 0) {
      setScore(prev => prev + matchCount * 10);
      
      setTimeout(() => {
        dropCells();
      }, 300);
    }
  };

  const dropCells = () => {
    setBoard(prev => {
      const newBoard = prev.map(row => row.map(cell => ({ ...cell })));
      
      // Drop cells down
      for (let col = 0; col < GRID_SIZE; col++) {
        const column = [];
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
          if (newBoard[row][col].animal !== '') {
            column.push(newBoard[row][col].animal);
          }
        }
        
        // Fill column from bottom
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
          if (column.length > 0) {
            newBoard[row][col].animal = column.shift();
          } else {
            newBoard[row][col].animal = seaAnimals[Math.floor(Math.random() * seaAnimals.length)];
          }
          newBoard[row][col].matched = false;
        }
      }
      
      return newBoard;
    });
    
    setTimeout(() => {
      const hasNewMatches = checkForMatches();
      if (hasNewMatches) {
        setTimeout(() => removeMatches(), 500);
      }
    }, 300);
  };

  const endPlayerTurn = () => {
    // Update player score
    setPlayers(prev => prev.map((player, index) => 
      index === currentPlayerIndex 
        ? { ...player, score: score }
        : player
    ));
    
    // Check if game is over
    if (currentPlayerIndex === playerCount - 1) {
      // Find winner
      const finalPlayers = players.map((player, index) => 
        index === currentPlayerIndex 
          ? { ...player, score: score }
          : player
      );
      const winnerPlayer = finalPlayers.reduce((prev, current) => 
        prev.score > current.score ? prev : current
      );
      setWinner(winnerPlayer);
      setGameState('gameOver');
    } else {
      // Next player
      setCurrentPlayerIndex(prev => prev + 1);
      setScore(0);
      setMoves(30);
      setTimeLeft(120);
      initializeBoard();
    }
  };

  // AI player logic
  useEffect(() => {
    if (gameState === 'playing' && !winner && !animating) {
      const currentPlayer = players[currentPlayerIndex];
      if (currentPlayer && currentPlayer.isAI && moves > 0) {
        setTimeout(() => {
          // AI makes random moves
          const randomRow1 = Math.floor(Math.random() * GRID_SIZE);
          const randomCol1 = Math.floor(Math.random() * GRID_SIZE);
          const randomRow2 = randomRow1 + (Math.random() > 0.5 ? 1 : -1);
          const randomCol2 = randomCol1 + (Math.random() > 0.5 ? 1 : -1);
          
          if (randomRow2 >= 0 && randomRow2 < GRID_SIZE && 
              randomCol2 >= 0 && randomCol2 < GRID_SIZE) {
            swapCells(randomRow1, randomCol1, randomRow2, randomCol2);
          }
        }, 1000);
      }
    }
  }, [currentPlayerIndex, gameState, winner, animating, moves, players]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    ctx.fillStyle = '#001f3f'; // Deep ocean blue
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameState === 'waiting') {
      // Draw waiting screen
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🌊 Sea Squares', CANVAS_WIDTH / 2, 150);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Players joined: ${playerCount}/${MAX_PLAYERS}`, CANVAS_WIDTH / 2, 200);
      
      if (waitTime > 3) {
        ctx.fillText(`Game starts in: ${waitTime} seconds`, CANVAS_WIDTH / 2, 250);
      }
      
      // Draw board preview
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 3;
      ctx.strokeRect(BOARD_OFFSET_X, BOARD_OFFSET_Y + 100, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      
      ctx.fillStyle = '#4ecdc4';
      ctx.font = '18px Arial';
      ctx.fillText('Match 3 Sea Creatures!', CANVAS_WIDTH / 2, BOARD_OFFSET_Y + 80);
      
      ctx.textAlign = 'left';
    } else {
      // Draw game board
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const x = BOARD_OFFSET_X + col * CELL_SIZE;
          const y = BOARD_OFFSET_Y + row * CELL_SIZE;
          const cell = board[row] && board[row][col];
          
          if (cell) {
            // Cell background
            ctx.fillStyle = cell.selected ? '#4ecdc4' : '#87ceeb';
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            
            // Cell border
            ctx.strokeStyle = '#001f3f';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
            
            // Sea animal
            if (cell.animal && !cell.matched) {
              ctx.font = '40px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(cell.animal, x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 15);
            }
          }
        }
      }

      // Draw UI
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      
      if (players[currentPlayerIndex]) {
        ctx.fillText(`Current Player: ${players[currentPlayerIndex].name}`, 20, 30);
        ctx.fillText(`Score: ${score}`, 20, 60);
        ctx.fillText(`Moves: ${moves}`, 20, 90);
        ctx.fillText(`Time: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`, 20, 120);
      }

      // Draw leaderboard
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Leaderboard:', CANVAS_WIDTH - 200, 30);
      
      players.forEach((player, index) => {
        ctx.fillStyle = player.color;
        ctx.fillText(`${player.name}: ${player.score}`, CANVAS_WIDTH - 200, 60 + index * 25);
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
  }, [board, gameState, waitTime, playerCount, currentPlayerIndex, score, moves, timeLeft, players, winner]);

  return (
    <div className="sea-squares-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🌊 Sea Squares</h3>
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
          onClick={handleCanvasClick}
        />

        {gameState === 'gameOver' && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>Game Over!</h2>
              <p>🏆 {winner?.name} wins with {winner?.score} points!</p>
              <div className="final-scores">
                <h4>Final Scores:</h4>
                {players.map((player, index) => (
                  <p key={index}>{player.name}: {player.score} points</p>
                ))}
              </div>
              <button onClick={startGame} className="restart-btn">Play Again</button>
              <button onClick={onClose} className="exit-btn">Exit</button>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <h4>🎮 How to Play</h4>
        <p>Click two adjacent sea creatures to swap them</p>
        <p>Match 3 or more of the same creature to score points</p>
        <p>Each player gets 30 moves and 2 minutes per turn</p>
        <p>Highest score after all players finish wins!</p>
      </div>
    </div>
  );
};

export default SeaSquares;

