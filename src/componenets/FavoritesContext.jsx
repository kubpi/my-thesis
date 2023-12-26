import React, { createContext, useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection,onSnapshot, where, query  } from 'firebase/firestore';
import { tournaments } from '../Services/apiService';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  //const [favoritesMatches, setFavoritesMatches] = useState([]);
  const firestore = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(firestore, 'userFavorites', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFavorites(docSnap.data().matches);
        }
      }

      console.log(favorites)
    };

    fetchFavorites();
  }, [auth.currentUser]);

  // useEffect(() => {
  //   const firestore = getFirestore();
  //   const unsubscribeFromSnapshots = []; // Inicjalizacja zewnętrznej tablicy dla funkcji anulujących
  //   const matches = [];
  //   tournaments.forEach(tournament => {
  //     const matchesRef = collection(firestore, `matchesData/${tournament.name}/matches`);
  
  //     favorites.forEach((id) => {
  //       const q = query(matchesRef, where("id", "==", id));
  //       const unsubscribe = onSnapshot(q, (querySnapshot) => {
        
  //         querySnapshot.forEach((doc) => {
          
  //           matches.push(doc.data());
  //         });
         
        
  //       });
  //       unsubscribeFromSnapshots.push(unsubscribe); // Dodawanie funkcji anulującej do zewnętrznej tablicy
  //     });
  //      // Aktualizacja stanu powinna odbyć się tutaj, ale trzeba uważać na synchronizację stanu
  //     setFavoritesMatches(matches);
  //     console.log(favoritesMatches)
  //   });
  
    // Funkcja czyszcząca subskrypcje
  //   return () => {
  //     unsubscribeFromSnapshots.forEach(unsubscribe => unsubscribe());
  //   };
  // }, [favorites]); // Zależności useEffect
  



  const addFavorite = async (match) => {
    const user = auth.currentUser;
    if (user) {

      const newFavorites = [...favorites, match.id];
      //console.log(newFavorites)
      setFavorites(newFavorites);

      const docRef = doc(firestore, 'userFavorites', user.uid);
      await setDoc(docRef, { matches: newFavorites }, { merge: true });
    }
  };

  const removeFavorite = async (matchIds) => {
    const user = auth.currentUser;
    if (user) {
      // Filter out the matches that are not in the matchIds array
      const newFavorites = favorites.filter((match) => !matchIds.includes(match));
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
    const newFavorites = favorites.filter((match) => match !== matchId);
    setFavorites(newFavorites);

    const docRef = doc(firestore, 'userFavorites', user.uid);
    await updateDoc(docRef, { matches: newFavorites });
  }
};


  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite,removeFavoriteid }}>
      {children}
    </FavoritesContext.Provider>
  );
};
