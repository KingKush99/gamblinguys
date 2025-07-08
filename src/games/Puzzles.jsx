import React, { useState, useEffect, useRef } from 'react';
import './Puzzles.css';

const Puzzles = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('waiting');
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState([]);
  const [puzzlePieces, setPuzzlePieces] = useState([]);
  const [placedPieces, setPlacedPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [gameTime, setGameTime] = useState(60);
  const [winner, setWinner] = useState(null);
  const [puzzleImage, setPuzzleImage] = useState(null);

  // Game constants
  const GRID_SIZE = 10; // 10x10 grid = 100 pieces
  const PIECE_SIZE = 60;
  const CANVAS_WIDTH = GRID_SIZE * PIECE_SIZE;
  const CANVAS_HEIGHT = GRID_SIZE * PIECE_SIZE;

  // Player names for AI
  const playerNames = [
    'PuzzleMaster', 'JigsawKing', 'PieceWiz', 'QuickSolver', 'BrainBox',
    'PatternPro', 'SharpEye', 'FastFingers', 'LogicLord', 'PuzzleAce'
  ];

  // Puzzle images
  const puzzleImages = [
    '/src/assets/puzzle1.png',
    '/src/assets/puzzle2.png', 
    '/src/assets/puzzle3.png'
  ];

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState]);

  const initializeGame = () => {
    // Initialize players
    const humanPlayer = {
      id: 'player_1',
      name: 'You',
      isAI: false,
      piecesPlaced: 0,
      color: '#4ecdc4'
    };

    const aiPlayers = [];
    for (let i = 1; i < 4; i++) {
      aiPlayers.push({
        id: `ai_${i}`,
        name: playerNames[Math.floor(Math.random() * playerNames.length)],
        isAI: true,
        piecesPlaced: 0,
        color: `hsl(${i * 120}, 70%, 60%)`
      });
    }

    setPlayers([humanPlayer, ...aiPlayers]);

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
        if (prev >= 4) {
          clearInterval(joinTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => {
      clearInterval(waitTimer);
      clearInterval(joinTimer);
    };
  };

  const startGame = () => {
    setGameState('playing');
    
    // Select random puzzle image
    const selectedImage = puzzleImages[Math.floor(Math.random() * puzzleImages.length)];
    setPuzzleImage(selectedImage);
    
    // Generate puzzle pieces
    generatePuzzlePieces();
    
    // Start AI behavior
    startAIBehavior();
  };

  const generatePuzzlePieces = () => {
    const pieces = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        pieces.push({
          id: `piece_${row}_${col}`,
          row,
          col,
          correctX: col * PIECE_SIZE,
          correctY: row * PIECE_SIZE,
          currentX: Math.random() * 400 + 650, // Scattered on the right side
          currentY: Math.random() * 500 + 50,
          placed: false,
          placedBy: null
        });
      }
    }
    
    // Shuffle pieces
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    
    setPuzzlePieces(pieces);
  };

  const startAIBehavior = () => {
    // AI places pieces every 0.6 seconds (60 seconds / 100 pieces)
    const aiInterval = setInterval(() => {
      if (gameState !== 'playing') {
        clearInterval(aiInterval);
        return;
      }

      // Each AI has a chance to place a piece
      players.forEach(player => {
        if (player.isAI && Math.random() < 0.25) { // 25% chance per AI per interval
          placePieceForAI(player);
        }
      });
    }, 600);

    return () => clearInterval(aiInterval);
  };

  const placePieceForAI = (aiPlayer) => {
    setPuzzlePieces(prevPieces => {
      const availablePieces = prevPieces.filter(piece => !piece.placed);
      if (availablePieces.length === 0) return prevPieces;

      const randomPiece = availablePieces[Math.floor(Math.random() * availablePieces.length)];
      
      return prevPieces.map(piece => {
        if (piece.id === randomPiece.id) {
          // Update player score
          setPlayers(prevPlayers => 
            prevPlayers.map(p => 
              p.id === aiPlayer.id 
                ? { ...p, piecesPlaced: p.piecesPlaced + 1 }
                : p
            )
          );

          return {
            ...piece,
            placed: true,
            placedBy: aiPlayer.id,
            currentX: piece.correctX,
            currentY: piece.correctY
          };
        }
        return piece;
      });
    });
  };

  const handlePieceClick = (piece) => {
    if (piece.placed || gameState !== 'playing') return;
    
    setSelectedPiece(piece);
  };

  const handleCanvasClick = (e) => {
    if (!selectedPiece || gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is near the correct position
    const tolerance = 30;
    if (
      Math.abs(x - selectedPiece.correctX - PIECE_SIZE/2) < tolerance &&
      Math.abs(y - selectedPiece.correctY - PIECE_SIZE/2) < tolerance
    ) {
      // Place the piece
      setPuzzlePieces(prevPieces => 
        prevPieces.map(piece => 
          piece.id === selectedPiece.id 
            ? { 
                ...piece, 
                placed: true, 
                placedBy: 'player_1',
                currentX: piece.correctX,
                currentY: piece.correctY
              }
            : piece
        )
      );

      // Update player score
      setPlayers(prevPlayers => 
        prevPlayers.map(p => 
          p.id === 'player_1' 
            ? { ...p, piecesPlaced: p.piecesPlaced + 1 }
            : p
        )
      );

      setSelectedPiece(null);

      // Check for win condition
      const totalPlaced = puzzlePieces.filter(p => p.placed).length + 1;
      if (totalPlaced >= 100) {
        endGame();
      }
    }
  };

  const endGame = () => {
    setGameState('gameOver');
    
    // Determine winner (player with most pieces placed)
    const sortedPlayers = [...players].sort((a, b) => b.piecesPlaced - a.piecesPlaced);
    setWinner(sortedPlayers[0]);
  };

  const drawPuzzle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * PIECE_SIZE, 0);
      ctx.lineTo(i * PIECE_SIZE, CANVAS_HEIGHT);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * PIECE_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * PIECE_SIZE);
      ctx.stroke();
    }

    // Draw placed pieces
    puzzlePieces.forEach(piece => {
      if (piece.placed) {
        const player = players.find(p => p.id === piece.placedBy);
        ctx.fillStyle = player ? player.color : '#ccc';
        ctx.fillRect(piece.currentX, piece.currentY, PIECE_SIZE, PIECE_SIZE);
        
        // Draw piece number
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${piece.row * GRID_SIZE + piece.col + 1}`,
          piece.currentX + PIECE_SIZE/2,
          piece.currentY + PIECE_SIZE/2
        );
      }
    });

    // Highlight selected piece position
    if (selectedPiece) {
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        selectedPiece.correctX, 
        selectedPiece.correctY, 
        PIECE_SIZE, 
        PIECE_SIZE
      );
    }
  };

  useEffect(() => {
    drawPuzzle();
  }, [puzzlePieces, selectedPiece, players]);

  return (
    <div className="puzzles-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🧩 Jigsaw Puzzle</h3>
          <div className="timer">Time: {gameTime}s</div>
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        {gameState === 'waiting' && (
          <div className="waiting-screen">
            <h2>Waiting for Players...</h2>
            <p>Players joined: {playerCount}/4</p>
            {waitTime > 3 && <p>Game starts in: {waitTime} seconds</p>}
            {waitTime <= 3 && <p>Starting in: {waitTime}...</p>}
          </div>
        )}

        {(gameState === 'playing' || gameState === 'gameOver') && (
          <div className="puzzle-area">
            <div className="puzzle-board">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onClick={handleCanvasClick}
                className="puzzle-canvas"
              />
            </div>

            <div className="pieces-area">
              <h4>Available Pieces</h4>
              <div className="pieces-grid">
                {puzzlePieces
                  .filter(piece => !piece.placed)
                  .slice(0, 20) // Show only first 20 for performance
                  .map(piece => (
                    <div
                      key={piece.id}
                      className={`puzzle-piece ${selectedPiece?.id === piece.id ? 'selected' : ''}`}
                      onClick={() => handlePieceClick(piece)}
                    >
                      {piece.row * GRID_SIZE + piece.col + 1}
                    </div>
                  ))}
              </div>
              <p>{puzzlePieces.filter(p => !p.placed).length} pieces remaining</p>
            </div>

            <div className="players-area">
              <h4>Players</h4>
              {players.map(player => (
                <div key={player.id} className="player-score">
                  <span 
                    className="player-color" 
                    style={{ backgroundColor: player.color }}
                  ></span>
                  <span className="player-name">{player.name}</span>
                  <span className="player-pieces">{player.piecesPlaced}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>Game Over!</h2>
              <h3>🏆 {winner?.name} Wins!</h3>
              <div className="final-scores">
                {players
                  .sort((a, b) => b.piecesPlaced - a.piecesPlaced)
                  .map((player, index) => (
                    <div key={player.id} className="final-score">
                      <span>#{index + 1}</span>
                      <span>{player.name}</span>
                      <span>{player.piecesPlaced} pieces</span>
                    </div>
                  ))}
              </div>
              <button onClick={() => window.location.reload()} className="restart-btn">
                Play Again
              </button>
              <button onClick={onClose} className="exit-btn">Exit</button>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <h4>🎮 How to Play</h4>
        <p>1. Click a piece from the available pieces</p>
        <p>2. Click near its correct position on the board</p>
        <p>3. Place as many pieces as you can in 60 seconds!</p>
        <p>4. Player with most pieces placed wins!</p>
      </div>
    </div>
  );
};

export default Puzzles;

