import React, { useState, useEffect } from 'react';
import './Footer.css';

const Footer = () => {
  const [onlineNow, setOnlineNow] = useState(668);
  const [allTimeVisitors, setAllTimeVisitors] = useState(1509430);

  // Simulate real-time updates for online users
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineNow(prev => {
        const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
        const newValue = Math.max(500, Math.min(1000, prev + change));
        return newValue;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Simulate gradual increase in all-time visitors
  useEffect(() => {
    const interval = setInterval(() => {
      setAllTimeVisitors(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Format numbers with leading zeros for odometer effect
  const formatOdometerNumber = (num, digits = 7) => {
    return num.toString().padStart(digits, '0').split('');
  };

  const onlineDigits = formatOdometerNumber(onlineNow, 7);
  const visitorsDigits = formatOdometerNumber(allTimeVisitors, 7);

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Odometer Section */}
        <div className="odometer-section">
          <div className="odometer-group">
            <h3 className="odometer-title">ONLINE NOW</h3>
            <div className="odometer">
              {onlineDigits.map((digit, index) => (
                <div key={index} className="odometer-digit">
                  <span className="digit-display">{digit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="odometer-group">
            <h3 className="odometer-title">ALL TIME VISITORS</h3>
            <div className="odometer">
              {visitorsDigits.map((digit, index) => (
                <div key={index} className="odometer-digit">
                  <span className="digit-display">{digit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="footer-links">
          <div className="footer-column">
            <h4 className="footer-column-title accessibility">ACCESSIBILITY</h4>
            <ul className="footer-list">
              <li><a href="#accessibility-options">Accessibility Options</a></li>
              <li><a href="#suggestions">Suggestions</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title company">COMPANY</h4>
            <ul className="footer-list">
              <li><a href="#about-us">About Us</a></li>
              <li><a href="#press-room">Press Room</a></li>
              <li><a href="#newsletter">Newsletter</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title competitions">COMPETITIONS</h4>
            <ul className="footer-list">
              <li><a href="#tournaments">Tournaments</a></li>
              <li><a href="#registration">Registration</a></li>
              <li><a href="#prizes">Prizes</a></li>
              <li><a href="#awards">Awards</a></li>
              <li><a href="#player-of-month">Player of the Month</a></li>
              <li><a href="#hall-of-fame">Hall of Fame</a></li>
              <li><a href="#credits">Credits</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title legal">LEGAL</h4>
            <ul className="footer-list">
              <li><a href="#community-guidelines">Community Guidelines</a></li>
              <li><a href="#terms-of-service">Terms of Service</a></li>
              <li><a href="#privacy-policy">Privacy Policy</a></li>
              <li><a href="#cookie-policy">Cookie Policy</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title support">SUPPORT</h4>
            <ul className="footer-list">
              <li><a href="#contact-us">Contact Us</a></li>
              <li><a href="#help-center">Help Center</a></li>
              <li><a href="#faqs">FAQs</a></li>
              <li><a href="#report-bug">Report a Bug</a></li>
              <li><a href="#feature-request">Feature Request</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

