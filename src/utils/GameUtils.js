// Game utility functions for AI population and countdown timers

// Realistic usernames for AI players
export const generateRealisticUsernames = () => {
  const firstNames = [
    'Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery', 'Quinn',
    'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden', 'Jamie', 'Kai',
    'Logan', 'Micah', 'Noah', 'Parker', 'Reese', 'Sage', 'Skyler', 'Tanner',
    'Zion', 'Ari', 'Bryce', 'Charlie', 'Dakota', 'Ellis', 'Frankie', 'Gray',
    'Hunter', 'Indigo', 'Jesse', 'Kendall', 'Lane', 'Max', 'Nico', 'Ocean',
    'Phoenix', 'River', 'Sam', 'True', 'Val', 'Winter', 'Zen', 'Ash',
    'Bay', 'Cruz', 'Dallas', 'Echo', 'Fox', 'Gale', 'Haven', 'Iris',
    'Jude', 'Knox', 'Lux', 'Marlowe', 'Nova', 'Onyx', 'Pace', 'Reign',
    'Storm', 'Tate', 'Unity', 'Vale', 'Wren', 'Zara', 'Ace', 'Blue'
  ];

  const suffixes = [
    'Pro', 'Master', 'King', 'Queen', 'Ace', 'Star', 'Hero', 'Legend',
    'Ninja', 'Warrior', 'Champion', 'Elite', 'Boss', 'Chief', 'Captain',
    'Lord', 'Lady', 'Duke', 'Count', 'Baron', 'Knight', 'Sage', 'Wizard',
    'Mage', 'Hunter', 'Ranger', 'Scout', 'Guard', 'Defender', 'Striker',
    'Slayer', 'Crusher', 'Breaker', 'Maker', 'Builder', 'Creator', 'Forge',
    'Storm', 'Thunder', 'Lightning', 'Fire', 'Ice', 'Shadow', 'Light',
    'Dark', 'Bright', 'Swift', 'Quick', 'Fast', 'Rapid', 'Speed', 'Rush'
  ];

  const numbers = ['', '99', '2024', '007', '21', '42', '88', '777', '123', '456'];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const number = numbers[Math.floor(Math.random() * numbers.length)];

  return `${firstName}${suffix}${number}`;
};

