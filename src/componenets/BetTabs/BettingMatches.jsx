import { useEffect, useState } from "react";
import "../../css//BettingMatches.css";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  where,
  query,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  ReturnTeamImage,
  getTurnamentImgURLbyId,
  tournaments,
} from "../../Services/apiService";
import PodiumForFriendsBets from "../PodiumForFriendsBets";
import OtherUsersBettings from "./OtherUsersBettings";

const BettingMatches = ({
  selectedMatchesId,
  onBetClick,
  onSaveBet,
  isBetClosed,
  updateMatchPoints,
  activeTab,
  activeUser,
}) => {
  console.log(selectedMatchesId);
  const [matchesBetting, setMatchesBetting] = useState([]);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [nextMatchTime, setNextMatchTime] = useState(null);
  const [timeUntilNextMatch, setTimeUntilNextMatch] = useState("");
  const [betClosed, setBetClosed] = useState(false);

  const [showInvitationModal, setShowInvitationModal] = useState(false);

  const [closestMatch, setClosestMatch] = useState();
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [selectedBetIdForDeletion, setSelectedBetIdForDeletion] =
    useState(null);

  const [friendGamesTabs, setFriendGamesTabs] = useState([]);
  const [friendsMatchesBetting, setfriendsMatchesBetting] = useState([]);

  async function fetchTabsWithTabId(tabId, participants) {
    const firestore = getFirestore();

    // Map over the participants and create a promise for each query
    const queries = participants.map(async (user) => {
      const userBettingTabsRef = doc(firestore, "userBettingTabs", user.uid);
      const docSnap = await getDoc(userBettingTabsRef);

      if (docSnap.exists() && docSnap.data().tabs) {
        // Find the tab with the matching tabId
        return {
          userUid: user.uid,
          userName: user.displayName,
          tab: docSnap.data().tabs.find((tab) => tab.id === tabId),
        };
      } else {
        return null;
      }
    });

    // Wait for all queries to complete
    const tabs = await Promise.all(queries);

    // Filter out any undefined or null results
    return tabs.filter((tab) => tab != null);
  }

  useEffect(() => {
    if (activeTab && activeTab.participants) {
      const tabIdToSearch = activeTab.id; // Use the actual tab id you're searching for
      fetchTabsWithTabId(tabIdToSearch, activeTab.participants).then((tabs) => {
        setFriendGamesTabs(tabs);
      });
    }
  }, [activeTab]);

  console.log(friendGamesTabs);

  // Oblicz sumę punktów
  const totalPoints = matchesBetting.reduce(
    (sum, match) => sum + (match.points || 0),
    0
  );

  // Aktualizacja czasu do rozpoczęcia najbliższego meczu

  useEffect(() => {
    if (matchesBetting.length > 0) {
      const closest = matchesBetting.reduce((a, b) =>
        a.match.startTimestamp < b.match.startTimestamp ? a : b
      );
      setClosestMatch(closest);
    }
  }, [matchesBetting]); // Add matchesB

  // State to track whether betting time has expired
  const [bettingTimeExpired, setBettingTimeExpired] = useState(false);

  useEffect(() => {
    if (timeUntilNextMatch === "Zakład zamknięty") {
      setBettingTimeExpired(true);
    }
  }, [timeUntilNextMatch]);

  // Separate useEffect to handle changes in 'betClosed'
  useEffect(() => {
    if (
      closestMatch &&
      (closestMatch.match.status.type === "inprogress" ||
        closestMatch.match.status.type === "finished")
    ) {
      // Perform any actions needed when betting is closed
      onSaveBet();
    }
  }, []);

  useEffect(() => {
    let intervalId;

    const calculateNextMatchTime = () => {
      if (matchesBetting.length > 0 && closestMatch && closestMatch.match) {
        // Make sure closestMatch and its match property are defined
        const nextMatchDate = new Date(
          closestMatch.match.startTimestamp * 1000
        );
        const now = new Date();

        if (now < nextMatchDate) {
          setNextMatchTime(nextMatchDate);
        } else {
          setNextMatchTime(null);
          clearInterval(intervalId);
        }
      }
    };

    if (!betClosed) {
      calculateNextMatchTime();
      intervalId = setInterval(calculateNextMatchTime, 60000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [matchesBetting, closestMatch, betClosed]);

  useEffect(() => {
    if (nextMatchTime) {
      const updateTimer = () => {
        const now = new Date();
        const timeDiff = nextMatchTime - now;

        console.log(timeDiff);
        if (timeDiff <= 0) {
          onSaveBet();
          setTimeUntilNextMatch("Zakład zamknięty");
        } else {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
          );

          if (days > 0) {
            setTimeUntilNextMatch(`${days} dni do zamknięcia zakłądu`);
          } else {
            setTimeUntilNextMatch(
              `${hours}h ${minutes}m do zamknięcia zakładu`
            );
          }
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000); // aktualizacja co 1 minutę

      return () => clearInterval(interval);
    }
  }, [nextMatchTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // aktualizacja co 1 minutę

    return () => clearInterval(interval); // Czyszczenie interwału
  }, []);

  const getTimeUntilMatch = (timestamp) => {
    const matchDate = new Date(timestamp * 1000);
    const timeDiff = matchDate - currentTime;

    if (matchDate.toDateString() === currentTime.toDateString()) {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      if (minutes > 0) {
        return `${hours}h ${minutes}m do rozpoczęcia`;
      }
    } else {
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24) - 1);
      return `${days} dni do meczu`;
    }
  };

  const convertDate = (timestamp) => {
    let date = new Date(timestamp * 1000);
    let day = date.getDate().toString().padStart(2, "0");
    let month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0!
    let year = date.getFullYear();
    let hours = date.getHours().toString().padStart(2, "0");
    let minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const handleSaveBet = () => {
    // Call the onSaveBet function passed from TabsBar
    onSaveBet();
  };

  const auth = getAuth();
  const user = auth.currentUser;

  console.log(user.uid);
  console.log(activeTab);
  // Check if there's a received invitation
  useEffect(() => {
    if (
      activeTab.invitations &&
      activeTab?.invitations[user?.uid] &&
      activeTab?.invitations[user.uid]?.status === "received"
    ) {
      setShowInvitationModal(true);
    }
  }, [activeTab, user.uid]);

  // Handle Accept
  // Handle Accept
  const handleAccept = async () => {
    const firestore = getFirestore();
    const userBettingTabRef = doc(firestore, "userBettingTabs", user.uid);

    try {
      // Update the current user's invitation status to 'accepted'
      await updateInvitationStatus(userBettingTabRef, "accepted");

      // Update the invitation status for other participants
      for (const participant of activeTab.participants) {
        if (participant.uid !== user.uid) {
          const participantTabRef = doc(
            firestore,
            "userBettingTabs",
            participant.uid
          );
          await updateInvitationStatus(participantTabRef, "accepted");
        }
      }

      console.log("Invitation accepted and all tabs updated.");
      setShowInvitationModal(false);
    } catch (error) {
      console.error("Error updating tabs: ", error);
    }
  };

  // Function to update the invitation status
  const updateInvitationStatus = async (tabRef, status) => {
    const docSnap = await getDoc(tabRef);
    if (docSnap.exists()) {
      let tabs = docSnap.data().tabs;
      let tabToUpdate = tabs.find((tab) => tab.id === activeTab.id);
      if (tabToUpdate) {
        tabToUpdate.invitations[user.uid].status = status;
        await updateDoc(tabRef, { tabs });
      }
    }
  };

  // Inside BettingMatches component

  // Handle Reject
  // Handle Reject
  const handleReject = () => {
    const firestore = getFirestore();
    const userBettingTabRef = doc(firestore, "userBettingTabs", user.uid);

    // Update the invitation status to 'rejected' for the current user
    getDoc(userBettingTabRef).then((docSnap) => {
      if (docSnap.exists()) {
        let tabs = docSnap.data().tabs;
        let tabToUpdateIndex = tabs.findIndex((tab) => tab.id === activeTab.id);

        if (tabToUpdateIndex !== -1) {
          // Update the invitation status to 'rejected'
          tabs[tabToUpdateIndex].invitations[user.uid].status = "rejected";

          // Save the updated tabs back to Firestore for the current user
          updateDoc(userBettingTabRef, { tabs })
            .then(() => {
              console.log("Invitation rejected by the user.");
              setShowInvitationModal(false);
            })
            .catch((error) => console.error("Error updating tabs: ", error));
        }
      }
    });

    // Update the status in all participants' tabs to reflect the rejection
    activeTab.participants.forEach((participant) => {
      if (participant.uid !== user.uid) {
        const participantTabRef = doc(
          firestore,
          "userBettingTabs",
          participant.uid
        );

        // Fetch the current participant's betting tabs
        getDoc(participantTabRef).then((participantDocSnap) => {
          if (participantDocSnap.exists()) {
            let participantTabs = participantDocSnap.data().tabs;
            let participantTabToUpdateIndex = participantTabs.findIndex(
              (tab) => tab.id === activeTab.id
            );

            if (participantTabToUpdateIndex !== -1) {
              // Update the invitation status to 'rejected'
              participantTabs[participantTabToUpdateIndex].invitations[
                user.uid
              ].status = "rejected";

              // Save the updated tabs back to Firestore for the participant
              updateDoc(participantTabRef, { tabs: participantTabs })
                .then(() => {
                  console.log(
                    `Participant ${participant.uid} notified of the rejection.`
                  );
                })
                .catch((error) =>
                  console.error("Error updating participant's tabs: ", error)
                );
            }
          }
        });
      }
    });
  };

  const isBetCanceled = (bet) => {
    return Object.values(bet.invitations).some(
      (invitation) => invitation.status === "rejected"
    );
  };

  const handleDeleteBet = () => {
    setShowDeleteConfirmationModal(true);
    setSelectedBetIdForDeletion(activeTab.id); // Zakładając, że id zakładu do usunięcia to 'activeTab.id'
  };

  const confirmDeleteBet = async () => {
    if (!selectedBetIdForDeletion) return;

    const firestore = getFirestore();
    const userBettingTabRef = doc(firestore, "userBettingTabs", user.uid);

    try {
      // Pobierz aktualne zakładki
      const docSnap = await getDoc(userBettingTabRef);
      if (docSnap.exists()) {
        let tabs = docSnap.data().tabs;
        // Usuń zakład o wybranym ID
        tabs = tabs.filter((tab) => tab.id !== selectedBetIdForDeletion);

        // Zaktualizuj zakładki w Firestore
        await updateDoc(userBettingTabRef, { tabs });
        console.log("Bet deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting bet: ", error);
    }

    // Zamknij modal i wyczyść stan
    setShowDeleteConfirmationModal(false);
    setSelectedBetIdForDeletion(null);
  };

  useEffect(() => {
    const firestore = getFirestore();
    const unsubscribeFromSnapshots = [];
    const matches = {};

    selectedMatchesId.forEach((match) => {
      console.log(match);
      tournaments.forEach((tournament) => {
        const matchesRef = collection(
          firestore,
          `matchesData/${tournament.name}/matches`
        );
        const q = query(matchesRef, where("id", "==", match.id));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          let newMatches = {};
          let matchess = [];
          querySnapshot.forEach((doc) => {
            const matchData = doc.data();
            newMatches = { match: matchData, ...match };
            console.log(newMatches.match.status.type);
            console.log(newMatches.betHomeScore);
            console.log(newMatches.betAwayScore);
            matches[matchData.id] = newMatches;
          });

          setMatchesBetting(Object.values(matches));
        });

        unsubscribeFromSnapshots.push(unsubscribe);
      });
    });

    return () => {
      unsubscribeFromSnapshots.forEach((unsubscribe) => unsubscribe());
    };
  }, [selectedMatchesId]);

  console.log(matchesBetting);
  console.log(closestMatch);
  const creator = activeTab.participants.filter(
    (creator) => creator.uid === activeTab.creator
  );
  // Find the user(s) who have rejected the invitation
  const rejectedUsers = activeTab.participants.filter(
    (participant) =>
      activeTab.invitations[participant.uid]?.status === "rejected"
  );

  // Extract the display names of the rejected users
  const rejectedUserNames = rejectedUsers.map(
    (user) => user.displayName || user.email.split("@")[0]
  );
  // Find the users who have not yet accepted the invitation
  const pendingInvitations = activeTab.participants.filter(
    (participant) =>
      participant.uid !== activeTab.creator &&
      activeTab.invitations[participant.uid]?.status !== "accepted"
  );

  // Extract the display names of the users with pending invitations
  const pendingUserNames = pendingInvitations.map(
    (user) => user.displayName || user.email.split("@")[0]
  );

  // Check if all invitations have been accepted
  const allInvitationsAccepted = Object.values(activeTab.invitations).every(
    (invitation) => invitation.status === "accepted"
  );

  console.log(matchesBetting);
  console.log(friendGamesTabs);

  const kuba = [];
  const buba = [];

  matchesBetting.forEach((tab) => {
    console.log(tab);

    kuba.push({ ...tab, userUid: user.uid });
  });

  friendGamesTabs.forEach((tab) => {
    tab?.tab?.matches.forEach((mecz) => {
      if (tab.userUid !== user.uid)
        buba.push({
          ...mecz,
          userUid: tab.userUid,
          displayName: tab.userName,
        });
    });
  });

  console.log(buba);
  console.log(kuba);

  kuba.forEach((tab) => {
    const matchingMecze = buba.filter((mecz) => tab.id === mecz.id);
    if (matchingMecze.length > 0) {
      tab.mecze = matchingMecze.map((matchingMecz) => ({
        userUid: matchingMecz.userUid,
        displayName: matchingMecz.displayName,
        betAwayScore: matchingMecz.betAwayScore,
        betHomeScore: matchingMecz.betHomeScore,
        points: matchingMecz.points,
      }));
    }
  });

  console.log(kuba);
  console.log(matchesBetting);
  const allMatchesFinished = matchesBetting.every(
    (match) => match.match.status.type === "finished"
  );
  console.log(allMatchesFinished);
  return (
    <div className="favorite-matches-container">
      <div className="betting-text-style">
        {!allInvitationsAccepted ? (
          <div className="waiting-for-players">
            <p>
              Oczekiwanie na akceptację graczy:{" "}
              <strong>{pendingUserNames.join(", ")}</strong>
            </p>
          </div>
        ) : isBetCanceled(activeTab) ? (
          <div className="canceled-bet-container">
            <p>
              Zakład został anulowany. Użytkownik:{" "}
              <strong>{rejectedUserNames.join(", ")}</strong> nie zaakceptował
              zaproszenia.
            </p>
            <button onClick={() => handleDeleteBet(activeTab.id)}>
              Usuń zakład
            </button>
          </div>
        ) : allMatchesFinished && activeTab?.isGameWithFriends ? (
          <>
            {activeTab?.isGameWithFriends && (
              <div className="opponents-container">
                <div className="opponents-title">Grasz przeciwko</div>
                <ul className="opponents-list">
                  {activeTab?.participants?.map((userParticipant) => {
                    if (userParticipant?.uid !== user.uid) {
                      return (
                        <li key={userParticipant.uid} className="opponent-item">
                          <span
                            className="

opponent-name"
                          >
                            {userParticipant?.displayName}
                          </span>
                          {/* If you have a remove functionality add it here /}
{/ <button className="opponent-remove-btn">Usuń</button> */}
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              </div>
            )}

            <div className="users-table">
              {/* <SearchBar onSearch={setSearchQuery}></SearchBar>
                <div className="buttons-container">
                  <RemoveButton onClick={handleRemoveClick}></RemoveButton>{" "}
                  <FilterButton></FilterButton>
                </div> */}

              <div className="users-table-header">
                <div className="header-item">Liga</div>
                <div className="header-item">
                  Gospodarze <div>Goście</div>
                </div>
                <div className="header-item">Obstawiony wynik</div>
                {/* {friendGamesTabs &&
                friendGamesTabs?.map(
                  (userParticipant) =>
                    userParticipant.userUid !== user.uid && (
                      <div
                        className="header-item"
                        key={userParticipant?.userUid}
                      >
                        {userParticipant?.userName}
                      </div>
                    )
                )} */}
                <div className="header-item">Wynik meczu</div>
                <div className="header-item">Data</div>

                <div className="header-item">Punkty</div>
              </div>
              <div className="users-table-body">
                {kuba.map((user, index) => (
                  <>
                    <div className="table-row " key={user.match.id}>
                      <div className="row-item">
                        <img
                          src={getTurnamentImgURLbyId(
                            user.match.tournament.uniqueTournament.id
                          )}
                          className="team-logo2"
                          alt={user.match.homeTeam.name}
                        ></img>
                        {user.match.tournament.name}
                      </div>
                      <div className="row-item">
                        <div>
                          <img
                            src={ReturnTeamImage(user.match.homeTeam.id)}
                            className="team-logo2"
                            alt={user.match.homeTeam.name}
                          ></img>
                          {user.match.homeTeam.name}
                        </div>
                        <img
                          src={ReturnTeamImage(user.match.awayTeam.id)}
                          className="team-logo2"
                          alt={user.match.awayTeam.name}
                        ></img>
                        {user.match.awayTeam.name}
                      </div>
                      <div className="row-item">
                        <>
                          {user.betHomeScore !== null &&
                          user.betAwayScore !== null ? (
                            <>
                              <div>{user.betHomeScore}</div>
                              <div>{user.betAwayScore}</div>
                            </>
                          ) : (
                            <div>Nieobstawiono</div>
                          )}
                        </>
                      </div>
                      {/* {(user?.mecze?.map((mecz, index) => (
                      mecz.betHomeScore && mecz.betAwayScore ?(
                      <div className="row-item" key={index}>
                        <div>{mecz.betHomeScore}</div>
                        <div>{mecz.betAwayScore}</div>
                        </div>
                      )
                    : (
                          <div>Nieobstawiono</div>
                        ))))} */}

                      <div className="row-item">
                        {user.match.status.type !== "notstarted" ? (
                          <>
                            <div>{user.match.homeScore.display}</div>
                            {user.match.awayScore.display}
                          </>
                        ) : (
                          <div>
                            {getTimeUntilMatch(user.match.startTimestamp)}{" "}
                          </div>
                        )}
                      </div>
                      <div className="row-item">
                        {convertDate(user.match.startTimestamp)}
                      </div>

                      <div className="row-item">{user.points}</div>
                    </div>
                  </>
                ))}
              </div>
              <div className="save-all-button-container time-points-container">
                {closestMatch?.match?.status?.type === "finished" ||
                closestMatch?.match?.status?.type === "inprogress" ||
                isBetClosed ? (
                  <>
                    <span>
                      Zakład zakończony{" "}
                      <button
                        onClick={() => handleDeleteBet(activeTab.id)}
                        className="bet-match-button delete-bet-button"
                      >
                        Usuń zakład
                      </button>
                    </span>
                    <span className="total-points-container points-info">
                      Suma punktów: {totalPoints}
                    </span>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSaveBet}
                      className="save-all-button bet-match-button"
                    >
                      Zamknij zakład
                    </button>
                    <button
                      onClick={() => handleDeleteBet(activeTab.id)}
                      className="bet-match-button delete-bet-button"
                    >
                      Usuń zakład
                    </button>
                    <div className="time-info">{timeUntilNextMatch}</div>
                  </>
                )}
              </div>
            </div>

            <OtherUsersBettings
              user={user}
              activeTab={activeTab}
              friendGamesTabs={friendGamesTabs}
              kuba={kuba}
              closestMatch={closestMatch}
              isBetClosed={isBetClosed}
              allMatchesFinished={allMatchesFinished}
              totalPoints={totalPoints}
              convertDate={convertDate}
              getTimeUntilMatch={getTimeUntilMatch}
            ></OtherUsersBettings>
            <h2 className="podium-title podium-title1">Ranking: </h2>
            <PodiumForFriendsBets kuba={kuba}></PodiumForFriendsBets>
          </>
        ) : (
          <>
            {activeTab?.isGameWithFriends && (
              <div className="opponents-container">
                <div className="opponents-title">Grasz przeciwko</div>
                <ul className="opponents-list">
                  {activeTab?.participants?.map((userParticipant) => {
                    if (userParticipant?.uid !== user.uid) {
                      return (
                        <li key={userParticipant.uid} className="opponent-item">
                          <span className="opponent-name">
                            {userParticipant?.displayName}
                          </span>
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              </div>
            )}

            <div className="users-table">
              {/* <SearchBar onSearch={setSearchQuery}></SearchBar>
                <div className="buttons-container">
                  <RemoveButton onClick={handleRemoveClick}></RemoveButton>{" "}
                  <FilterButton></FilterButton>
                </div> */}

              <div className="users-table-header">
                <div className="header-item">Liga</div>
                <div className="header-item">
                  Gospodarze <div>Goście</div>
                </div>
                <div className="header-item">Obstawiony wynik</div>
                <div className="header-item">Wynik meczu</div>
                <div className="header-item">Data</div>
                <div className="header-item">Status</div>

                <div className="header-item">Punkty</div>
              </div>
              <div className="users-table-body">
                {matchesBetting.map((user, index) => (
                  <div className="table-row " key={user.match.id}>
                    <div className="row-item">
                      <img
                        src={getTurnamentImgURLbyId(
                          user.match.tournament.uniqueTournament.id
                        )}
                        className="team-logo2"
                        alt={user.match.homeTeam.name}
                      ></img>
                      {user.match.tournament.name}
                    </div>
                    <div className="row-item">
                      <div>
                        <img
                          src={ReturnTeamImage(user.match.homeTeam.id)}
                          className="team-logo2"
                          alt={user.match.homeTeam.name}
                        ></img>
                        {user.match.homeTeam.name}
                      </div>
                      <img
                        src={ReturnTeamImage(user.match.awayTeam.id)}
                        className="team-logo2"
                        alt={user.match.awayTeam.name}
                      ></img>
                      {user.match.awayTeam.name}
                    </div>
                    <div className="row-item">
                      {closestMatch?.match?.status?.type === "finished" ||
                      closestMatch?.match?.status?.type === "inprogress" ? (
                        <>
                          {user.betHomeScore !== null &&
                          user.betAwayScore !== null ? (
                            <>
                              <div>{user.betHomeScore}</div>
                              <div>{user.betAwayScore}</div>
                            </>
                          ) : (
                            <div>Nieobstawiono</div>
                          )}
                        </>
                      ) : (
                        <>
                          {user.betPlaced &&
                          !user.betHomeScore &&
                          !user.betAwayScore ? (
                            <div>Nieobstawiono</div>
                          ) : (
                            <>
                              {user.betHomeScore !== null &&
                              user.betAwayScore !== null ? (
                                <>
                                  <div>{user.betHomeScore}</div>
                                  <div>{user.betAwayScore}</div>
                                  {!user.betPlaced && (
                                    <button
                                      className="bet-match-button"
                                      onClick={() => onBetClick(user.match)}
                                    >
                                      Edytuj
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  className="bet-match-button"
                                  onClick={() => onBetClick(user.match)}
                                >
                                  Obstaw mecz
                                </button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>

                    <div className="row-item">
                      {user.match.status.type !== "notstarted" ? (
                        <>
                          <div>{user.match.homeScore.display}</div>
                          {user.match.awayScore.display}
                        </>
                      ) : (
                        <div>
                          {getTimeUntilMatch(user.match.startTimestamp)}{" "}
                        </div>
                      )}
                    </div>
                    <div className="row-item">
                      {convertDate(user.match.startTimestamp)}
                    </div>
                    <div className="row-item">
                      {user.match.status.description}
                    </div>

                    <div className="row-item">{user.points}</div>
                  </div>
                ))}
              </div>
              <div className="save-all-button-container time-points-container">
                {closestMatch?.match?.status?.type === "finished" ||
                closestMatch?.match?.status?.type === "inprogress" ||
                isBetClosed ? (
                  <>
                    <span>
                      Zakład zakończony{" "}
                      <button
                        onClick={() => handleDeleteBet(activeTab.id)}
                        className="bet-match-button delete-bet-button"
                      >
                        Usuń zakład
                      </button>
                    </span>
                    <span className="total-points-container points-info">
                      Suma punktów: {totalPoints}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {" "}
                      <button
                        onClick={handleSaveBet}
                        className="save-all-button bet-match-button"
                      >
                        Zamknij zakład
                      </button>{" "}
                      <button
                        onClick={() => handleDeleteBet(activeTab.id)}
                        className="bet-match-button delete-bet-button"
                      >
                        Usuń zakład
                      </button>
                    </span>

                    <div className="time-info">{timeUntilNextMatch}</div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
        {showInvitationModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h2>
                Użytkownik{" "}
                <strong>{creator[0].displayName?.split("@")[0]}</strong>{" "}
                zaprosił cię do gry
              </h2>
              <button onClick={handleAccept} className="save-button">
                Akceptuj
              </button>
              <button onClick={handleReject}>Odrzuć</button>
            </div>
          </div>
        )}
        {/* Modal do potwierdzenia usunięcia zakładu */}
        {showDeleteConfirmationModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h2>Czy na pewno chcesz usunąć ten zakład?</h2>
              <div className="modal-buttons">
                <button
                  onClick={confirmDeleteBet}
                  className="modal-confirm-button"
                >
                  Usuń
                </button>
                <button
                  onClick={() => setShowDeleteConfirmationModal(false)}
                  className="modal-cancel-button"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingMatches;
