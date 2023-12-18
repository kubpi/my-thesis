import React, { useContext, useState } from 'react';
import './TabsBar.css';

import SearchBar from './SearchBar';
import MatchesTable3 from './MatchesTable3';
import FilterButton from './FilterButton';
import FavoriteMatches from './FavoriteMatches';
import RemoveButton from './RemoveButton';
import { FavoritesContext } from './FavoritesContext';
import BettingView from './BettingView';

function TabsBar() {
  const [tabs, setTabs] = useState([
    { id: 1, name: 'Ulubione', count: 4 },
    { id: 2, name: 'Obstawianie', count: 150 },
    // Add other default tabs as needed
  ]);
  const [activeTab, setActiveTab] = useState('Ulubione');
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [isBettingOpen, setIsBettingOpen] = useState(false);
  
  const addNewTab = () => {
    const newTabName = prompt('Enter the name of the new tab:');
    if (newTabName) {
      // Find the highest existing ID and add 1 to it for the new tab's ID
      const newId = Math.max(...tabs.map(t => t.id)) + 1;
      setTabs([...tabs, { id: newId, name: newTabName, count: 0 }]);
    }
  };
  

  const renderActiveTabContent = () => {
    // Find the active tab object using the activeTabId
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    
    // If no active tab is found or for the default case, return null or some default content
    if (!activeTab) return null;
    
    switch (activeTab.id) {
      case 1:
        return <FavoriteMatches />;
      case 2:
        return <FavoriteMatches />;
        break;
      // ... handle other IDs
      default:
        return null;
    }
  };
 // Function to handle adding a new tab
 const handleAddTab = (name) => {
  const newTabId = Math.max(...tabs.map((t) => t.id), 0) + 1;
  setTabs([...tabs, { id: newTabId, name: name, count: 0 }]);
  setActiveTabId(newTabId); // Optionally set the new tab as active
};
  return (
    <>
      <div className="container">
        <div className="row tabs-container col-12">
        <div className="tabs-bar">
  {tabs.map((tab) => (
    <div
      key={tab.id}
      className={`tab ${activeTabId === tab.id ? 'active' : ''}`}
      onClick={() => setActiveTabId(tab.id)}
    >
      {tab.name} <span className="tab-count">{tab.count}</span>
      <div className={`progress-bar ${activeTabId === tab.id ? '' : 'deactivated'}`}></div>
    </div>
  ))}
  <div className="add-tab-button" onClick={() => setIsBettingOpen(true)}>+</div>
  </div>
          <div className="row tab-content r">
            {renderActiveTabContent()}
          </div>
        </div>
        {isBettingOpen && (
          <BettingView
            isOpen={isBettingOpen}
            onClose={() => setIsBettingOpen(false)}
            onAddTab={handleAddTab} // Changed the prop to onAddTab
          />
        )}
      </div>
    </>
  );
}




export default TabsBar;
