import React, { useState, useEffect } from 'react';
import './MiniSlots.css';

const MiniSlots = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [credits, setCredits] = useState(1000);
  const [bet, setBet] = useState(10);
  const [lastWin, setLastWin] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [jackpotAmount, setJackpotAmount] = useState(50000);

  const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🎰', '🔔'];
  const symbolValues = {
    '🍒': 2,
    '🍋': 3,
    '🍊': 4,
    '🍇': 5,
    '⭐': 10,
    '💎': 20,
    '🎰': 50,
    '🔔': 100
  };

  useEffect(() => {
    // Increase jackpot over time
    const interval = setInterval(() => {
      setJackpotAmount(prev => prev + Math.floor(Math.random() * 10) + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getRandomSymbol = () => {
    const weights = [30, 25, 20, 15, 5, 3, 1, 1]; // Higher chance for lower value symbols
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < symbols.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return symbols[i];
      }
    }
    return symbols[0];
  };

  const calculateWin = (reelResults) => {
    const [reel1, reel2, reel3] = reelResults;
    
    // Jackpot - three 🎰 symbols
    if (reel1 === '🎰' && reel2 === '🎰' && reel3 === '🎰') {
      return jackpotAmount;
    }
    
    // Three of a kind
    if (reel1 === reel2 && reel2 === reel3) {
      return bet * symbolValues[reel1];
    }
    
    // Two of a kind (smaller win)
    if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      const symbol = reel1 === reel2 ? reel1 : (reel2 === reel3 ? reel2 : reel1);
      return Math.floor(bet * symbolValues[symbol] * 0.3);
    }
    
    return 0;
  };

  const spin = () => {
    if (isSpinning || credits < bet) return;
    
    setIsSpinning(true);
    setCredits(prev => prev - bet);
    setLastWin(0);
    
    // Animate reels spinning
    const spinDuration = 2000;
    const spinInterval = 100;
    let elapsed = 0;
    
    const spinAnimation = setInterval(() => {
      setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
      elapsed += spinInterval;
      
      if (elapsed >= spinDuration) {
        clearInterval(spinAnimation);
        
        // Final result
        const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        setReels(finalReels);
        
        const winAmount = calculateWin(finalReels);
        if (winAmount > 0) {
          setLastWin(winAmount);
          setCredits(prev => prev + winAmount);
          setTotalWins(prev => prev + winAmount);
          
          // Reset jackpot if won
          if (winAmount === jackpotAmount) {
            setJackpotAmount(50000);
          }
        }
        
        setIsSpinning(false);
      }
    }, spinInterval);
  };

  const adjustBet = (amount) => {
    const newBet = Math.max(1, Math.min(credits, bet + amount));
    setBet(newBet);
  };

  const maxBet = () => {
    setBet(Math.min(100, credits));
  };

  return (
    <div className={`mini-slots-container ${isOpen ? 'open' : ''}`}>
      <div className="mini-slots-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span className="slots-icon">🎰</span>
        {!isOpen && <span className="slots-label">Mini Slots</span>}
      </div>

      {isOpen && (
        <div className="mini-slots-window">
          <div className="slots-header">
            <div className="slots-title">
              <span className="slots-avatar">🎰</span>
              <span>Cosmic Jackpot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="close-btn">×</button>
          </div>

          <div className="slots-content">
            <div className="jackpot-display">
              <div className="jackpot-label">MEGA JACKPOT</div>
              <div className="jackpot-amount">💎 {jackpotAmount.toLocaleString()}</div>
            </div>

            <div className="slots-machine">
              <div className="reels-container">
                {reels.map((symbol, index) => (
                  <div key={index} className={`reel ${isSpinning ? 'spinning' : ''}`}>
                    <div className="symbol">{symbol}</div>
                  </div>
                ))}
              </div>
              
              <div className="machine-lights">
                <div className="light"></div>
                <div className="light"></div>
                <div className="light"></div>
                <div className="light"></div>
              </div>
            </div>

            <div className="game-info">
              <div className="info-row">
                <div className="info-item">
                  <span className="info-label">Credits:</span>
                  <span className="info-value">{credits.toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Win:</span>
                  <span className={`info-value ${lastWin > 0 ? 'win' : ''}`}>
                    {lastWin.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <span className="info-label">Total Wins:</span>
                  <span className="info-value">{totalWins.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="betting-controls">
              <div className="bet-section">
                <span className="bet-label">Bet Amount:</span>
                <div className="bet-controls">
                  <button onClick={() => adjustBet(-1)} disabled={bet <= 1}>-</button>
                  <span className="bet-amount">{bet}</span>
                  <button onClick={() => adjustBet(1)} disabled={bet >= credits}>+</button>
                  <button onClick={maxBet} className="max-bet-btn">MAX</button>
                </div>
              </div>

              <button 
                className={`spin-btn ${isSpinning ? 'spinning' : ''}`}
                onClick={spin}
                disabled={isSpinning || credits < bet}
              >
                {isSpinning ? 'SPINNING...' : 'SPIN'}
              </button>
            </div>

            <div className="paytable">
              <div className="paytable-title">Paytable (x Bet)</div>
              <div className="paytable-grid">
                <div className="paytable-row">
                  <span>🎰 🎰 🎰</span>
                  <span>JACKPOT!</span>
                </div>
                <div className="paytable-row">
                  <span>🔔 🔔 🔔</span>
                  <span>x100</span>
                </div>
                <div className="paytable-row">
                  <span>💎 💎 💎</span>
                  <span>x20</span>
                </div>
                <div className="paytable-row">
                  <span>⭐ ⭐ ⭐</span>
                  <span>x10</span>
                </div>
                <div className="paytable-row">
                  <span>🍇 🍇 🍇</span>
                  <span>x5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniSlots;

