import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import "../../css/FilterButton.css";

const FilterButton = ({ onClick }) => {
  return (
    <button className="filter-button" onClick={onClick}>
      <FontAwesomeIcon icon={faBars} />
      <span>Filter</span>
    </button>
  );
};

export default FilterButton;
