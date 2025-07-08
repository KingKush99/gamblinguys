import React from 'react';
import './LobbySection.css';

const LobbySection = ({ onEnterLobby }) => {
  return (
    <section className="lobby-section">
      <div className="lobby-card">
        <div className="lobby-icon">🏢</div>
        <div className="lobby-content">
          <h3>SkyHub Tower Lobby</h3>
          <p>Explore 5 floors of mini-games & social spaces!</p>
        </div>
        <button className="lobby-enter-btn" onClick={onEnterLobby}>
          Enter Lobby
        </button>
      </div>
    </section>
  );
};

export default LobbySection;

