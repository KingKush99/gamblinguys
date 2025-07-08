import React, { useState, useEffect } from 'react';
import './ClassicWar.css';

const ClassicWar = ({ onClose }) => {
  const [gameState, setGameState] = useState('ready');
  const [playerDeck, setPlayerDeck] = useState([]);
  const [computerDeck, setComputerDeck] = useState([]);
  const [playerCard, setPlayerCard] = useState(null);
  const [computerCard, setComputerCard] = useState(null);
  const [roundResult, setRoundResult] = useState('');
  const [warCards, setWarCards] = useState({ player: [], computer: [] });
  const [isWar, setIsWar] = useState(false);
  const [roundCount, setRoundCount] = useState(0);

  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const rankValues = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const createDeck = () => {
    const deck = [];
    suits.forEach(suit => {
      ranks.forEach(rank => {
        deck.push({ suit, rank, value: rankValues[rank] });
      });
    });
    return shuffleDeck(deck);
  };

  const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = () => {
    const deck = createDeck();
    const playerCards = deck.slice(0, 26);
    const computerCards = deck.slice(26, 52);
    
    setPlayerDeck(playerCards);
    setComputerDeck(computerCards);
    setPlayerCard(null);
    setComputerCard(null);
    setRoundResult('');
    setWarCards({ player: [], computer: [] });
    setIsWar(false);
    setRoundCount(0);
    setGameState('playing');
  };

  const playRound = () => {
    if (playerDeck.length === 0 || computerDeck.length === 0) {
      return;
    }

    const pCard = playerDeck[0];
    const cCard = computerDeck[0];
    
    setPlayerCard(pCard);
    setComputerCard(cCard);
    setRoundCount(prev => prev + 1);

    const newPlayerDeck = playerDeck.slice(1);
    const newComputerDeck = computerDeck.slice(1);

    if (pCard.value > cCard.value) {
      // Player wins
      const wonCards = [pCard, cCard, ...warCards.player, ...warCards.computer];
      setPlayerDeck([...newPlayerDeck, ...wonCards]);
      setComputerDeck(newComputerDeck);
      setRoundResult('You win this round!');
      setWarCards({ player: [], computer: [] });
      setIsWar(false);
    } else if (cCard.value > pCard.value) {
      // Computer wins
      const wonCards = [cCard, pCard, ...warCards.computer, ...warCards.player];
      setComputerDeck([...newComputerDeck, ...wonCards]);
      setPlayerDeck(newPlayerDeck);
      setRoundResult('Computer wins this round!');
      setWarCards({ player: [], computer: [] });
      setIsWar(false);
    } else {
      // War!
      setIsWar(true);
      setRoundResult('WAR!');
      
      // Each player puts down 3 cards face down + 1 face up
      const playerWarCards = newPlayerDeck.slice(0, 4);
      const computerWarCards = newComputerDeck.slice(0, 4);
      
      if (playerWarCards.length < 4 || computerWarCards.length < 4) {
        // Not enough cards for war
        if (newPlayerDeck.length > newComputerDeck.length) {
          setGameState('victory');
        } else {
          setGameState('defeat');
        }
        return;
      }

      setWarCards({
        player: [...warCards.player, pCard, ...playerWarCards],
        computer: [...warCards.computer, cCard, ...computerWarCards]
      });
      
      setPlayerDeck(newPlayerDeck.slice(4));
      setComputerDeck(newComputerDeck.slice(4));
      
      // Set the war cards for comparison
      setPlayerCard(playerWarCards[3]);
      setComputerCard(computerWarCards[3]);
      
      // Automatically resolve war after a delay
      setTimeout(() => {
        resolveWar(playerWarCards[3], computerWarCards[3]);
      }, 1500);
    }

    // Check for game end
    setTimeout(() => {
      if (newPlayerDeck.length === 0) {
        setGameState('defeat');
      } else if (newComputerDeck.length === 0) {
        setGameState('victory');
      }
    }, 2000);
  };

  const resolveWar = (pWarCard, cWarCard) => {
    if (pWarCard.value > cWarCard.value) {
      // Player wins war
      const wonCards = [...warCards.player, ...warCards.computer];
      setPlayerDeck(prev => [...prev, ...wonCards]);
      setRoundResult('You win the war!');
    } else if (cWarCard.value > pWarCard.value) {
      // Computer wins war
      const wonCards = [...warCards.computer, ...warCards.player];
      setComputerDeck(prev => [...prev, ...wonCards]);
      setRoundResult('Computer wins the war!');
    } else {
      // Another war (rare)
      setRoundResult('Another war!');
      // For simplicity, we'll just continue with current state
    }
    
    setWarCards({ player: [], computer: [] });
    setIsWar(false);
  };

  const getCardDisplay = (card) => {
    if (!card) return '';
    const color = card.suit === '♥️' || card.suit === '♦️' ? '#ff6b6b' : '#333';
    return (
      <div className="card" style={{ color }}>
        <div className="card-rank">{card.rank}</div>
        <div className="card-suit">{card.suit}</div>
      </div>
    );
  };

  return (
    <div className="classic-war-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🃏 Classic War</h3>
          <div className="deck-counts">
            <span>Your Cards: {playerDeck.length}</span>
            <span>Computer Cards: {computerDeck.length}</span>
          </div>
          <div className="round-count">Round: {roundCount}</div>
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        <div className="battlefield">
          <div className="player-side">
            <h4>Your Card</h4>
            <div className="card-area">
              {playerCard ? getCardDisplay(playerCard) : (
                <div className="card-back">🃏</div>
              )}
            </div>
            <div className="deck-info">
              <div className="deck-stack">
                {Array.from({ length: Math.min(5, playerDeck.length) }, (_, i) => (
                  <div key={i} className="deck-card" style={{ zIndex: 5 - i }}>🃏</div>
                ))}
              </div>
              <span>{playerDeck.length} cards</span>
            </div>
          </div>

          <div className="battle-center">
            <div className="result-display">
              <h3>{roundResult}</h3>
              {isWar && (
                <div className="war-indicator">
                  <div className="war-text">⚔️ WAR! ⚔️</div>
                  <div className="war-cards">
                    <span>War cards: {warCards.player.length}</span>
                  </div>
                </div>
              )}
            </div>
            
            {gameState === 'playing' && (
              <button 
                className="play-round-btn"
                onClick={playRound}
                disabled={isWar || playerDeck.length === 0 || computerDeck.length === 0}
              >
                {isWar ? 'Resolving War...' : 'Play Round'}
              </button>
            )}
          </div>

          <div className="computer-side">
            <h4>Computer Card</h4>
            <div className="card-area">
              {computerCard ? getCardDisplay(computerCard) : (
                <div className="card-back">🃏</div>
              )}
            </div>
            <div className="deck-info">
              <div className="deck-stack">
                {Array.from({ length: Math.min(5, computerDeck.length) }, (_, i) => (
                  <div key={i} className="deck-card" style={{ zIndex: 5 - i }}>🃏</div>
                ))}
              </div>
              <span>{computerDeck.length} cards</span>
            </div>
          </div>
        </div>

        {(gameState === 'victory' || gameState === 'defeat') && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>{gameState === 'victory' ? '🎉 Victory!' : '💀 Defeat!'}</h2>
              <p>
                {gameState === 'victory' 
                  ? 'You won all the cards!' 
                  : 'The computer won all the cards!'}
              </p>
              <p>Rounds played: {roundCount}</p>
              <div className="game-over-buttons">
                <button onClick={initializeGame} className="restart-btn">Play Again</button>
                <button onClick={onClose} className="exit-btn">Exit</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-rules">
        <h4>How to Play:</h4>
        <p>• Each player flips their top card</p>
        <p>• Highest card wins both cards (Ace is high)</p>
        <p>• If cards are equal, it's WAR! Each player puts down 4 cards</p>
        <p>• Win all 52 cards to victory!</p>
      </div>
    </div>
  );
};

export default ClassicWar;

