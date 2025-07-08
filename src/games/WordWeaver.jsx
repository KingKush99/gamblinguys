import React, { useState, useEffect, useRef } from 'react';
import './WordWeaver.css';

const WordWeaver = ({ onClose }) => {
  const [gameState, setGameState] = useState('waiting');
  const [waitTime, setWaitTime] = useState(30);
  const [playerCount, setPlayerCount] = useState(1);
  const [players, setPlayers] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [gameTime, setGameTime] = useState(60);
  const [promptTime, setPromptTime] = useState(3);
  const [playerInput, setPlayerInput] = useState('');
  const [submittedWords, setSubmittedWords] = useState([]);
  const [scores, setScores] = useState({});
  const [roundResults, setRoundResults] = useState([]);
  const inputRef = useRef(null);

  // Prompt words for rhyming
  const promptWords = [
    'cat', 'dog', 'sun', 'moon', 'tree', 'car', 'house', 'book', 'love', 'time',
    'blue', 'red', 'big', 'small', 'fast', 'slow', 'hot', 'cold', 'new', 'old'
  ];

  // Player names for AI
  const playerNames = [
    'RhymeKing', 'WordWiz', 'PoetPro', 'VerseMaster', 'LyricLord',
    'RhymeTime', 'WordPlay', 'VerseVibe', 'PoemPower', 'RhymeRider'
  ];

  // Common rhyming patterns for AI
  const rhymeDatabase = {
    'cat': ['bat', 'hat', 'mat', 'rat', 'sat', 'fat', 'flat', 'chat'],
    'dog': ['log', 'fog', 'hog', 'jog', 'clog', 'frog'],
    'sun': ['run', 'fun', 'gun', 'bun', 'done', 'one', 'won', 'ton'],
    'moon': ['soon', 'noon', 'tune', 'june', 'spoon', 'balloon'],
    'tree': ['free', 'see', 'bee', 'key', 'tea', 'sea', 'flee', 'agree'],
    'car': ['far', 'bar', 'star', 'jar', 'tar', 'scar', 'guitar'],
    'house': ['mouse', 'spouse', 'blouse', 'grouse'],
    'book': ['look', 'took', 'cook', 'hook', 'brook', 'shook'],
    'love': ['dove', 'above', 'glove', 'shove'],
    'time': ['rhyme', 'climb', 'lime', 'prime', 'chime', 'mime'],
    'blue': ['true', 'new', 'few', 'grew', 'flew', 'threw', 'crew'],
    'red': ['bed', 'head', 'led', 'fed', 'said', 'bread', 'thread'],
    'big': ['pig', 'dig', 'fig', 'wig', 'twig', 'jig'],
    'small': ['ball', 'call', 'fall', 'wall', 'tall', 'hall', 'mall'],
    'fast': ['last', 'past', 'cast', 'vast', 'blast', 'mast'],
    'slow': ['go', 'show', 'know', 'grow', 'flow', 'glow', 'throw'],
    'hot': ['pot', 'lot', 'got', 'not', 'spot', 'shot', 'dot'],
    'cold': ['old', 'gold', 'bold', 'told', 'hold', 'fold', 'sold'],
    'new': ['blue', 'true', 'few', 'grew', 'flew', 'threw', 'crew'],
    'old': ['cold', 'gold', 'bold', 'told', 'hold', 'fold', 'sold']
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      const gameTimer = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            clearInterval(gameTimer);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const promptTimer = setInterval(() => {
        setPromptTime(prev => {
          if (prev <= 1) {
            nextPrompt();
            return 3;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(gameTimer);
        clearInterval(promptTimer);
      };
    }
  }, [gameState, promptIndex]);

  const initializeGame = () => {
    // Initialize players
    const humanPlayer = {
      id: 'player_1',
      name: 'You',
      isAI: false,
      score: 0,
      wordsSubmitted: 0
    };

    const aiPlayers = [];
    for (let i = 1; i < 3; i++) {
      aiPlayers.push({
        id: `ai_${i}`,
        name: playerNames[Math.floor(Math.random() * playerNames.length)],
        isAI: true,
        score: 0,
        wordsSubmitted: 0
      });
    }

    const allPlayers = [humanPlayer, ...aiPlayers];
    setPlayers(allPlayers);

    // Initialize scores
    const initialScores = {};
    allPlayers.forEach(player => {
      initialScores[player.id] = 0;
    });
    setScores(initialScores);

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
        if (prev >= 3) {
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
    setCurrentPrompt(promptWords[0]);
    setPromptIndex(0);
    setPromptTime(3);
    
    // Focus input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const nextPrompt = () => {
    // Process current round
    processRound();
    
    // Move to next prompt
    if (promptIndex < 19) { // 20 prompts total
      const nextIndex = promptIndex + 1;
      setPromptIndex(nextIndex);
      setCurrentPrompt(promptWords[nextIndex]);
      setPlayerInput('');
      setSubmittedWords([]);
      setPromptTime(3);
    } else {
      endGame();
    }
  };

  const processRound = () => {
    const roundData = {
      prompt: currentPrompt,
      words: [...submittedWords]
    };

    // AI submissions
    players.forEach(player => {
      if (player.isAI) {
        const aiWords = generateAIWords(currentPrompt, 2 + Math.floor(Math.random() * 3));
        aiWords.forEach(word => {
          roundData.words.push({
            word,
            player: player.id,
            score: calculateWordScore(word, currentPrompt)
          });
        });
      }
    });

    // Calculate scores for this round
    roundData.words.forEach(wordData => {
      setScores(prev => ({
        ...prev,
        [wordData.player]: (prev[wordData.player] || 0) + wordData.score
      }));
    });

    setRoundResults(prev => [...prev, roundData]);
  };

  const generateAIWords = (prompt, count) => {
    const rhymes = rhymeDatabase[prompt] || [];
    const words = [];
    
    for (let i = 0; i < count && i < rhymes.length; i++) {
      const randomIndex = Math.floor(Math.random() * rhymes.length);
      const word = rhymes[randomIndex];
      if (!words.includes(word)) {
        words.push(word);
      }
    }
    
    return words;
  };

  const calculateWordScore = (word, prompt) => {
    // Check if word rhymes (simplified rhyme checking)
    const rhymes = rhymeDatabase[prompt] || [];
    const doesRhyme = rhymes.includes(word.toLowerCase()) || 
                     word.toLowerCase().endsWith(prompt.slice(-2)) ||
                     checkSoundRhyme(word, prompt);
    
    if (!doesRhyme) return 0;
    
    // Base score for rhyming
    let score = 10;
    
    // Complexity bonus (longer words)
    score += Math.max(0, word.length - 3) * 2;
    
    // Originality bonus (less common words get higher scores)
    const commonWords = ['cat', 'bat', 'hat', 'mat', 'rat', 'sat'];
    if (!commonWords.includes(word.toLowerCase())) {
      score += 5;
    }
    
    return score;
  };

  const checkSoundRhyme = (word1, word2) => {
    // Simple sound-based rhyme checking
    const endings = [
      word1.slice(-2).toLowerCase(),
      word1.slice(-3).toLowerCase(),
      word2.slice(-2).toLowerCase(),
      word2.slice(-3).toLowerCase()
    ];
    
    return endings[0] === endings[2] || endings[1] === endings[3];
  };

  const handleInputChange = (e) => {
    setPlayerInput(e.target.value);
  };

  const handleInputSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      submitWord();
    }
  };

  const submitWord = () => {
    if (!playerInput.trim() || gameState !== 'playing') return;
    
    const word = playerInput.trim().toLowerCase();
    const score = calculateWordScore(word, currentPrompt);
    
    setSubmittedWords(prev => [...prev, {
      word,
      player: 'player_1',
      score
    }]);
    
    setPlayerInput('');
    
    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const endGame = () => {
    setGameState('gameOver');
    
    // Process final round if needed
    if (submittedWords.length > 0) {
      processRound();
    }
  };

  const getWinner = () => {
    const sortedPlayers = players
      .map(player => ({
        ...player,
        finalScore: scores[player.id] || 0
      }))
      .sort((a, b) => b.finalScore - a.finalScore);
    
    return sortedPlayers[0];
  };

  return (
    <div className="word-weaver-game">
      <div className="game-header">
        <div className="game-info">
          <h3>📝 Word Weaver</h3>
          <div className="game-stats">
            <span>Round: {promptIndex + 1}/20</span>
            <span>Time: {gameTime}s</span>
          </div>
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        {gameState === 'waiting' && (
          <div className="waiting-screen">
            <h2>Waiting for Players...</h2>
            <p>Players joined: {playerCount}/3</p>
            {waitTime > 3 && <p>Game starts in: {waitTime} seconds</p>}
            {waitTime <= 3 && <p>Starting in: {waitTime}...</p>}
          </div>
        )}

        {gameState === 'playing' && (
          <div className="game-screen">
            <div className="prompt-section">
              <h2>Find words that rhyme with:</h2>
              <div className="current-prompt">{currentPrompt}</div>
              <div className="prompt-timer">Next word in: {promptTime}s</div>
            </div>

            <div className="input-section">
              <input
                ref={inputRef}
                type="text"
                value={playerInput}
                onChange={handleInputChange}
                onKeyPress={handleInputSubmit}
                placeholder="Type a rhyming word..."
                className="word-input"
              />
              <button onClick={handleInputSubmit} className="submit-btn">
                Submit
              </button>
            </div>

            <div className="submitted-words">
              <h4>Your words this round:</h4>
              <div className="words-list">
                {submittedWords
                  .filter(w => w.player === 'player_1')
                  .map((wordData, index) => (
                    <span key={index} className={`word-chip ${wordData.score > 0 ? 'valid' : 'invalid'}`}>
                      {wordData.word} ({wordData.score})
                    </span>
                  ))}
              </div>
            </div>

            <div className="players-section">
              <h4>Scores</h4>
              {players.map(player => (
                <div key={player.id} className="player-score">
                  <span className="player-name">{player.name}</span>
                  <span className="player-points">{scores[player.id] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="game-over-screen">
            <h2>Game Over!</h2>
            <h3>🏆 {getWinner()?.name} Wins!</h3>
            
            <div className="final-scores">
              {players
                .map(player => ({
                  ...player,
                  finalScore: scores[player.id] || 0
                }))
                .sort((a, b) => b.finalScore - a.finalScore)
                .map((player, index) => (
                  <div key={player.id} className="final-score">
                    <span>#{index + 1}</span>
                    <span>{player.name}</span>
                    <span>{player.finalScore} points</span>
                  </div>
                ))}
            </div>

            <button onClick={() => window.location.reload()} className="restart-btn">
              Play Again
            </button>
            <button onClick={onClose} className="exit-btn">Exit</button>
          </div>
        )}
      </div>

      <div className="game-controls">
        <h4>🎮 How to Play</h4>
        <p>1. A prompt word appears every 3 seconds</p>
        <p>2. Type as many rhyming words as you can</p>
        <p>3. Press Enter to submit each word</p>
        <p>4. Score = Rhyme × Complexity × Originality</p>
        <p>5. Highest total score after 20 prompts wins!</p>
      </div>
    </div>
  );
};

export default WordWeaver;

