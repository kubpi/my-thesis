import "../../css/SearchBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
// SearchBar.js

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    onSearch(event.target.value); // Call the onSearch callback passed by the parent
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch(""); // Reset search
  };

  return (
    <div className="search-bar">
      <FontAwesomeIcon icon={faSearch} className="search-icon" />
      <input
        className="search-input"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search..."
      />
      <FontAwesomeIcon
        icon={faTimes}
        className="search-clear"
        onClick={clearSearch}
      />
    </div>
  );
};

export default SearchBar;