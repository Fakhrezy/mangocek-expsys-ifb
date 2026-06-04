import React, { useState } from 'react';
import '../flipcard.css'; // Pastikan file CSS ini terpisah

function FlipCard({ coverTitle, infoContent, symptoms, control }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={handleClick}>
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <h3>{coverTitle}</h3>
        </div>
        <div className="flip-card-back">
          <div>
            <h4>Gejala:</h4>
            <ul>
              {symptoms.map((g, index) => (
                <li key={index}>{g}</li>
              ))}
            </ul>
            <h4>Pengendalian:</h4>
            <ul>
              {control.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlipCard;
