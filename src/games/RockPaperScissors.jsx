import React, { useState, useEffect } from 'react';
import './RockPaperScissors.css';

const RockPaperScissors = ({ onClose }) => {
  const [gameState, setGameState] = useState('waiting');
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState([]);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [roundResult, setRoundResult] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  // Player names for AI
  const playerNames = [
    'RockMaster', 'PaperKing', 'ScissorPro', 'ChoiceChamp', 'GameGuru',
    'QuickDraw', 'StrategyAce', 'LuckyPlayer', 'WinnerTake', 'GameFace'
  ];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Initialize players
    const humanPlayer = {
      id: 'player_1',
      name: 'You',
      isAI: false,
      score: 0
    };

    const aiPlayer = {
      id: 'player_2', 
      name: playerNames[Math.floor(Math.random() * playerNames.length)],
      isAI: true,
      score: 0
    };

    setPlayers([humanPlayer, aiPlayer]);

    // Start waiting timer
    const waitTimer = setInterval(() => {
      setWaitTime(prev => {
        if (prev <= 1) {
          clearInterval(waitTimer);
          setGameState('playing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate second player joining
    setTimeout(() => {
      setPlayerCount(2);
    }, 2000);

    return () => clearInterval(waitTimer);
  };

  const choices = [
    { name: 'rock', icon: '🪨', emoji: '✊' },
    { name: 'paper', icon: '📄', emoji: '✋' },
    { name: 'scissors', icon: '✂️', emoji: '✌️' }
  ];

  const getRandomChoice = () => {
    return choices[Math.floor(Math.random() * choices.length)];
  };

  const determineWinner = (player, computer) => {
    if (player.name === computer.name) {
      return 'tie';
    }
    
    if (
      (player.name === 'rock' && computer.name === 'scissors') ||
      (player.name === 'paper' && computer.name === 'rock') ||
      (player.name === 'scissors' && computer.name === 'paper')
    ) {
      return 'player';
    }
    
    return 'computer';
  };

  const playRound = (choice) => {
    if (isRevealing) return;
    
    setIsRevealing(true);
    setPlayerChoice(choice);
    
    // Add suspense with delayed computer choice
    setTimeout(() => {
      const compChoice = getRandomChoice();
      setComputerChoice(compChoice);
      
      const winner = determineWinner(choice, compChoice);
      
      if (winner === 'player') {
        setPlayerScore(prev => prev + 1);
        setRoundResult('You win this round!');
      } else if (winner === 'computer') {
        setComputerScore(prev => prev + 1);
        setRoundResult('Computer wins this round!');
      } else {
        setRoundResult("It's a tie!");
      }
      
      // Check for game end (best of 3)
      setTimeout(() => {
        const newPlayerScore = winner === 'player' ? playerScore + 1 : playerScore;
        const newComputerScore = winner === 'computer' ? computerScore + 1 : computerScore;
        
        if (newPlayerScore === 2) {
          setGameState('playerWin');
        } else if (newComputerScore === 2) {
          setGameState('computerWin');
        } else {
          // Continue to next round
          setCurrentRound(prev => prev + 1);
          setIsRevealing(false);
          setPlayerChoice(null);
          setComputerChoice(null);
          setRoundResult('');
        }
      }, 2000);
    }, 1000);
  };

  const resetGame = () => {
    setGameState('playing');
    setPlayerChoice(null);
    setComputerChoice(null);
    setPlayerScore(0);
    setComputerScore(0);
    setRoundResult('');
    setIsRevealing(false);
    setCurrentRound(1);
  };

  const getChoiceDisplay = (choice) => {
    if (!choice) return '❓';
    return choice.emoji;
  };

  return (
    <div className="rock-paper-scissors-game">
      <div className="game-header">
        <div className="game-info">
          <h3>✂️ Rock Paper Scissors</h3>
          <div className="score-display">
            <div className="score-item">
              <span>You: {playerScore}</span>
            </div>
            <div className="round-indicator">
              Round {currentRound}
            </div>
            <div className="score-item">
              <span>Computer: {computerScore}</span>
            </div>
          </div>
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        <div className="game-arena">
          <div className="player-section">
            <h4>Your Choice</h4>
            <div className="choice-display">
              <div className="choice-circle player-choice">
                {getChoiceDisplay(playerChoice)}
              </div>
            </div>
          </div>

          <div className="vs-section">
            <div className="vs-text">VS</div>
            {roundResult && (
              <div className="round-result">
                {roundResult}
              </div>
            )}
          </div>

          <div className="computer-section">
            <h4>Computer's Choice</h4>
            <div className="choice-display">
              <div className="choice-circle computer-choice">
                {isRevealing && !computerChoice ? '🤔' : getChoiceDisplay(computerChoice)}
              </div>
            </div>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="choice-buttons">
            <h4>Make Your Choice:</h4>
            <div className="buttons-grid">
              {choices.map((choice) => (
                <button
                  key={choice.name}
                  className={`choice-btn ${isRevealing ? 'disabled' : ''}`}
                  onClick={() => playRound(choice)}
                  disabled={isRevealing}
                >
                  <div className="choice-icon">{choice.icon}</div>
                  <div className="choice-name">{choice.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {(gameState === 'playerWin' || gameState === 'computerWin') && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>
                {gameState === 'playerWin' ? '🎉 You Win!' : '💻 Computer Wins!'}
              </h2>
              <p>
                Final Score: You {playerScore} - {computerScore} Computer
              </p>
              <div className="game-over-buttons">
                <button onClick={resetGame} className="restart-btn">Play Again</button>
                <button onClick={onClose} className="exit-btn">Exit</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-rules">
        <h4>Rules:</h4>
        <div className="rules-grid">
          <div className="rule-item">
            <span>🪨 Rock beats ✂️ Scissors</span>
          </div>
          <div className="rule-item">
            <span>📄 Paper beats 🪨 Rock</span>
          </div>
          <div className="rule-item">
            <span>✂️ Scissors beats 📄 Paper</span>
          </div>
        </div>
        <p>Best of 3 rounds wins the match!</p>
      </div>
    </div>
  );
};

export default RockPaperScissors;

