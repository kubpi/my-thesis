import React, { useState } from 'react';
import './TabsBar.css';
import MatchesTable2 from './MatchesTable2';
import SearchBar from './SearchBar';
import MatchesTable3 from './MatchesTable3';

function TabsBar() {
  const [activeTab, setActiveTab] = useState('Ulubione');

  return (
    <>
      <div className="container">
      <div className="row tabs-container col-12 ">
         
      <div className="tabs-bar">
        <div 
          className={`tab ${activeTab === 'Ulubione' ? 'active' : ''}`}
          onClick={() => setActiveTab('Ulubione')}
        >
          Ulubione <span className="tab-count">1500</span>
          <div className={`progress-bar ${activeTab === 'Ulubione' ? '' : 'deactivated'}`}></div>
        </div>
        <div 
          className={`tab ${activeTab === 'Obstawianie' ? 'active' : ''}`}
          onClick={() => setActiveTab('Obstawianie')}
        >
          Obstawianie <span className="tab-count">150</span>
          <div className={`progress-bar ${activeTab === 'Obstawianie' ? '' : 'deactivated'}`}></div>
        </div>
        
            </div>
         
              <div className="row tab-content">
                  <SearchBar></SearchBar>
        {activeTab === 'Ulubione' && <MatchesTable3 />}
        {activeTab === 'Obstawianie' && <MatchesTable2 />}
        {/* Możesz tu dodać inne komponenty dla różnych zakładek, jeśli są potrzebne */}
              </div>
        </div>
        </div>
    </>
  );
}

export default TabsBar;
