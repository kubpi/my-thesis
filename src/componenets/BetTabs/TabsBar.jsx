import PropTypes from "prop-types";
import "../../css/TabsBar.css";
import { useState, useEffect, useContext } from "react";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { faPlus, faUsers, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FavoritesContext } from "../../Context/FavoritesContext";
import FavoriteMatches from "./FavoriteMatches";
import BettingView from "./BettingView";
import GameModeView from "./GameModeView";
import BettingMatches from "./BettingMatches";
import MatchInputView from "./MatchInputView";
import CreateTeamModal from "./CreateTeamModal";
import Podium from "../Podium";

function TabsBar() {
  const { favorites } = useContext(FavoritesContext);
  const [tabs, setTabs] = useState([
    { id: 1, name: "Ulubione", count: favorites.length },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [isBettingOpen, setIsBettingOpen] = useState(false);
  const [isGameModeOpen, setIsGameModeOpen] = useState(false);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [selectedMatchForBetting, setSelectedMatchForBetting] = useState(null);
  const [isMatchInputOpen, setIsMatchInputOpen] = useState(false);
  const [isAddTabModalOpen, setIsAddTabModalOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [teamUsers, setTeamUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const handleUsersSelectedForTeam = (selectedUsers) => {
    setTeamUsers(selectedUsers);
    setIsCreateTeamModalOpen(false);
    setIsBettingOpen(true);
  };

  const handleOpenAddTabModal = () => {
    setIsAddTabModalOpen(true);
  };

  const handleCloseAddTabModal = () => {
    setIsAddTabModalOpen(false);
  };

  const handleCloseTab = (tabId) => {
    if (tabId === 1) return;

    setTabs((prevTabs) => {
      const newTabs = prevTabs.map((tab) => {
        if (tab.id === tabId) {
          return { ...tab, isActive: false };
        }
        return tab;
      });

      if (tabId === activeTabId) {
        const activeTabs = newTabs.filter((tab) => tab.isActive);
        const newActiveIdx = Math.max(
          1,
          activeTabs.findIndex((tab) => tab.id === tabId) - 1
        );
        setActiveTabId(activeTabs[newActiveIdx]?.id || 1);
      }

      return newTabs;
    });
  };

  const handleOpenTab = (tabId) => {
    setActiveTabId(tabId);
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId ? { ...tab, isActive: true } : tab
      )
    );
  };

  const auth = getAuth();
  const firestore = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      setCurrentUser(user.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const userBettingTabRef = doc(firestore, "userBettingTabs", user.uid);
      const unsubscribe = onSnapshot(userBettingTabRef, (docSnap) => {
        if (docSnap.exists()) {
          setTabs(docSnap.data().tabs);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    setTabs((currentTabs) => {
      const hasFavorites = currentTabs.some((tab) => tab.id === 1);
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
      return updatedTabs.map((tab) => {
        if (tab.id === 1) {
          return { ...tab, count: favorites.length, isActive: true };
        }
        return tab;
      });
    });
  }, [favorites.length]);

  useEffect(() => {
    if (user) {
      const docRef = doc(firestore, "userBettingTabs", user.uid);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
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
          const updatedMatches = tab.matches.map((match) => ({
            ...match,
            betPlaced: true,
          }));
          return { ...tab, matches: updatedMatches, betClosed: true };
        }
        return tab;
      });

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

    const generateUniqueId = () => {
      return "xxxx-xxxx-4xxx-yxxx-xxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const newTabId = generateUniqueId();

    const newTab = {
      id: newTabId,
      name: tabName,
      count: updatedMatches.length,
      matches: updatedMatches,
      betClosed: false,
      isActive: true,
      isGameWithFriends: selectedUserIds.length !== 0 ? true : false,
      participants: selectedUsers,
      invitations: selectedUserIds
        ? selectedUserIds.reduce((acc, userId) => {
            if (userId != currentUser) {
              acc[userId] = { status: "received" };
            }
            return acc;
          }, {})
        : null,
      creator: currentUser,
    };

    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTabId(newTabId);
    setSelectedMatches([]);
    setIsBettingOpen(false);
    saveBettingTabs();

    if (selectedUserIds) {
      console.log(selectedUserIds);
      selectedUserIds.forEach((userId) => {
        saveBettingTabsForUser(userId, newTab);
      });
    }
  };

  const saveBettingTabsForUser = (userId, newTab) => {
    const docRef = doc(firestore, "userBettingTabs", userId);

    getDoc(docRef)
      .then((docSnap) => {
        let updatedUserTabs = docSnap.exists() ? docSnap.data().tabs : [];
        updatedUserTabs = updatedUserTabs.filter((tab) => tab.id !== newTab.id);
        updatedUserTabs.push(newTab);

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

  console.log(selectedMatches);

  const renderActiveTabContent = () => {
    const activeTab = tabs.find(
      (tab) => tab.id === activeTabId && tab.isActive
    );

    if (!activeTab) return null;

    switch (activeTab.id) {
      case 1:
        return <FavoriteMatches />;
      default:
        if (activeTab.matches) {
          return (
            <BettingMatches
              activeTab={activeTab}
              selectedMatchesId={activeTab.matches}
              onBetClick={handleBetClick}
              onSaveBet={handleSaveAllBets}
              isBetClosed={activeTab.betClosed}
              activeUser={currentUser}
            />
          );
        } else {
          return <div>No matches for this tab.</div>;
        }
    }
  };

  const onSelectTeam = () => {
    setIsCreateTeamModalOpen(true);
    setIsGameModeOpen(false);
  };
  useEffect(() => {
    if (teamUsers.length > 0) {
      setIsBettingOpen(true);
    }
  }, [teamUsers]);

  console.log(tabs);
  return (
    <>
      <div className="container betting-text-style">
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
                    {tab.name}
                  </span>
                  <span className="tab-count">{tab.count}</span>
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
                    {tab.name}
                  </button>
                ))}
                <button
                  className="game-mode-button solo"
                  onClick={() => {
                    setIsGameModeOpen(true);
                    setIsBettingOpen(false);
                    handleCloseAddTabModal();
                  }}
                >
                  Stwórz nowy zakład
                </button>
              </div>
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
            teamUsers={teamUsers}
          />
        )}
        {isMatchInputOpen && (
          <MatchInputView
            isOpen={isMatchInputOpen}
            match={selectedMatchForBetting}
            onClose={() => setIsMatchInputOpen(false)}
            onSubmitScore={onSubmitScore}
          />
        )}
        {isCreateTeamModalOpen && (
          <CreateTeamModal
            isOpen={isCreateTeamModalOpen}
            onClose={() => setIsCreateTeamModalOpen(false)}
            onCreateTab={handleAddTabWithMatches}
            onUsersSelected={handleUsersSelectedForTeam}
          />
        )}
      </div>
      <Podium></Podium>
    </>
  );
}

export default TabsBar;

TabsBar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
  }),
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  onTabClick: PropTypes.func,
  onTabClose: PropTypes.func,
};
