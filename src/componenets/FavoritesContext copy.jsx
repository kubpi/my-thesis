// FavoritesContext.js
import React, { createContext, useState, useEffect } from 'react';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(loadedFavorites);
  }, []);

  const addFavorite = (match) => {
    const updatedFavorites = [...favorites, match];
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const removeFavorite = (matchIds) => {
    const updatedFavorites = favorites.filter((match) => !matchIds.includes(match.id));
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Remove match from favorites
  const removeFavoriteid = (matchId) => {
    const newFavorites = favorites.filter((m) => m.id !== matchId);
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite,removeFavoriteid }}>
      {children}
    </FavoritesContext.Provider>
  );
};
