import React, { useState, useEffect } from 'react';
import './App.css';
import LobbySection from './components/LobbySection';
import Chatbot from './components/Chatbot';
import MiniSlots from './components/MiniSlots';
import CosmicJackpot from './components/CosmicJackpot';
import Footer from './components/Footer';
import BlobBets from './games/BlobBets';
import CastleSiege from './games/CastleSiege';
import GetOnTop from './games/GetOnTop';
import Hangman from './games/Hangman';
import LunarLaunch from './games/LunarLaunch';
import PixelPython from './games/PixelPython';
import BigFish from './games/BigFish';
import Puzzles from './games/Puzzles';
import EscapePrison from './games/EscapePrison';
import StickmanFighter from './games/StickmanFighter';
import StickmanRacer from './games/StickmanRacer';
import SnakesLadders from './games/SnakesLadders';
import WordWeaver from './games/WordWeaver';
import Wolverine from './games/Wolverine';
import IdleGameEngine from './components/IdleGameEngine';
import LobbySystem from './components/LobbySystem';

function App() {
  const [currentWeeklyGame, setCurrentWeeklyGame] = useState(24); // Start at week 25 (index 24)
  const [timeLeft, setTimeLeft] = useState({ days: 5, hours: 2, minutes: 43, seconds: 0 });
  const [showGameRules, setShowGameRules] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [showLobby, setShowLobby] = useState(false);
  const [playerTier, setPlayerTier] = useState(1);
  const [currentIdleGame, setCurrentIdleGame] = useState(null);
  const [showCosmicJackpot, setShowCosmicJackpot] = useState(false);
  
  // Weekly idle games (52 total, scrollable) - Reordered so week 25 is current
  const weeklyGames = [
    { name: "Frog Derby", description: "Amphibian racing competition", color: "#228b22", icon: "🐸" },
    { name: "Summer Sports Rush", description: "Olympic summer sports collection", color: "#ffa500", icon: "🏅" },
    { name: "DJ Beat Brawl", description: "Music mixing competition", color: "#ff1493", icon: "🎧" },
    { name: "Underwater Empire", description: "Aquatic civilization building", color: "#4169e1", icon: "🌊" },
    { name: "Rocket Junkyard", description: "Space salvage and rebuilding", color: "#708090", icon: "🚀" }, // Week 25 (current)
    { name: "Skatepark Royalty", description: "Skateboarding career simulation", color: "#ff6347", icon: "🛹" }, // Week 26 (next)
    { name: "Beach Blitz", description: "Summer beach sports tournament", color: "#f0e68c", icon: "🏖️" },
    { name: "Cult Crafter", description: "Dark strategy cult management", color: "#800080", icon: "🔮" },
    { name: "Back to School Brawl", description: "High school social combat", color: "#ffd700", icon: "🎒" },
    { name: "Artifact Dealer", description: "Ancient treasure trading", color: "#cd853f", icon: "🏺" },
    { name: "Trash Talk Rumble", description: "Competitive verbal combat", color: "#ff4500", icon: "💬" },
    { name: "Witch Market", description: "Magical marketplace trading", color: "#8a2be2", icon: "🧙‍♀️" },
    { name: "Planetary Deliveries", description: "Interplanetary logistics", color: "#4682b4", icon: "🚀" },
    { name: "Quantum Librarian", description: "Dimensional knowledge management", color: "#6495ed", icon: "📚" },
    { name: "Deepfry Simulator", description: "Fast food cooking management", color: "#daa520", icon: "🍟" },
    { name: "Carve Clash: Halloween", description: "Pumpkin carving competition", color: "#ff8c00", icon: "🎃" },
    { name: "Influencer Island", description: "Social media reality show", color: "#ff69b4", icon: "📱" },
    { name: "Ghost Realtor", description: "Supernatural property sales", color: "#9370db", icon: "👻" },
    { name: "Prank Patrol", description: "Master prankster simulation", color: "#32cd32", icon: "😜" },
    { name: "Crime Clickers", description: "Criminal empire building", color: "#8b0000", icon: "🔫" },
    { name: "Chef Speedrun", description: "High-speed cooking challenges", color: "#ff6347", icon: "⏱️" },
    { name: "Snowball Syndicate", description: "Winter warfare strategy", color: "#87ceeb", icon: "❄️" },
    { name: "Santa's Toy Factory", description: "Christmas production management", color: "#dc143c", icon: "🎅" },
    { name: "New Year's Eve Showdown", description: "Party planning competition", color: "#ffd700", icon: "🎉" },
    { name: "Tiki Blitz", description: "Tropical match-3 paradise", color: "#ffd93d", icon: "🏝️" }, // Week 24 (last week)
    { name: "Espresso Wars", description: "Coffee shop competition", color: "#8b4513", icon: "☕" },
    { name: "Mascot Meltdown", description: "Sports mascot entertainment", color: "#ff6b6b", icon: "🏆" },
    { name: "MechaForge", description: "Giant robot building combat", color: "#2f4f4f", icon: "🤖" },
    { name: "Real Estate Rush", description: "Property investment empire", color: "#32cd32", icon: "🏠" },
    { name: "City Hacker", description: "Cyberpunk hacking simulation", color: "#9370db", icon: "💻" },
    { name: "Side Hustle Saga", description: "Gig economy management", color: "#4ecdc4", icon: "💰" },
    { name: "MasterChef Royale", description: "Cooking competition battle royale", color: "#ff6b6b", icon: "👨‍🍳" },
    { name: "Grow Wars: Winter Garden", description: "Strategic winter plant defense", color: "#4ecdc4", icon: "🌱" },
    { name: "Cookie Clash: Cabin Clicker", description: "Cozy mountain cabin bakery", color: "#ffd93d", icon: "🍪" },
    { name: "Pet Empire: Valentine Edition", description: "Romantic pet breeding empire", color: "#ff69b4", icon: "💕" },
    { name: "Car Wash Kingdom", description: "Build your car wash empire", color: "#87ceeb", icon: "🚗" },
    { name: "Alien Lab Escape", description: "Escape from alien laboratory", color: "#9370db", icon: "👽" },
    { name: "Hustle City", description: "Street hustler to city mogul", color: "#ff8c00", icon: "🏙️" },
    { name: "Dungeon Depths", description: "Roguelike dungeon crawler", color: "#8b4513", icon: "⚔️" },
    { name: "Meme Lord Showdown", description: "Competitive meme creation", color: "#32cd32", icon: "😂" },
    { name: "March Madness: Bracket Brawl", description: "Basketball tournament predictions", color: "#ff4500", icon: "🏀" },
    { name: "Streamer Royale", description: "Build your streaming career", color: "#9932cc", icon: "📺" },
    { name: "Bunny Run: Easter Sprint", description: "Easter bunny endless runner", color: "#ffb6c1", icon: "🐰" },
    { name: "Dragon Rancher", description: "Fantasy dragon breeding ranch", color: "#dc143c", icon: "🐉" },
    { name: "Gladiatorgram", description: "Ancient Rome social media", color: "#b8860b", icon: "⚔️" },
    { name: "Spring Builders Fest", description: "Seasonal building competition", color: "#90ee90", icon: "🏗️" },
    { name: "Trash Tycoon", description: "Waste management empire", color: "#696969", icon: "🗑️" },
    { name: "Biohack Blitz", description: "Genetic engineering puzzles", color: "#00ff7f", icon: "🧬" },
    { name: "Prestige Reset", description: "Alpha Ascend progression system", color: "#9932cc", icon: "⭐" },
    { name: "Cosmic Casino", description: "Space-themed gambling adventure", color: "#4b0082", icon: "🎰" },
    { name: "Time Trader", description: "Temporal market manipulation", color: "#00ced1", icon: "⏰" },
    { name: "Neon Nights", description: "Cyberpunk city management", color: "#ff1493", icon: "🌃" },
    { name: "Mystic Mines", description: "Magical resource extraction", color: "#8b4513", icon: "⛏️" }
  ];

  // Permanent mini-games
  const miniGames = [
    { name: "Blob Bets", description: "Eat, grow, dominate! Battle other players in this agar.io-style game.", color: "#4ecdc4", icon: "🟢", rules: "Control your blob with the mouse. Eat smaller blobs to grow bigger. Avoid larger blobs that can eat you. Use spacebar to split your blob. The goal is to become the largest blob on the server." },
    { name: "Castle Siege", description: "4-player RTS battle! Build your army and destroy enemy bases.", color: "#ff6b6b", icon: "🏰", rules: "Build your army by gathering resources. Train different unit types: soldiers, archers, and siege weapons. Destroy all enemy castles to win. Use strategy to outmaneuver your opponents." },
    { name: "Classic War", description: "Pure luck card battle! Flip cards to beat your opponent.", color: "#ff4500", icon: "🃏", rules: "Each player flips a card simultaneously. The highest card wins both cards. Aces are high. If cards are equal, it's war - place 3 cards down and flip the 4th. Winner takes all cards. First to collect all cards wins." },
    { name: "Cosmic Jackpot", description: "Spin for massive rewards! Hit the mega slots jackpot.", color: "#9932cc", icon: "🎰", rules: "Place your bet and spin the reels. Match 3 symbols to win. Three 🎰 symbols = MEGA JACKPOT! Higher value symbols pay more. Two matching symbols give smaller wins." },
    { name: "Big Fish", description: "Eat to grow, become the biggest fish in the ocean to win!", color: "#4169e1", icon: "🐟", rules: "Use arrow keys or WASD to swim. Eat fish smaller than you to grow. Avoid larger fish that can eat you. The goal is to become the biggest fish in the ocean. Watch out for sharks!" },
    { name: "Escape Prison", description: "A classic choice-based adventure game with multiple endings.", color: "#696969", icon: "🔓", rules: "Make strategic choices to escape from prison. Each decision affects your path and determines your ending. Choose wisely between stealth, force, or cunning to achieve freedom." },
    { name: "Rock Paper Scissors", description: "Classic hand game! Best of 3 rounds wins.", color: "#00ced1", icon: "✂️", rules: "Choose rock, paper, or scissors. Rock beats scissors, scissors beats paper, paper beats rock. Best of 3 rounds wins the match. Quick reflexes and psychology matter!" },
    { name: "Flight Risk Rewards", description: "Fly, collect multipliers, avoid hazards & cash out!", color: "#87ceeb", icon: "✈️", rules: "Pilot your aircraft through dangerous skies. Collect multiplier bonuses while avoiding obstacles. Cash out at the right time to maximize your rewards before crashing." },
    { name: "Get On Top", description: "Physics duel! 2 vs 2 wrestling match with crazy physics.", color: "#ffa500", icon: "🤼", rules: "Use physics-based controls to wrestle your opponent. Push, pull, and throw to get your opponent's head to touch the ground. First team to score wins the match." },
    { name: "Hangman", description: "Classic word guessing! You can bet the creator or...", color: "#9370db", icon: "🎯", rules: "Guess the hidden word by selecting letters. Each wrong guess adds a part to the hangman. Guess the word before the drawing is complete to win." },
    { name: "Header Hustle", description: "1v1 soccer heads with power-ups & betting. First to 5!", color: "#32cd32", icon: "⚽", rules: "Control your soccer player's head to score goals. Use power-ups strategically and jump to head the ball into the opponent's goal. First player to score 5 goals wins." },
    { name: "Puzzles", description: "Assemble an image puzzle against the clock!", color: "#ff69b4", icon: "🧩", rules: "Drag and drop puzzle pieces to recreate the original image. Race against time to complete the puzzle before the timer runs out. Faster completion earns higher scores." },
    { name: "Lunar Lander: Horizon", description: "Side-scrolling landing! Timed rewards, increasing...", color: "#ffd93d", icon: "🚀", rules: "Navigate your lunar lander through side-scrolling terrain. Use thrust carefully to land safely on designated platforms. Fuel is limited, so plan your approach wisely." },
    { name: "Math Works", description: "5-player math battles!", color: "#ff8c00", icon: "🔢", rules: "Solve math problems faster than your opponents. Answer correctly to earn points and advance. Wrong answers may penalize you. The player with the most points wins." },
    { name: "Memory Match", description: "Test your memory skills!", color: "#00ff7f", icon: "🧠", rules: "Flip cards to find matching pairs. Remember the positions of cards you've seen. Match all pairs with the fewest moves to achieve the highest score." },
    { name: "Mini Basketball", description: "Shoot some hoops! Simple physics, based scoring.", color: "#ff4500", icon: "🏀", rules: "Aim and shoot basketballs into the hoop. Adjust angle and power for perfect shots. Score as many baskets as possible within the time limit." },
    { name: "One in a Million", description: "Competitive Where's Waldo! 2-player. 10 rounds each.", color: "#daa520", icon: "🔍", rules: "Find the hidden character in crowded scenes faster than your opponent. Each round presents a new challenge. The player who finds the most characters wins." },
    { name: "Pixel Python Arena", description: "Full-screen snake battle! WASD/Click controls.", color: "#32cd32", icon: "🐍", rules: "Control your snake using WASD keys or mouse clicks. Eat food to grow longer while avoiding walls and other snakes. Last snake surviving wins the arena battle." },
    { name: "Platform Jump", description: "Jump to the top!", color: "#90ee90", icon: "⬆️", rules: "Jump from platform to platform to reach the top. Time your jumps carefully to avoid falling. Collect power-ups and avoid obstacles on your way up." },
    { name: "QuizKnows", description: "Competitive trivia! 5-12 players. Fast answers win.", color: "#9932cc", icon: "💡", rules: "Answer trivia questions faster than other players. Correct answers earn points, with bonus points for speed. The player with the most points after all questions wins." },
    { name: "Sea Squares", description: "Match-3 puzzle with betting & competitive themes. 7x7...", color: "#4169e1", icon: "🌊", rules: "Match 3 or more sea creatures in rows or columns on a 7x7 grid. Create combos for higher scores. Place bets on your performance before each round." },
    { name: "Snakes n Ladders - Gamble", description: "Classic board game with betting. 2-6 players.", color: "#228b22", icon: "🎲", rules: "Roll dice to move around the board. Climb ladders to advance quickly, but avoid snakes that send you backward. Place bets on who will reach the finish first." },
    { name: "Stickman Fight", description: "Epic stickman battles!", color: "#8b0000", icon: "🥊", rules: "Control your stickman fighter using keyboard controls. Punch, kick, and perform special moves to defeat opponents. Last stickman standing wins the battle." },
    { name: "Stickman Racer", description: "Fast and track clicker game!", color: "#ff6b6b", icon: "🏁", rules: "Click rapidly to make your stickman run faster around the track. Maintain rhythm and speed to outpace other racers. First to cross the finish line wins." },
    { name: "Wolverine", description: "Social deduction! Identify roles, eliminate enemies.", color: "#4b0082", icon: "🐺", rules: "Players are assigned secret roles. Wolverines hunt at night while villagers vote to eliminate suspects during the day. Use deduction and strategy to identify and eliminate the opposing team." },
    { name: "WordWeaver", description: "Fast-paced rhyming battle! 2 players. 10 vs 12 prompts.", color: "#ff1493", icon: "📝", rules: "Create rhyming words or phrases based on given prompts. Players take turns responding with rhymes. Points awarded for creativity and speed. Best rhymer after all prompts wins." }
  ];

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        } else {
          // Reset to next week
          return { days: 6, hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollWeeklyGames = (direction) => {
    if (direction === 'left' && currentWeeklyGame > 0) {
      setCurrentWeeklyGame(currentWeeklyGame - 1);
    } else if (direction === 'right' && currentWeeklyGame < weeklyGames.length - 7) {
      setCurrentWeeklyGame(currentWeeklyGame + 1);
    }
  };

  const handleGameClick = (game) => {
    setSelectedGame({
      ...game,
      isWeeklyGame: weeklyGames.some(wg => wg.name === game.name),
      isMiniGame: miniGames.some(mg => mg.name === game.name)
    });
    setShowGameRules(true);
  };

  const handlePlayGame = () => {
    setShowGameRules(false);
    
    // Check if it's a weekly idle game
    const isWeeklyGame = weeklyGames.some(game => game.name === selectedGame.name);
    
    if (isWeeklyGame) {
      // Launch idle game with specific configuration
      const gameConfig = getIdleGameConfig(selectedGame.name);
      setCurrentIdleGame(gameConfig);
      return;
    }
    
    // Launch the appropriate mini-game based on the selected game
    switch(selectedGame.name) {
      case 'Blob Bets':
        setCurrentGame('BlobBets');
        break;
      case 'Castle Siege':
        setCurrentGame('CastleSiege');
        break;
      case 'Classic War':
        setCurrentGame('ClassicWar');
        break;
      case 'Cosmic Jackpot':
        setShowCosmicJackpot(true);
        break;
      case 'Big Fish':
        setCurrentGame('BigFish');
        break;
      case 'Escape Prison':
        setCurrentGame('EscapePrison');
        break;
      case 'Get On Top':
        setCurrentGame('GetOnTop');
        break;
      case 'Hangman':
        setCurrentGame('Hangman');
        break;
      case 'Puzzles':
        setCurrentGame('Puzzles');
        break;
      case 'Stickman Fight':
        setCurrentGame('StickmanFighter');
        break;
      case 'Stickman Racer':
        setCurrentGame('StickmanRacer');
        break;
      case 'Snakes n Ladders - Gamble':
        setCurrentGame('SnakesLadders');
        break;
      case 'WordWeaver':
        setCurrentGame('WordWeaver');
        break;
      case 'Wolverine':
        setCurrentGame('Wolverine');
        break;
      case 'Lunar Lander: Horizon':
        setCurrentGame('LunarLaunch');
        break;
      case 'Pixel Python Arena':
        setCurrentGame('PixelPython');
        break;
      default:
        alert(`${selectedGame.name} game implementation coming soon!`);
    }
  };

  const getIdleGameConfig = (gameName) => {
    const configs = {
      "Frog Derby": {
        name: "Frog Derby",
        background: "linear-gradient(135deg, #228b22 0%, #32cd32 100%)",
        icon: "🐸",
        baseMultiplier: 1.8,
        maxMultiplier: 15.0,
        progressSpeed: 0.015
      },
      "Summer Sports Rush": {
        name: "Summer Sports Rush",
        background: "linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)",
        icon: "🏅",
        baseMultiplier: 2.2,
        maxMultiplier: 18.0,
        progressSpeed: 0.018
      },
      "DJ Beat Brawl": {
        name: "DJ Beat Brawl",
        background: "linear-gradient(135deg, #ff1493 0%, #9932cc 100%)",
        icon: "🎧",
        baseMultiplier: 2.8,
        maxMultiplier: 25.0,
        progressSpeed: 0.012
      },
      "Underwater Empire": {
        name: "Underwater Empire",
        background: "linear-gradient(135deg, #4169e1 0%, #00bfff 100%)",
        icon: "🌊",
        baseMultiplier: 2.1,
        maxMultiplier: 16.0,
        progressSpeed: 0.016
      },
      "Rocket Junkyard": {
        name: "Rocket Junkyard",
        background: "linear-gradient(135deg, #4169e1 0%, #1e90ff 100%)",
        icon: "🚀",
        baseMultiplier: 2.5,
        maxMultiplier: 20.0,
        progressSpeed: 0.01
      },
      "Skatepark Royalty": {
        name: "Skatepark Royalty",
        background: "linear-gradient(135deg, #ff6347 0%, #ff4500 100%)",
        icon: "🛹",
        baseMultiplier: 2.3,
        maxMultiplier: 17.0,
        progressSpeed: 0.014
      },
      "Beach Blitz": {
        name: "Beach Blitz",
        background: "linear-gradient(135deg, #f0e68c 0%, #ffd700 100%)",
        icon: "🏖️",
        baseMultiplier: 1.9,
        maxMultiplier: 14.0,
        progressSpeed: 0.017
      },
      "Cult Crafter": {
        name: "Cult Crafter",
        background: "linear-gradient(135deg, #800080 0%, #4b0082 100%)",
        icon: "🔮",
        baseMultiplier: 3.2,
        maxMultiplier: 30.0,
        progressSpeed: 0.008
      },
      "Tiki Blitz": {
        name: "Tiki Blitz",
        background: "linear-gradient(135deg, #ff6347 0%, #ffa500 100%)",
        icon: "🏝️",
        baseMultiplier: 2.0,
        maxMultiplier: 12.0,
        progressSpeed: 0.02
      },
      "Pet Empire Valentine Edition": {
        name: "Pet Empire Valentine Edition",
        background: "linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)",
        icon: "💕",
        baseMultiplier: 1.6,
        maxMultiplier: 10.0,
        progressSpeed: 0.025
      },
      "Espresso Wars": {
        name: "Espresso Wars",
        background: "linear-gradient(135deg, #8b4513 0%, #a0522d 100%)",
        icon: "☕",
        baseMultiplier: 1.7,
        maxMultiplier: 11.0,
        progressSpeed: 0.022
      },
      "Mascot Meltdown": {
        name: "Mascot Meltdown",
        background: "linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)",
        icon: "🏆",
        baseMultiplier: 2.4,
        maxMultiplier: 19.0,
        progressSpeed: 0.013
      },
      "MechaForge": {
        name: "MechaForge",
        background: "linear-gradient(135deg, #2f4f4f 0%, #708090 100%)",
        icon: "🤖",
        baseMultiplier: 2.7,
        maxMultiplier: 22.0,
        progressSpeed: 0.011
      },
      "Real Estate Rush": {
        name: "Real Estate Rush",
        background: "linear-gradient(135deg, #32cd32 0%, #228b22 100%)",
        icon: "🏠",
        baseMultiplier: 2.0,
        maxMultiplier: 15.0,
        progressSpeed: 0.015
      },
      "City Hacker": {
        name: "City Hacker",
        background: "linear-gradient(135deg, #9370db 0%, #8a2be2 100%)",
        icon: "💻",
        baseMultiplier: 2.6,
        maxMultiplier: 21.0,
        progressSpeed: 0.012
      },
      "Side Hustle Saga": {
        name: "Side Hustle Saga",
        background: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
        icon: "💰",
        baseMultiplier: 1.8,
        maxMultiplier: 13.0,
        progressSpeed: 0.019
      }
    };
    
    return configs[gameName] || {
      name: gameName,
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "🎮",
      baseMultiplier: 1.5,
      maxMultiplier: 10.0,
      progressSpeed: 0.02
    };
  };

  const handleLiveClick = () => {
    setShowLiveStream(true);
  };

  const getCurrentWeekNumber = () => {
    return ((currentWeeklyGame + 1) % 52) || 52;
  };

  const getNextWeekNumber = () => {
    return ((currentWeeklyGame + 2) % 52) || 52;
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="logo">
          <span className="logo-text">THE GAMBLING GUYS</span>
          <span className="player-info">👤 Player208</span>
        </div>
      </header>

      <div className="live-stream" onClick={handleLiveClick}>
        <div className="stream-button">
          ▶ Live
        </div>
      </div>

      <main className="main-content">
        {/* Big Grind Section */}
        <section className="big-grind-section">
          <div className="big-grind-header">
            <h2>THE BIG GRIND: 52-WEEK COMPETITIVE GAMBLING GAME ROTATION ⭐</h2>
            <p>🟢 Current Week {getCurrentWeekNumber()} (June 30 - July 06, 2025) & Full Rotation Below! 🟢</p>
          </div>

          <div className="current-week-games">
            <div className="current-week">
              <h3>🏆 CURRENT WEEK {getCurrentWeekNumber()} (June 30 - July 06, 2025) 🏆</h3>
              <div className="featured-game current-game">
                <div className="game-icon">{weeklyGames[4].icon}</div>
                <div className="game-info">
                  <h4>{weeklyGames[4].name}</h4>
                  <p>{weeklyGames[4].description}</p>
                  <p className="game-timer">
                    Ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                  </p>
                </div>
              </div>
            </div>

            <div className="game-of-day">
              <h3>🎮 Game of the Day 🎮</h3>
              <div className="featured-game daily-game">
                <div className="game-icon">🐍</div>
                <div className="game-info">
                  <h4>Pixel Python Arena</h4>
                  <p>Full-screen snake battle! WASD/Click controls.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="special-offer">
            <p>🎯 Special Offer! Play our new games today and get a bonus! 🎯</p>
          </div>
        </section>

        {/* Weekly Grind Rotation */}
        <section className="weekly-rotation">
          <h3>Weekly Grind Rotation (Upcoming & Past)</h3>
          <div className="games-scroll-container">
            <div className="games-grid-wrapper">
              <div className="games-grid weekly-games">
                {weeklyGames.map((game, index) => {
                  const weekNumber = ((index + 1) % 52) || 52;
                  return (
                    <div 
                      key={index} 
                      className="game-card weekly-card" 
                      style={{backgroundColor: game.color}}
                    >
                      <div className="game-icon">{game.icon}</div>
                      <h4>{game.name}</h4>
                      <p>{game.description}</p>
                      <div className="week-number">Week {weekNumber}</div>
                      <button className="play-btn" onClick={() => handleGameClick(game)}>Play Now</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Mini Games Section */}
        <section className="mini-games-section">
          <div className="games-grid mini-games">
            {miniGames.map((game, index) => (
              <div key={index} className="game-card mini-card" style={{backgroundColor: game.color}}>
                <div className="game-icon">{game.icon}</div>
                <h4>{game.name}</h4>
                <p>{game.description}</p>
                <button className="play-btn" onClick={() => handleGameClick(game)}>Play Now</button>
              </div>
            ))}
          </div>
        </section>

        {/* SkyHub Tower Lobby */}
        <LobbySection onEnterLobby={() => setShowLobby(true)} />
      </main>

      {/* Game Rules Modal */}
      {showGameRules && selectedGame && (
        <div className="modal-overlay" onClick={() => setShowGameRules(false)}>
          <div className="modal-content game-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedGame.icon} {selectedGame.name}</h3>
              <button className="close-btn" onClick={() => setShowGameRules(false)}>×</button>
            </div>
            <div className="modal-body">
              <h4>How to Play:</h4>
              <p>{selectedGame.rules || "Game rules will be available soon!"}</p>
              
              {/* Gambling Options */}
              <div className="gambling-section">
                <h4>🎰 Gambling Options:</h4>
                <div className="game-options">
                  <div className="option-card">
                    <h5>🎮 Start New Game</h5>
                    <p>Create a new game room and wait for opponents</p>
                    <div className="bet-input">
                      <label>Bet Amount:</label>
                      <select>
                        <option value="10">10 tokens</option>
                        <option value="25">25 tokens</option>
                        <option value="50">50 tokens</option>
                        <option value="100">100 tokens</option>
                        <option value="250">250 tokens</option>
                      </select>
                    </div>
                    <button className="action-btn start-btn" onClick={handlePlayGame}>
                      Start Game (30s wait)
                    </button>
                  </div>
                  
                  <div className="option-card">
                    <h5>🔍 Join Game</h5>
                    <p>Join an existing game room with matching bet</p>
                    <div className="available-games">
                      <div className="game-room">
                        <span>Room #1 - 25 tokens</span>
                        <button className="join-btn">Join</button>
                      </div>
                      <div className="game-room">
                        <span>Room #2 - 50 tokens</span>
                        <button className="join-btn">Join</button>
                      </div>
                      <div className="game-room">
                        <span>Room #3 - 100 tokens</span>
                        <button className="join-btn">Join</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="option-card">
                    <h5>👁️ Spectate</h5>
                    <p>Watch ongoing games (20min delay to prevent cheating)</p>
                    <div className="spectate-games">
                      <div className="spectate-room">
                        <span>Game #1 - 2/4 players</span>
                        <button className="spectate-btn">Spectate</button>
                      </div>
                      <div className="spectate-room">
                        <span>Game #2 - 3/4 players</span>
                        <button className="spectate-btn">Spectate</button>
                      </div>
                    </div>
                    <p className="delay-notice">⚠️ 20-minute delay active</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="house-edge-notice">
                🏠 House takes 5% of winnings
              </div>
              <button className="cancel-btn" onClick={() => setShowGameRules(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Live Stream Modal */}
      {showLiveStream && (
        <div className="modal-overlay" onClick={() => setShowLiveStream(false)}>
          <div className="livestream-modal" onClick={(e) => e.stopPropagation()}>
            <div className="livestream-header">
              <h3>🔴 Live Stream</h3>
              <button className="close-btn" onClick={() => setShowLiveStream(false)}>×</button>
            </div>
            <div className="livestream-content">
              <div className="video-container">
                <iframe
                  width="100%"
                  height="400"
                  src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1"
                  title="Live Stream"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="chat-section">
                <div className="chat-header">
                  <span>Live Chat</span>
                  <button className="filter-btn">🔒 Filter: ON</button>
                </div>
                <div className="chat-messages">
                  <div className="chat-message">
                    <span className="username">Player123:</span>
                    <span className="message">Great stream!</span>
                  </div>
                  <div className="chat-message">
                    <span className="username">GamerPro:</span>
                    <span className="message">When is the next game?</span>
                  </div>
                </div>
                <div className="chat-input">
                  <input type="text" placeholder="Type a message..." />
                  <button>Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Components */}
      <Chatbot />
      <MiniSlots />
      
      {/* Game Components */}
      {currentGame === 'BlobBets' && <BlobBets onClose={() => setCurrentGame(null)} />}
      {currentGame === 'CastleSiege' && <CastleSiege onClose={() => setCurrentGame(null)} />}
      {currentGame === 'ClassicWar' && <ClassicWar onClose={() => setCurrentGame(null)} />}
      {currentGame === 'RockPaperScissors' && <RockPaperScissors onClose={() => setCurrentGame(null)} />}
      {currentGame === 'BigFish' && <BigFish onClose={() => setCurrentGame(null)} />}
      {currentGame === 'EscapePrison' && <EscapePrison onClose={() => setCurrentGame(null)} />}
      {currentGame === 'GetOnTop' && <GetOnTop onClose={() => setCurrentGame(null)} />}
      {currentGame === 'Hangman' && <Hangman onClose={() => setCurrentGame(null)} />}
      {currentGame === 'LunarLaunch' && <LunarLaunch onClose={() => setCurrentGame(null)} />}
      {currentGame === 'PixelPython' && <PixelPython onClose={() => setCurrentGame(null)} />}
      {currentGame === 'Puzzles' && <Puzzles onClose={() => setCurrentGame(null)} />}
      {currentGame === 'StickmanFighter' && <StickmanFighter onClose={() => setCurrentGame(null)} />}
      {currentGame === 'StickmanRacer' && <StickmanRacer onClose={() => setCurrentGame(null)} />}
      {currentGame === 'SnakesLadders' && <SnakesLadders onClose={() => setCurrentGame(null)} />}
      {currentGame === 'WordWeaver' && <WordWeaver onClose={() => setCurrentGame(null)} />}
      {currentGame === 'Wolverine' && <Wolverine onClose={() => setCurrentGame(null)} />}
      
      {/* Cosmic Jackpot */}
      {showCosmicJackpot && <CosmicJackpot onClose={() => setShowCosmicJackpot(false)} />}
      
      {/* Idle Game Engine */}
      {currentIdleGame && (
        <IdleGameEngine 
          gameConfig={currentIdleGame} 
          onClose={() => setCurrentIdleGame(null)} 
        />
      )}
      
      {/* Lobby System */}
      {showLobby && (
        <LobbySystem 
          onClose={() => setShowLobby(false)} 
          playerTier={playerTier}
        />
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;

