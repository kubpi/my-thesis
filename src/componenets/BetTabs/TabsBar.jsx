import { useState, useEffect, useContext } from "react";
import "../../css/TabsBar.css";

import FavoriteMatches from "./FavoriteMatches";
import BettingView from "./BettingView";
import { faPlus, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GameModeView from "./GameModeView";
import BettingMatches from "./BettingMatches";
import MatchInputView from "./MatchInputView";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FavoritesContext } from "../../Context/FavoritesContext";

import { faTimes } from "@fortawesome/free-solid-svg-icons";
import CreateTeamModal from "./CreateTeamModal";
import Podium from "../Podium";
function TabsBar() {
  const { favorites, removeFavorite } = useContext(FavoritesContext);
  console.log(favorites.length);
  const [tabs, setTabs] = useState([
    { id: 1, name: "Ulubione", count: favorites.length },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [isBettingOpen, setIsBettingOpen] = useState(false);
  const [isGameModeOpen, setIsGameModeOpen] = useState(false); // Added state for GameModeView
  const [selectedMatches, setSelectedMatches] = useState([]); // State to hold selected matches
  const [selectedMatchForBetting, setSelectedMatchForBetting] = useState(null);
  const [isMatchInputOpen, setIsMatchInputOpen] = useState(false);
  const [isAddTabModalOpen, setIsAddTabModalOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [teamUsers, setTeamUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // Add a state for the current user
  console.log(tabs);

  const handleUsersSelectedForTeam = (selectedUsers) => {
    setTeamUsers(selectedUsers); // Sets the selected team users
    setIsCreateTeamModalOpen(false); // This should close the CreateTeamModal
    setIsBettingOpen(true); // This should open the BettingView
  };

  const handleOpenAddTabModal = () => {
    setIsAddTabModalOpen(true);
  };

  const handleCloseAddTabModal = () => {
    setIsAddTabModalOpen(false);
  };

  const handleCloseTab = (tabId) => {
    if (tabId === 1) return; // Prevent closing "Favorites" tab

    setTabs((prevTabs) => {
      const newTabs = prevTabs.map((tab) => {
        if (tab.id === tabId) {
          return { ...tab, isActive: false };
        }
        return tab;
      });

      // If the closed tab is active, find and activate an adjacent tab
      if (tabId === activeTabId) {
        const activeTabs = newTabs.filter((tab) => tab.isActive);
        const newActiveIdx = Math.max(
          1,
          activeTabs.findIndex((tab) => tab.id === tabId) - 1
        );
        setActiveTabId(activeTabs[newActiveIdx]?.id || 1); // Fallback to "Favorites" if no other tabs
      }

      return newTabs;
    });
  };

  // Funkcja do wyświetlania opcji dodania nowej zakładki

  const handleOpenTab = (tabId) => {
    setActiveTabId(tabId);
    setTabs((prevTabs) =>
      prevTabs.map(
        (tab) => (tab.id === tabId ? { ...tab, isActive: true } : tab) // Set the tab as active
      )
    );
  };

  const auth = getAuth();
  const firestore = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      setCurrentUser(user.uid); // Update the state when the auth state changes
    });

    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, []);

  useEffect(() => {
    // Ensure that user object is not null before proceeding
    if (user) {
      const userBettingTabRef = doc(firestore, "userBettingTabs", user.uid);

      // Subscribe to Firestore changes
      const unsubscribe = onSnapshot(userBettingTabRef, (docSnap) => {
        if (docSnap.exists()) {
          setTabs(docSnap.data().tabs);
        }
      });

      return () => {
        unsubscribe(); // Clean up the listener on unmount
      };
    }
  }, [user]); // Dependency array includes 'user' to re-run effect when 'user' changes

  //console.log(auth.currentUser.uid)
  // Modify the effect hook that initializes the tabs state to include the "Favorites" tab
  useEffect(() => {
    setTabs((currentTabs) => {
      const hasFavorites = currentTabs.some((tab) => tab.id === 1);
      // Ensure "Favorites" tab is always at the start and active
      const updatedTabs = hasFavorites
        ? currentTabs
        : [
            {
              id: 1,
              name: "Ulubione",
              count: favorites.length,
              isActive: true,
            },
            ...currentTabs,
          ];
      // Update the count for the "Favorites" tab
      return updatedTabs.map((tab) => {
        if (tab.id === 1) {
          return { ...tab, count: favorites.length, isActive: true }; // Keep "Favorites" always active
        }
        return tab;
      });
    });
  }, [favorites.length]); // Dep

  useEffect(() => {
    // Load betting tabs when the component mounts and when the user changes
    if (user) {
      const docRef = doc(firestore, "userBettingTabs", user.uid);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            // Assuming the data structure includes an array of tabs
            setTabs(docSnap.data().tabs);
          }
        })
        .catch((error) => {
          console.error("Error loading betting tabs:", error);
        });
    }
  }, [user]);

  const saveBettingTabs = () => {
    if (user) {
      setTabs((prevTabs) => {
        const docRef = doc(firestore, "userBettingTabs", user.uid);
        setDoc(docRef, { tabs: prevTabs }, { merge: true })
          .then(() => {
            console.log("Betting tabs saved successfully.");
          })
          .catch((error) => {
            console.error("Error saving betting tabs:", error);
          });

        // Return the tabs to complete the state update
        return prevTabs;
      });
    }
  };

  const handleBetClick = (match) => {
    setSelectedMatchForBetting(match);
    setIsMatchInputOpen(true);
  };
  const handleSaveAllBets = () => {
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.map((tab) => {
        if (tab.id === activeTabId) {
          // Zaktualizuj zakładki z flagą betClosed na true dla aktywnego zakładu
          const updatedMatches = tab.matches.map((match) => ({
            ...match,
            betPlaced: true,
          }));
          return { ...tab, matches: updatedMatches, betClosed: true };
        }
        return tab;
      });

      // Asynchronicznie zapisz zakładki do Firebase po zaktualizowaniu stanu
      const docRef = doc(firestore, "userBettingTabs", user.uid);
      setDoc(docRef, { tabs: updatedTabs }, { merge: true })
        .then(() => {
          console.log("Betting tabs saved successfully.");
        })
        .catch((error) => {
          console.error("Error saving betting tabs:", error);
        });

      return updatedTabs;
    });
  };

  const handleAddTabWithMatches = (
    tabName,
    selectedMatches,
    selectedUserIds,
    selectedUsers
  ) => {
    console.log(selectedUserIds);
    const updatedMatches = selectedMatches.map((match) => {
      return {
        id: match.id,
        betHomeScore: null,
        betAwayScore: null,
        betClosed: false,
        points: null,
        isItFinished: false,
      };
    });
    // Przykładowa funkcja generująca UUID
    const generateUniqueId = () => {
      return "xxxx-xxxx-4xxx-yxxx-xxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const newTabId = generateUniqueId();

    //const newTabId = Math.max(...tabs.map((t) => t.id), 0) + 1;

    const newTab = {
      id: newTabId, // wspólny identyfikator dla wszystkich uczestników
      name: tabName,
      count: updatedMatches.length,
      matches: updatedMatches,
      betClosed: false,
      isActive: true,
      isGameWithFriends: selectedUserIds.length !== 0 ? true : false, // nowy atrybut
      participants: selectedUsers, // nowy atrybut
      invitations: selectedUserIds
        ? selectedUserIds.reduce((acc, userId) => {
            if (userId != currentUser) {
              acc[userId] = { status: "received" }; // początkowy status dla każdego zaproszonego użytkownika
            }
            return acc;
          }, {})
        : null,
      creator: currentUser,
    };

    // Update the local state with the new tab and set it as active
    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTabId(newTabId); // Set the new tab as the active tab

    // Clear the selected matches for betting
    setSelectedMatches([]);
    setIsBettingOpen(false);

    // Save the new tabs array to Firestore for the current user
    saveBettingTabs();

    if (selectedUserIds) {
      // Save the new tab for the selected user as wel
      console.log(selectedUserIds);
      // Zapisz nową zakładkę dla każdego wybranego użytkownika
      selectedUserIds.forEach((userId) => {
        saveBettingTabsForUser(userId, newTab);
      });
    }
  };
  // This function saves the new tab to another user's Firestore document
  const saveBettingTabsForUser = (userId, newTab) => {
    const docRef = doc(firestore, "userBettingTabs", userId);

    getDoc(docRef)
      .then((docSnap) => {
        let updatedUserTabs = docSnap.exists() ? docSnap.data().tabs : [];
        updatedUserTabs = updatedUserTabs.filter((tab) => tab.id !== newTab.id); // Usuń starą zakładkę, jeśli istnieje
        updatedUserTabs.push(newTab); // Dodaj nową zakładkę

        setDoc(docRef, { tabs: updatedUserTabs }, { merge: true });
      })
      .catch((error) => {
        console.error("Error saving betting tabs for the user:", error);
      });
  };

  const onSubmitScore = (matchId, homeScore, awayScore) => {
    setTabs((prevTabs) => {
      return prevTabs.map((tab) => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            matches: tab.matches.map((match) => {
              if (match.id === matchId) {
                return {
                  id: match.id,
                  betHomeScore: homeScore,
                  betAwayScore: awayScore,
                  points: null,
                  isItFinished: false,
                };
              }
              return match;
            }),
          };
        }
        return tab;
      });
    });
    console.log(tabs);
    saveBettingTabs();
  };

  const handleSelectSolo = () => {
    setIsGameModeOpen(false);
    setIsBettingOpen(true);
  };

  const handleOpenGameMode = () => {
    setIsGameModeOpen(true);
    setIsBettingOpen(false);
  };

  console.log(selectedMatches);
  // Inside TabsBar component
  const renderActiveTabContent = () => {
    const activeTab = tabs.find(
      (tab) => tab.id === activeTabId && tab.isActive
    );

    if (!activeTab) return null;

    switch (activeTab.id) {
      case 1:
        return <FavoriteMatches />;
      default:
        // Assuming that any tab other than the first tab holds betting matches
        if (activeTab.matches) {
          // If the active tab has a 'matches' property, render BettingMatches with those matches
          return (
            <BettingMatches
              activeTab={activeTab}
              selectedMatchesId={activeTab.matches}
              onBetClick={handleBetClick}
              onSaveBet={handleSaveAllBets} // Pass the new onSaveBet handler
              isBetClosed={activeTab.betClosed} // Dodaj tę linię
              activeUser={currentUser}
              //updateMatchPoints={updateMatchPoints}
            />
          );
        } else {
          // If there are no matches for this tab, render a default message or component
          return <div>No matches for this tab.</div>;
        }
    }
  };

  const onSelectTeam = () => {
    setIsCreateTeamModalOpen(true); // Otwiera modal
    setIsGameModeOpen(false); // Zamknie obecny modal
  };
  useEffect(() => {
    if (teamUsers.length > 0) {
      setIsBettingOpen(true);
    }
  }, [teamUsers]);

  console.log(tabs);
  return (
    <>
      <div className="container">
        <div className="row tabs-container ">
          <div className="tabs-bar col-9">
            {tabs
              .filter((tab) => tab.isActive)
              .map((tab) => (
                <div
                  key={tab.id}
                  className={`tab ${activeTabId === tab.id ? "active" : ""} ${
                    tab.isGameWithFriends ? "isGameWithFriends" : ""
                  }`}
                >
                  <span onClick={() => setActiveTabId(tab.id)}>
                    {tab.isGameWithFriends && (
                      <FontAwesomeIcon icon={faUsers} />
                    )}{" "}
                    {/* Dodajemy ikonę przyjaciół */}
                    {tab.name}
                  </span>
                  <span className="tab-count">{tab.count}</span>

                  {/* Only show the close button if it's not the "Favorites" tab */}
                  {tab.id !== 1 && (
                    <button
                      className="close-tab-button"
                      onClick={() => handleCloseTab(tab.id)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}

                  <div
                    className={`progress-bar ${
                      activeTabId === tab.id ? "" : "deactivated"
                    }`}
                  ></div>
                </div>
              ))}
          </div>
          <div className="add-tab-container col-1">
            <div className="add-tab-button" onClick={handleOpenAddTabModal}>
              <FontAwesomeIcon icon={faPlus} />
            </div>
          </div>
          <div className="row tab-content r">{renderActiveTabContent()}</div>
        </div>
        {/* Modal do dodawania nowej zakładki */}
        {isAddTabModalOpen && (
          <div className="modal-backdrop">
            <div className="game-mode-content">
              <h2>Wybierz zakładkę</h2>
              <div className="game-mode-buttons">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`game-mode-button ${
                      tab.isGameWithFriends ? "gameWithFriends" : ""
                    }`}
                    onClick={() => handleOpenTab(tab.id)}
                  >
                    {tab.isGameWithFriends && (
                      <FontAwesomeIcon icon={faUsers} />
                    )}{" "}
                    {/* Dodajemy ikonę przyjaciół */}
                    {tab.name}
                  </button>
                ))}
                <button
                  className="game-mode-button solo"
                  onClick={() => {
                    setIsGameModeOpen(true); // To open GameModeView
                    setIsBettingOpen(false); // Ensure BettingView is closed
                    handleCloseAddTabModal(); // Close modal
                  }}
                >
                  Stwórz nowy zakład
                </button>
              </div>
              {/* Move the close button here, inside the `game-mode-content` div */}
              <button className="close-button" onClick={handleCloseAddTabModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        )}

        {isGameModeOpen && (
          <GameModeView
            isOpen={isGameModeOpen}
            onClose={() => setIsGameModeOpen(false)}
            onSelectSolo={handleSelectSolo}
            onSelectTeam={onSelectTeam}
          />
        )}
        {isBettingOpen && (
          <BettingView
            isOpen={isBettingOpen}
            onClose={() => setIsBettingOpen(false)}
            selectedMatches={selectedMatches}
            setSelectedMatches={setSelectedMatches}
            onAddTab={handleAddTabWithMatches}
            onBetClick={handleBetClick}
            teamUsers={teamUsers} // Pass the selected team users to BettingView
          />
        )}
        {isMatchInputOpen && (
          <MatchInputView
            isOpen={isMatchInputOpen}
            match={selectedMatchForBetting}
            onClose={() => setIsMatchInputOpen(false)}
            onSubmitScore={onSubmitScore}
            // ... Other props as needed ...
          />
        )}
        {isCreateTeamModalOpen && (
          <CreateTeamModal
            isOpen={isCreateTeamModalOpen}
            onClose={() => setIsCreateTeamModalOpen(false)}
            onCreateTab={handleAddTabWithMatches}
            onUsersSelected={handleUsersSelectedForTeam} // Pass the function here
          />
        )}
      </div>
      <Podium></Podium>
    </>
  );
}

export default TabsBar;
