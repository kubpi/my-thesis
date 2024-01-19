import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "../../css//BettingMatches.css";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  where,
  query,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import PodiumForFriendsBets from "../Podium/PodiumForFriendsBets";
import OtherUsersBettings from "./OtherUsersBettings";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { tournaments } from "../../Services/apiService";
const BettingMatches = ({
  selectedMatchesId,
  onBetClick,
  onSaveBet,
  isBetClosed,
  activeTab,
}) => {
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
  const [tournamentLogos, setTournamentLogos] = useState({});
  const [homeTeamLogo, setHomeTeamLogo] = useState("");
  const [awayTeamLogo, setAwayTeamLogo] = useState("");

  useEffect(() => {
    const savedLogos =
      JSON.parse(localStorage.getItem("tournamentLogos")) || {};
    const storage = getStorage();
    const fetchLogoPromises = [];

    matchesBetting.forEach((bet) => {
      const tournamentId = bet.match.tournament.uniqueTournament.id;
      if (!savedLogos[tournamentId]) {
        const logoRef = ref(storage, `tournamentsLogos/${tournamentId}.png`);
        fetchLogoPromises.push(
          getDownloadURL(logoRef)
            .then((url) => {
              savedLogos[tournamentId] = url;
              return [tournamentId, url];
            })
            .catch((error) => {
              console.error(
                `Error fetching logo for tournamentId: ${tournamentId}`,
                error
              );

              return [tournamentId, "default_logo_url.png"];
            })
        );
      }
    });

    Promise.all(fetchLogoPromises).then((results) => {
      const newLogos = results.reduce((acc, [id, url]) => {
        acc[id] = url;
        return acc;
      }, savedLogos);

      localStorage.setItem("tournamentLogos", JSON.stringify(newLogos));
      setTournamentLogos(newLogos);
    });

    if (Object.keys(savedLogos).length > 0) {
      setTournamentLogos(savedLogos);
    }
  }, [matchesBetting]);

  useEffect(() => {
    const savedLogos = JSON.parse(localStorage.getItem("teamsLogos")) || {};
    const storage = getStorage();
    const fetchLogoPromises = [];

    matchesBetting.forEach((bet) => {
      const homeTeamId = bet.match.homeTeam.id;
      if (!savedLogos[homeTeamId]) {
        const logoRef = ref(storage, `teamsLogos/${homeTeamId}.png`);
        fetchLogoPromises.push(
          getDownloadURL(logoRef)
            .then((url) => {
              savedLogos[homeTeamId] = url;
              return [homeTeamId, url];
            })
            .catch((error) => {
              console.error(
                `Error fetching logo for teamId: ${homeTeamId}`,
                error
              );
              return [homeTeamId, "default_logo_url.png"];
            })
        );
      }
    });

    Promise.all(fetchLogoPromises).then((results) => {
      const newLogos = results.reduce((acc, [id, url]) => {
        acc[id] = url;
        return acc;
      }, savedLogos);

      localStorage.setItem("teamsLogos", JSON.stringify(newLogos));
      setHomeTeamLogo(newLogos);
    });

    if (Object.keys(savedLogos).length > 0) {
      setHomeTeamLogo(savedLogos);
    }
  }, [matchesBetting]);

  useEffect(() => {
    const savedLogos = JSON.parse(localStorage.getItem("teamsLogos")) || {};
    const storage = getStorage();
    const fetchLogoPromises = [];

    matchesBetting.forEach((bet) => {
      const awayTeamId = bet.match.awayTeam.id;
      if (!savedLogos[awayTeamId]) {
        const logoRef = ref(storage, `teamsLogos/${awayTeamId}.png`);
        fetchLogoPromises.push(
          getDownloadURL(logoRef)
            .then((url) => {
              savedLogos[awayTeamId] = url;
              return [awayTeamId, url];
            })
            .catch((error) => {
              console.error(
                `Error fetching logo for teamId: ${awayTeamId}`,
                error
              );
              return [awayTeamId, "default_logo_url.png"];
            })
        );
      }
    });

    Promise.all(fetchLogoPromises).then((results) => {
      const newLogos = results.reduce((acc, [id, url]) => {
        acc[id] = url;
        return acc;
      }, savedLogos);

      localStorage.setItem("teamsLogos", JSON.stringify(newLogos));
      setAwayTeamLogo(newLogos);
    });

    // If logos are already saved, set them directly
    if (Object.keys(savedLogos).length > 0) {
      setAwayTeamLogo(savedLogos);
    }
  }, [matchesBetting]);

  async function fetchTabsWithTabId(tabId, participants) {
    const firestore = getFirestore();
    const queries = participants.map(async (user) => {
      const userBettingTabsRef = doc(firestore, "userBettingTabs", user.uid);
      const docSnap = await getDoc(userBettingTabsRef);
      if (docSnap.exists() && docSnap.data().tabs) {
        return {
          userUid: user.uid,
          userName: user.displayName,
          tab: docSnap.data().tabs.find((tab) => tab.id === tabId),
        };
      } else {
        return null;
      }
    });

    const tabs = await Promise.all(queries);

    return tabs.filter((tab) => tab != null);
  }

  useEffect(() => {
    if (activeTab && activeTab.participants) {
      const tabIdToSearch = activeTab.id;
      fetchTabsWithTabId(tabIdToSearch, activeTab.participants).then((tabs) => {
        setFriendGamesTabs(tabs);
      });
    }
  }, [activeTab]);

  console.log(friendGamesTabs);

  const totalPoints = matchesBetting.reduce(
    (sum, match) => sum + (match.points || 0),
    0
  );

  useEffect(() => {
    if (matchesBetting.length > 0) {
      const closest = matchesBetting.reduce((a, b) =>
        a.match.startTimestamp < b.match.startTimestamp ? a : b
      );
      setClosestMatch(closest);
    }
  }, [matchesBetting]);

  const [bettingTimeExpired, setBettingTimeExpired] = useState(false);

  useEffect(() => {
    if (timeUntilNextMatch === "Zakład zamknięty") {
      setBettingTimeExpired(true);
    }
  }, [timeUntilNextMatch]);

  useEffect(() => {
    if (
      closestMatch &&
      (closestMatch.match.status.type === "inprogress" ||
        closestMatch.match.status.type === "finished")
    ) {
      onSaveBet();
    }
  }, []);

  useEffect(() => {
    let intervalId;

    const calculateNextMatchTime = () => {
      if (matchesBetting.length > 0 && closestMatch && closestMatch.match) {
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
      const interval = setInterval(updateTimer, 60000);

      return () => clearInterval(interval);
    }
  }, [nextMatchTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
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
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let year = date.getFullYear();
    let hours = date.getHours().toString().padStart(2, "0");
    let minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const handleSaveBet = () => {
    onSaveBet();
  };

  const auth = getAuth();
  const user = auth.currentUser;

  console.log(user.uid);
  console.log(activeTab);

  useEffect(() => {
    if (
      activeTab.invitations &&
      activeTab?.invitations[user?.uid] &&
      activeTab?.invitations[user.uid]?.status === "received"
    ) {
      setShowInvitationModal(true);
    }
  }, [activeTab, user.uid]);

  const handleAccept = async () => {
    const firestore = getFirestore();
    const userBettingTabRef = doc(firestore, "userBettingTabs", user.uid);

    try {
      await updateInvitationStatus(userBettingTabRef, "accepted");

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

  const handleReject = () => {
    const firestore = getFirestore();
    const userBettingTabRef = doc(firestore, "userBettingTabs", user.uid);

    getDoc(userBettingTabRef).then((docSnap) => {
      if (docSnap.exists()) {
        let tabs = docSnap.data().tabs;
        let tabToUpdateIndex = tabs.findIndex((tab) => tab.id === activeTab.id);

        if (tabToUpdateIndex !== -1) {
          tabs[tabToUpdateIndex].invitations[user.uid].status = "rejected";

          updateDoc(userBettingTabRef, { tabs })
            .then(() => {
              console.log("Invitation rejected by the user.");
              setShowInvitationModal(false);
            })
            .catch((error) => console.error("Error updating tabs: ", error));
        }
      }
    });

    activeTab.participants.forEach((participant) => {
      if (participant.uid !== user.uid) {
        const participantTabRef = doc(
          firestore,
          "userBettingTabs",
          participant.uid
        );

        getDoc(participantTabRef).then((participantDocSnap) => {
          if (participantDocSnap.exists()) {
            let participantTabs = participantDocSnap.data().tabs;
            let participantTabToUpdateIndex = participantTabs.findIndex(
              (tab) => tab.id === activeTab.id
            );

            if (participantTabToUpdateIndex !== -1) {
              participantTabs[participantTabToUpdateIndex].invitations[
                user.uid
              ].status = "rejected";

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
    console.log(
      Object.values(bet.invitations).some(
        (invitation) => invitation.status === "rejected"
      )
    );
    return Object.values(bet.invitations).some(
      (invitation) => invitation.status === "rejected"
    );
  };

  const handleDeleteBet = () => {
    setShowDeleteConfirmationModal(true);
    setSelectedBetIdForDeletion(activeTab.id);
  };

  const confirmDeleteBet = async () => {
    if (!selectedBetIdForDeletion) return;

    const firestore = getFirestore();
    const userBettingTabRef = doc(firestore, "userBettingTabs", user.uid);

    try {
      const docSnap = await getDoc(userBettingTabRef);
      if (docSnap.exists()) {
        let tabs = docSnap.data().tabs;

        tabs = tabs.filter((tab) => tab.id !== selectedBetIdForDeletion);

        await updateDoc(userBettingTabRef, { tabs });
        console.log("Bet deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting bet: ", error);
    }

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

  const rejectedUsers = activeTab.participants.filter(
    (participant) =>
      activeTab.invitations[participant.uid]?.status === "rejected"
  );

  const rejectedUserNames = rejectedUsers.map(
    (user) => user.displayName || user.email.split("@")[0]
  );

  const pendingInvitations = activeTab.participants.filter(
    (participant) =>
      participant.uid !== activeTab.creator &&
      activeTab.invitations[participant.uid]?.status !== "accepted"
  );

  const pendingUserNames = pendingInvitations.map(
    (user) => user.displayName || user.email.split("@")[0]
  );

  const allInvitationsAccepted = Object.values(activeTab.invitations).every(
    (invitation) => invitation.status === "accepted"
  );

  console.log(matchesBetting);
  console.log(friendGamesTabs);

  const tab1 = [];
  const tab2 = [];

  matchesBetting.forEach((tab) => {
    console.log(tab);

    tab1.push({ ...tab, userUid: user.uid });
  });

  friendGamesTabs.forEach((tab) => {
    tab?.tab?.matches.forEach((mecz) => {
      if (tab.userUid !== user.uid)
        tab2.push({
          ...mecz,
          userUid: tab.userUid,
          displayName: tab.userName,
        });
    });
  });

  console.log(tab2);
  console.log(tab1);

  tab1.forEach((tab) => {
    const matchingMecze = tab2.filter((mecz) => tab.id === mecz.id);
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

  console.log(tab1);
  console.log(matchesBetting);
  const allMatchesFinished = matchesBetting.every(
    (match) => match.match.status.type === "finished"
  );
  console.log(allMatchesFinished);
  return (
    <div className="favorite-matches-container">
      {!allInvitationsAccepted && !isBetCanceled(activeTab) ? (
        <div className="waiting-for-players">
          <p className="betting-text-style">
            Oczekiwanie na akceptację graczy:{" "}
            <strong>{pendingUserNames.join(", ")}</strong>
          </p>
        </div>
      ) : isBetCanceled(activeTab) ? (
        <div className="canceled-bet-container ">
          <p className="betting-text-style">
            Zakład został anulowany. Użytkownik:{" "}
            <strong>{rejectedUserNames.join(", ")}</strong> odrzucił
            zaproszenie.
          </p>
          <button
            onClick={() => handleDeleteBet(activeTab.id)}
            className="delete-bet-button"
          >
            Usuń zakład
          </button>
        </div>
      ) : allMatchesFinished && activeTab?.isGameWithFriends ? (
        <>
          {activeTab?.isGameWithFriends && (
            <div className="opponents-container betting-text-style">
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
            <div className="users-table-header betting-text-style">
              <div className="header-item">Liga</div>
              <div className="header-item">
                Gospodarze <div>Goście</div>
              </div>
              <div className="header-item">Obstawiony wynik</div>
              <div className="header-item">Wynik meczu</div>
              <div className="header-item">Data</div>
              <div className="header-item">Punkty</div>
            </div>
            <div className="users-table-body betting-text-style">
              {tab1.map((user) => (
                <>
                  <div className="table-row " key={user.match.id}>
                    <div className="row-item">
                      <img
                        src={
                          tournamentLogos[
                            user.match.tournament.uniqueTournament.id
                          ]
                        }
                        className="team-logo2"
                        alt={user.match.homeTeam.name}
                      />
                      {user.match.tournament.name}
                    </div>
                    <div className="row-item">
                      <div>
                        <img
                          src={homeTeamLogo[user.match.homeTeam.id]}
                          className="team-logo2"
                          alt={user.match.homeTeam.name}
                        />
                        {user.match.homeTeam.name}
                      </div>
                      <img
                        src={awayTeamLogo[user.match.awayTeam.id]}
                        className="team-logo2"
                        alt={user.match.homeTeam.name}
                      />
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
            <div className="save-all-button-container time-points-container betting-text-style">
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
            tab1={tab1}
            closestMatch={closestMatch}
            isBetClosed={isBetClosed}
            allMatchesFinished={allMatchesFinished}
            totalPoints={totalPoints}
            convertDate={convertDate}
            getTimeUntilMatch={getTimeUntilMatch}
            tournamentLogos={tournamentLogos}
            homeTeamLogo={homeTeamLogo}
            awayTeamLogo={awayTeamLogo}
          ></OtherUsersBettings>
          <h2 className="podium-title podium-title1">Ranking:</h2>
          <PodiumForFriendsBets tab1={tab1}></PodiumForFriendsBets>
        </>
      ) : (
        <>
          {activeTab?.isGameWithFriends && (
            <div className="opponents-container betting-text-style">
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
            <div className="users-table-header betting-text-style">
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
            <div className="users-table-body betting-text-style">
              {matchesBetting.map((user) => (
                <div className="table-row " key={user.match.id}>
                  <div className="row-item">
                    <img
                      src={
                        tournamentLogos[
                          user.match.tournament.uniqueTournament.id
                        ]
                      }
                      className="team-logo2"
                      alt={user.match.homeTeam.name}
                    />
                    {user.match.tournament.name}
                  </div>
                  <div className="row-item">
                    <div>
                      <img
                        src={homeTeamLogo[user.match.homeTeam.id]}
                        className="team-logo2"
                        alt={user.match.homeTeam.name}
                      />
                      {user.match.homeTeam.name}
                    </div>
                    <img
                      src={awayTeamLogo[user.match.awayTeam.id]}
                      className="team-logo2"
                      alt={user.match.awayTeam.name}
                    />
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
                      <div>{getTimeUntilMatch(user.match.startTimestamp)} </div>
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
            <div className="save-all-button-container time-points-container betting-text-style">
              {closestMatch?.match?.status?.type === "finished" ||
              closestMatch?.match?.status?.type === "inprogress" ||
              isBetClosed ? (
                <>
                  <span>
                    Zakład zamknięty{" "}
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
              <strong>{creator[0].displayName?.split("@")[0]}</strong> zaprosił
              cię do gry
            </h2>
            <button onClick={handleAccept} className="save-button">
              Akceptuj
            </button>
            <button onClick={handleReject}>Odrzuć</button>
          </div>
        </div>
      )}

      {showDeleteConfirmationModal && (
        <div className="modal-backdrop">
          <div className="modal-content betting-text-style">
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
  );
};

export default BettingMatches;

BettingMatches.propTypes = {
  selectedMatchesId: PropTypes.array,
  onBetClick: PropTypes.func.isRequired,
  onSaveBet: PropTypes.func.isRequired,
  isBetClosed: PropTypes.bool,
  activeTab: PropTypes.shape({
    id: PropTypes.string,
    creator: PropTypes.string,
    participants: PropTypes.arrayOf(
      PropTypes.shape({
        uid: PropTypes.string,
        displayName: PropTypes.string,
      })
    ),
    invitations: PropTypes.object,
    isGameWithFriends: PropTypes.bool,
  }),
};
