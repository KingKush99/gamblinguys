import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your gaming assistant. I can help you with questions about our games, rules, and features. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const gameRules = {
    'blob bets': {
      en: "Blob Bets is an agar.io-style game where you control a blob and eat smaller blobs to grow bigger. Avoid larger blobs that can eat you. Use mouse to move and spacebar to split. The goal is to become the largest blob on the server.",
      es: "Blob Bets es un juego estilo agar.io donde controlas una masa y comes masas más pequeñas para crecer. Evita las masas más grandes que pueden comerte. Usa el ratón para moverte y la barra espaciadora para dividirte. El objetivo es convertirte en la masa más grande del servidor.",
      fr: "Blob Bets est un jeu de style agar.io où vous contrôlez une masse et mangez des masses plus petites pour grandir. Évitez les masses plus grandes qui peuvent vous manger. Utilisez la souris pour vous déplacer et la barre d'espace pour vous diviser. L'objectif est de devenir la plus grande masse du serveur."
    },
    'castle siege': {
      en: "Castle Siege is a 4-player RTS battle game. Build your army, gather resources, and destroy enemy bases. Use different unit types strategically. The last player standing wins.",
      es: "Castle Siege es un juego de batalla RTS de 4 jugadores. Construye tu ejército, reúne recursos y destruye las bases enemigas. Usa diferentes tipos de unidades estratégicamente. El último jugador en pie gana.",
      fr: "Castle Siege est un jeu de bataille RTS à 4 joueurs. Construisez votre armée, rassemblez des ressources et détruisez les bases ennemies. Utilisez différents types d'unités de manière stratégique. Le dernier joueur debout gagne."
    },
    'classic war': {
      en: "Classic War is a pure luck card battle game. Each player flips a card, and the highest card wins the round. Aces are high. The player who wins all cards wins the game.",
      es: "Classic War es un juego de batalla de cartas de pura suerte. Cada jugador voltea una carta, y la carta más alta gana la ronda. Los ases son altos. El jugador que gane todas las cartas gana el juego.",
      fr: "Classic War est un jeu de bataille de cartes de pure chance. Chaque joueur retourne une carte, et la carte la plus haute gagne le tour. Les as sont hauts. Le joueur qui gagne toutes les cartes gagne la partie."
    },
    'cosmic jackpot': {
      en: "Cosmic Jackpot is a mega slots game. Spin the reels to match symbols and win rewards. Look for special bonus symbols that trigger jackpot rounds. The more you bet, the bigger the potential rewards.",
      es: "Cosmic Jackpot es un juego de mega tragamonedas. Gira los carretes para hacer coincidir símbolos y ganar recompensas. Busca símbolos de bonificación especiales que activen rondas de jackpot. Cuanto más apuestes, mayores serán las recompensas potenciales.",
      fr: "Cosmic Jackpot est un jeu de méga machines à sous. Faites tourner les rouleaux pour faire correspondre les symboles et gagner des récompenses. Recherchez des symboles de bonus spéciaux qui déclenchent des tours de jackpot. Plus vous misez, plus les récompenses potentielles sont importantes."
    },
    'big fish': {
      en: "Big Fish is an ocean survival game. Eat smaller fish to grow bigger while avoiding larger predators. Use arrow keys or WASD to swim. The goal is to become the biggest fish in the ocean.",
      es: "Big Fish es un juego de supervivencia oceánica. Come peces más pequeños para crecer mientras evitas depredadores más grandes. Usa las teclas de flecha o WASD para nadar. El objetivo es convertirte en el pez más grande del océano.",
      fr: "Big Fish est un jeu de survie océanique. Mangez des poissons plus petits pour grandir tout en évitant les prédateurs plus grands. Utilisez les touches fléchées ou WASD pour nager. L'objectif est de devenir le plus gros poisson de l'océan."
    }
  };

  const siteInfo = {
    en: {
      about: "The Gambling Guys is a competitive gaming platform featuring 52 weekly idle games and 26 permanent mini-games. We rotate games weekly and offer a social lobby experience.",
      features: "Our features include weekly game rotations, live streaming, social lobby, and competitive gameplay with betting elements.",
      games: "We have 52 weekly showcase games that rotate every Monday, plus 26 permanent mini-games available anytime.",
      lobby: "The SkyHub Tower Lobby is a 6-floor social space where players can interact, chat, and access mini-games."
    },
    es: {
      about: "The Gambling Guys es una plataforma de juegos competitivos que presenta 52 juegos inactivos semanales y 26 mini-juegos permanentes. Rotamos juegos semanalmente y ofrecemos una experiencia de lobby social.",
      features: "Nuestras características incluyen rotaciones de juegos semanales, transmisión en vivo, lobby social y juego competitivo con elementos de apuestas.",
      games: "Tenemos 52 juegos de exhibición semanales que rotan cada lunes, más 26 mini-juegos permanentes disponibles en cualquier momento.",
      lobby: "El SkyHub Tower Lobby es un espacio social de 6 pisos donde los jugadores pueden interactuar, chatear y acceder a mini-juegos."
    },
    fr: {
      about: "The Gambling Guys est une plateforme de jeu compétitive proposant 52 jeux inactifs hebdomadaires et 26 mini-jeux permanents. Nous faisons tourner les jeux chaque semaine et offrons une expérience de lobby social.",
      features: "Nos fonctionnalités incluent des rotations de jeux hebdomadaires, la diffusion en direct, un lobby social et un gameplay compétitif avec des éléments de paris.",
      games: "Nous avons 52 jeux de vitrine hebdomadaires qui tournent chaque lundi, plus 26 mini-jeux permanents disponibles à tout moment.",
      lobby: "Le SkyHub Tower Lobby est un espace social de 6 étages où les joueurs peuvent interagir, discuter et accéder aux mini-jeux."
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [selectedLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    const lang = selectedLanguage;

    // Check if it's a site-related question
    if (message.includes('game') || message.includes('rule') || message.includes('how to play') || 
        message.includes('lobby') || message.includes('feature') || message.includes('about') ||
        message.includes('week') || message.includes('rotation') || message.includes('live') ||
        message.includes('stream') || message.includes('chat') || message.includes('timer')) {
      
      // Game rules
      for (const [gameName, rules] of Object.entries(gameRules)) {
        if (message.includes(gameName)) {
          return rules[lang] || rules.en;
        }
      }

      // Site information
      if (message.includes('about') || message.includes('what is')) {
        return siteInfo[lang]?.about || siteInfo.en.about;
      }
      if (message.includes('feature') || message.includes('what can')) {
        return siteInfo[lang]?.features || siteInfo.en.features;
      }
      if (message.includes('games') || message.includes('how many')) {
        return siteInfo[lang]?.games || siteInfo.en.games;
      }
      if (message.includes('lobby') || message.includes('skyhub')) {
        return siteInfo[lang]?.lobby || siteInfo.en.lobby;
      }

      // Default site-related response
      const responses = {
        en: "I can help you with information about our games, rules, features, and lobby. What specific aspect would you like to know more about?",
        es: "Puedo ayudarte con información sobre nuestros juegos, reglas, características y lobby. ¿Qué aspecto específico te gustaría conocer más?",
        fr: "Je peux vous aider avec des informations sur nos jeux, règles, fonctionnalités et lobby. Quel aspect spécifique aimeriez-vous en savoir plus?"
      };
      return responses[lang] || responses.en;
    }

    // Non-site related question
    const responses = {
      en: "I'm sorry, but I can only help with questions related to our gaming platform. Please ask me about our games, rules, features, or lobby.",
      es: "Lo siento, pero solo puedo ayudar con preguntas relacionadas con nuestra plataforma de juegos. Por favor pregúntame sobre nuestros juegos, reglas, características o lobby.",
      fr: "Je suis désolé, mais je ne peux aider qu'avec des questions liées à notre plateforme de jeu. Veuillez me poser des questions sur nos jeux, règles, fonctionnalités ou lobby."
    };
    return responses[lang] || responses.en;
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      <div className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span className="chatbot-icon">🤖</span>
        {!isOpen && <span className="chatbot-label">Chat Assistant</span>}
      </div>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="bot-avatar">🤖</span>
              <span>Gaming Assistant</span>
            </div>
            <div className="chatbot-controls">
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="language-selector"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <button onClick={() => setIsOpen(false)} className="close-btn">×</button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <span className="message-text">{message.text}</span>
                  {message.sender === 'bot' && (
                    <button 
                      className="speak-btn"
                      onClick={() => speakMessage(message.text)}
                      title="Speak message"
                    >
                      🔊
                    </button>
                  )}
                </div>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="message bot typing">
                <div className="message-content">
                  <span className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <div className="input-container">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about games, rules, or features..."
                className="message-input"
                rows="1"
              />
              <div className="input-controls">
                <button
                  className={`voice-btn ${isListening ? 'listening' : ''}`}
                  onClick={isListening ? stopListening : startListening}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? '🔴' : '🎤'}
                </button>
                <button 
                  onClick={handleSendMessage}
                  className="send-btn"
                  disabled={!inputText.trim()}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

