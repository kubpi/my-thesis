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
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  ReturnTeamImage,
  getTurnamentImgURLbyId,
  tournaments,
} from "../../Services/apiService";

const BettingMatches = ({
  selectedMatchesId,
  onBetClick,
  onSaveBet,
  isBetClosed,
  updateMatchPoints,
  activeTab,
}) => {
  console.log(selectedMatchesId);
  const [matchesBetting, setMatchesBetting] = useState([]);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [nextMatchTime, setNextMatchTime] = useState(null);
  const [timeUntilNextMatch, setTimeUntilNextMatch] = useState("");
  const [betClosed, setBetClosed] = useState(false);

  const [showInvitationModal, setShowInvitationModal] = useState(false);

  // Oblicz sumę punktów
  const totalPoints = matchesBetting.reduce(
    (sum, match) => sum + (match.points || 0),
    0
  );
  // Function to calculate points for a single match
  const calculateMatchPoints = (match) => {
    // Define points for different outcomes
    const pointsForCorrectHomeScore = 1;
    const pointsForCorrectAwayScore = 1;
    const pointsForCorrectOutcome = 3;

    let points = 0;

    console.log(match);
    // // Check if the match has been bet on and the result is available
    // console.log(match.match.status.type);
    // console.log(match.betHomeScore);
    // console.log(match.betAwayScore);

    if (
      match.match.status.type === "finished" &&
      match.betHomeScore &&
      match.betAwayScore
    ) {
      // Add points for correctly predicted home score
      console.log("match.betHomeScore " + match.betHomeScore);
      console.log(
        "match.match.homeScore.display " + match.match.homeScore.display
      );

      console.log(match.betHomeScore == match.match.homeScore.display);
      if (match.betHomeScore == match.match.homeScore.display) {
        points += pointsForCorrectHomeScore;
        console.log("points " + points);
      }

      // Add points for correctly predicted away score
      if (match.betAwayScore == match.match.awayScore.display) {
        points += pointsForCorrectAwayScore;
      }

      if (
        match.betHomeScore == match.match.homeScore.display &&
        match.betAwayScore == match.match.awayScore.display
      ) {
        points += pointsForCorrectOutcome;
        console.log("points " + points);
      }
    }

    return points;
  };

  // Aktualizacja czasu do rozpoczęcia najbliższego meczu
  let closestMatch;
  if (matchesBetting.length > 0) {
    closestMatch = matchesBetting.reduce((a, b) =>
      a.match.startTimestamp < b.match.startTimestamp ? a : b
    );
  }

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
      if (matchesBetting.length > 0) {
        // Assuming you have logic to find the closest match

        const nextMatchDate = new Date(
          closestMatch.match.startTimestamp * 1000
        );
        const now = new Date();

        if (now < nextMatchDate) {
          setNextMatchTime(nextMatchDate);
        } else {
          setNextMatchTime(null); // Resetting nextMatchTime
          clearInterval(intervalId); // Stop the interval
        }
      }
    };

    if (!betClosed) {
      calculateNextMatchTime();
      intervalId = setInterval(calculateNextMatchTime, 60000); // Set up the interval
    }

    return () => {
      if (intervalId) clearInterval(intervalId); // Clear the interval when the component unmounts or dependencies change
    };
  }, [matchesBetting]); // Dependencies

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
  const handleAccept = () => {
    const firestore = getFirestore();
    const userBettingTabRef = doc(firestore, "userBettingTabs", user.uid);

    // Fetch the current user's betting tabs
    getDoc(userBettingTabRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          let tabs = docSnap.data().tabs;
          let tabToUpdate = tabs.find((tab) => tab.id === activeTab.id);

          if (tabToUpdate) {
            // Update the invitation status to 'accepted' for the current user
            tabToUpdate.invitations[user.uid].status = "accepted";

            // Save the updated tabs back to Firestore
            updateDoc(userBettingTabRef, { tabs })
              .then(() => {
                console.log("Invitation accepted and tabs updated.");
                setShowInvitationModal(false);
              })
              .catch((error) => console.error("Error updating tabs: ", error));
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching user betting tabs: ", error);
      });
  };

  // Inside BettingMatches component

  // Handle Reject
  const handleReject = () => {
    const firestore = getFirestore();
    const userBettingTabRef = doc(firestore, "userBettingTabs", user.uid);

    // Remove the tab from the current user's tabs
    getDoc(userBettingTabRef).then((docSnap) => {
      if (docSnap.exists()) {
        let tabs = docSnap.data().tabs;
        tabs = tabs.filter((tab) => tab.id !== activeTab.id);
        updateDoc(userBettingTabRef, { tabs })
          .then(() => {
            console.log("Tab removed after rejection.");
            setShowInvitationModal(false);
          })
          .catch((error) => console.error("Error removing tab: ", error));
      }
    });

    // Update the status in other participants' tabs
    activeTab.participants.forEach((participantId) => {
      if (participantId !== user.uid) {
        const participantTabRef = doc(
          firestore,
          "userBettingTabs",
          participantId
        );

        getDoc(participantTabRef).then((participantDocSnap) => {
          if (participantDocSnap.exists()) {
            let participantTabs = participantDocSnap.data().tabs;
            let tabToUpdate = participantTabs.find(
              (tab) => tab.id === activeTab.id
            );

            if (tabToUpdate) {
              tabToUpdate.invitations[user.uid].status = "rejected";
              // Optionally, remove the rejecting user from the participants list
              tabToUpdate.participants = tabToUpdate.participants.filter(
                (id) => id !== user.uid
              );

              updateDoc(participantTabRef, { tabs: participantTabs })
                .then(() => {
                  console.log("Participant's tab updated after rejection.");
                })
                .catch((error) =>
                  console.error("Error updating participant's tab: ", error)
                );
            }
          }
        });
      }
    });
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
            // if (
            //   isBetClosed &&
            //   newMatches.match.status.type === "finished" &&
            //   newMatches.betHomeScore &&
            //   newMatches.betAwayScore
            // ) {

            //   newMatches.points = calculateMatchPoints(newMatches);
            //   // Call the updateMatchPoints function after calculating the points

            // } else if (!newMatches.betHomeScore || !newMatches.betAwayScore) {
            //   newMatches.points = 0;
            // }
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

  // useEffect(() => {
  //   const firestore = getFirestore();
  //   const userBettingTabRef = doc(firestore, "userBettingTabs", user.uid);

  //   getDoc(userBettingTabRef).then((docSnap) => {
  //     if (docSnap.exists()) {
  //       const data = docSnap.data();
  //       const tabs = data.tabs; // Assuming tabs is an array of tabs
  //       let pointsUpdated = false;
  //       console.log(tabs);
  //       tabs.forEach((tab) => {
  //         if (tab.id === activeTab.id) {
  //           tab.matches.forEach((match) => {
  //             const changedMatch = matchesBetting.find(
  //               (m) => m.id === match.id
  //             );
  //             console.log(changedMatch);
  //             console.log(calculateMatchPoints(changedMatch));
  //             if (
  //               changedMatch &&
  //               changedMatch.match.status.type === "finished" &&
  //               !match.pointsUpdated
  //             ) {
  //               console.log(changedMatch);
  //               match.points = calculateMatchPoints(changedMatch);
  //               console.log(match.points);
  //               match.pointsUpdated = true;
  //               pointsUpdated = true;
  //             }
  //           });
  //         }
  //       });

  //       if (pointsUpdated) {
  //         updateDoc(userBettingTabRef, { tabs })
  //           .then(() => {
  //             console.log("Points updated for finished matches.");
  //           })
  //           .catch((error) => {
  //             console.error("Error updating points:", error);
  //           });
  //       }
  //     }
  //   });
  // }, [matchesBetting, activeTab, user.uid]);

  return (
    <div className="favorite-matches-container">
      {matchesBetting && matchesBetting.length === 0 ? (
        <p>No favorite matches added.</p>
      ) : (
          <>
            <div>Grasz z</div>
          <div className="users-table">
            {/* <SearchBar onSearch={setSearchQuery}></SearchBar>
                <div className="buttons-container">
                  <RemoveButton onClick={handleRemoveClick}></RemoveButton>{" "}
                  <FilterButton></FilterButton>
                </div> */}

            <div className="users-table-header">
              <div className="header-item select-column">
                <input type="checkbox" />
              </div>

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
                  <div className="row-item select-column">
                    <input type="checkbox" />
                  </div>
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
                    {bettingTimeExpired ? (
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
                                    onClick={() => onBetClick(user.match)}
                                  >
                                    Edytuj
                                  </button>
                                )}
                              </>
                            ) : (
                              <button onClick={() => onBetClick(user.match)}>
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
            <div className="save-all-button-container">
              {!isBetClosed && (
                <>
                  <button onClick={handleSaveBet} className="save-all-button">
                    Zamknij zakład
                  </button>

                  <div>{timeUntilNextMatch}</div>
                </>
              )}
            </div>
          </div>
          {/* Pole sumy punktów */}
          <div className="total-points-container">
            Łączna suma punktów: {totalPoints}
          </div>
        </>
      )}
      {showInvitationModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Invitation to Bet</h2>
            <button onClick={handleAccept} className="save-button">
              Accept
            </button>
            <button onClick={handleReject}>Reject</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BettingMatches;
