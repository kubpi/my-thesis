import React, { useContext, useState } from 'react';
import './TabsBar.css';

import SearchBar from './SearchBar';
import MatchesTable3 from './MatchesTable3';
import FilterButton from './FilterButton';
import FavoriteMatches from './FavoriteMatches';
import RemoveButton from './RemoveButton';
import { FavoritesContext } from './FavoritesContext';

function TabsBar() {
  const [activeTab, setActiveTab] = useState('Ulubione');
  const { favorites, removeFavorite } = useContext(FavoritesContext);
  
  return (
    <>
      <div className="container">
      <div className="row tabs-container col-12 ">
         
      <div className="tabs-bar">
        <div 
          className={`tab ${activeTab === 'Ulubione' ? 'active' : ''}`}
          onClick={() => setActiveTab('Ulubione')}
        >
          Ulubione <span className="tab-count">{favorites.length}</span>
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
         
          <div className="row tab-content r">
          <div className="col-sm searchBar-container ">
           
            </div>
            <div className="col-sm buttons-container">
             
              
            </div>
          
        {activeTab === 'Ulubione' && <FavoriteMatches />}
     
        {/* Możesz tu dodać inne komponenty dla różnych zakładek, jeśli są potrzebne */}
              </div>
        </div>
        </div>
    </>
  );
}

export default TabsBar;
