import React, { useState } from 'react';
import './SearchBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.innerText);
    };

    const handleSearch = () => {
        console.log('Search:', searchQuery);
        // Here you can implement the function that will handle the search
    };

    return (
        <div className="search-bar">
           <div className="search-icon">
                <FontAwesomeIcon icon={faSearch} />
            </div>
            <div
                className="search-input"
                contentEditable
                onInput={handleSearchChange}
                data-placeholder="Search..."
                suppressContentEditableWarning={true}
            >
            </div>
            <div className="search-clear">
                <FontAwesomeIcon icon={faTimes} />
            </div>
        </div>
    );
};

export default SearchBar;
