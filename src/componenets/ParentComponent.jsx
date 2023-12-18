// ParentComponent.js

import React, { useState } from 'react';
import GameModeView from './GameModeView';
import BettingView from './BettingView';

const ParentComponent = () => {
  const [isGameModeOpen, setIsGameModeOpen] = useState(true);
  const [isBettingOpen, setIsBettingOpen] = useState(false);

  const handleSelectSolo = () => {
    setIsGameModeOpen(false);
    setIsBettingOpen(true);
  };

  const handleCloseBetting = () => {
    setIsBettingOpen(false);
  };

  return (
    <>
      {isGameModeOpen && (
        <GameModeView
          isOpen={isGameModeOpen}
          onClose={() => setIsGameModeOpen(false)}
          onSelectSolo={handleSelectSolo}
          onSelectTeam={() => {/* handle team selection */}}
        />
      )}

      {isBettingOpen && (
        <BettingView
          isOpen={isBettingOpen}
          onClose={handleCloseBetting}
          onAddTab={() => {/* handle adding a tab */}}
        />
      )}
    </>
  );
};

export default ParentComponent;
