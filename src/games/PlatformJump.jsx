import React, { useState, useEffect, useRef } from 'react';
import './PlatformJump.css';

const PlatformJump = ({ onClose }) => {
  const canvasRef = useRef(null);
  const gameStateRef = useRef({
    players: [],
    platforms: [],
    tokens: [],
    gameTime: 120,
    gameStarted: false,
    gameEnded: false,
    winner: null,
    scores: {},
    difficulty: 1
  });

  const [gameState, setGameState] = useState(gameStateRef.current);
  const [showRules, setShowRules] = useState(true);

  // Initialize game
  useEffect(() => {
    if (!showRules) {
      initializeGame();
    }
  }, [showRules]);

  const initializeGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // Initialize players
    const players = [
      { id: 1, name: 'Player1', x: 100, y: 500, vx: 0, vy: 0, color: '#4CAF50', isUser: true, alive: true },
      { id: 2, name: 'JumpMaster', x: 200, y: 500, vx: 0, vy: 0, color: '#2196F3', isUser: false, alive: true },
      { id: 3, name: 'SkyLeaper', x: 300, y: 500, vx: 0, vy: 0, color: '#FF9800', isUser: false, alive: true },
      { id: 4, name: 'CloudHopper', x: 400, y: 500, vx: 0, vy: 0, color: '#9C27B0', isUser: false, alive: true }
    ];

    // Initialize platforms
    const platforms = [
      // Starting platform
      { x: 50, y: 520, width: 700, height: 20, type: 'ground' },
      // Initial platforms
      { x: 100, y: 450, width: 120, height: 15, type: 'brick' },
      { x: 300, y: 400, width: 120, height: 15, type: 'grass' },
      { x: 500, y: 350, width: 120, height: 15, type: 'blue' },
      { x: 150, y: 300, width: 120, height: 15, type: 'grass' },
      { x: 400, y: 250, width: 120, height: 15, type: 'brick' },
      { x: 600, y: 200, width: 120, height: 15, type: 'blue' },
    ];

    // Initialize tokens
    const tokens = [
      { x: 160, y: 430, type: 'coin', collected: false },
      { x: 360, y: 380, type: 'coin', collected: false },
      { x: 560, y: 330, type: 'special', collected: false },
      { x: 210, y: 280, type: 'coin', collected: false },
      { x: 460, y: 230, type: 'special', collected: false },
    ];

    // Initialize scores
    const scores = {};
    players.forEach(player => {
      scores[player.id] = {
        platformsJumped: 0,
        pushes: 0,
        pulls: 0,
        timesPushed: 0,
        coinsCollected: 0,
        specialCoinsCollected: 0,
        totalScore: 0
      };
    });

    gameStateRef.current = {
      players,
      platforms,
      tokens,
      gameTime: 120,
      gameStarted: true,
      gameEnded: false,
      winner: null,
      scores,
      difficulty: 1
    };

    setGameState({ ...gameStateRef.current });
    startGameLoop();
  };

  const startGameLoop = () => {
    const gameLoop = () => {
      if (gameStateRef.current.gameEnded) return;

      updateGame();
      renderGame();
      
      if (gameStateRef.current.gameTime > 0 && !gameStateRef.current.gameEnded) {
        requestAnimationFrame(gameLoop);
      }
    };

    // Start timer
    const timer = setInterval(() => {
      if (gameStateRef.current.gameTime > 0 && !gameStateRef.current.gameEnded) {
        gameStateRef.current.gameTime -= 1;
        
        if (gameStateRef.current.gameTime <= 0) {
          endGame();
          clearInterval(timer);
        }
        
        setGameState({ ...gameStateRef.current });
      }
    }, 1000);

    gameLoop();
  };

  const updateGame = () => {
    const { players, platforms, tokens } = gameStateRef.current;
    
    // Update physics for each player
    players.forEach(player => {
      if (!player.alive) return;

      // Apply gravity
      player.vy += 0.8;
      
      // Update position
      player.x += player.vx;
      player.y += player.vy;
      
      // Apply friction
      player.vx *= 0.85;
      
      // Keep player within canvas bounds
      if (player.x < 0) {
        player.x = 0;
        player.vx = 0;
      }
      if (player.x > 780) {
        player.x = 780;
        player.vx = 0;
      }
      
      // Check platform collisions
      let onPlatform = false;
      platforms.forEach(platform => {
        // Check if player is landing on top of platform
        if (player.x + 20 > platform.x && 
            player.x < platform.x + platform.width &&
            player.y + 20 > platform.y && 
            player.y + 20 < platform.y + platform.height + 10 &&
            player.vy > 0) {
          player.y = platform.y - 20;
          player.vy = 0;
          onPlatform = true;
          
          // Track platform jumping for score
          if (!player.lastPlatform || player.lastPlatform !== platform) {
            gameStateRef.current.scores[player.id].platformsJumped++;
            player.lastPlatform = platform;
            updateScore(player.id);
          }
        }
        
        // Side collisions
        if (player.x + 20 > platform.x && 
            player.x < platform.x + platform.width &&
            player.y + 20 > platform.y && 
            player.y < platform.y + platform.height) {
          
          // Push player out from the side
          if (player.x + 10 < platform.x + platform.width / 2) {
            player.x = platform.x - 20;
          } else {
            player.x = platform.x + platform.width;
          }
          player.vx = 0;
        }
      });

      // Check token collection
      tokens.forEach(token => {
        if (!token.collected &&
            Math.abs(player.x + 10 - token.x) < 20 &&
            Math.abs(player.y + 10 - token.y) < 20) {
          token.collected = true;
          if (token.type === 'coin') {
            gameStateRef.current.scores[player.id].coinsCollected++;
          } else if (token.type === 'special') {
            gameStateRef.current.scores[player.id].specialCoinsCollected++;
          }
          updateScore(player.id);
        }
      });

      // Check player-to-player interactions (push/pull)
      players.forEach(otherPlayer => {
        if (otherPlayer.id !== player.id && otherPlayer.alive) {
          const dx = otherPlayer.x - player.x;
          const dy = otherPlayer.y - player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 35 && distance > 0) {
            // Calculate interaction force based on distance
            const force = Math.max(1, 4 - distance / 10);
            const angle = Math.atan2(dy, dx);
            
            // Determine if it's a push or pull based on player movement
            const isPush = (player.vx > 0 && dx > 0) || (player.vx < 0 && dx < 0);
            const interactionMultiplier = isPush ? 1.5 : 1;
            
            // Apply force to other player
            const forceX = Math.cos(angle) * force * interactionMultiplier;
            const forceY = Math.sin(angle) * force * interactionMultiplier * 0.3;
            
            otherPlayer.vx += forceX;
            otherPlayer.vy += forceY;
            
            // Apply reaction force to current player (Newton's 3rd law)
            player.vx -= forceX * 0.3;
            player.vy -= forceY * 0.3;
            
            // Visual feedback - make players flash when interacting
            player.interacting = true;
            otherPlayer.interacting = true;
            
            // Track interactions for scoring (limit frequency)
            if (Math.random() < 0.08) {
              if (isPush) {
                gameStateRef.current.scores[player.id].pushes++;
              } else {
                gameStateRef.current.scores[player.id].pulls++;
              }
              gameStateRef.current.scores[otherPlayer.id].timesPushed++;
              updateScore(player.id);
              updateScore(otherPlayer.id);
            }
          }
        }
      });

      // Reset interaction visual feedback
      if (player.interacting) {
        setTimeout(() => {
          player.interacting = false;
        }, 100);
      }

      // Check if player fell off screen
      if (player.y > 650) {
        player.alive = false;
      }

      // AI behavior for non-user players
      if (!player.isUser && player.alive) {
        updateAI(player);
      }
    });

    // Generate new platforms as players climb higher
    generateDynamicPlatforms();

    // Increase difficulty over time
    increaseDifficulty();

    // Check win conditions
    const alivePlayers = players.filter(p => p.alive);
    if (alivePlayers.length <= 1) {
      endGame();
    }
  };

  const updateAI = (player) => {
    // Enhanced AI: try to jump to nearest platform above and avoid other players
    const { platforms, players } = gameStateRef.current;
    
    const nearbyPlatforms = platforms.filter(p => 
      p.y < player.y - 30 && 
      p.y > player.y - 150 &&
      Math.abs(p.x + p.width/2 - player.x) < 200
    );

    if (nearbyPlatforms.length > 0 && Math.random() < 0.03) {
      const targetPlatform = nearbyPlatforms[Math.floor(Math.random() * nearbyPlatforms.length)];
      const direction = targetPlatform.x + targetPlatform.width/2 > player.x ? 1 : -1;
      
      player.vx = direction * (3 + Math.random() * 2);
      if (Math.abs(player.vy) < 1) { // Only jump if not already jumping
        player.vy = -12 - Math.random() * 5;
      }
    }

    // AI tries to push other players when close
    players.forEach(otherPlayer => {
      if (otherPlayer.id !== player.id && otherPlayer.alive) {
        const dx = otherPlayer.x - player.x;
        const dy = otherPlayer.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 40 && Math.random() < 0.05) {
          // Move towards other player to push them
          const direction = dx > 0 ? 1 : -1;
          player.vx += direction * 2;
        }
      }
    });
  };

  const generateDynamicPlatforms = () => {
    const { platforms, players } = gameStateRef.current;
    
    // Find the highest player position
    const highestPlayerY = Math.min(...players.filter(p => p.alive).map(p => p.y));
    
    // Generate new platforms above the highest player
    const highestPlatformY = Math.min(...platforms.map(p => p.y));
    
    if (highestPlayerY < highestPlatformY + 100) {
      // Add new platforms above
      for (let i = 0; i < 3; i++) {
        const newY = highestPlatformY - 80 - (i * 60);
        const newX = Math.random() * (800 - 120);
        const platformTypes = ['brick', 'grass', 'blue'];
        const type = platformTypes[Math.floor(Math.random() * platformTypes.length)];
        
        // Make platforms smaller as difficulty increases
        const width = Math.max(80, 120 - gameStateRef.current.difficulty * 5);
        
        platforms.push({
          x: newX,
          y: newY,
          width: width,
          height: 15,
          type: type
        });

        // Add tokens on some platforms
        if (Math.random() < 0.4) {
          const tokenType = Math.random() < 0.7 ? 'coin' : 'special';
          gameStateRef.current.tokens.push({
            x: newX + width/2,
            y: newY - 20,
            type: tokenType,
            collected: false
          });
        }
      }
    }

    // Remove platforms that are too far below
    const lowestPlayerY = Math.max(...players.filter(p => p.alive).map(p => p.y));
    gameStateRef.current.platforms = platforms.filter(p => p.y < lowestPlayerY + 200);
  };

  const increaseDifficulty = () => {
    const timeElapsed = 120 - gameStateRef.current.gameTime;
    const newDifficulty = 1 + Math.floor(timeElapsed / 20);
    
    if (newDifficulty > gameStateRef.current.difficulty) {
      gameStateRef.current.difficulty = newDifficulty;
      
      // Difficulty level 2: Platforms start disappearing
      if (gameStateRef.current.difficulty === 2) {
        gameStateRef.current.platforms.forEach(platform => {
          if (platform.type !== 'ground' && Math.random() < 0.15) {
            platform.disappearing = true;
            platform.alpha = 1;
          }
        });
      }
      
      // Difficulty level 3: Moving platforms
      if (gameStateRef.current.difficulty === 3) {
        gameStateRef.current.platforms.forEach(platform => {
          if (platform.type !== 'ground' && Math.random() < 0.2) {
            platform.moving = true;
            platform.moveSpeed = (Math.random() - 0.5) * 2;
            platform.originalX = platform.x;
            platform.moveRange = 100;
          }
        });
      }
      
      // Difficulty level 4: Faster disappearing and smaller platforms
      if (gameStateRef.current.difficulty === 4) {
        gameStateRef.current.platforms.forEach(platform => {
          if (platform.type !== 'ground' && Math.random() < 0.25) {
            platform.disappearing = true;
            platform.alpha = 1;
            platform.width = Math.max(60, platform.width * 0.8);
          }
        });
      }
      
      // Difficulty level 5: Extreme mode
      if (gameStateRef.current.difficulty >= 5) {
        gameStateRef.current.platforms.forEach(platform => {
          if (platform.type !== 'ground' && Math.random() < 0.3) {
            platform.disappearing = true;
            platform.alpha = 1;
            platform.width = Math.max(50, platform.width * 0.7);
          }
        });
      }
    }

    // Handle disappearing platforms
    gameStateRef.current.platforms.forEach(platform => {
      if (platform.disappearing) {
        platform.alpha -= 0.015 * gameStateRef.current.difficulty;
        if (platform.alpha <= 0) {
          platform.width = 0; // Make it non-collidable
        }
      }
      
      // Handle moving platforms
      if (platform.moving) {
        platform.x += platform.moveSpeed;
        if (Math.abs(platform.x - platform.originalX) > platform.moveRange) {
          platform.moveSpeed *= -1;
        }
        // Keep platforms within bounds
        if (platform.x < 0 || platform.x + platform.width > 800) {
          platform.moveSpeed *= -1;
        }
      }
    });

    // Add environmental hazards at higher difficulties
    if (gameStateRef.current.difficulty >= 3 && Math.random() < 0.001) {
      // Add falling debris
      gameStateRef.current.hazards = gameStateRef.current.hazards || [];
      gameStateRef.current.hazards.push({
        x: Math.random() * 800,
        y: -20,
        width: 15,
        height: 15,
        vy: 3,
        type: 'debris'
      });
    }

    // Update hazards
    if (gameStateRef.current.hazards) {
      gameStateRef.current.hazards.forEach(hazard => {
        hazard.y += hazard.vy;
        
        // Check collision with players
        gameStateRef.current.players.forEach(player => {
          if (player.alive &&
              player.x < hazard.x + hazard.width &&
              player.x + 20 > hazard.x &&
              player.y < hazard.y + hazard.height &&
              player.y + 20 > hazard.y) {
            // Push player down
            player.vy += 5;
            player.vx += (Math.random() - 0.5) * 4;
          }
        });
      });
      
      // Remove hazards that are off screen
      gameStateRef.current.hazards = gameStateRef.current.hazards.filter(h => h.y < 650);
    }
  };

  const endGame = () => {
    gameStateRef.current.gameEnded = true;
    
    // Determine winner based on survival and score
    const alivePlayers = gameStateRef.current.players.filter(p => p.alive);
    
    if (alivePlayers.length === 1) {
      // Last player standing wins
      gameStateRef.current.winner = alivePlayers[0];
      gameStateRef.current.winCondition = 'Last Player Standing';
    } else if (alivePlayers.length === 0) {
      // All players eliminated - find who survived longest or had highest score
      let winner = null;
      let highestScore = -1;
      gameStateRef.current.players.forEach(player => {
        const score = gameStateRef.current.scores[player.id].totalScore;
        if (score > highestScore) {
          highestScore = score;
          winner = player;
        }
      });
      gameStateRef.current.winner = winner;
      gameStateRef.current.winCondition = 'Highest Score (All Eliminated)';
    } else {
      // Multiple survivors - highest score wins
      let winner = null;
      let highestScore = -1;
      alivePlayers.forEach(player => {
        const score = gameStateRef.current.scores[player.id].totalScore;
        if (score > highestScore) {
          highestScore = score;
          winner = player;
        }
      });
      gameStateRef.current.winner = winner;
      gameStateRef.current.winCondition = 'Highest Score';
    }
    
    setGameState({ ...gameStateRef.current });
  };

  const updateScore = (playerId) => {
    const score = gameStateRef.current.scores[playerId];
    score.totalScore = score.platformsJumped + 
                     (score.pushes + score.pulls - score.timesPushed) + 
                     score.coinsCollected + 
                     (score.specialCoinsCollected * 3);
  };

  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas with sky background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    drawClouds(ctx);

    // Draw platforms
    gameStateRef.current.platforms.forEach(platform => {
      drawPlatform(ctx, platform);
    });

    // Draw tokens
    gameStateRef.current.tokens.forEach(token => {
      if (!token.collected) {
        drawToken(ctx, token);
      }
    });

    // Draw hazards
    if (gameStateRef.current.hazards) {
      gameStateRef.current.hazards.forEach(hazard => {
        drawHazard(ctx, hazard);
      });
    }

    // Draw players
    gameStateRef.current.players.forEach(player => {
      if (player.alive) {
        drawPlayer(ctx, player);
      }
    });

    // Draw UI
    drawUI(ctx);
  };

  const drawClouds = (ctx) => {
    ctx.fillStyle = 'white';
    // Static clouds for now
    const clouds = [
      { x: 100, y: 100, size: 40 },
      { x: 300, y: 150, size: 30 },
      { x: 500, y: 80, size: 35 },
      { x: 650, y: 120, size: 25 },
    ];

    clouds.forEach(cloud => {
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
      ctx.arc(cloud.x + 20, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
      ctx.arc(cloud.x - 20, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawPlatform = (ctx, platform) => {
    let color;
    switch (platform.type) {
      case 'ground':
        color = '#8B4513';
        break;
      case 'brick':
        color = '#CD853F';
        break;
      case 'grass':
        color = '#32CD32';
        break;
      case 'blue':
        color = '#4169E1';
        break;
      default:
        color = '#8B4513';
    }

    // Handle disappearing platforms
    if (platform.disappearing && platform.alpha !== undefined) {
      ctx.globalAlpha = platform.alpha;
    }

    ctx.fillStyle = color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Add border
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);

    // Add texture based on type
    if (platform.type === 'brick') {
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 1;
      for (let i = 0; i < platform.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(platform.x + i, platform.y);
        ctx.lineTo(platform.x + i, platform.y + platform.height);
        ctx.stroke();
      }
    } else if (platform.type === 'grass') {
      // Add grass texture
      ctx.fillStyle = '#228B22';
      for (let i = 0; i < platform.width; i += 5) {
        ctx.fillRect(platform.x + i, platform.y, 2, 3);
      }
    }

    // Reset alpha
    ctx.globalAlpha = 1;
  };

  const drawToken = (ctx, token) => {
    if (token.type === 'coin') {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(token.x, token.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (token.type === 'special') {
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath();
      ctx.arc(token.x, token.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FF1493';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add sparkle effect
      ctx.fillStyle = 'white';
      ctx.fillRect(token.x - 2, token.y - 8, 4, 4);
      ctx.fillRect(token.x - 8, token.y - 2, 4, 4);
    }
  };

  const drawHazard = (ctx, hazard) => {
    if (hazard.type === 'debris') {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 1;
      ctx.strokeRect(hazard.x, hazard.y, hazard.width, hazard.height);
      
      // Add warning trail
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(hazard.x - 2, hazard.y - 10, hazard.width + 4, 10);
    }
  };

  const drawPlayer = (ctx, player) => {
    // Draw simple character (frog-like) with interaction feedback
    if (player.interacting) {
      // Flash effect when interacting
      ctx.fillStyle = 'white';
      ctx.fillRect(player.x - 2, player.y - 2, 24, 24);
    }
    
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, 20, 20);
    
    // Add eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 3, player.y + 3, 4, 4);
    ctx.fillRect(player.x + 13, player.y + 3, 4, 4);
    
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 4, player.y + 4, 2, 2);
    ctx.fillRect(player.x + 14, player.y + 4, 2, 2);

    // Add simple limbs for more character
    ctx.fillStyle = player.color;
    // Arms
    ctx.fillRect(player.x - 3, player.y + 8, 6, 3);
    ctx.fillRect(player.x + 17, player.y + 8, 6, 3);
    // Legs
    ctx.fillRect(player.x + 3, player.y + 20, 3, 6);
    ctx.fillRect(player.x + 14, player.y + 20, 3, 6);

    // Draw name with background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(player.x - 10, player.y - 20, 40, 12);
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, player.x + 10, player.y - 10);

    // Show interaction range for user player
    if (player.isUser) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(player.x + 10, player.y + 10, 35, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawUI = (ctx) => {
    // Timer with countdown warning
    const timeLeft = gameStateRef.current.gameTime;
    const isWarning = timeLeft <= 10;
    
    ctx.fillStyle = isWarning ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 140, 50);
    
    ctx.fillStyle = isWarning ? 'yellow' : 'white';
    ctx.font = isWarning ? 'bold 20px Arial' : '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Time: ${timeLeft}s`, 20, 35);
    
    // Show countdown for last 3 seconds
    if (timeLeft <= 3 && timeLeft > 0) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
      ctx.fillRect(300, 200, 200, 100);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(timeLeft, 400, 260);
    }

    // Difficulty indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 70, 120, 25);
    ctx.fillStyle = 'orange';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Difficulty: ${gameStateRef.current.difficulty}`, 15, 88);

    // Player scores with detailed breakdown
    let yOffset = 105;
    gameStateRef.current.players.forEach(player => {
      if (player.alive) {
        const score = gameStateRef.current.scores[player.id];
        
        // Main score box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, yOffset, 200, 60);
        
        // Player name and total score
        ctx.fillStyle = player.color;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${player.name}: ${score.totalScore}`, 15, yOffset + 18);
        
        // Score breakdown
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(`Platforms: ${score.platformsJumped}`, 15, yOffset + 32);
        ctx.fillText(`Push/Pull: ${score.pushes + score.pulls}`, 15, yOffset + 44);
        ctx.fillText(`Coins: ${score.coinsCollected}`, 100, yOffset + 32);
        ctx.fillText(`Special: ${score.specialCoinsCollected}`, 100, yOffset + 44);
        ctx.fillText(`Pushed: -${score.timesPushed}`, 15, yOffset + 56);
        
        yOffset += 70;
      }
    });

    // Height indicator (like in the reference image)
    const highestPlayer = gameStateRef.current.players
      .filter(p => p.alive)
      .reduce((highest, player) => player.y < highest.y ? player : highest, { y: 600 });
    
    const height = Math.max(0, Math.round((600 - highestPlayer.y) / 10));
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(canvas.width - 120, 10, 110, 40);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${height}.${Math.floor(Math.random() * 10)}FT`, canvas.width - 15, 35);

    // Instructions for user
    if (gameStateRef.current.gameTime > 110) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(250, canvas.height - 60, 300, 50);
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Arrow Keys/WASD: Move & Jump', 400, canvas.height - 40);
      ctx.fillText('Get close to other players to push/pull them!', 400, canvas.height - 25);
    }
  };

  const endGame = () => {
    gameStateRef.current.gameEnded = true;
    
    // Determine winner
    const alivePlayers = gameStateRef.current.players.filter(p => p.alive);
    if (alivePlayers.length === 1) {
      gameStateRef.current.winner = alivePlayers[0];
    } else {
      // Find highest score
      let highestScore = -1;
      let winner = null;
      gameStateRef.current.players.forEach(player => {
        const score = gameStateRef.current.scores[player.id].totalScore;
        if (score > highestScore) {
          highestScore = score;
          winner = player;
        }
      });
      gameStateRef.current.winner = winner;
    }
    
    setGameState({ ...gameStateRef.current });
  };

  const handleKeyPress = (e) => {
    if (!gameStateRef.current.gameStarted || gameStateRef.current.gameEnded) return;

    const userPlayer = gameStateRef.current.players.find(p => p.isUser && p.alive);
    if (!userPlayer) return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        userPlayer.vx = -5;
        break;
      case 'ArrowRight':
      case 'd':
        userPlayer.vx = 5;
        break;
      case 'ArrowUp':
      case 'w':
      case ' ':
        if (userPlayer.vy === 0) { // Only jump if on ground
          userPlayer.vy = -15;
        }
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (showRules) {
    return (
      <div className="platform-jump-overlay">
        <div className="platform-jump-rules">
          <h2>🏔️ Platform Jump</h2>
          <div className="rules-content">
            <h3>How to Play:</h3>
            <ul>
              <li>🎯 <strong>Objective:</strong> Be the last player standing or have the highest score when time runs out!</li>
              <li>⏱️ <strong>Timer:</strong> 120 seconds to compete</li>
              <li>🎮 <strong>Controls:</strong> Arrow keys or WASD to move, Space/Up to jump</li>
              <li>🏃 <strong>Push/Pull:</strong> Get close to other players to interact with them</li>
              <li>💰 <strong>Collect Tokens:</strong> Gold coins (+1 point), Pink special coins (+3 points)</li>
              <li>📈 <strong>Increasing Difficulty:</strong> Game gets harder as time progresses</li>
            </ul>
            
            <h3>Scoring System:</h3>
            <ul>
              <li>Platforms jumped on</li>
              <li>Players pushed/pulled - times you got pushed/pulled</li>
              <li>Coins collected (+1 each)</li>
              <li>Special coins collected (+3 each)</li>
            </ul>

            <h3>Winning Conditions:</h3>
            <ul>
              <li>🏆 Last player standing wins immediately</li>
              <li>📊 If multiple players survive 120 seconds, highest score wins</li>
            </ul>
          </div>
          
          <button className="start-game-btn" onClick={() => setShowRules(false)}>
            Start Game
          </button>
          <button className="close-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="platform-jump-container">
      <div className="platform-jump-header">
        <h2>🏔️ Platform Jump</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <canvas 
        ref={canvasRef}
        className="platform-jump-canvas"
      />

      {gameStateRef.current.gameEnded && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>🎉 Game Over!</h2>
            <h3>Winner: {gameStateRef.current.winner?.name}</h3>
            <div className="final-scores">
              <h4>Final Scores:</h4>
              {gameStateRef.current.players.map(player => (
                <div key={player.id} className="score-line">
                  <span style={{color: player.color}}>{player.name}:</span>
                  <span>{gameStateRef.current.scores[player.id].totalScore} points</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowRules(true)}>Play Again</button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformJump;

