import React, { createContext, useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc,onSnapshot } from 'firebase/firestore';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const firestore = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(firestore, 'userFavorites', user.uid);

      // Nasłuchiwacz snapshotów dla ulubionych meczów
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          setFavorites(doc.data().matches);
        } else {
          setFavorites([]);
        }
      });

      // Oczyszczenie subskrypcji
      return () => unsubscribe();
    }
  }, [auth.currentUser]);
  
  // useEffect(() => {
  //   const fetchFavorites = async () => {
  //     const user = auth.currentUser;
  //     if (user) {
  //       const docRef = doc(firestore, 'userFavorites', user.uid);
  //       const docSnap = await getDoc(docRef);

  //       if (docSnap.exists()) {
  //         setFavorites(docSnap.data().matches);
  //       }
  //     }
  //   };

  //   fetchFavorites();
  // }, [auth.currentUser]);

  const addFavorite = async (match) => {
    const user = auth.currentUser;
    if (user) {
      const newFavorites = [...favorites, match];
      setFavorites(newFavorites);

      const docRef = doc(firestore, 'userFavorites', user.uid);
      await setDoc(docRef, { matches: newFavorites }, { merge: true });
    }
  };

  const removeFavorite = async (matchIds) => {
    const user = auth.currentUser;
    if (user) {
      // Filter out the matches that are not in the matchIds array
      const newFavorites = favorites.filter((match) => !matchIds.includes(match.id));
      setFavorites(newFavorites);
  
      // Get a reference to the user's favorites document
      const docRef = doc(firestore, 'userFavorites', user.uid);
  
      // Update the document in Firestore
      await updateDoc(docRef, { matches: newFavorites });
    }
  };
  
  const removeFavoriteid = async (matchId) => {
    const user = auth.currentUser;
    if (user) {
      const newFavorites = favorites.filter((match) => match.id !== matchId);
      setFavorites(newFavorites);
  
      const docRef = doc(firestore, 'userFavorites', user.uid);
      await updateDoc(docRef, { matches: newFavorites });
    }
  };
  

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, removeFavoriteid }}>
      {children}
    </FavoritesContext.Provider>
  );
};
