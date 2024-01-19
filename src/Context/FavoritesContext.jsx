import PropTypes from "prop-types";
import { createContext, useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const firestore = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(firestore, "userFavorites", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFavorites(docSnap.data().matches);
        }
      }

      console.log(favorites);
    };

    fetchFavorites();
  }, [auth.currentUser]);

  const addFavorite = async (match) => {
    const user = auth.currentUser;
    if (user) {
      const newFavorites = [...favorites, match.id];
      setFavorites(newFavorites);
      const docRef = doc(firestore, "userFavorites", user.uid);
      await setDoc(docRef, { matches: newFavorites }, { merge: true });
    }
  };

  const removeFavorite = async (matchIds) => {
    const user = auth.currentUser;
    if (user) {
      const newFavorites = favorites.filter(
        (match) => !matchIds.includes(match)
      );
      setFavorites(newFavorites);
      const docRef = doc(firestore, "userFavorites", user.uid);
      await updateDoc(docRef, { matches: newFavorites });
    }
  };

  const removeFavoriteid = async (matchId) => {
    const user = auth.currentUser;
    if (user) {
      const newFavorites = favorites.filter((match) => match !== matchId);
      setFavorites(newFavorites);

      const docRef = doc(firestore, "userFavorites", user.uid);
      await updateDoc(docRef, { matches: newFavorites });
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, removeFavoriteid }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
FavoritesProvider.propTypes = {
  children: PropTypes.node,
};
