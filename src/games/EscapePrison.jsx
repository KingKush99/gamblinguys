import React, { useState, useEffect } from 'react';
import './EscapePrison.css';

const EscapePrison = ({ onClose }) => {
  const [gameState, setGameState] = useState('intro'); // 'intro', 'playing', 'success', 'failure'
  const [currentStage, setCurrentStage] = useState(0);
  const [stages, setStages] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [storyText, setStoryText] = useState('');
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);

  // Stage templates with randomized elements
  const stageTemplates = [
    {
      id: 'cell_escape',
      title: 'Cell Block Escape',
      scenarios: [
        {
          text: "You're locked in your cell. The guard just finished his rounds. You notice...",
          choices: [
            { text: "A loose bar in the window", correct: true, clue: "The moonlight reveals wear marks" },
            { text: "The guard left keys nearby", correct: false, trap: "The keys are fake - ALARM!" },
            { text: "A ventilation grate above", correct: true, clue: "You hear air flowing" },
            { text: "Dig through the floor", correct: false, trap: "Too noisy - guards return!" }
          ]
        },
        {
          text: "Your cellmate whispers about an escape plan. He suggests...",
          choices: [
            { text: "Wait for the shift change", correct: true, clue: "Guards are tired then" },
            { text: "Create a distraction now", correct: false, trap: "Too many guards around" },
            { text: "Use the laundry cart", correct: true, clue: "It's collection day" },
            { text: "Overpower the guard", correct: false, trap: "He calls for backup!" }
          ]
        }
      ]
    },
    {
      id: 'corridor_navigation',
      title: 'Corridor Navigation',
      scenarios: [
        {
          text: "You're in the main corridor. Security cameras sweep the area. You see...",
          choices: [
            { text: "Duck behind the cleaning cart", correct: true, clue: "It's in the blind spot" },
            { text: "Run straight across", correct: false, trap: "Camera catches you!" },
            { text: "Crawl along the wall", correct: true, clue: "Shadows provide cover" },
            { text: "Hide in the supply closet", correct: false, trap: "It's locked from outside!" }
          ]
        },
        {
          text: "A guard approaches your hiding spot. You quickly...",
          choices: [
            { text: "Hold your breath and stay still", correct: true, clue: "He seems distracted" },
            { text: "Make a noise to distract him", correct: false, trap: "He investigates!" },
            { text: "Slip past while he's not looking", correct: true, clue: "His radio is buzzing" },
            { text: "Confront him directly", correct: false, trap: "He sounds the alarm!" }
          ]
        }
      ]
    },
    {
      id: 'guard_room',
      title: 'Guard Station',
      scenarios: [
        {
          text: "You reach the guard station. The duty officer is...",
          choices: [
            { text: "Asleep at his desk", correct: true, clue: "Coffee cup is cold" },
            { text: "Watching TV with volume up", correct: true, clue: "Late night movie" },
            { text: "On patrol outside", correct: false, trap: "He returns unexpectedly!" },
            { text: "Talking on the phone", correct: false, trap: "He spots you!" }
          ]
        },
        {
          text: "You need to get past the security desk. You notice...",
          choices: [
            { text: "A master key hanging nearby", correct: true, clue: "It's labeled 'Emergency'" },
            { text: "The computer is unlocked", correct: true, clue: "Security system is accessible" },
            { text: "A weapon in the drawer", correct: false, trap: "It triggers silent alarm!" },
            { text: "Cash in the safe", correct: false, trap: "Wrong priority - time wasted!" }
          ]
        }
      ]
    },
    {
      id: 'kitchen_area',
      title: 'Kitchen Passage',
      scenarios: [
        {
          text: "The kitchen is your next obstacle. You find...",
          choices: [
            { text: "A delivery entrance unlocked", correct: true, clue: "Fresh food delivery today" },
            { text: "Chef's uniform hanging up", correct: true, clue: "Perfect disguise" },
            { text: "Sharp knives for protection", correct: false, trap: "Violence brings more guards!" },
            { text: "Food to take with you", correct: false, trap: "Inventory check will reveal theft!" }
          ]
        },
        {
          text: "Kitchen staff might arrive early. You should...",
          choices: [
            { text: "Check the schedule board", correct: true, clue: "Shows shift times" },
            { text: "Hide in the freezer", correct: false, trap: "You'll freeze or suffocate!" },
            { text: "Pretend to be new staff", correct: true, clue: "High turnover here" },
            { text: "Rush through quickly", correct: false, trap: "Motion sensors activate!" }
          ]
        }
      ]
    },
    {
      id: 'maintenance_tunnels',
      title: 'Maintenance Area',
      scenarios: [
        {
          text: "You discover maintenance tunnels. The best route is...",
          choices: [
            { text: "Follow the main water pipe", correct: true, clue: "Leads to city connection" },
            { text: "Take the electrical conduit path", correct: false, trap: "High voltage danger!" },
            { text: "Use the ventilation shaft", correct: true, clue: "Fresh air means exit nearby" },
            { text: "Go through the steam pipes", correct: false, trap: "Scalding hot!" }
          ]
        },
        {
          text: "The tunnel splits in multiple directions. You choose...",
          choices: [
            { text: "The path with cool air flow", correct: true, clue: "Outside air circulation" },
            { text: "The widest tunnel", correct: false, trap: "Leads back to prison!" },
            { text: "Follow the power cables", correct: true, clue: "They lead to external grid" },
            { text: "The tunnel with water sounds", correct: false, trap: "Sewage treatment - dead end!" }
          ]
        }
      ]
    },
    {
      id: 'outer_perimeter',
      title: 'Perimeter Fence',
      scenarios: [
        {
          text: "You reach the outer fence. Your escape method is...",
          choices: [
            { text: "Cut through the fence quietly", correct: true, clue: "Wire cutters from maintenance" },
            { text: "Climb over the razor wire", correct: false, trap: "Cuts trigger medical alarm!" },
            { text: "Dig under the fence", correct: true, clue: "Soft ground from recent rain" },
            { text: "Ram through with a vehicle", correct: false, trap: "Too much noise!" }
          ]
        },
        {
          text: "Guard towers scan the perimeter. You time your move when...",
          choices: [
            { text: "Searchlight passes your position", correct: true, clue: "Predictable pattern" },
            { text: "Guards change shifts", correct: true, clue: "Brief communication gap" },
            { text: "A cloud covers the moon", correct: false, trap: "Infrared still works!" },
            { text: "You hear thunder", correct: false, trap: "Guards are more alert in storms!" }
          ]
        }
      ]
    },
    {
      id: 'final_escape',
      title: 'Freedom Run',
      scenarios: [
        {
          text: "You're outside! Your escape vehicle is...",
          choices: [
            { text: "A bicycle hidden in bushes", correct: true, clue: "Silent and fast" },
            { text: "Steal a guard's car", correct: false, trap: "GPS tracking device!" },
            { text: "Run to the nearby forest", correct: true, clue: "Natural cover" },
            { text: "Take the main road", correct: false, trap: "Roadblocks ahead!" }
          ]
        },
        {
          text: "Sirens wail in the distance. Your final move is...",
          choices: [
            { text: "Change clothes and blend in", correct: true, clue: "Civilian clothes hidden nearby" },
            { text: "Keep running at full speed", correct: false, trap: "You'll tire out quickly!" },
            { text: "Find a safe house", correct: true, clue: "Contact gave you an address" },
            { text: "Head to the airport", correct: false, trap: "First place they'll check!" }
          ]
        }
      ]
    }
  ];

  // Initialize game
  useEffect(() => {
    generateRandomStages();
  }, []);

  const generateRandomStages = () => {
    // Randomly select 5-7 stages
    const numStages = 5 + Math.floor(Math.random() * 3); // 5-7 stages
    const shuffledTemplates = [...stageTemplates].sort(() => Math.random() - 0.5);
    const selectedTemplates = shuffledTemplates.slice(0, numStages);
    
    // For each stage, randomly select a scenario and shuffle choices
    const randomizedStages = selectedTemplates.map(template => {
      const scenario = template.scenarios[Math.floor(Math.random() * template.scenarios.length)];
      const shuffledChoices = [...scenario.choices].sort(() => Math.random() - 0.5);
      
      return {
        ...template,
        scenario: {
          ...scenario,
          choices: shuffledChoices
        }
      };
    });
    
    setStages(randomizedStages);
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentStage(0);
    setAttempts(0);
    setScore(0);
    loadStage(0);
  };

  const loadStage = (stageIndex) => {
    if (stageIndex >= stages.length) {
      // Successfully completed all stages
      setGameState('success');
      return;
    }

    const stage = stages[stageIndex];
    setStoryText(stage.scenario.text);
    setChoices(stage.scenario.choices);
    setSelectedChoice(null);
  };

  const makeChoice = (choiceIndex) => {
    const choice = choices[choiceIndex];
    setSelectedChoice(choiceIndex);
    setAttempts(prev => prev + 1);

    setTimeout(() => {
      if (choice.correct) {
        // Correct choice - advance to next stage
        setScore(prev => prev + 100);
        const nextStage = currentStage + 1;
        setCurrentStage(nextStage);
        loadStage(nextStage);
      } else {
        // Wrong choice - game over
        setStoryText(choice.trap);
        setTimeout(() => {
          setGameState('failure');
        }, 2000);
      }
    }, 1500);
  };

  const restartGame = () => {
    generateRandomStages();
    setGameState('intro');
    setCurrentStage(0);
    setAttempts(0);
    setScore(0);
    setSelectedChoice(null);
  };

  const getStageProgress = () => {
    return `${currentStage}/${stages.length}`;
  };

  return (
    <div className="escape-prison-game">
      <div className="game-header">
        <div className="game-info">
          <h3>🔓 Escape from Prison</h3>
          <div className="stats">
            <span>Stage: {getStageProgress()}</span>
            <span>Score: {score}</span>
            <span>Attempts: {attempts}</span>
          </div>
        </div>
        <button className="close-game-btn" onClick={onClose}>×</button>
      </div>

      <div className="game-container">
        {gameState === 'intro' && (
          <div className="intro-screen">
            <h2>🔓 Prison Break</h2>
            <div className="intro-content">
              <p>You've been wrongfully imprisoned and tonight is your only chance to escape!</p>
              <p>Navigate through <strong>{stages.length} randomized stages</strong> where every choice matters.</p>
              <div className="game-features">
                <h3>🎯 Game Features</h3>
                <div className="features-list">
                  <div>🔀 Randomized stages every playthrough</div>
                  <div>🧩 Shuffled solutions - no memorizing!</div>
                  <div>🕵️ Use clues to make smart choices</div>
                  <div>⚠️ One wrong move = game over</div>
                  <div>🏆 Score points for correct decisions</div>
                </div>
              </div>
              <button onClick={startGame} className="start-btn">Begin Escape</button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="playing-screen">
            <div className="stage-header">
              <h3>{stages[currentStage]?.title}</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentStage / stages.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="story-section">
              <p className="story-text">{storyText}</p>
            </div>

            <div className="choices-section">
              <h4>What do you do?</h4>
              <div className="choices-grid">
                {choices.map((choice, index) => (
                  <button
                    key={index}
                    className={`choice-btn ${selectedChoice === index ? 
                      (choice.correct ? 'correct' : 'incorrect') : ''}`}
                    onClick={() => makeChoice(index)}
                    disabled={selectedChoice !== null}
                  >
                    <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="choice-text">{choice.text}</span>
                    {selectedChoice === index && choice.clue && (
                      <div className="choice-clue">💡 {choice.clue}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'success' && (
          <div className="success-screen">
            <h2>🎉 Freedom Achieved!</h2>
            <div className="success-content">
              <div className="success-stats">
                <p>You successfully escaped from prison!</p>
                <p><strong>Stages Completed:</strong> {stages.length}</p>
                <p><strong>Total Score:</strong> {score}</p>
                <p><strong>Total Attempts:</strong> {attempts}</p>
                <p><strong>Success Rate:</strong> {Math.round((stages.length / attempts) * 100)}%</p>
              </div>
              <div className="success-message">
                <p>🏃‍♂️ You vanish into the night, a free person once again!</p>
                <p>Your careful planning and smart choices led to a successful escape.</p>
              </div>
              <div className="success-buttons">
                <button onClick={restartGame} className="restart-btn">New Escape</button>
                <button onClick={onClose} className="exit-btn">Exit</button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'failure' && (
          <div className="failure-screen">
            <h2>🚨 Escape Failed!</h2>
            <div className="failure-content">
              <div className="failure-stats">
                <p>Your escape attempt was thwarted!</p>
                <p><strong>Stages Reached:</strong> {currentStage + 1}/{stages.length}</p>
                <p><strong>Score:</strong> {score}</p>
                <p><strong>Attempts:</strong> {attempts}</p>
              </div>
              <div className="failure-message">
                <p>🔒 You've been caught and returned to your cell.</p>
                <p>Every escape attempt teaches you something new. Try again with a different strategy!</p>
              </div>
              <div className="failure-buttons">
                <button onClick={restartGame} className="restart-btn">Try Again</button>
                <button onClick={onClose} className="exit-btn">Exit</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <div className="controls-section">
          <h4>🎮 How to Play</h4>
          <p>🖱️ Click on your choice</p>
          <p>💡 Look for clues in the text</p>
          <p>🧠 Think carefully - one mistake ends the game</p>
        </div>
        <div className="tips-section">
          <h4>💡 Strategy Tips</h4>
          <p>🔍 Read each scenario carefully</p>
          <p>⚠️ Avoid obviously risky choices</p>
          <p>🕵️ Use environmental clues</p>
          <p>🎯 Every playthrough is different</p>
        </div>
      </div>
    </div>
  );
};

export default EscapePrison;

