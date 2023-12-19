import {  useState } from "react";
import "./TabsBar.css";

import FavoriteMatches from "./FavoriteMatches";
import BettingView from "./BettingView";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GameModeView from "./GameModeView";
import BettingMatches from "./BettingMatches";
import MatchInputView from "./MatchInputView";

function TabsBar() {

  const [tabs, setTabs] = useState([
    { id: 1, name: "Ulubione", count: 4 },
  ]);

  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [isBettingOpen, setIsBettingOpen] = useState(false);
  const [isGameModeOpen, setIsGameModeOpen] = useState(false); // Added state for GameModeView
  const [selectedMatches, setSelectedMatches] = useState([]); // State to hold selected matches
  const [selectedMatchForBetting, setSelectedMatchForBetting] = useState(null);
  const [isMatchInputOpen, setIsMatchInputOpen] = useState(false);

  const handleBetClick = (match) => {
    setSelectedMatchForBetting(match);
    setIsMatchInputOpen(true);
  };
  const handleSaveAllBets = () => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            matches: tab.matches.map((match) => {
              // Assume all matches have had bets placed by this point
              return { ...match, betPlaced: true };
            }),
          };
        }
        return tab;
      })
    );
  };
  
  const handleAddTabWithMatches = (tabName) => {
    const updatedMatches = selectedMatches.map(match => {
      return {
        ...match,
        betHomeScore: null, // Initialize with null or any default value
        betAwayScore: null  // Initialize with null or any default value
      };
    });
  
    const newTabId = Math.max(...tabs.map(t => t.id), 0) + 1;
    const newTab = {
      id: newTabId,
      name: tabName,
      count: updatedMatches.length,
      matches: updatedMatches,
    };
  
    setTabs([...tabs, newTab]);
    setSelectedMatches([]);
    setIsBettingOpen(false);
  };
  
  const onSubmitScore = (matchId, homeScore, awayScore) => {
    
    setTabs(prevTabs => {
      return prevTabs.map(tab => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            matches: tab.matches.map(match => {
              if (match.id === matchId) {
                return { ...match, betHomeScore: homeScore, betAwayScore: awayScore };
              }
              return match;
            })
          };
        }
        return tab;
      });
    });
  };

  const handleSelectSolo = () => {
    setIsGameModeOpen(false);
    setIsBettingOpen(true);
  };

  
  const handleOpenGameMode = () => {
    setIsGameModeOpen(true); 
    setIsBettingOpen(false); 
  };

  console.log(selectedMatches);
  // Inside TabsBar component
const renderActiveTabContent = () => {
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  if (!activeTab) return null;

  switch (activeTab.id) {
    case 1:
      return <FavoriteMatches />;
    default:
      // Assuming that any tab other than the first tab holds betting matches
      if (activeTab.matches) {
        // If the active tab has a 'matches' property, render BettingMatches with those matches
        return (
          <BettingMatches
            selectedMatches={activeTab.matches}
            onBetClick={handleBetClick}
            onSaveBet={handleSaveAllBets} // Pass the new onSaveBet handler
          />
        );
      } else {
        // If there are no matches for this tab, render a default message or component
        return <div>No matches for this tab.</div>;
      }
  }
};


  return (
    <>
      <div className="container">
        <div className="row tabs-container col-12">
          <div className="tabs-bar">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`tab ${activeTabId === tab.id ? "active" : ""}`}
                onClick={() => setActiveTabId(tab.id)}
              >
                {tab.name} <span className="tab-count">{tab.count}</span>
                <div
                  className={`progress-bar ${
                    activeTabId === tab.id ? "" : "deactivated"
                  }`}
                ></div>
              </div>
            ))}
            <div className="add-tab-button" onClick={handleOpenGameMode}>
              <FontAwesomeIcon icon={faPlus} /> {/* Render the plus icon */}
            </div>
          </div>
          <div className="row tab-content r">{renderActiveTabContent()}</div>
        </div>
        {isGameModeOpen && (
          <GameModeView
            isOpen={isGameModeOpen}
            onClose={() => setIsGameModeOpen(false)}
            onSelectSolo={handleSelectSolo}

          />
        )}
        {isBettingOpen && (
          <BettingView
            isOpen={isBettingOpen}
            onClose={() => setIsBettingOpen(false)}
            selectedMatches={selectedMatches}
            setSelectedMatches={setSelectedMatches}
            onAddTab={handleAddTabWithMatches}
            onBetClick={handleBetClick}
          />
        )}
        {isMatchInputOpen && (
        <MatchInputView
          isOpen={isMatchInputOpen}
          match={selectedMatchForBetting}
            onClose={() => setIsMatchInputOpen(false)}
            onSubmitScore={onSubmitScore}
          // ... Other props as needed ...
        />
      )}
      </div>
    </>
  );
}

export default TabsBar;