// AI population timer with countdown for last 3 seconds
export const useAIPopulation = (
  maxPlayers,
  currentPlayerCount,
  setPlayerCount,
  onGameStart,
  initialWaitTime = 30
) => {
  const [waitTime, setWaitTime] = React.useState(initialWaitTime);
  const [showCountdown, setShowCountdown] = React.useState(false);

  React.useEffect(() => {
    const waitTimer = setInterval(() => {
      setWaitTime(prev => {
        if (prev <= 3 && prev > 0) {
          setShowCountdown(true);
        }
        
        if (prev <= 1) {
          clearInterval(waitTimer);
          // Fill remaining slots with AI
          const aiPlayersNeeded = maxPlayers - currentPlayerCount;
          if (aiPlayersNeeded > 0) {
            const aiPlayers = [];
            for (let i = 0; i < aiPlayersNeeded; i++) {
              aiPlayers.push({
                id: `ai_${Date.now()}_${i}`,
                name: generateRealisticUsernames(),
                isAI: true,
                joinTime: Date.now()
              });
            }
            setPlayerCount(maxPlayers);
          }
          onGameStart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate real players joining randomly
    const joinTimer = setInterval(() => {
      setPlayerCount(prev => {
        if (prev >= maxPlayers) {
          clearInterval(joinTimer);
          return prev;
        }
        // Random chance for players to join
        if (Math.random() < 0.3) {
          return Math.min(prev + 1, maxPlayers);
        }
        return prev;
      });
    }, 2000);

    return () => {
      clearInterval(waitTimer);
      clearInterval(joinTimer);
    };
  }, [maxPlayers, currentPlayerCount, setPlayerCount, onGameStart]);

  return { waitTime, showCountdown };
};

// Countdown component for last 3 seconds
export const CountdownOverlay = ({ countdown, show }) => {
  if (!show || countdown > 3) return null;

  return (
    <div className="countdown-overlay">
      <div className="countdown-number">{countdown}</div>
    </div>
  );
};

// Generate AI player with realistic stats
export const generateAIPlayer = (gameType, playerId) => {
  const name = generateRealisticUsernames();
  
  const basePlayer = {
    id: playerId,
    name,
    isAI: true,
    joinTime: Date.now(),
    alive: true,
    score: 0
  };

  // Game-specific AI properties
  switch (gameType) {
    case 'bigfish':
      return {
        ...basePlayer,
        x: Math.random() * 2000 + 500,
        y: Math.random() * 2000 + 500,
        size: 15 + Math.random() * 10,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        vx: 0,
        vy: 0,
        targetFood: null,
        targetFish: null,
        changeDirectionTimer: 0
      };

    case 'pixelpython':
      return {
        ...basePlayer,
        x: Math.random() * 18000 + 1000,
        y: Math.random() * 18000 + 1000,
        segments: [],
        direction: { x: 1, y: 0 },
        length: 3,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        targetFood: null
      };

    case 'puzzles':
      return {
        ...basePlayer,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        piecesPlaced: 0,
        lastMoveTime: Date.now(),
        targetPiece: null
      };

    case 'stickmanfighter':
      const colors = ['red', 'blue', 'green', 'purple', 'orange', 'cyan'];
      return {
        ...basePlayer,
        x: Math.random() * 600 + 100,
        y: 500,
        vx: 0,
        vy: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        hasWeapon: null,
        health: 100
      };

    default:
      return basePlayer;
  }
};

// Common AI behavior patterns
export const aiMovementPatterns = {
  // Random movement with occasional direction changes
  randomWalk: (aiPlayer, changeDirectionChance = 0.1) => {
    if (Math.random() < changeDirectionChance) {
      const angle = Math.random() * Math.PI * 2;
      return {
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2
      };
    }
    return { vx: aiPlayer.vx, vy: aiPlayer.vy };
  },

  // Move towards target with some randomness
  seekTarget: (aiPlayer, target, speed = 2, randomness = 0.2) => {
    if (!target) return { vx: 0, vy: 0 };
    
    const dx = target.x - aiPlayer.x;
    const dy = target.y - aiPlayer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      // Add some randomness to make AI less predictable
      const randomAngle = (Math.random() - 0.5) * randomness;
      const cos = Math.cos(randomAngle);
      const sin = Math.sin(randomAngle);
      
      return {
        vx: (normalizedDx * cos - normalizedDy * sin) * speed,
        vy: (normalizedDx * sin + normalizedDy * cos) * speed
      };
    }
    
    return { vx: 0, vy: 0 };
  },

  // Avoid threats while seeking targets
  avoidAndSeek: (aiPlayer, threats, targets, avoidRadius = 100, seekRadius = 200) => {
    let avoidVx = 0, avoidVy = 0;
    let seekVx = 0, seekVy = 0;
    
    // Avoid threats
    threats.forEach(threat => {
      const dx = aiPlayer.x - threat.x;
      const dy = aiPlayer.y - threat.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < avoidRadius && distance > 0) {
        const force = (avoidRadius - distance) / avoidRadius;
        avoidVx += (dx / distance) * force * 3;
        avoidVy += (dy / distance) * force * 3;
      }
    });
    
    // Seek targets
    if (targets.length > 0) {
      const nearestTarget = targets.reduce((nearest, target) => {
        const distance = Math.sqrt(
          Math.pow(target.x - aiPlayer.x, 2) + Math.pow(target.y - aiPlayer.y, 2)
        );
        return !nearest || distance < nearest.distance 
          ? { target, distance } 
          : nearest;
      }, null);
      
      if (nearestTarget && nearestTarget.distance < seekRadius) {
        const movement = aiMovementPatterns.seekTarget(
          aiPlayer, 
          nearestTarget.target, 
          1.5, 
          0.3
        );
        seekVx = movement.vx;
        seekVy = movement.vy;
      }
    }
    
    return {
      vx: avoidVx + seekVx,
      vy: avoidVy + seekVy
    };
  }
};

// Spectator mode utilities
export const spectatorMode = {
  // Create spectator session with 20-minute delay
  createSession: (gameId, gameData) => {
    const delayedData = {
      ...gameData,
      timestamp: Date.now(),
      spectatorDelay: 20 * 60 * 1000 // 20 minutes in milliseconds
    };
    
    // Store in session storage for spectator mode
    sessionStorage.setItem(`spectator_${gameId}`, JSON.stringify(delayedData));
    return delayedData;
  },

  // Get spectator data with proper delay
  getSpectatorData: (gameId) => {
    const stored = sessionStorage.getItem(`spectator_${gameId}`);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    const now = Date.now();
    const gameTime = data.timestamp;
    const delay = data.spectatorDelay;
    
    // Only return data if enough time has passed
    if (now - gameTime >= delay) {
      return data;
    }
    
    return null;
  },

  // Check if spectator mode is available
  isAvailable: (gameId) => {
    const data = spectatorMode.getSpectatorData(gameId);
    return data !== null;
  }
};

export default {
  generateRealisticUsernames,
  useAIPopulation,
  CountdownOverlay,
  generateAIPlayer,
  aiMovementPatterns,
  spectatorMode
};

