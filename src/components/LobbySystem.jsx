import React, { useState, useEffect, useRef } from 'react';
import './LobbySystem.css';

const LobbySystem = ({ onClose, playerTier = 1 }) => {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [playerPosition, setPlayerPosition] = useState({ x: 400, y: 300 });
  const [otherPlayers, setOtherPlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const canvasRef = useRef(null);
  const keysPressed = useRef({});

  // Floor configurations with enhanced backgrounds and NPCs
  const floors = {
    1: {
      name: "Ground Floor - Welcome Lobby",
      background: "#2c3e50",
      unlocked: true,
      description: "Welcome to SkyHub Tower! Start your journey here.",
      backgroundElements: [
        { type: 'desk', x: 150, y: 200, width: 100, height: 60, color: '#8b4513' },
        { type: 'posterboard', x: 600, y: 100, width: 80, height: 120, color: '#f0f0f0' },
        { type: 'carpet', x: 200, y: 350, width: 400, height: 100, color: '#800080' },
        { type: 'plant', x: 100, y: 400, width: 30, height: 50, color: '#228b22' },
        { type: 'plant', x: 700, y: 400, width: 30, height: 50, color: '#228b22' }
      ],
      npcs: [
        { id: 'guide', x: 200, y: 200, name: 'Guide', emoji: '🧭', avatar: '👤', dialogue: 'Welcome to SkyHub Tower! Use WASD to move around.' },
        { id: 'robo_worker', x: 150, y: 180, name: 'Robo Worker', emoji: '🤖', avatar: '🤖', dialogue: 'I manage the leaderboards! Click the poster to see rankings.' }
      ],
      interactables: [
        { id: 'info_board', x: 600, y: 150, name: 'Info Board', emoji: '📋', type: 'info' },
        { id: 'leaderboard', x: 600, y: 150, name: 'Leaderboard', emoji: '🏆', type: 'leaderboard' }
      ]
    },
    2: {
      name: "Floor 2 - Casual Games",
      background: "#27ae60",
      unlocked: playerTier >= 2,
      description: "Casual gaming area for beginners",
      backgroundElements: [
        { type: 'couch', x: 200, y: 300, width: 120, height: 60, color: '#654321' },
        { type: 'table', x: 400, y: 250, width: 80, height: 80, color: '#8b4513' },
        { type: 'tv', x: 150, y: 200, width: 100, height: 60, color: '#000000' },
        { type: 'bookshelf', x: 650, y: 150, width: 60, height: 120, color: '#8b4513' }
      ],
      npcs: [
        { id: 'casual_host', x: 300, y: 250, name: 'Casual Host', emoji: '🎮', avatar: '👨‍💼', dialogue: 'Try some casual games to improve your skills!' }
      ],
      interactables: [
        { id: 'arcade', x: 500, y: 200, name: 'Arcade Machine', emoji: '🕹️', type: 'game' }
      ]
    },
    3: {
      name: "Floor 3 - Competitive Arena",
      background: "#e74c3c",
      unlocked: playerTier >= 3,
      description: "High-stakes competitive gaming",
      backgroundElements: [
        { type: 'arena_ring', x: 300, y: 200, width: 200, height: 150, color: '#ff6b6b' },
        { type: 'scoreboard', x: 100, y: 100, width: 100, height: 80, color: '#000000' },
        { type: 'trophy_case', x: 600, y: 150, width: 80, height: 100, color: '#ffd700' }
      ],
      npcs: [
        { id: 'arena_master', x: 400, y: 200, name: 'Arena Master', emoji: '⚔️', avatar: '👨‍⚔️', dialogue: 'Only the skilled survive here!' }
      ],
      interactables: [
        { id: 'tournament_board', x: 200, y: 300, name: 'Tournament Board', emoji: '🏆', type: 'tournament' }
      ]
    },
    4: {
      name: "Floor 4 - VIP Lounge",
      background: "#9b59b6",
      unlocked: playerTier >= 4,
      description: "Exclusive area for VIP members",
      backgroundElements: [
        { type: 'luxury_sofa', x: 250, y: 280, width: 150, height: 80, color: '#800080' },
        { type: 'bar', x: 500, y: 200, width: 120, height: 60, color: '#8b4513' },
        { type: 'chandelier', x: 400, y: 100, width: 60, height: 40, color: '#ffd700' },
        { type: 'wine_rack', x: 650, y: 250, width: 50, height: 100, color: '#654321' }
      ],
      npcs: [
        { id: 'vip_concierge', x: 350, y: 250, name: 'VIP Concierge', emoji: '💎', avatar: '👨‍💼', dialogue: 'Welcome to the VIP lounge, esteemed member!' }
      ],
      interactables: [
        { id: 'vip_table', x: 450, y: 180, name: 'VIP Gaming Table', emoji: '🎲', type: 'vip_game' }
      ]
    },
    5: {
      name: "Floor 5 - Penthouse",
      background: "#f39c12",
      unlocked: playerTier >= 5,
      description: "The ultimate gaming experience",
      backgroundElements: [
        { type: 'golden_throne', x: 350, y: 250, width: 100, height: 80, color: '#ffd700' },
        { type: 'panoramic_window', x: 50, y: 100, width: 700, height: 100, color: '#87ceeb' },
        { type: 'marble_floor', x: 200, y: 350, width: 400, height: 100, color: '#f5f5dc' },
        { type: 'crystal_table', x: 500, y: 300, width: 80, height: 60, color: '#e0e0e0' }
      ],
      npcs: [
        { id: 'penthouse_host', x: 400, y: 200, name: 'Penthouse Host', emoji: '👑', avatar: '👑', dialogue: 'You have reached the pinnacle of SkyHub Tower!' }
      ],
      interactables: [
        { id: 'golden_throne', x: 400, y: 300, name: 'Golden Gaming Throne', emoji: '👑', type: 'ultimate' }
      ]
    }
  };

  // Leaderboard data
  const leaderboardData = {
    global: [
      { rank: 1, name: 'ProGamer2024', score: 125000, region: 'NA', avatar: '👑' },
      { rank: 2, name: 'ElitePlayer', score: 118500, region: 'EU', avatar: '🏆' },
      { rank: 3, name: 'MasterChief', score: 112000, region: 'AS', avatar: '⭐' },
      { rank: 4, name: 'GamingLegend', score: 108750, region: 'NA', avatar: '🎮' },
      { rank: 5, name: 'SkillMaster', score: 105200, region: 'EU', avatar: '💎' }
    ],
    regions: {
      'NA': [
        { rank: 1, name: 'ProGamer2024', score: 125000, avatar: '👑' },
        { rank: 2, name: 'GamingLegend', score: 108750, avatar: '🎮' },
        { rank: 3, name: 'NorthStar', score: 95000, avatar: '⭐' }
      ],
      'EU': [
        { rank: 1, name: 'ElitePlayer', score: 118500, avatar: '🏆' },
        { rank: 2, name: 'SkillMaster', score: 105200, avatar: '💎' },
        { rank: 3, name: 'EuroChamp', score: 92000, avatar: '🥇' }
      ],
      'AS': [
        { rank: 1, name: 'MasterChief', score: 112000, avatar: '⭐' },
        { rank: 2, name: 'AsianAce', score: 98000, avatar: '🎯' },
        { rank: 3, name: 'DragonSlayer', score: 89500, avatar: '🐉' }
      ]
    },
    games: {
      'Rocket Junkyard': [
        { rank: 1, name: 'SpaceExplorer', score: 45000, avatar: '🚀' },
        { rank: 2, name: 'CosmicGamer', score: 42000, avatar: '🌟' },
        { rank: 3, name: 'StarPilot', score: 38500, avatar: '✨' }
      ],
      'Blob Bets': [
        { rank: 1, name: 'BlobMaster', score: 38000, avatar: '🟢' },
        { rank: 2, name: 'CellDivider', score: 35000, avatar: '🔵' },
        { rank: 3, name: 'GrowthKing', score: 32000, avatar: '🟡' }
      ],
      'Castle Siege': [
        { rank: 1, name: 'WarLord', score: 52000, avatar: '🏰' },
        { rank: 2, name: 'Strategist', score: 48000, avatar: '⚔️' },
        { rank: 3, name: 'Commander', score: 44000, avatar: '🛡️' }
      ]
    }
  };

  useEffect(() => {
    // Generate random other players with profile-style avatars
    const generatePlayers = () => {
      const players = [];
      const numPlayers = Math.floor(Math.random() * 8) + 3; // 3-10 players
      const avatars = ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓'];
      
      for (let i = 0; i < numPlayers; i++) {
        players.push({
          id: `player_${i}`,
          name: `Player${Math.floor(Math.random() * 1000)}`,
          x: Math.random() * 700 + 50,
          y: Math.random() * 400 + 100,
          avatar: avatars[Math.floor(Math.random() * avatars.length)],
          tier: Math.floor(Math.random() * 5) + 1
        });
      }
      setOtherPlayers(players);
    };

    generatePlayers();
    
    // Generate some initial chat messages
    const initialMessages = [
      { id: 1, player: 'System', message: 'Welcome to SkyHub Tower!', timestamp: Date.now() - 60000 },
      { id: 2, player: 'Player123', message: 'Anyone want to play some games?', timestamp: Date.now() - 30000 },
      { id: 3, player: 'GameMaster', message: 'New tournament starting on Floor 3!', timestamp: Date.now() - 15000 }
    ];
    setChatMessages(initialMessages);

    // Set up keyboard controls
    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Movement loop
    const movePlayer = () => {
      setPlayerPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        const speed = 3;

        if (keysPressed.current['w'] || keysPressed.current['arrowup']) newY -= speed;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) newY += speed;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) newX -= speed;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) newX += speed;

        // Boundary checking
        newX = Math.max(25, Math.min(775, newX));
        newY = Math.max(75, Math.min(475, newY));

        return { x: newX, y: newY };
      });
    };

    const movementInterval = setInterval(movePlayer, 16); // ~60fps

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(movementInterval);
    };
  }, []);

  useEffect(() => {
    drawLobby();
  }, [currentFloor, playerPosition, otherPlayers]);

  const drawLobby = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const floor = floors[currentFloor];
    
    // Clear canvas
    ctx.clearRect(0, 0, 800, 500);
    
    // Draw background
    ctx.fillStyle = floor.background;
    ctx.fillRect(0, 0, 800, 500);
    
    // Draw background elements
    floor.backgroundElements?.forEach(element => {
      ctx.fillStyle = element.color;
      ctx.fillRect(element.x, element.y, element.width, element.height);
      
      // Add element labels
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(element.type.replace('_', ' '), element.x + element.width/2, element.y - 5);
    });
    
    // Draw floor pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 800; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 500);
      ctx.stroke();
    }
    for (let i = 0; i < 500; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(800, i);
      ctx.stroke();
    }

    // Draw NPCs with profile-style avatars
    floor.npcs.forEach(npc => {
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(npc.avatar, npc.x, npc.y);
      
      ctx.font = '12px Arial';
      ctx.fillText(npc.name, npc.x, npc.y + 20);
    });

    // Draw interactables
    floor.interactables.forEach(item => {
      ctx.fillStyle = '#ffd700';
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.emoji, item.x, item.y);
      
      ctx.font = '10px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(item.name, item.x, item.y + 25);
    });

    // Draw other players with profile-style avatars
    otherPlayers.forEach(player => {
      ctx.fillStyle = '#4ecdc4';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(player.avatar, player.x, player.y);
      
      ctx.font = '10px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(player.name, player.x, player.y + 20);
      
      // Tier indicator
      ctx.fillStyle = getTierColor(player.tier);
      ctx.fillRect(player.x - 15, player.y - 25, 30, 3);
    });

    // Draw player with profile-style avatar
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('👤', playerPosition.x, playerPosition.y);
    
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('You', playerPosition.x, playerPosition.y + 20);
    
    // Player tier indicator
    ctx.fillStyle = getTierColor(playerTier);
    ctx.fillRect(playerPosition.x - 15, playerPosition.y - 25, 30, 3);

    // Draw elevators
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(50, 50, 60, 80); // Up elevator
    ctx.fillRect(690, 50, 60, 80); // Down elevator
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⬆️', 80, 90);
    ctx.fillText('UP', 80, 110);
    ctx.fillText('⬇️', 720, 90);
    ctx.fillText('DOWN', 720, 110);
  };

  const getTierColor = (tier) => {
    const colors = ['#95a5a6', '#3498db', '#2ecc71', '#9b59b6', '#f39c12'];
    return colors[tier - 1] || '#95a5a6';
  };

  const changeFloor = (direction) => {
    if (direction === 'up' && currentFloor < 5 && floors[currentFloor + 1].unlocked) {
      setCurrentFloor(prev => prev + 1);
      setPlayerPosition({ x: 720, y: 300 }); // Start near down elevator
    } else if (direction === 'down' && currentFloor > 1) {
      setCurrentFloor(prev => prev - 1);
      setPlayerPosition({ x: 80, y: 300 }); // Start near up elevator
    }
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check elevator clicks
    if (clickX >= 50 && clickX <= 110 && clickY >= 50 && clickY <= 130) {
      changeFloor('up');
    } else if (clickX >= 690 && clickX <= 750 && clickY >= 50 && clickY <= 130) {
      changeFloor('down');
    }

    // Check NPC interactions
    const floor = floors[currentFloor];
    floor.npcs.forEach(npc => {
      const distance = Math.sqrt((clickX - npc.x) ** 2 + (clickY - npc.y) ** 2);
      if (distance < 30) {
        addChatMessage('System', npc.dialogue);
      }
    });

    // Check interactable clicks
    floor.interactables.forEach(item => {
      const distance = Math.sqrt((clickX - item.x) ** 2 + (clickY - item.y) ** 2);
      if (distance < 30) {
        handleInteraction(item);
      }
    });
  };

  const handleInteraction = (item) => {
    switch (item.type) {
      case 'info':
        addChatMessage('System', 'Welcome to SkyHub Tower! Explore different floors and unlock new areas by increasing your tier.');
        break;
      case 'leaderboard':
        setShowLeaderboard(true);
        break;
      case 'game':
        addChatMessage('System', 'Game launching... (Feature coming soon!)');
        break;
      case 'tournament':
        addChatMessage('System', 'Tournament registration is now open! Compete for amazing prizes.');
        break;
      case 'vip_game':
        addChatMessage('System', 'VIP exclusive games available. Higher stakes, bigger rewards!');
        break;
      case 'ultimate':
        addChatMessage('System', 'You have reached the ultimate gaming experience! Congratulations!');
        break;
      default:
        addChatMessage('System', `You interacted with ${item.name}`);
    }
  };

  const addChatMessage = (player, message) => {
    const newMessage = {
      id: Date.now(),
      player,
      message,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev.slice(-19), newMessage]); // Keep last 20 messages
  };

  const sendChatMessage = () => {
    if (chatInput.trim()) {
      addChatMessage('You', chatInput.trim());
      setChatInput('');
      
      // Simulate other players responding occasionally
      if (Math.random() < 0.3) {
        setTimeout(() => {
          const responses = [
            'Nice!', 'Cool!', 'Awesome!', 'Let\'s play!', 'Good luck!', 
            'See you in the games!', 'Welcome!', 'Have fun!'
          ];
          const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          addChatMessage(randomPlayer.name, randomResponse);
        }, 1000 + Math.random() * 3000);
      }
    }
  };

  const currentFloorData = floors[currentFloor];

  return (
    <div className="lobby-system">
      <div className="lobby-header">
        <div className="lobby-info">
          <h3>🏢 {currentFloorData.name}</h3>
          <div className="floor-indicator">
            Floor {currentFloor}/5 | Tier {playerTier}
          </div>
          <div className="floor-description">{currentFloorData.description}</div>
        </div>
        <button className="close-lobby-btn" onClick={onClose}>×</button>
      </div>

      <div className="lobby-main">
        <div className="lobby-canvas-container">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="lobby-canvas"
            onClick={handleCanvasClick}
          />
          
          <div className="lobby-controls">
            <div className="movement-hint">
              Use WASD or Arrow Keys to move around
            </div>
            <div className="floor-navigation">
              <button 
                onClick={() => changeFloor('up')}
                disabled={currentFloor >= 5 || !floors[currentFloor + 1]?.unlocked}
                className="floor-btn"
              >
                ⬆️ Floor {currentFloor + 1}
                {currentFloor < 5 && !floors[currentFloor + 1]?.unlocked && (
                  <span className="locked"> (Tier {currentFloor + 1} Required)</span>
                )}
              </button>
              <button 
                onClick={() => changeFloor('down')}
                disabled={currentFloor <= 1}
                className="floor-btn"
              >
                ⬇️ Floor {currentFloor - 1}
              </button>
            </div>
          </div>
        </div>

        {showChat && (
          <div className="lobby-chat">
            <div className="chat-header">
              <h4>💬 Lobby Chat</h4>
              <button 
                className="chat-toggle"
                onClick={() => setShowChat(false)}
              >
                ✕
              </button>
            </div>
            <div className="chat-messages">
              {chatMessages.map(msg => (
                <div key={msg.id} className="chat-message">
                  <span className="chat-player">{msg.player}:</span>
                  <span className="chat-text">{msg.message}</span>
                </div>
              ))}
            </div>
            <div className="chat-input-container">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="chat-input"
                maxLength={100}
              />
              <button onClick={sendChatMessage} className="chat-send">
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {!showChat && (
        <button 
          className="chat-show-btn"
          onClick={() => setShowChat(true)}
        >
          💬 Show Chat
        </button>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="modal-overlay" onClick={() => setShowLeaderboard(false)}>
          <div className="leaderboard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="leaderboard-header">
              <h3>🏆 Global Leaderboards</h3>
              <button className="close-btn" onClick={() => setShowLeaderboard(false)}>×</button>
            </div>
            <div className="leaderboard-content">
              <div className="leaderboard-tabs">
                <div className="tab active">Global</div>
                <div className="tab">Regions</div>
                <div className="tab">Games</div>
              </div>
              <div className="leaderboard-list">
                {leaderboardData.global.map(player => (
                  <div key={player.rank} className="leaderboard-entry">
                    <span className="rank">#{player.rank}</span>
                    <span className="avatar">{player.avatar}</span>
                    <span className="name">{player.name}</span>
                    <span className="region">{player.region}</span>
                    <span className="score">{player.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lobby-footer">
        <div className="online-count">
          👥 {otherPlayers.length + 1} players in lobby
        </div>
        <div className="tier-progress">
          🏆 Tier {playerTier}/5 - {playerTier < 5 ? 'Play more games to unlock higher floors!' : 'Max tier reached!'}
        </div>
      </div>
    </div>
  );
};

export default LobbySystem;

