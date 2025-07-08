import React, { useState, useEffect, useRef, useCallback } from 'react';
import './QuizKnows.css';

const QuizKnows = ({ onClose }) => {
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'question', 'results', 'gameOver'
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionData, setQuestionData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [winner, setWinner] = useState(null);
  const [roundResults, setRoundResults] = useState([]);

  // Game constants
  const MAX_PLAYERS = 12;
  const MIN_PLAYERS = 5;
  const TOTAL_QUESTIONS = 10;
  const QUESTION_TIME = 20; // seconds

  // Player names for AI
  const playerNames = [
    'BrainBox', 'QuizMaster', 'SmartCookie', 'FactFinder', 'KnowItAll',
    'WisdomSeeker', 'TriviaTitan', 'MindReader', 'GeniusGamer', 'QuickThink',
    'BrightSpark', 'CleverClogs', 'SharpMind', 'FastFacts', 'BrainStorm'
  ];

  // Sample questions database
  const questionsDatabase = [
    {
      question: "What is the capital of France?",
      answers: ["London", "Berlin", "Paris", "Madrid"],
      correct: 2,
      category: "Geography"
    },
    {
      question: "Which planet is known as the Red Planet?",
      answers: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct: 1,
      category: "Science"
    },
    {
      question: "Who painted the Mona Lisa?",
      answers: ["Van Gogh", "Picasso", "Da Vinci", "Monet"],
      correct: 2,
      category: "Art"
    },
    {
      question: "What is the largest mammal in the world?",
      answers: ["Elephant", "Blue Whale", "Giraffe", "Hippo"],
      correct: 1,
      category: "Nature"
    },
    {
      question: "In which year did World War II end?",
      answers: ["1944", "1945", "1946", "1947"],
      correct: 1,
      category: "History"
    },
    {
      question: "What is the chemical symbol for gold?",
      answers: ["Go", "Gd", "Au", "Ag"],
      correct: 2,
      category: "Science"
    },
    {
      question: "Which country invented pizza?",
      answers: ["France", "Italy", "Greece", "Spain"],
      correct: 1,
      category: "Food"
    },
    {
      question: "What is the fastest land animal?",
      answers: ["Lion", "Cheetah", "Leopard", "Tiger"],
      correct: 1,
      category: "Nature"
    },
    {
      question: "How many sides does a hexagon have?",
      answers: ["5", "6", "7", "8"],
      correct: 1,
      category: "Math"
    },
    {
      question: "Which ocean is the largest?",
      answers: ["Atlantic", "Indian", "Arctic", "Pacific"],
      correct: 3,
      category: "Geography"
    },
    {
      question: "Who wrote Romeo and Juliet?",
      answers: ["Dickens", "Shakespeare", "Austen", "Tolkien"],
      correct: 1,
      category: "Literature"
    },
    {
      question: "What is the smallest country in the world?",
      answers: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
      correct: 1,
      category: "Geography"
    }
  ];

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Start waiting timer
    const waitTimer = setInterval(() => {
      setWaitTime(prev => {
        if (prev <= 1) {
          clearInterval(waitTimer);
          if (playerCount >= MIN_PLAYERS) {
            startGame();
          } else {
            // Add more AI players if needed
            setPlayerCount(MIN_PLAYERS);
            setTimeout(startGame, 1000);
          }
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
    }, 2000);

    return () => {
      clearInterval(waitTimer);
      clearInterval(joinTimer);
    };
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setWinner(null);
    
    // Initialize players
    const initialPlayers = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf', '#ffd93d', '#ff8b94', '#c7ceea', '#b4f8c8', '#ffaaa5'];
    
    for (let i = 0; i < playerCount; i++) {
      initialPlayers.push({
        id: `player_${i}`,
        name: i === 0 ? 'You' : playerNames[i - 1],
        color: colors[i % colors.length],
        score: 0,
        isAI: i > 0,
        streak: 0
      });
    }
    setPlayers(initialPlayers);
    
    // Start first question
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentQuestion >= TOTAL_QUESTIONS) {
      endGame();
      return;
    }

    // Select random question
    const randomQuestion = questionsDatabase[Math.floor(Math.random() * questionsDatabase.length)];
    setQuestionData(randomQuestion);
    setGameState('question');
    setTimeLeft(QUESTION_TIME);
    setSelectedAnswer(null);
    setShowResults(false);
    setRoundResults([]);

    // Start question timer
    const questionTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(questionTimer);
          showQuestionResults();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null || gameState !== 'question') return;
    
    setSelectedAnswer(answerIndex);
    
    // Calculate score based on speed and correctness
    const isCorrect = answerIndex === questionData.correct;
    const speedBonus = Math.max(0, timeLeft * 5); // 5 points per second remaining
    const basePoints = isCorrect ? 100 : 0;
    const totalPoints = basePoints + (isCorrect ? speedBonus : 0);
    
    // Update player score
    setPlayers(prev => prev.map(player => 
      player.id === 'player_0' 
        ? { 
            ...player, 
            score: player.score + totalPoints,
            streak: isCorrect ? player.streak + 1 : 0
          }
        : player
    ));
  };

  const showQuestionResults = () => {
    setGameState('results');
    
    // Generate AI answers and update scores
    setPlayers(prev => prev.map(player => {
      if (player.isAI) {
        // AI has varying accuracy based on difficulty
        const accuracy = 0.6 + Math.random() * 0.3; // 60-90% accuracy
        const isCorrect = Math.random() < accuracy;
        const aiAnswerIndex = isCorrect ? questionData.correct : Math.floor(Math.random() * 4);
        const responseTime = 5 + Math.random() * 10; // 5-15 seconds
        const speedBonus = Math.max(0, (QUESTION_TIME - responseTime) * 5);
        const basePoints = isCorrect ? 100 : 0;
        const totalPoints = basePoints + (isCorrect ? speedBonus : 0);
        
        return {
          ...player,
          score: player.score + totalPoints,
          streak: isCorrect ? player.streak + 1 : 0,
          lastAnswer: aiAnswerIndex,
          lastCorrect: isCorrect,
          responseTime: responseTime
        };
      }
      return {
        ...player,
        lastAnswer: selectedAnswer,
        lastCorrect: selectedAnswer === questionData.correct,
        responseTime: QUESTION_TIME - timeLeft
      };
    }));

    // Show results for 5 seconds then next question
    setTimeout(() => {
      setCurrentQuestion(prev => prev + 1);
      nextQuestion();
    }, 5000);
  };

  const endGame = () => {
    setGameState('gameOver');
    
    // Find winner
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    setWinner(sortedPlayers[0]);
  };

  // AI behavior simulation
  useEffect(() => {
    if (gameState === 'question' && questionData) {
      // Simulate AI players answering at different times
      players.forEach((player, index) => {
        if (player.isAI) {
          const responseDelay = 3000 + Math.random() * 10000; // 3-13 seconds
          setTimeout(() => {
            if (gameState === 'question') {
              // AI answer is handled in showQuestionResults
            }
          }, responseDelay);
        }
      });
    }
  }, [gameState, questionData, players]);

  const getAnswerColor = (index) => {
    const colors = ['#e74c3c', '#3498db', '#f39c12', '#27ae60']; // Red, Blue, Orange, Green
    return colors[index % colors.length];
  };

  return (
    <div className="quiz-knows-game">
      <div className="game-header">
        <div className="game-info">
          <h3>💡 QuizKnows</h3>
          <div className="stats">
            {gameState === 'playing' || gameState === 'question' || gameState === 'results' ? (
              <>
                <span>Question: {currentQuestion + 1}/{TOTAL_QUESTIONS}</span>
                <span>Players: {playerCount}</span>
              </>
            ) : (
              <span>Players: {playerCount}/{MAX_PLAYERS}</span>
            )}
          </div>
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        {gameState === 'waiting' && (
          <div className="waiting-screen">
            <div className="kahoot-style-waiting">
              <h1>🧠 QuizKnows</h1>
              <div className="player-count">
                <span className="count">{playerCount}</span>
                <span className="label">Players Joined</span>
              </div>
              {waitTime > 3 && (
                <div className="start-timer">
                  <span>Starting in {waitTime} seconds...</span>
                </div>
              )}
              {waitTime <= 3 && waitTime > 0 && (
                <div className="countdown">
                  <span className="countdown-number">{waitTime}</span>
                </div>
              )}
              <div className="game-description">
                <p>Answer questions faster than your opponents!</p>
                <p>Correct answers + Speed = Higher Score</p>
              </div>
            </div>
          </div>
        )}

        {gameState === 'question' && questionData && (
          <div className="question-screen">
            <div className="question-header">
              <div className="question-number">Question {currentQuestion + 1}</div>
              <div className="category-badge">{questionData.category}</div>
              <div className="timer-circle">
                <span className="timer-text">{timeLeft}</span>
              </div>
            </div>
            
            <div className="question-content">
              <h2 className="question-text">{questionData.question}</h2>
            </div>
            
            <div className="answers-grid">
              {questionData.answers.map((answer, index) => (
                <button
                  key={index}
                  className={`answer-btn ${selectedAnswer === index ? 'selected' : ''}`}
                  style={{ backgroundColor: getAnswerColor(index) }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="answer-symbol">
                    {index === 0 ? '△' : index === 1 ? '◇' : index === 2 ? '○' : '□'}
                  </span>
                  <span className="answer-text">{answer}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'results' && questionData && (
          <div className="results-screen">
            <div className="correct-answer">
              <h2>Correct Answer:</h2>
              <div 
                className="correct-answer-display"
                style={{ backgroundColor: getAnswerColor(questionData.correct) }}
              >
                <span className="answer-symbol">
                  {questionData.correct === 0 ? '△' : questionData.correct === 1 ? '◇' : questionData.correct === 2 ? '○' : '□'}
                </span>
                <span className="answer-text">{questionData.answers[questionData.correct]}</span>
              </div>
            </div>
            
            <div className="leaderboard">
              <h3>Current Standings</h3>
              <div className="leaderboard-list">
                {[...players]
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5)
                  .map((player, index) => (
                    <div key={player.id} className="leaderboard-item">
                      <span className="rank">#{index + 1}</span>
                      <span className="player-name" style={{ color: player.color }}>
                        {player.name}
                      </span>
                      <span className="player-score">{player.score}</span>
                      {player.lastCorrect && <span className="correct-indicator">✓</span>}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="game-over-screen">
            <div className="winner-announcement">
              <h1>🏆 Game Over!</h1>
              <div className="winner-display">
                <h2 style={{ color: winner?.color }}>{winner?.name} Wins!</h2>
                <div className="final-score">Final Score: {winner?.score}</div>
              </div>
            </div>
            
            <div className="final-leaderboard">
              <h3>Final Rankings</h3>
              <div className="final-rankings">
                {[...players]
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div key={player.id} className="final-rank-item">
                      <span className="final-rank">#{index + 1}</span>
                      <span className="final-name" style={{ color: player.color }}>
                        {player.name}
                      </span>
                      <span className="final-score">{player.score}</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="game-over-buttons">
              <button onClick={startGame} className="restart-btn">Play Again</button>
              <button onClick={onClose} className="exit-btn">Exit</button>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <h4>🎮 How to Play</h4>
        <p>Answer trivia questions as fast as possible</p>
        <p>Correct answers earn 100 points + speed bonus</p>
        <p>Fastest correct answers get the highest scores</p>
        <p>Player with most points after {TOTAL_QUESTIONS} questions wins!</p>
      </div>
    </div>
  );
};

export default QuizKnows;

