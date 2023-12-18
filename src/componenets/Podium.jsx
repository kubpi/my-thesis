import React from 'react';
import './Podium.css';

const Podium = ({ rankings }) => {
  return (
    <>
      <div className="podium">
        <div className="place second-place">
          <div className="rank">2</div>
          <div className="competitor">{rankings[1].name}</div>
          <div className="points">{rankings[1].points} pts</div>
        </div>
        <div className="place first-place">
          <div className="rank">1</div>
          <div className="competitor">{rankings[0].name}</div>
          <div className="points">{rankings[0].points} pts</div>
        </div>
        <div className="place third-place">
          <div className="rank">3</div>
          <div className="competitor">{rankings[2].name}</div>
          <div className="points">{rankings[2].points} pts</div>
        </div>
      </div>
      <div className="additional-rankings">
        {rankings.slice(3).map((ranking, index) => (
          <div key={index} className="additional-place">
            <span className="additional-rank">{index + 4}</span>
            <span className="additional-name">{ranking.name}</span>
            <span className="additional-points">{ranking.points} pts</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Podium;
