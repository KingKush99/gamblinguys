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
import SeaSquares from './games/SeaSquares';
import QuizKnows from './games/QuizKnows';
import WordWeaver from './games/WordWeaver';
import Wolverine from './games/Wolverine';
import HeaderHustle from './games/HeaderHustle';
import MiniHoops from './games/MiniHoops';
import OneInAMillion from './games/OneInAMillion';
import CarPassing from './games/CarPassing';
import PlatformJump from './games/PlatformJump';
import IdleGameEngine from './components/IdleGameEngine';
import LobbySystem from './components/LobbySystem';

function App() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showGameRules, setShowGameRules] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [showLobby, setShowLobby] = useState(false);
  const [playerTier, setPlayerTier] = useState(1);
  const [currentIdleGame, setCurrentIdleGame] = useState(null);
  const [showCosmicJackpot, setShowCosmicJackpot] = useState(false);
  
  // Get current week number based on real calendar
  const getCurrentWeekOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  };

  // Calculate time until next Monday 12:00 AM UTC
  const getTimeUntilNextMonday = () => {
    const now = new Date();
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    
    // Find next Monday at 12:00 AM UTC
    const nextMonday = new Date(utcNow);
    const daysUntilMonday = (8 - utcNow.getDay()) % 7 || 7; // 0 = Sunday, 1 = Monday, etc.
    nextMonday.setDate(utcNow.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    
    const timeDiff = nextMonday.getTime() - utcNow.getTime();
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  };
  
  // Weekly idle games (52 total) - Mapped to real-life events and seasons
  const weeklyGames = [
    { name: "New Year's Eve Showdown", description: "Party planning competition for the new year", color: "#ffd700", icon: "🎉", realEvent: "New Year's Week" }, // Week 1
    { name: "Winter Olympics Prep", description: "Train for winter sports competitions", color: "#87ceeb", icon: "⛷️", realEvent: "Winter Sports Season" }, // Week 2
    { name: "Snowball Syndicate", description: "Winter warfare strategy", color: "#87ceeb", icon: "❄️", realEvent: "Peak Winter" }, // Week 3
    { name: "Groundhog Day Predictions", description: "Weather forecasting empire", color: "#8b4513", icon: "🐹", realEvent: "Groundhog Day" }, // Week 4
    { name: "Super Bowl Spectacle", description: "Football championship management", color: "#ff4500", icon: "🏈", realEvent: "Super Bowl Week" }, // Week 5
    { name: "Pet Empire: Valentine Edition", description: "Romantic pet breeding empire", color: "#ff69b4", icon: "💕", realEvent: "Valentine's Week" }, // Week 6
    { name: "Espresso Wars", description: "Coffee shop competition", color: "#8b4513", icon: "☕", realEvent: "Winter X Games" }, // Week 7
    { name: "Winter Carnival Chaos", description: "Ice festival management", color: "#4169e1", icon: "🎪", realEvent: "Winter Festivals" }, // Week 8
    { name: "Presidents Day Politics", description: "Political campaign simulation", color: "#dc143c", icon: "🇺🇸", realEvent: "Presidents Day" }, // Week 9
    { name: "March Madness: Bracket Brawl", description: "Basketball tournament predictions", color: "#ff4500", icon: "🏀", realEvent: "March Madness Begins" }, // Week 10
    { name: "Spring Training Stadium", description: "Baseball season preparation", color: "#32cd32", icon: "⚾", realEvent: "Spring Training" }, // Week 11
    { name: "St. Patrick's Pub Empire", description: "Irish pub management", color: "#228b22", icon: "🍀", realEvent: "St. Patrick's Day" }, // Week 12
    { name: "Bunny Run: Easter Sprint", description: "Easter bunny endless runner", color: "#ffb6c1", icon: "🐰", realEvent: "Easter Preparation" }, // Week 13
    { name: "Underwater Empire", description: "Aquatic civilization building", color: "#4169e1", icon: "🌊", realEvent: "Tsunami Awareness Month" }, // Week 14
    { name: "Masters Golf Tournament", description: "Professional golf management", color: "#228b22", icon: "⛳", realEvent: "Masters Tournament" }, // Week 15
    { name: "Tax Season Survival", description: "Accounting firm management", color: "#696969", icon: "📊", realEvent: "Tax Deadline Week" }, // Week 16
    { name: "Spring Builders Fest", description: "Seasonal building competition", color: "#90ee90", icon: "🏗️", realEvent: "Spring Construction" }, // Week 17
    { name: "Earth Day Eco Empire", description: "Environmental conservation game", color: "#32cd32", icon: "🌍", realEvent: "Earth Day" }, // Week 18
    { name: "Derby Day Racing", description: "Horse racing championship", color: "#8b4513", icon: "🐎", realEvent: "Kentucky Derby" }, // Week 19
    { name: "Mother's Day Marketplace", description: "Gift shop management", color: "#ff69b4", icon: "💐", realEvent: "Mother's Day" }, // Week 20
    { name: "Indy 500 Racing Empire", description: "Professional racing management", color: "#ff4500", icon: "🏎️", realEvent: "Indianapolis 500" }, // Week 21
    { name: "Memorial Day BBQ Bash", description: "Summer cookout catering", color: "#ff6347", icon: "🍖", realEvent: "Memorial Day" }, // Week 22
    { name: "Beach Blitz", description: "Summer beach sports tournament", color: "#f0e68c", icon: "🏖️", realEvent: "Beach Season Begins" }, // Week 23
    { name: "Summer Sports Rush", description: "Olympic summer sports collection", color: "#ffa500", icon: "🏅", realEvent: "Summer Sports Season" }, // Week 24
    { name: "Father's Day Workshop", description: "Tool and hardware empire", color: "#4682b4", icon: "🔧", realEvent: "Father's Day" }, // Week 25
    { name: "Graduation Ceremony Central", description: "Education event management", color: "#9932cc", icon: "🎓", realEvent: "Graduation Season" }, // Week 26
    { name: "Independence Day Fireworks", description: "Fireworks show production", color: "#dc143c", icon: "🎆", realEvent: "4th of July" }, // Week 27
    { name: "Summer Camp Adventures", description: "Youth camp management", color: "#32cd32", icon: "🏕️", realEvent: "Summer Camp Season" }, // Week 28
    { name: "Car Passing", description: "Highway idle racing! Pass cars to earn points", color: "#ff4500", icon: "🚗", realEvent: "Summer Road Trips" }, // Week 29
    { name: "State Fair Carnival", description: "County fair management", color: "#ffd700", icon: "🎡", realEvent: "State Fair Season" }, // Week 30
    { name: "Olympic Games Glory", description: "International sports competition", color: "#ffd700", icon: "🥇", realEvent: "Summer Olympics (off-year)" }, // Week 31
    { name: "Back to School Brawl", description: "High school social combat", color: "#ffd700", icon: "🎒", realEvent: "Back to School" }, // Week 32
    { name: "Labor Day Weekend Rush", description: "Holiday travel management", color: "#4682b4", icon: "🛣️", realEvent: "Labor Day" }, // Week 33
    { name: "Football Season Kickoff", description: "NFL team management", color: "#8b4513", icon: "🏈", realEvent: "NFL Season Begins" }, // Week 34
    { name: "Harvest Moon Festival", description: "Autumn farming simulation", color: "#ff8c00", icon: "🌾", realEvent: "Harvest Season" }, // Week 35
    { name: "Oktoberfest Brewery", description: "Beer festival management", color: "#daa520", icon: "🍺", realEvent: "Oktoberfest" }, // Week 36
    { name: "Halloween Horror Empire", description: "Spooky entertainment business", color: "#ff8c00", icon: "🎃", realEvent: "Halloween Preparation" }, // Week 37
    { name: "World Series Baseball", description: "Championship baseball management", color: "#ff4500", icon: "⚾", realEvent: "World Series" }, // Week 38
    { name: "Thanksgiving Turkey Tycoon", description: "Holiday meal preparation", color: "#8b4513", icon: "🦃", realEvent: "Thanksgiving Prep" }, // Week 39
    { name: "Black Friday Shopping Spree", description: "Retail empire management", color: "#000000", icon: "🛍️", realEvent: "Black Friday" }, // Week 40
    { name: "Cyber Monday Tech Empire", description: "Online retail domination", color: "#0066cc", icon: "💻", realEvent: "Cyber Monday" }, // Week 41
    { name: "Holiday Decoration Dynasty", description: "Christmas decoration business", color: "#dc143c", icon: "🎄", realEvent: "Holiday Season Begins" }, // Week 42
    { name: "Winter Wonderland Workshop", description: "Holiday gift manufacturing", color: "#87ceeb", icon: "🎁", realEvent: "Holiday Shopping" }, // Week 43
    { name: "Santa's Toy Factory", description: "Christmas production management", color: "#dc143c", icon: "🎅", realEvent: "Christmas Week" }, // Week 44
    { name: "Trash Talk Rumble", description: "Competitive verbal combat", color: "#ff4500", icon: "💬", realEvent: "Anti-Bullying Week" }, // Week 45
    { name: "Winter Storm Survival", description: "Emergency preparedness simulation", color: "#4682b4", icon: "🌨️", realEvent: "Winter Weather" }, // Week 46
    { name: "Holiday Travel Chaos", description: "Airport and travel management", color: "#ff6347", icon: "✈️", realEvent: "Holiday Travel" }, // Week 47
    { name: "New Year Resolution Gym", description: "Fitness center empire", color: "#32cd32", icon: "💪", realEvent: "New Year Prep" }, // Week 48
    { name: "Winter Solstice Celebration", description: "Seasonal festival management", color: "#4b0082", icon: "🌟", realEvent: "Winter Solstice" }, // Week 49
    { name: "Year-End Financial Empire", description: "Accounting and tax preparation", color: "#696969", icon: "📈", realEvent: "Year-End Business" }, // Week 50
    { name: "Christmas Eve Magic", description: "Holiday miracle management", color: "#dc143c", icon: "🎄", realEvent: "Christmas Eve" }, // Week 51
    { name: "New Year's Resolution Reset", description: "Goal-setting and achievement", color: "#ffd700", icon: "⭐", realEvent: "New Year's Eve" } // Week 52
  ];

  // Get current week game index (0-based)
  const getCurrentWeekGameIndex = () => {
    const currentWeek = getCurrentWeekOfYear();
    return (currentWeek - 1) % 52; // Convert to 0-based index
  };

  // Timer countdown effect with persistent state
  useEffect(() => {
    // Initialize timer on component mount
    setTimeLeft(getTimeUntilNextMonday());
    
    const timer = setInterval(() => {
      const newTimeLeft = getTimeUntilNextMonday();
      setTimeLeft(newTimeLeft);
      
      // Check if we've hit Monday 12:00 AM UTC (all values are 0 or very close)
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds <= 1) {
        // Week has changed, force a re-render by updating the time
        setTimeout(() => {
          setTimeLeft(getTimeUntilNextMonday());
        }, 2000);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Permanent mini-games
  const miniGames = [
    { name: "Blob Bets", description: "Eat, grow, dominate! Battle other players in this agar.io-style game.", color: "#4ecdc4", icon: "🟢", rules: "Control your blob with the mouse. Eat smaller blobs to grow bigger. Avoid larger blobs that can eat you. Use spacebar to split your blob. The goal is to become the largest blob on the server." },
    { name: "Castle Siege", description: "4-player RTS battle! Build your army and destroy enemy bases.", color: "#ff6b6b", icon: "🏰", rules: "Build your army by gathering resources. Train different unit types: soldiers, archers, and siege weapons. Destroy all enemy castles to win. Use strategy to outmaneuver your opponents." },
    { name: "Classic War", description: "Pure luck card battle! Flip cards to beat your opponent.", color: "#ff4500", icon: "🃏", rules: "Each player flips a card simultaneously. The highest card wins both cards. Aces are high. If cards are equal, it's war - place 3 cards down and flip the 4th. Winner takes all cards. First to collect all cards wins." },
    { name: "Cosmic Jackpot", description: "Spin for massive rewards! Hit the mega slots jackpot.", color: "#9932cc", icon: "🎰", rules: "Place your bet and spin the reels. Match 3 symbols to win. Three 🎰 symbols = MEGA JACKPOT! Higher value symbols pay more. Two matching symbols give smaller wins." },
    { name: "Big Fish", description: "Eat to grow, become the biggest fish in the ocean to win!", color: "#4169e1", icon: "🐟", rules: "Use arrow keys or WASD to swim. Eat fish smaller than you to grow. Avoid larger fish that can eat you. The goal is to become the biggest fish in the ocean. Watch out for sharks!" },
    { name: "Escape Prison", description: "A classic choice-based adventure game with multiple endings.", color: "#696969", icon: "🔓", rules: "Make strategic choices to escape from prison. Each decision affects your path and determines your ending. Choose wisely between stealth, force, or cunning to achieve freedom." },
    { name: "Rock Paper Scissors", description: "Classic hand game! Best of 3 rounds wins.", color: "#00ced1", icon: "✂️", rules: "Choose rock, paper, or scissors. Rock beats scissors, scissors beats paper, paper beats rock. Best of 3 rounds wins the match. Quick reflexes and psychology matter!" },
    { name: "Get On Top", description: "Physics duel! 2 vs 2 wrestling match with crazy physics.", color: "#ffa500", icon: "🤼", rules: "Use physics-based controls to wrestle your opponent. Push, pull, and throw to get your opponent's head to touch the ground. First team to score wins the match." },
    { name: "Hangman", description: "Classic word guessing! You can bet the creator or...", color: "#9370db", icon: "🎯", rules: "Guess the hidden word by selecting letters. Each wrong guess adds a part to the hangman. Guess the word before the drawing is complete to win." },
    { name: "Header Hustle", description: "1v1 soccer heads with power-ups & betting. First to 5!", color: "#32cd32", icon: "⚽", rules: "Control your soccer player's head to score goals. Use power-ups strategically and jump to head the ball into the opponent's goal. First player to score 5 goals wins." },
    { name: "Puzzles", description: "Assemble an image puzzle against the clock!", color: "#ff69b4", icon: "🧩", rules: "Drag and drop puzzle pieces to recreate the original image. Race against time to complete the puzzle before the timer runs out. Faster completion earns higher scores." },
    { name: "Lunar Lander: Horizon", description: "Side-scrolling landing! Timed rewards, increasing...", color: "#ffd93d", icon: "🚀", rules: "Navigate your lunar lander through side-scrolling terrain. Use thrust carefully to land safely on designated platforms. Fuel is limited, so plan your approach wisely." },
    { name: "Math Works", description: "5-player math battles!", color: "#ff8c00", icon: "🔢", rules: "Solve math problems faster than your opponents. Answer correctly to earn points and advance. Wrong answers may penalize you. The player with the most points wins." },
    { name: "Memory Match", description: "Test your memory skills!", color: "#00ff7f", icon: "🧠", rules: "Flip cards to find matching pairs. Remember the positions of cards you've seen. Match all pairs with the fewest moves to achieve the highest score." },
    { name: "Mini Basketball", description: "Shoot some hoops! Simple physics, based scoring.", color: "#ff4500", icon: "🏀", rules: "Aim and shoot basketballs into the hoop. Adjust angle and power for perfect shots. Score as many baskets as possible within the time limit." },
    { name: "One in a Million", description: "Competitive Where's Waldo! 2-player. 10 rounds each.", color: "#daa520", icon: "🔍", rules: "Find the hidden character in crowded scenes faster than your opponent. Each round presents a new challenge. The player who finds the most characters wins." },
    { name: "Platform Jump", description: "4-player ledge jumping! Push others off to win!", color: "#32cd32", icon: "🏔️", rules: "Jump between ledges and try to be the last one standing! Push and pull other players to knock them off. Collect coins for extra points. Game gets harder over time with disappearing platforms and hazards. Last player alive or highest score after 120 seconds wins!" },
    { name: "Pixel Python Arena", description: "Full-screen snake battle! WASD/Click controls.", color: "#32cd32", icon: "🐍", rules: "Control your snake using WASD keys or mouse clicks. Eat food to grow longer while avoiding walls and other snakes. Last snake surviving wins the arena battle." },
    { name: "QuizKnows", description: "Competitive trivia! 5-12 players. Fast answers win.", color: "#9932cc", icon: "💡", rules: "Answer trivia questions faster than other players. Correct answers earn points, with bonus points for speed. The player with the most points after all questions wins." },
    { name: "Sea Squares", description: "Match-3 puzzle with betting & competitive themes. 7x7...", color: "#4169e1", icon: "🌊", rules: "Match 3 or more sea creatures in rows or columns on a 7x7 grid. Create combos for higher scores. Place bets on your performance before each round." },
    { name: "Snakes n Ladders - Gamble", description: "Classic board game with betting. 2-6 players.", color: "#228b22", icon: "🎲", rules: "Roll dice to move around the board. Climb ladders to advance quickly, but avoid snakes that send you backward. Place bets on who will reach the finish first." },
    { name: "Stickman Fight", description: "Epic stickman battles!", color: "#8b0000", icon: "🥊", rules: "Control your stickman fighter using keyboard controls. Punch, kick, and perform special moves to defeat opponents. Last stickman standing wins the battle." },
    { name: "Stickman Racer", description: "Fast and track clicker game!", color: "#ff6b6b", icon: "🏁", rules: "Click rapidly to make your stickman run faster around the track. Maintain rhythm and speed to outpace other racers. First to cross the finish line wins." },
    { name: "Wolverine", description: "Social deduction! Identify roles, eliminate enemies.", color: "#4b0082", icon: "🐺", rules: "Players are assigned secret roles. Wolverines hunt at night while villagers vote to eliminate suspects during the day. Use deduction and strategy to identify and eliminate the opposing team." },
    { name: "WordWeaver", description: "Fast-paced rhyming battle! 2 players. 10 vs 12 prompts.", color: "#ff1493", icon: "📝", rules: "Create rhyming words or phrases based on given prompts. Players take turns responding with rhymes. Points awarded for creativity and speed. Best rhymer after all prompts wins." }
  ];

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
      case 'Sea Squares':
        setCurrentGame('SeaSquares');
        break;
      case 'QuizKnows':
        setCurrentGame('QuizKnows');
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
      case 'Header Hustle':
        setCurrentGame('HeaderHustle');
        break;
      case 'Mini Basketball':
        setCurrentGame('MiniHoops');
        break;
      case 'One in a Million':
        setCurrentGame('OneInAMillion');
        break;
      case 'Platform Jump':
        setCurrentGame('PlatformJump');
        break;
      case 'Car Passing':
        setCurrentGame('CarPassing');
        break;
      default:
        alert(`${selectedGame.name} game implementation coming soon!`);
    }
  };

  const getIdleGameConfig = (gameName) => {
    const configs = {
      "New Year's Eve Showdown": {
        name: "New Year's Eve Showdown",
        background: "linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)",
        icon: "🎉",
        baseMultiplier: 2.0,
        maxMultiplier: 15.0,
        progressSpeed: 0.02
      },
      "Winter Olympics Prep": {
        name: "Winter Olympics Prep",
        background: "linear-gradient(135deg, #87ceeb 0%, #4169e1 100%)",
        icon: "⛷️",
        baseMultiplier: 2.2,
        maxMultiplier: 18.0,
        progressSpeed: 0.018
      },
      "Car Passing": {
        name: "Car Passing",
        background: "linear-gradient(135deg, #ff4500 0%, #ff6347 100%)",
        icon: "🚗",
        baseMultiplier: 2.5,
        maxMultiplier: 20.0,
        progressSpeed: 0.015
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
    return getCurrentWeekOfYear();
  };

  const getNextWeekNumber = () => {
    return (getCurrentWeekOfYear() % 52) + 1;
  };

  const getCurrentWeekGame = () => {
    const currentIndex = getCurrentWeekGameIndex();
    return weeklyGames[currentIndex];
  };

  const getNextWeekGame = () => {
    const nextIndex = (getCurrentWeekGameIndex() + 1) % 52;
    return weeklyGames[nextIndex];
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
            <p>🟢 Current Week {getCurrentWeekNumber()} & Full Rotation Below! 🟢</p>
          </div>

          <div className="current-week-games">
            <div className="current-week">
              <h3>🏆 CURRENT WEEK {getCurrentWeekNumber()} 🏆</h3>
              <div className="featured-game current-game">
                <div className="game-icon">{getCurrentWeekGame().icon}</div>
                <div className="game-info">
                  <h4>{getCurrentWeekGame().name}</h4>
                  <p>{getCurrentWeekGame().description}</p>
                  <p className="real-event">🌟 {getCurrentWeekGame().realEvent}</p>
                  <p className="game-timer">
                    Ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                  </p>
                </div>
              </div>
            </div>

            <div className="next-week">
              <h3>🔮 NEXT WEEK {getNextWeekNumber()} 🔮</h3>
              <div className="featured-game next-game">
                <div className="game-icon">{getNextWeekGame().icon}</div>
                <div className="game-info">
                  <h4>{getNextWeekGame().name}</h4>
                  <p>{getNextWeekGame().description}</p>
                  <p className="real-event">🌟 {getNextWeekGame().realEvent}</p>
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
          <h3>Weekly Grind Rotation (All 52 Weeks)</h3>
          <div className="games-scroll-container">
            <div className="games-grid-wrapper">
              <div className="games-grid weekly-games">
                {weeklyGames.map((game, index) => {
                  const weekNumber = index + 1;
                  const isCurrent = index === getCurrentWeekGameIndex();
                  return (
                    <div 
                      key={index} 
                      className={`game-card weekly-card ${isCurrent ? 'current-week-highlight' : ''}`}
                      style={{backgroundColor: game.color}}
                    >
                      <div className="game-icon">{game.icon}</div>
                      <h4>{game.name}</h4>
                      <p>{game.description}</p>
                      <div className="week-number">Week {weekNumber}</div>
                      <div className="real-event">{game.realEvent}</div>
                      {isCurrent && <div className="current-badge">CURRENT</div>}
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
      {currentGame === 'SeaSquares' && <SeaSquares onClose={() => setCurrentGame(null)} />}
      {currentGame === 'QuizKnows' && <QuizKnows onClose={() => setCurrentGame(null)} />}
      {currentGame === 'WordWeaver' && <WordWeaver onClose={() => setCurrentGame(null)} />}
      {currentGame === 'Wolverine' && <Wolverine onClose={() => setCurrentGame(null)} />}
      {currentGame === 'HeaderHustle' && <HeaderHustle onClose={() => setCurrentGame(null)} />}
      {currentGame === 'MiniHoops' && <MiniHoops onClose={() => setCurrentGame(null)} />}
      {currentGame === 'OneInAMillion' && <OneInAMillion onClose={() => setCurrentGame(null)} />}
      {currentGame === 'PlatformJump' && <PlatformJump onClose={() => setCurrentGame(null)} />}
      {currentGame === 'CarPassing' && <CarPassing onClose={() => setCurrentGame(null)} />}
      
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

