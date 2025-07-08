import React, { useState, useEffect } from 'react';
import './Hangman.css';

const Hangman = ({ onClose }) => {
  const [gameMode, setGameMode] = useState('menu'); // 'menu', 'create', 'guess'
  const [currentWord, setCurrentWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
  const [customWord, setCustomWord] = useState('');
  const [score, setScore] = useState({ wins: 0, losses: 0 });
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false);

  const maxWrongGuesses = 6;

  // Common English words for random selection
  const wordList = [
    { word: 'JAVASCRIPT', hint: 'Programming language' },
    { word: 'COMPUTER', hint: 'Electronic device' },
    { word: 'INTERNET', hint: 'Global network' },
    { word: 'KEYBOARD', hint: 'Input device' },
    { word: 'MONITOR', hint: 'Display screen' },
    { word: 'SOFTWARE', hint: 'Computer programs' },
    { word: 'HARDWARE', hint: 'Physical components' },
    { word: 'WEBSITE', hint: 'Online page' },
    { word: 'BROWSER', hint: 'Web navigator' },
    { word: 'DOWNLOAD', hint: 'Get from internet' },
    { word: 'UPLOAD', hint: 'Send to server' },
    { word: 'PASSWORD', hint: 'Security code' },
    { word: 'DATABASE', hint: 'Data storage' },
    { word: 'NETWORK', hint: 'Connected systems' },
    { word: 'ALGORITHM', hint: 'Problem-solving steps' },
    { word: 'FUNCTION', hint: 'Code block' },
    { word: 'VARIABLE', hint: 'Data container' },
    { word: 'DEBUGGING', hint: 'Finding errors' },
    { word: 'PROGRAMMING', hint: 'Writing code' },
    { word: 'TECHNOLOGY', hint: 'Modern innovation' }
  ];

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const startRandomGame = () => {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    setCurrentWord(randomWord.word.toUpperCase());
    setHint(randomWord.hint);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameState('playing');
    setGameMode('guess');
    setShowHint(false);
  };

  // Dictionary of valid English words
  const validWords = new Set([
    'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
    'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
    'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
    'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AVOID', 'AWAKE', 'AWARD',
    'AWARE', 'BADLY', 'BAKER', 'BASES', 'BASIC', 'BEACH', 'BEGAN', 'BEGIN', 'BEING', 'BELOW',
    'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLANK', 'BLAST', 'BLIND', 'BLOCK', 'BLOOD',
    'BOARD', 'BOAST', 'BOBBY', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BRASS', 'BRAVE',
    'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BUILT',
    'BUYER', 'CABLE', 'CALIF', 'CARRY', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHAOS', 'CHARM',
    'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHOSE', 'CIVIL',
    'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLIMB', 'CLOCK', 'CLOSE', 'CLOUD', 'COACH',
    'COAST', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRAFT', 'CRASH', 'CRAZY', 'CREAM', 'CRIME',
    'CROSS', 'CROWD', 'CROWN', 'CRUDE', 'CURVE', 'CYCLE', 'DAILY', 'DANCE', 'DATED', 'DEALT',
    'DEATH', 'DEBUT', 'DELAY', 'DEPTH', 'DOING', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA', 'DRANK',
    'DREAM', 'DRESS', 'DRILL', 'DRINK', 'DRIVE', 'DROVE', 'DYING', 'EAGER', 'EARLY', 'EARTH',
    'EIGHT', 'ELITE', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR', 'EVENT',
    'EVERY', 'EXACT', 'EXIST', 'EXTRA', 'FAITH', 'FALSE', 'FAULT', 'FIBER', 'FIELD', 'FIFTH',
    'FIFTY', 'FIGHT', 'FINAL', 'FIRST', 'FIXED', 'FLASH', 'FLEET', 'FLOOR', 'FLUID', 'FOCUS',
    'FORCE', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FRESH', 'FRONT',
    'FRUIT', 'FULLY', 'FUNNY', 'GIANT', 'GIVEN', 'GLASS', 'GLOBE', 'GOING', 'GRACE', 'GRADE',
    'GRAND', 'GRANT', 'GRASS', 'GRAVE', 'GREAT', 'GREEN', 'GROSS', 'GROUP', 'GROWN', 'GUARD',
    'GUESS', 'GUEST', 'GUIDE', 'HAPPY', 'HARRY', 'HEART', 'HEAVY', 'HENCE', 'HENRY', 'HORSE',
    'HOTEL', 'HOUSE', 'HUMAN', 'IDEAL', 'IMAGE', 'INDEX', 'INNER', 'INPUT', 'ISSUE', 'JAPAN',
    'JIMMY', 'JOINT', 'JONES', 'JUDGE', 'KNOWN', 'LABEL', 'LARGE', 'LASER', 'LATER', 'LAUGH',
    'LAYER', 'LEARN', 'LEASE', 'LEAST', 'LEAVE', 'LEGAL', 'LEVEL', 'LEWIS', 'LIGHT', 'LIMIT',
    'LINKS', 'LIVES', 'LOCAL', 'LOOSE', 'LOWER', 'LUCKY', 'LUNCH', 'LYING', 'MAGIC', 'MAJOR',
    'MAKER', 'MARCH', 'MARIA', 'MATCH', 'MAYBE', 'MAYOR', 'MEANT', 'MEDIA', 'METAL', 'MIGHT',
    'MINOR', 'MINUS', 'MIXED', 'MODEL', 'MONEY', 'MONTH', 'MORAL', 'MOTOR', 'MOUNT', 'MOUSE',
    'MOUTH', 'MOVED', 'MOVIE', 'MUSIC', 'NEEDS', 'NEVER', 'NEWLY', 'NIGHT', 'NOISE', 'NORTH',
    'NOTED', 'NOVEL', 'NURSE', 'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'ORDER', 'OTHER', 'OUGHT',
    'PAINT', 'PANEL', 'PAPER', 'PARTY', 'PEACE', 'PETER', 'PHASE', 'PHONE', 'PHOTO', 'PIANO',
    'PIECE', 'PILOT', 'PITCH', 'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND',
    'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE', 'PROOF', 'PROUD',
    'PROVE', 'QUEEN', 'QUICK', 'QUIET', 'QUITE', 'RADIO', 'RAISE', 'RANGE', 'RAPID', 'RATIO',
    'REACH', 'READY', 'REALM', 'REBEL', 'REFER', 'RELAX', 'REPAY', 'REPLY', 'RIGHT', 'RIGID',
    'RIVAL', 'RIVER', 'ROBIN', 'ROGER', 'ROMAN', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL',
    'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SEVEN', 'SHALL', 'SHAPE', 'SHARE',
    'SHARP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIRT', 'SHOCK', 'SHOOT', 'SHORT',
    'SHOWN', 'SIGHT', 'SILLY', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SKILL', 'SLEEP', 'SLIDE',
    'SMALL', 'SMART', 'SMILE', 'SMITH', 'SMOKE', 'SNAKE', 'SNOW', 'SOLID', 'SOLVE', 'SORRY',
    'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT', 'SPLIT', 'SPOKE',
    'SPORT', 'STAFF', 'STAGE', 'STAKE', 'STAND', 'START', 'STATE', 'STEAM', 'STEEL', 'STEEP',
    'STEER', 'STICK', 'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 'STRIP',
    'STUCK', 'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'SWEET', 'TABLE', 'TAKEN',
    'TASTE', 'TAXES', 'TEACH', 'TEAMS', 'TEETH', 'TERRY', 'TEXAS', 'THANK', 'THEFT', 'THEIR',
    'THEME', 'THERE', 'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THREW',
    'THROW', 'THUMB', 'TIGER', 'TIGHT', 'TIMER', 'TIMES', 'TIRED', 'TITLE', 'TODAY', 'TOKEN',
    'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH', 'TOWER', 'TRACK', 'TRADE', 'TRAIN', 'TREAT', 'TREND',
    'TRIAL', 'TRIBE', 'TRICK', 'TRIED', 'TRIES', 'TRUCK', 'TRULY', 'TRUNK', 'TRUST', 'TRUTH',
    'TWICE', 'TWIST', 'TYLER', 'UNCLE', 'UNDER', 'UNDUE', 'UNION', 'UNITY', 'UNTIL', 'UPPER',
    'UPSET', 'URBAN', 'USAGE', 'USUAL', 'VALID', 'VALUE', 'VIDEO', 'VIRUS', 'VISIT', 'VITAL',
    'VOCAL', 'VOICE', 'WASTE', 'WATCH', 'WATER', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE',
    'WHOLE', 'WHOSE', 'WOMAN', 'WOMEN', 'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD',
    'WRITE', 'WRONG', 'WROTE', 'YOUNG', 'YOUTH'
  ]);

  const startCustomGame = () => {
    if (customWord.length < 3) {
      alert('Word must be at least 3 letters long!');
      return;
    }
    
    // Validate that it's a real word (basic check - only letters)
    if (!/^[A-Za-z]+$/.test(customWord)) {
      alert('Please enter only letters!');
      return;
    }

    // Check if word exists in dictionary
    if (!validWords.has(customWord.toUpperCase())) {
      alert('Please enter a valid English word from the dictionary!');
      return;
    }

    setCurrentWord(customWord.toUpperCase());
    setHint('Custom word');
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameState('playing');
    setGameMode('guess');
    setCustomWord('');
    setShowHint(false);
  };

  const guessLetter = (letter) => {
    if (guessedLetters.includes(letter) || gameState !== 'playing') {
      return;
    }

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= maxWrongGuesses) {
        setGameState('lost');
        setScore(prev => ({ ...prev, losses: prev.losses + 1 }));
      }
    } else {
      // Check if word is complete
      const isComplete = currentWord.split('').every(char => newGuessedLetters.includes(char));
      if (isComplete) {
        setGameState('won');
        setScore(prev => ({ ...prev, wins: prev.wins + 1 }));
      }
    }
  };

  const getDisplayWord = () => {
    return currentWord.split('').map(letter => 
      guessedLetters.includes(letter) ? letter : '_'
    ).join(' ');
  };

  const getHangmanDrawing = () => {
    const parts = [
      '  ____',
      '  |  |',
      '  |  O',
      '  | /|\\',
      '  | / \\',
      '  |',
      '__|__'
    ];

    const visibleParts = Math.min(wrongGuesses + 2, parts.length);
    return parts.slice(0, visibleParts);
  };

  const resetGame = () => {
    setGameMode('menu');
    setCurrentWord('');
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameState('playing');
    setShowHint(false);
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  return (
    <div className="hangman-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🎯 Hangman</h3>
          <div className="score-display">
            <span className="wins">Wins: {score.wins}</span>
            <span className="losses">Losses: {score.losses}</span>
          </div>
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        {gameMode === 'menu' && (
          <div className="menu-screen">
            <h2>Choose Game Mode</h2>
            <div className="menu-buttons">
              <button className="mode-btn guess-btn" onClick={startRandomGame}>
                <div className="btn-icon">🎲</div>
                <div className="btn-text">
                  <h4>Guess the Word</h4>
                  <p>Try to guess a random word</p>
                </div>
              </button>
              
              <div className="create-word-section">
                <button className="mode-btn create-btn" onClick={() => setGameMode('create')}>
                  <div className="btn-icon">✏️</div>
                  <div className="btn-text">
                    <h4>Create Word</h4>
                    <p>Challenge someone with your word</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {gameMode === 'create' && (
          <div className="create-screen">
            <h2>Create a Word</h2>
            <div className="create-form">
              <input
                type="text"
                placeholder="Enter your word (letters only)"
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                maxLength="15"
                className="word-input"
              />
              <div className="create-buttons">
                <button onClick={startCustomGame} className="start-btn">Start Game</button>
                <button onClick={() => setGameMode('menu')} className="back-btn">Back</button>
              </div>
            </div>
            <div className="create-rules">
              <h4>Rules for Creating Words:</h4>
              <ul>
                <li>Must be at least 3 letters long</li>
                <li>Only letters allowed (no numbers or symbols)</li>
                <li>Must be a real English word</li>
                <li>Maximum 15 letters</li>
              </ul>
            </div>
          </div>
        )}

        {gameMode === 'guess' && (
          <div className="game-screen">
            <div className="hangman-display">
              <div className="gallows">
                {getHangmanDrawing().map((line, index) => (
                  <div key={index} className="gallows-line">{line}</div>
                ))}
              </div>
            </div>

            <div className="word-display">
              <h2>{getDisplayWord()}</h2>
              {hint && (
                <div className="hint-section">
                  <button onClick={toggleHint} className="hint-btn">
                    {showHint ? 'Hide Hint' : 'Show Hint'} 💡
                  </button>
                  {showHint && <p className="hint-text">Hint: {hint}</p>}
                </div>
              )}
            </div>

            <div className="game-stats">
              <div className="wrong-guesses">
                Wrong guesses: {wrongGuesses}/{maxWrongGuesses}
              </div>
              <div className="guessed-letters">
                {guessedLetters.length > 0 && (
                  <>
                    Guessed: {guessedLetters.join(', ')}
                  </>
                )}
              </div>
            </div>

            {gameState === 'playing' && (
              <div className="alphabet">
                {alphabet.map(letter => (
                  <button
                    key={letter}
                    onClick={() => guessLetter(letter)}
                    disabled={guessedLetters.includes(letter)}
                    className={`letter-btn ${guessedLetters.includes(letter) ? 'used' : ''} ${
                      guessedLetters.includes(letter) && !currentWord.includes(letter) ? 'wrong' : ''
                    } ${
                      guessedLetters.includes(letter) && currentWord.includes(letter) ? 'correct' : ''
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            )}

            {gameState === 'won' && (
              <div className="game-result win">
                <h2>🎉 You Won!</h2>
                <p>The word was: <strong>{currentWord}</strong></p>
                <div className="result-buttons">
                  <button onClick={startRandomGame} className="play-again-btn">Play Again</button>
                  <button onClick={resetGame} className="menu-btn">Main Menu</button>
                </div>
              </div>
            )}

            {gameState === 'lost' && (
              <div className="game-result lose">
                <h2>💀 Game Over!</h2>
                <p>The word was: <strong>{currentWord}</strong></p>
                <div className="result-buttons">
                  <button onClick={startRandomGame} className="play-again-btn">Play Again</button>
                  <button onClick={resetGame} className="menu-btn">Main Menu</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="game-rules">
        <h4>How to Play:</h4>
        <div className="rules-list">
          <p>🎯 Guess the hidden word by selecting letters</p>
          <p>❌ Each wrong guess adds a part to the hangman</p>
          <p>🏆 Guess the word before the drawing is complete to win</p>
          <p>💡 Use hints if you're stuck</p>
        </div>
      </div>
    </div>
  );
};

export default Hangman;

