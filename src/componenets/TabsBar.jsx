import {  useState } from "react";
import "./TabsBar.css";

import FavoriteMatches from "./FavoriteMatches";
import BettingView from "./BettingView";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GameModeView from "./GameModeView";
import BettingMatches from "./BettingMatches";

function TabsBar() {

  const [tabs, setTabs] = useState([
    { id: 1, name: "Ulubione", count: 4 },
  ]);

  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [isBettingOpen, setIsBettingOpen] = useState(false);
  const [isGameModeOpen, setIsGameModeOpen] = useState(false); // Added state for GameModeView
  const [selectedMatches, setSelectedMatches] = useState([]); // State to hold selected matches
  
  const handleAddTabWithMatches = (tabName) => {
    const newTabId = Math.max(...tabs.map((t) => t.id), 0) + 1;
    const newTab = {
      id: newTabId,
      name: tabName,
      count: selectedMatches.length,
      matches: selectedMatches,
    };
    setTabs([...tabs, newTab]);
    setSelectedMatches([]);
    setIsBettingOpen(false);
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
          return <BettingMatches selectedMatches={activeTab.matches} />;
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
          />
        )}
      </div>
    </>
  );
}

export default TabsBar;
