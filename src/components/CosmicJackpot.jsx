import React, { useState, useEffect } from 'react';
import './CosmicJackpot.css';

const CosmicJackpot = ({ onClose }) => {
  const [playerBalance, setPlayerBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [jackpotAmount, setJackpotAmount] = useState(50000); // Starting jackpot
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [recentWinners, setRecentWinners] = useState([
    { name: 'Player123', amount: 25000, time: '2 hours ago' },
    { name: 'LuckyGamer', amount: 15000, time: '5 hours ago' },
    { name: 'CosmicWin', amount: 35000, time: '1 day ago' }
  ]);

  // Jackpot odds - very low chance to win
  const JACKPOT_ODDS = 0.001; // 0.1% chance to win
  const HOUSE_CUT = 0.05; // 5% house cut

  useEffect(() => {
    // Simulate jackpot growing over time
    const jackpotGrowth = setInterval(() => {
      setJackpotAmount(prev => prev + Math.floor(Math.random() * 50) + 10);
    }, 5000);

    return () => clearInterval(jackpotGrowth);
  }, []);

  const placeBet = () => {
    if (playerBalance < betAmount) {
      alert('Insufficient balance!');
      return;
    }

    setIsSpinning(true);
    setPlayerBalance(prev => prev - betAmount);
    
    // Add bet to jackpot (minus house cut)
    const jackpotContribution = betAmount * (1 - HOUSE_CUT);
    setJackpotAmount(prev => prev + jackpotContribution);

    // Simulate spinning animation
    setTimeout(() => {
      const isWinner = Math.random() < JACKPOT_ODDS;
      
      if (isWinner) {
        // Player wins the jackpot!
        setPlayerBalance(prev => prev + jackpotAmount);
        setGameResult({
          type: 'jackpot',
          amount: jackpotAmount,
          message: '🎉 COSMIC JACKPOT WON! 🎉'
        });
        
        // Add to recent winners
        setRecentWinners(prev => [
          { name: 'You', amount: jackpotAmount, time: 'Just now' },
          ...prev.slice(0, 2)
        ]);
        
        // Reset jackpot to base amount
        setJackpotAmount(10000);
      } else {
        // Player loses
        setGameResult({
          type: 'loss',
          amount: betAmount,
          message: 'Better luck next time!'
        });
      }
      
      setIsSpinning(false);
    }, 3000);
  };

  const resetGame = () => {
    setGameResult(null);
  };

  return (
    <div className="cosmic-jackpot">
      <div className="jackpot-header">
        <div className="jackpot-info">
          <h3>🌌 Cosmic Jackpot</h3>
          <div className="balance">💰 Balance: ${playerBalance}</div>
        </div>
        <button className="close-jackpot-btn" onClick={onClose}>×</button>
      </div>

      <div className="jackpot-container">
        <div className="jackpot-display">
          <div className="jackpot-amount">
            <div className="jackpot-label">COSMIC JACKPOT</div>
            <div className="jackpot-value">${jackpotAmount.toLocaleString()}</div>
            <div className="jackpot-subtitle">Winner takes all!</div>
          </div>

          <div className="cosmic-visual">
            <div className={`cosmic-orb ${isSpinning ? 'spinning' : ''}`}>
              🌌
            </div>
            <div className="cosmic-particles">
              <span className="particle">✨</span>
              <span className="particle">⭐</span>
              <span className="particle">💫</span>
              <span className="particle">🌟</span>
            </div>
          </div>

          <div className="odds-display">
            <p>🎯 Jackpot Odds: 1 in 1,000</p>
            <p>🏠 House Cut: 5%</p>
            <p>💎 Your contribution adds to the jackpot!</p>
          </div>
        </div>

        {!gameResult && !isSpinning && (
          <div className="betting-controls">
            <div className="bet-input-section">
              <label>Bet Amount:</label>
              <div className="bet-input-container">
                <button 
                  onClick={() => setBetAmount(Math.max(1, betAmount - 10))}
                  disabled={betAmount <= 1}
                >
                  -$10
                </button>
                <input 
                  type="number" 
                  value={betAmount} 
                  onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={playerBalance}
                />
                <button 
                  onClick={() => setBetAmount(Math.min(playerBalance, betAmount + 10))}
                  disabled={betAmount >= playerBalance}
                >
                  +$10
                </button>
              </div>
            </div>
            
            <div className="quick-bet-buttons">
              <button onClick={() => setBetAmount(10)}>$10</button>
              <button onClick={() => setBetAmount(50)}>$50</button>
              <button onClick={() => setBetAmount(100)}>$100</button>
              <button onClick={() => setBetAmount(500)}>$500</button>
            </div>

            <button 
              className="spin-button"
              onClick={placeBet}
              disabled={playerBalance < betAmount}
            >
              🎰 Try for Jackpot (${betAmount})
            </button>
          </div>
        )}

        {isSpinning && (
          <div className="spinning-interface">
            <div className="spinning-message">
              <h4>🌌 Cosmic forces are aligning... 🌌</h4>
              <div className="loading-spinner cosmic-spinner"></div>
              <p>Determining your cosmic fate...</p>
            </div>
          </div>
        )}

        {gameResult && (
          <div className="result-interface">
            <div className="result-content">
              <h3>{gameResult.message}</h3>
              {gameResult.type === 'jackpot' ? (
                <div className="jackpot-win">
                  <div className="win-amount">+${gameResult.amount.toLocaleString()}</div>
                  <div className="win-celebration">
                    <span className="celebration-emoji">🎉</span>
                    <span className="celebration-emoji">🌟</span>
                    <span className="celebration-emoji">💰</span>
                    <span className="celebration-emoji">🎊</span>
                  </div>
                  <p>You are now a Cosmic Jackpot winner!</p>
                </div>
              ) : (
                <div className="jackpot-loss">
                  <div className="loss-amount">-${gameResult.amount}</div>
                  <p>Your ${betAmount} has been added to the jackpot!</p>
                  <p>Current jackpot: ${jackpotAmount.toLocaleString()}</p>
                </div>
              )}
              <div className="result-actions">
                <button className="play-again-btn" onClick={resetGame}>
                  🎰 Try Again
                </button>
                <button className="exit-btn" onClick={onClose}>
                  🚪 Exit
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="recent-winners">
          <h4>🏆 Recent Cosmic Winners</h4>
          <div className="winners-list">
            {recentWinners.map((winner, index) => (
              <div key={index} className="winner-entry">
                <span className="winner-name">{winner.name}</span>
                <span className="winner-amount">${winner.amount.toLocaleString()}</span>
                <span className="winner-time">{winner.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="jackpot-footer">
        <div className="jackpot-stats">
          <span>Total Jackpots Won Today: ${Math.floor(Math.random() * 500000).toLocaleString()}</span>
          <span>Players Trying: {Math.floor(Math.random() * 200) + 50}</span>
        </div>
      </div>
    </div>
  );
};

export default CosmicJackpot;

