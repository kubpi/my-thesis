import Modal from "react-modal";
import { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const LoginModal = ({
  isOpen,
  onRequestClose,
  onRegisterClick,
  onForgotPasswordClick,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const auth = getAuth();
  const firestore = getFirestore();
  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (email) {
      // Check if email state is not empty
      sendPasswordResetEmail(auth, email)
        .then(() => {
          alert("Password reset email sent! Check your inbox.");
        })
        .catch((error) => {
          console.error("Error sending password reset email:", error);
        });
    } else {
      alert("Please enter your email address first.");
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    validateForm(e.target.value, password);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    validateForm(email, e.target.value);
  };

  const validateForm = (email, password) => {
    // Simple validation check
    const isValid = email.length > 0 && password.length > 0;
    setIsFormValid(isValid);
  };


  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => {
        // This would be triggered after a user registers/logs in and we have their user UID
        const createUserProfile = async (userAuth) => {
          const userRef = doc(firestore, "users", userAuth.uid);

          const userProfile = {
            displayName: userAuth.displayName || userAuth.email.split("@")[0], // Default to part of the email if no displayName
            email: userAuth.email,
            createdAt: new Date(), // Store the timestamp of when the user was created
            // ... any other fields you'd like to include
          };

          await setDoc(userRef, userProfile);
        };

        // This function would need to be called after user registration/login
        if (auth.currentUser) {
          createUserProfile(auth.currentUser)
            .then(() => {
              console.log("User profile created/updated in Firestore.");
            })
            .catch((error) => {
              console.error("Error creating user profile: ", error);
            });
        }
        onRequestClose(); // Close the modal on successful sign in
      })
      .catch((error) => {
        console.error("Error signing in with Google:", error);
      });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (isFormValid) {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
         
          onRequestClose(); // Close the modal on successful login
        })
        .catch((error) => {
          console.error("Error signing in with email and password:", error);
        });
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Login Modal"
      className="Modal"
      overlayClassName="Overlay"
    >
      <button onClick={onRequestClose} className="close-button">
        &times;
      </button>
      <h2 className="login-header">Zaloguj się na istniejącym koncie</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={handlePasswordChange}
        />
        <button type="submit" disabled={!isFormValid}>
          Zaloguj się
        </button>
      </form>
      <button type="submit" onClick={signInWithGoogle}>Sign in with Google</button>
      <div className="login-help-links">
        <a href="#" onClick={handleForgotPassword}>
          Zapomniałeś(aś) hasła?
        </a>
        <span> albo </span>
        <a href="#" onClick={onRegisterClick}>
          Nie posiadasz konta? Zarejestruj się
        </a>
      </div>
    </Modal>
  );
};

export default LoginModal;
import { useState } from 'react';
import Modal from 'react-modal';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

const RegisterModal = ({ isOpen, onRequestClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState(''); // State to hold the email error message
  // Function to validate the email
  const auth = getAuth();
  const firestore = getFirestore();


  const handleRegister = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          alert("Udało się zarejestrować");
           // This would be triggered after a user registers/logs in and we have their user UID
           const createUserProfile = async (userAuth) => {
            const userRef = doc(firestore, "users", userAuth.uid);

            const userProfile = {
              displayName: userAuth.displayName || userAuth.email.split("@")[0], // Default to part of the email if no displayName
              email: userAuth.email,
              createdAt: new Date(), // Store the timestamp of when the user was created
              // ... any other fields you'd like to include
            };

            await setDoc(userRef, userProfile);
          };

          // This function would need to be called after user registration/login
          if (auth.currentUser) {
            createUserProfile(auth.currentUser)
              .then(() => {
                console.log("User profile created/updated in Firestore.");
              })
              .catch((error) => {
                console.error("Error creating user profile: ", error);
              });
          }
          onRequestClose(); // Close the modal on successful registration
          resetForm();
        })
        .catch((error) => {
          console.error('Error during registration:', error);
        });
    }
  };

  const validateEmail = (email) => {
    if (!email.includes('@')) {
      setEmailError('Uwzględnij znak "@" w adresie e-mail. W adresie brakuje znaku "@"');
    } else {
      setEmailError(''); // Clear the error if the email is valid
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
  };
  
  const handleInputChange = (e, type) => {
    const value = e.target.value;
    if (type === 'email') {
      setEmail(value);
      validateEmail(value); // Validate email when it changes
    } else {
      type === 'password' ? setPassword(value) :
      setConfirmPassword(value);
    }
  };

  // Function to validate the whole form
  const isFormValid = () => {
    // More complex validation can be added here
    return email.length > 0 &&
           password.length > 0 &&
           password === confirmPassword &&
           emailError === ''; // Form is valid only if there is no email error
  };

  const closeButtonFun = function () {
    resetForm()
    onRequestClose()
    
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeButtonFun}
      contentLabel="Register Modal"
      className="Modal"
      overlayClassName="Overlay"
    >
       <button onClick={closeButtonFun} className="close-button">&times;</button>
      <h2 className="login-header">Załóż nowe konto</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => handleInputChange(e, 'email')}
        />
        {emailError && <div className="email-error-message">{emailError}</div>} {/* Display email error message */}
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => handleInputChange(e, 'password')}
        />
        <input
          type="password"
          placeholder="Potwierdź hasło"
          value={confirmPassword}
          onChange={(e) => handleInputChange(e, 'confirmPassword')}
        />
        <button type="submit" disabled={!isFormValid()}>Zarejestruj się</button>
      </form>
    </Modal>
  );
};

export default RegisterModal;
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
import { getDownloadURL, getStorage, ref } from "firebase/storage";

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
              // Optionally set a default logo URL
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

    // If logos are already saved, set them directly
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
              // Optionally set a default logo URL
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

    // If logos are already saved, set them directly
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
              // Optionally set a default logo URL
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
          <button onClick={() => handleDeleteBet(activeTab.id)}>
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

            <div className="users-table-header betting-text-style">
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
            <div className="users-table-body betting-text-style">
              {kuba.map((user, index) => (
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
            kuba={kuba}
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
          <PodiumForFriendsBets kuba={kuba}></PodiumForFriendsBets>
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
            {/* <SearchBar onSearch={setSearchQuery}></SearchBar>
                <div className="buttons-container">
                  <RemoveButton onClick={handleRemoveClick}></RemoveButton>{" "}
                  <FilterButton></FilterButton>
                </div> */}

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
              {matchesBetting.map((user, index) => (
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
      {/* Modal do potwierdzenia usunięcia zakładu */}
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
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "../../css/BettingView.css";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  ReturnTeamImage,
  getTurnamentImgURLbyId,
  tournaments,
} from "../../Services/apiService";
import { DateSlider } from "../Slider/DateSlider";
import { getDownloadURL, getStorage, ref } from "firebase/storage";

export function BettingView({
  isOpen,
  onClose,
  selectedMatches,
  setSelectedMatches,
  onAddTab,
  teamUsers,
}) {
  const [tabCount, setTabCount] = useState(1); // Stan do śledzenia liczby zakładek
  const [tabName, setTabName] = useState("Zakład");
  const localData = localStorage.getItem("daysWithNoMatches");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const apiFormatDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const apiFormatNextDate = `${tomorrow.getFullYear()}-${String(
    tomorrow.getMonth() + 1
  ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  const [selectedDate, setSelectedDate] = useState(apiFormatDate);
  const [selectedNextDate, setSelectedNextDate] = useState(apiFormatNextDate);

  const [matchesData, setMatchesData] = useState();

  const [tournamentLogos, setTournamentLogos] = useState({});
  const [homeTeamLogo, setHomeTeamLogo] = useState("");
  const [awayTeamLogo, setAwayTeamLogo] = useState("");
  useEffect(() => {
    const savedLogos =
      JSON.parse(localStorage.getItem("tournamentLogos")) || {};
    const storage = getStorage();
    const fetchLogoPromises = [];

    // Loop through the tournaments and matches to fetch logos
    matchesData &&
      Object.keys(matchesData).forEach((tournamentName) => {
        matchesData[tournamentName].forEach((bet) => {
          const tournamentId = bet.tournament.uniqueTournament.id;
          if (!savedLogos[tournamentId]) {
            const logoRef = ref(
              storage,
              `tournamentsLogos/${tournamentId}.png`
            );
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
                  return [tournamentId, "default_logo_url.png"]; // Fallback to default logo URL
                })
            );
          }
        });
      });

    Promise.all(fetchLogoPromises).then((results) => {
      const newLogos = results.reduce((acc, [id, url]) => {
        acc[id] = url;
        return acc;
      }, savedLogos);

      localStorage.setItem("tournamentLogos", JSON.stringify(newLogos));
      setTournamentLogos(newLogos);
    });

    // If logos are already saved, set them directly
    if (Object.keys(savedLogos).length > 0) {
      setTournamentLogos(savedLogos);
    }
  }, [matchesData]); // Make sure to include the dependency array here

  useEffect(() => {
    const savedLogos = JSON.parse(localStorage.getItem("teamsLogos")) || {};
    const storage = getStorage();
    const fetchLogoPromises = [];
    // Loop through the tournaments and matches to fetch logos
    matchesData &&
      Object.keys(matchesData).forEach((tournamentName) => {
        matchesData[tournamentName].forEach((bet) => {
          const homeTeamId = bet.homeTeam.id;
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
                  // Optionally set a default logo URL
                  return [homeTeamId, "default_logo_url.png"];
                })
            );
          }
        });
      });

    Promise.all(fetchLogoPromises).then((results) => {
      const newLogos = results.reduce((acc, [id, url]) => {
        acc[id] = url;
        return acc;
      }, savedLogos);

      localStorage.setItem("teamsLogos", JSON.stringify(newLogos));
      setHomeTeamLogo(newLogos);
    });

    // If logos are already saved, set them directly
    if (Object.keys(savedLogos).length > 0) {
      setHomeTeamLogo(savedLogos);
    }
  }, [matchesData]);

  useEffect(() => {
    const savedLogos = JSON.parse(localStorage.getItem("teamsLogos")) || {};
    const storage = getStorage();
    const fetchLogoPromises = [];

    matchesData &&
      Object.keys(matchesData).forEach((tournamentName) => {
        matchesData[tournamentName].forEach((bet) => {
          const awayTeamId = bet.awayTeam.id;
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
                  // Optionally set a default logo URL
                  return [awayTeamId, "default_logo_url.png"];
                })
            );
          }
        });
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
  }, [matchesData]);

  useEffect(() => {
    // Ustawienie domyślnej nazwy zakładki
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}.${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${today.getFullYear()}`;
    setTabName(`${formattedDate} Zakład ${tabCount}`);
  }, [tabCount]); // Ustawienie zależności od tabCount, aby aktualizować nazwę przy zmianie liczby zakładek

  // Function to handle the checkbox change
  const handleCheckboxChange = (matchId) => {
    setSelectedMatches((prevSelectedMatches) => {
      if (prevSelectedMatches.includes(matchId)) {
        // If the match is already selected, remove it from the array
        return prevSelectedMatches.filter((id) => id !== matchId);
      } else {
        // If the match is not selected, add it to the array
        return [...prevSelectedMatches, matchId];
      }
    });
  };

  // Function to handle the Save button click
  const handleSave = () => {
    if (tabName.trim() && selectedMatches.length > 0) {
      // Call onAddTab with the selected matches and the ID(s) of the other user(s)
      const selectedUserIds = teamUsers.map((user) => user.uid);
      onAddTab(tabName.trim(), selectedMatches, selectedUserIds, teamUsers);
      setTabCount(tabCount + 1); // Update the tab count state
      setTabName(""); // Reset the tab name state
      setSelectedMatches([]); // Clear the selected matches state
      onClose(); // Close the BettingView modal
    } else {
      alert("Please enter a tab name and select at least one match.");
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

  const handleDateSelect = (date, nextDate) => {
    setSelectedDate(date);
    setSelectedNextDate(nextDate); // Ustawienie wybranej daty
  };

  useEffect(() => {
    const firestore = getFirestore();
    const leagues = [];
    const allMatches = {};

    tournaments.forEach((tournament) => {
      leagues.push(tournament.name);
    });

    const fetchData = () => {
      const unsubscribeFromSnapshots = leagues.map((league) => {
        const matchesRef = collection(
          firestore,
          `matchesData/${league}/matches`
        );
        const selectedDateObj = new Date(selectedDate);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const q = query(
          matchesRef,
          where("startTimestamp", ">=", selectedDateObj.getTime() / 1000),
          where("startTimestamp", "<=", endDate.getTime() / 1000),
          where("status.type", "==", "notstarted")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const matches = [];
          querySnapshot.forEach((doc) => {
            matches.push(doc.data());
          });
          allMatches[league] = matches;
          setMatchesData({ ...allMatches });
        });

        return unsubscribe;
      });

      // Czyszczenie subskrypcji
      return () => {
        unsubscribeFromSnapshots.forEach((unsubscribe) => unsubscribe());
      };
    };

    // Wywołaj fetchData na starcie oraz gdy selectedDate się zmienia
    const unsubscribe = fetchData();

    return () => {
      unsubscribe();
    };
  }, [selectedDate]);
  console.log(matchesData);
  if (!isOpen) {
    return null; // This should prevent BettingView from rendering if isOpen is false
  }
  return (
    <div className="modal-backdrop">
      <div className="modal-content ">
        <h2 className="betting-text-style">Wybierz mecze do obstawiania</h2>
        <input
          className="textView"
          placeholder="Tab name"
          value={tabName}
          onChange={(e) => setTabName(e.target.value)}
        />

        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <DateSlider
          onDateSelect={handleDateSelect}
          disabledDates={localData}
          timeBackNumber={0}
        />
        <div className="users-table">
          <div className="users-table-header betting-text-style">
            <div className="header-item select-column">
              <input type="checkbox" />
            </div>
            <div className="header-item">Liga</div>
            <div className="header-item">
              Gospodarze <div>Goście</div>
            </div>
            <div className="header-item">Data</div>
            <div className="header-item">Status</div>
          </div>
          <div className="users-table-body  betting-text-style">
            {matchesData &&
              Object.keys(matchesData).map((tournamentName) => {
                return matchesData[tournamentName].map((user) => (
                  <div className="table-row" key={user.id}>
                    <div className="row-item select-column">
                      <input
                        type="checkbox"
                        checked={selectedMatches.includes(user)}
                        onChange={() => handleCheckboxChange(user)}
                      ></input>
                    </div>
                    <div className="row-item">
                      <img
                        src={
                          tournamentLogos[user.tournament.uniqueTournament.id]
                        }
                        className="team-logo2"
                        alt={user.homeTeam.name}
                      />
                      {user.tournament.name}
                    </div>
                    <div className="row-item">
                      <div>              
                      <img
                        src={
                          homeTeamLogo[user.homeTeam.id]
                        }
                        className="team-logo2"
                        alt={user.homeTeam.name}
                      />
                        {user.homeTeam.name}
                      </div>
                      <img
                        src={
                          awayTeamLogo[user.awayTeam.id]
                        }
                        className="team-logo2"
                        alt={user.homeTeam.name}
                      />
                      {user.awayTeam.name}
                    </div>
                    <div className="row-item">
                      {convertDate(user.startTimestamp)}
                    </div>
                    <div className="row-item">{user.status.description}</div>
                  </div>
                ));
              })}
          </div>
        </div>
        <button onClick={handleSave}>Zapisz</button>
      </div>
    </div>
  );
}

export default BettingView;
import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "../../css/CreateTeamModal.css"; // Make sure this path is correct
import { getAuth } from "firebase/auth";

const CreateTeamModal = ({ isOpen, onClose, onCreateTab, onUsersSelected }) => {
  const auth = getAuth();
  const loggedInUserId = auth.currentUser;
  console.log(loggedInUserId);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const firestore = getFirestore();
  const handleSearch = async () => {
    const usersRef = collection(firestore, "users");
    const field = searchTerm.includes("@") ? "email" : "displayName";
    const searchQuery = query(
      usersRef,
      where(field, "==", searchTerm),
      where(field, "!=", loggedInUserId.displayName || loggedInUserId.email)
    );

    try {
      const querySnapshot = await getDocs(searchQuery);
      const users = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setSearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddUserToTab = (user) => {
    setSelectedUsers((prevUsers) => {
      if (prevUsers.find((u) => u.uid === user.uid)) {
        return prevUsers; // User is already selected
      }
      setSearchTerm(""); // Clear the search term
      setSearchResults([]); // Clear the search results
      return [...prevUsers, user]; // Add new user to the list
    });
  };

  const handleCreateTab = () => {
    if (selectedUsers.length === 0 && loggedInUserId) {
      // If no users are selected and the current user is logged in
      onUsersSelected([{ uid: loggedInUserId }]);
    } else if (selectedUsers.length > 0) {
      // If users are selected
      const updatedSelectedUsers = selectedUsers.map((user) => ({
        uid: user.uid,
        displayName: user.displayName || user.email, // Include the displayName or email
      }));
      // Add the logged-in user to the list if not already included
      if (!updatedSelectedUsers.some((user) => user.uid === loggedInUserId)) {
        updatedSelectedUsers.push({
          uid: loggedInUserId?.uid,
          displayName: loggedInUserId.displayName || loggedInUserId.email,
        });
      }
      onUsersSelected(updatedSelectedUsers);
    } else {
      // No users selected and no one is logged in
      alert("Please select at least one friend to create a tab.");
    }
  };

  const handleRemoveUserFromTab = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user.uid !== userId));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="create-team-content">
        <h2>Wyszukaj znajomych</h2>
        <input
          type="text"
          placeholder="Wyszukaj znajomych..."
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
        <button className="content-button" onClick={handleSearch}>
          Wyszukaj
        </button>
        <div className="search-results">
          <div className="found-users-label">Znalezieni użytkownicy:</div>
          <ul className="user-list">
            {searchResults.map((user) => (
              <li key={user.uid} className="user-list-item">
                <span className="user-name">
                  {user.displayName || user.email}
                </span>
                <button
                  className="content-button-add-remove"
                  onClick={() => handleAddUserToTab(user)}
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="selected-users">
          <div className="selected-users-label">Wybrani rywale:</div>
          <ul className="user-list">
            {selectedUsers.map((user) => (
              <li key={user.uid} className="user-list-item">
                <span className="user-name">
                  {user.displayName || user.email}
                </span>
                <button
                  className="content-button-remove"
                  onClick={() => handleRemoveUserFromTab(user.uid)}
                >
                  -
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button className="content-button" onClick={handleCreateTab}>
          Utwórz zakład
        </button>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default CreateTeamModal;
import { useState, useEffect, useContext } from "react";
import { FavoritesContext } from "../../Context/FavoritesContext";
import RemoveButton from "./RemoveButton";
import SearchBar from "../SearchingComponents/SearchBar";
import FilterButton from "../SearchingComponents/FilterButton";
import "../../css/FavoriteMatches.css";
import { Oval, ThreeDots } from "react-loader-spinner";
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
import {
  ReturnTeamImage,
  getTurnamentImgURLbyId,
  tournaments,
} from "../../Services/apiService";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
export function FavoriteMatches() {
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [loadedImageCount, setLoadedImageCount] = useState(0);

  const { favorites, removeFavorite } = useContext(FavoritesContext);
  const [checkedIds, setCheckedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesMatches, setFavoritesMatches] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState(favoritesMatches);

  console.log(favoritesMatches);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [tournamentLogos, setTournamentLogos] = useState({});

  const [homeTeamLogo, setHomeTeamLogo] = useState("");
  const [awayTeamLogo, setAwayTeamLogo] = useState("");
  const onImageLoad = () => {
    setLoadedImageCount((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    if (loadedImageCount === favoritesMatches.length * 3) {
      // Assuming 3 images per match
      setTimeout(() => {
        setAllImagesLoaded(true); // Set the state to true after 1 second delay
      }, 700); // Delay of 1 second
    }
  }, [loadedImageCount, favoritesMatches.length]);

  // Fetch tournament logos
  useEffect(() => {
    const fetchTournamentLogos = async () => {
      const storage = getStorage();
      console.log(favoritesMatches);
      const tournamentIds = favoritesMatches.map(
        (bet) => bet.tournament.uniqueTournament.id
      );
      const uniqueTournamentIds = [...new Set(tournamentIds)];
      const logoUrls = {};

      for (const id of uniqueTournamentIds) {
        const logoRef = ref(storage, `tournamentsLogos/${id}.png`);
        try {
          const url = await getDownloadURL(logoRef);
          logoUrls[id] = url;
        } catch (error) {
          console.error("Error fetching tournament logo: ", error);
          // Handle any errors here, such as setting a default image
        }
      }

      setTournamentLogos(logoUrls);
    };

    if (favorites.length > 0) {
      fetchTournamentLogos();
    }
  }, [favoritesMatches]);

  useEffect(() => {
    const fetchHomeTeamLogos = async () => {
      const storage = getStorage();
      console.log(favoritesMatches);
      const tournamentIds = favoritesMatches.map((bet) => bet.homeTeam.id);
      const homeTeamIds = [...new Set(tournamentIds)];
      const logoUrls = {};

      for (const id of homeTeamIds) {
        const logoRef = ref(storage, `teamsLogos/${id}.png`);
        try {
          const url = await getDownloadURL(logoRef);
          logoUrls[id] = url;
        } catch (error) {
          console.error("Error fetching tournament logo: ", error);
          // Handle any errors here, such as setting a default image
        }
      }

      setHomeTeamLogo(logoUrls);
    };

    if (favorites.length > 0) {
      fetchHomeTeamLogos();
    }
  }, [favoritesMatches]);

  useEffect(() => {
    const fetchAwayTeamLogos = async () => {
      const storage = getStorage();
      console.log(favoritesMatches);
      const tournamentIds = favoritesMatches.map((bet) => bet.awayTeam.id);
      const awayTeamIds = [...new Set(tournamentIds)];
      const logoUrls = {};

      for (const id of awayTeamIds) {
        const logoRef = ref(storage, `teamsLogos/${id}.png`);
        try {
          const url = await getDownloadURL(logoRef);
          logoUrls[id] = url;
        } catch (error) {
          console.error("Error fetching tournament logo: ", error);
          // Handle any errors here, such as setting a default image
        }
      }

      setAwayTeamLogo(logoUrls);
    };

    if (favorites.length > 0) {
      fetchAwayTeamLogos();
    }
  }, [favoritesMatches]);

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

  useEffect(() => {
    const firestore = getFirestore();
    const unsubscribeFromSnapshots = [];
    const matches = {};

    favorites.forEach((favoriteId) => {
      tournaments.forEach((tournament) => {
        const matchesRef = collection(
          firestore,
          `matchesData/${tournament.name}/matches`
        );
        const q = query(matchesRef, where("id", "==", favoriteId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const matchData = doc.data();
            matches[matchData.id] = matchData;
          });

          setFavoritesMatches(Object.values(matches));
        });

        unsubscribeFromSnapshots.push(unsubscribe);
      });
    });

    return () => {
      unsubscribeFromSnapshots.forEach((unsubscribe) => unsubscribe());
    };
  }, [favorites]);

  useEffect(() => {
    // Filter matches whenever the searchQuery changes or favorites change
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = favoritesMatches.filter((match) => {
      return (
        match.tournament.name.toLowerCase().includes(lowercasedQuery) ||
        match.homeTeam.name.toLowerCase().includes(lowercasedQuery) ||
        match.awayTeam.name.toLowerCase().includes(lowercasedQuery) ||
        match.status.description.toLowerCase().includes(lowercasedQuery) ||
        // Assuming startTimestamp is in a human-readable format or convert it accordingly
        match.startTimestamp.toString().toLowerCase().includes(lowercasedQuery)
      );
    });
    setFilteredFavorites(filtered);
  }, [searchQuery, favoritesMatches]);

  const handleCheckboxChange = (matchId) => {
    setCheckedIds((prevCheckedIds) =>
      prevCheckedIds.includes(matchId)
        ? prevCheckedIds.filter((id) => id !== matchId)
        : [...prevCheckedIds, matchId]
    );
  };

  const handleMasterCheckboxChange = (e) => {
    if (e.target.checked) {
      setCheckedIds(favoritesMatches.map((match) => match.id)); // Add all match IDs to checkedIds
    } else {
      setCheckedIds([]); // Clear all selections
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

  const handleRemoveClick = () => {
    console.log(checkedIds);
    removeFavorite(checkedIds);
    setCheckedIds([]);
  };

  return (
    <div className="favorite-matches-container">
      {favoritesMatches.length === 0 ? (
        <p>Brak meczy ulubionych.</p>
      ) : (
        <>
          {allImagesLoaded ? (
            <div className={`users-table ${allImagesLoaded ? "fade-in" : ""}`}>
              <SearchBar onSearch={setSearchQuery}></SearchBar>
              <div className="buttons-container">
                <RemoveButton onClick={handleRemoveClick}></RemoveButton>{" "}
                <FilterButton></FilterButton>
              </div>

              <div className="users-table-header">
                <div className="header-item select-column">
                  <input
                    type="checkbox"
                    onChange={handleMasterCheckboxChange}
                    checked={checkedIds.length === favoritesMatches.length}
                  />
                </div>

                <div className="header-item">Liga</div>
                <div className="header-item">
                  Gospodarze <div>Goście</div>
                </div>
                <div className="header-item">Wynik</div>
                <div className="header-item">Data</div>
                <div className="header-item">Status</div>
              </div>
              <div className="users-table-body">
                {filteredFavorites.map((user, index) => (
                  <div
                    className="table-row fade-in-up"
                    key={user.id}
                    style={{ animationDelay: `${index * 50}ms` }} // Each row fades in slightly after the previous one
                  >
                    <div className="row-item select-column">
                      <input
                        type="checkbox"
                        checked={checkedIds.includes(user.id)}
                        onChange={() => handleCheckboxChange(user.id)}
                      />
                    </div>
                    <div className="row-item">
                      <img
                        src={
                          tournamentLogos[user.tournament.uniqueTournament.id]
                        }
                        onLoad={onImageLoad}
                        className="team-logo2"
                        alt={user.homeTeam.name}
                      ></img>
                      {user.tournament.name}
                    </div>
                    <div className="row-item">
                      <div>
                        <img
                          src={homeTeamLogo[user.homeTeam.id]}
                          onLoad={onImageLoad}
                          className="team-logo2"
                          alt={user.homeTeam.name}
                        ></img>
                        {user.homeTeam.name}
                      </div>
                      <img
                        src={awayTeamLogo[user.awayTeam.id]}
                        onLoad={onImageLoad}
                        className="team-logo2"
                        alt={user.awayTeam.name}
                      ></img>
                      {user.awayTeam.name}
                    </div>
                    <div className="row-item">
                      {user.status.type !== "notstarted" ? (
                        <>
                          <div>{user.homeScore.display}</div>
                          {user.awayScore.display}
                        </>
                      ) : (
                        <div>{getTimeUntilMatch(user.startTimestamp)} </div>
                      )}
                    </div>
                    <div className="row-item">
                      {convertDate(user.startTimestamp)}
                    </div>
                    <div className="row-item">{user.status.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="loader-container">
              <Oval
                color="#466551" // Kolor animacji
                height={80}
                width={80}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

FavoriteMatches.propTypes = {
  // If you have any props to pass to this component, define them here
};

export default FavoriteMatches;

// Add styling as needed in your Matches.css
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUser, faUsers } from "@fortawesome/free-solid-svg-icons";
import "../../css/GameModeView.css"; // Make sure to create this CSS file with your styles

const GameModeView = ({ isOpen, onClose, onSelectSolo, onSelectTeam }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="game-mode-content">
        <h2>Wybierz tryb gry</h2>

        <div className="game-mode-buttons">
          <button className="game-mode-button solo" onClick={onSelectSolo}>
            <FontAwesomeIcon icon={faUser} className="icon" />
            Gram solo
          </button>
          <button className="game-mode-button team" onClick={onSelectTeam}>
            <FontAwesomeIcon icon={faUsers} className="icon" />
            Gram z znajomym
          </button>
        </div>

        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default GameModeView;
import  { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "../../css/MatchInputView.css";
import { ReturnTeamImage } from "../../Services/apiService";

const MatchInputView = ({ isOpen, match, onClose, onSubmitScore }) => {
  const [homeScore, setHomeScore] = useState(null);
  const [awayScore, setAwayScore] = useState(null);

  console.log(match);
  if (!isOpen || !match) return null;

  const handleSubmit = () => {
    if (onSubmitScore) {
      onSubmitScore(match.id, homeScore, awayScore);
    }
    onClose();
  };

  const renderGoalOptions = () => {
    const options = [];
    for (let i = 0; i <= 10; i++) {
      if (i === 0) {
        options.push(<option>Brak</option>);
      }
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return options;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Obstaw wynik meczu</h2>
        <div className="match-details">
          <div className="team-score-input">
            <div>
              <img
                src={ReturnTeamImage(match.homeTeam.id)}
                className="team-logo3"
                alt={match.homeTeam.name}
              />
              {match.homeTeam.name}
            </div>
            <select
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
            >
              {renderGoalOptions()}
            </select>
          </div>
          <div className="team-score-input">
            <div>
              <img
                src={ReturnTeamImage(match.awayTeam.id)}
                className="team-logo3"
                alt={match.awayTeam.name}
              />
              {match.awayTeam.name}
            </div>
            <select
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
            >
              {renderGoalOptions()}
            </select>
          </div>
        </div>

        <button className="saveButton" onClick={handleSubmit}>
          Zapisz
        </button>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default MatchInputView;
import { useEffect, useState } from "react";
import "../../css//OtherUsersBettings.css";
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

const OtherUsersBettings = ({
    user,activeTab,friendGamesTabs,kuba,closestMatch,isBetClosed,allMatchesFinished,totalPoints,convertDate,getTimeUntilMatch,tournamentLogos,
    homeTeamLogo,
    awayTeamLogo
}) => {
    const isCorrectBet = (betScoreHome, betScoreAway, matchScoreHome, matchScoreAway) => {
        const isCorrect = betScoreHome == matchScoreHome && betScoreAway == matchScoreAway;
        console.log({ betScoreHome, betScoreAway, matchScoreHome, matchScoreAway, isCorrect }); // Debugging line
        return isCorrect;
      };
      
  return (
    <>
         <h2 className="podium-title podium-title1">Podsumowanie: </h2>
      <div className="users-table ">
        {/* <SearchBar onSearch={setSearchQuery}></SearchBar>
                <div className="buttons-container">
                  <RemoveButton onClick={handleRemoveClick}></RemoveButton>{" "}
                  <FilterButton></FilterButton>
                </div> */}

        <div className="users-table-header betting-text-style">
         

          <div className="header-item">Liga</div>
          <div className="header-item">
            Gospodarze <div>Goście</div>
          </div>
          <div className="header-item">Obstawiony wynik</div>
          {friendGamesTabs &&
            friendGamesTabs?.map(
              (userParticipant) =>
                userParticipant.userUid !== user.uid && (
                  <div className="header-item" key={userParticipant?.userUid}>
                    {userParticipant?.userName}
                  </div>
                )
            )}
          <div className="header-item">Wynik meczu</div>
          {/* <div className="header-item">Data</div> */}

        
        </div>
        <div className="users-table-body betting-text-style">
          {kuba.map((user, index) => (
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
                <div className={`row-item`}>
                  <>
                    {user.betHomeScore !== null &&
                    user.betAwayScore !== null ? (
                      <>
                        <div className={` ${isCorrectBet(user.betHomeScore, user.betAwayScore, user.match.homeScore.display, user.match.awayScore.display) ? 'correct-bet' : ''}`}>{user.betHomeScore}</div>
                        <div className={` ${isCorrectBet(user.betHomeScore, user.betAwayScore, user.match.homeScore.display, user.match.awayScore.display) ? 'correct-bet' : ''}`}>{user.betAwayScore}</div>
                      </>
                    ) : (
                      <div>Nieobstawiono</div>
                    )}
                  </>
                </div>
                {user?.mecze?.map((mecz, index) =>
                  mecz.betHomeScore && mecz.betAwayScore ? (
                    <div className={`row-item `} key={index}>
                            <div className={`${isCorrectBet(mecz.betHomeScore, mecz.betAwayScore, user.match.homeScore.display, user.match.awayScore.display) ? 'correct-bet' : ''}`}>{mecz.betHomeScore}</div>
                      <div className={`${isCorrectBet(mecz.betHomeScore, mecz.betAwayScore, user.match.homeScore.display, user.match.awayScore.display) ? 'correct-bet' : ''}`}>{mecz.betAwayScore}</div>
                    </div>
                  ) : (
                    <div>Nieobstawiono</div>
                  )
                )}

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
                {/* <div className="row-item">
                  {convertDate(user.match.startTimestamp)}
                </div> */}

              
              </div>
            </>
          ))}
        </div>
       
      </div>
  
   
    </>
  );
};

export default OtherUsersBettings;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "../../css/RemoveButton.css"; // We will create this CSS file

const RemoveButton = ({ onClick }) => {
  return (
    <button className="remove-button" onClick={onClick}>
      <FontAwesomeIcon icon={faTrash} />
      <span>Remove</span>
    </button>
  );
};

export default RemoveButton;
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
import "../../css/Matches.css";
import { Teams } from "./Teams";
import React, { useEffect, useState } from "react";

import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

export function CardBoxForMatches(props) {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  const [logos, setLogos] = useState({});

  const matches = props.matches;
  let tournamentId = props.tournamentId;

  const [tournamentLogo, setTournamentLogo] = useState('');
console.log(tournamentId)
useEffect(() => {
  const fetchTournamentLogo = async () => {
    // Check if the logo URL is already in local storage
    const storedLogos = JSON.parse(localStorage.getItem('tournamentLogos')) || {};
    const storage = getStorage();

    if (storedLogos[props.tournamentId]) {
      // Use the URL from local storage if it exists
      setTournamentLogo(storedLogos[props.tournamentId]);
    } else {
      // If not, fetch it from Firebase and store it in local storage
      const logoRef = ref(storage, `tournamentsLogos/${props.tournamentId}.png`);
      try {
        const url = await getDownloadURL(logoRef);
        setTournamentLogo(url);
        storedLogos[props.tournamentId] = url;
        localStorage.setItem('tournamentLogos', JSON.stringify(storedLogos));
      } catch (error) {
        console.error("Error fetching tournament logo: ", error);
        // Optionally, set a default logo in case of an error
        setTournamentLogo('path_to_default_logo.png');
      }
    }
  };

  fetchTournamentLogo();
}, [props.tournamentId]);



  // Sortowanie meczów, mecze w trakcie będą pierwsze
  const sortedMatches = matches.slice().sort((a, b) => {
    if (a.status.type === "inprogress" && b.status.type !== "inprogress") {
      return -1; // a przed b
    } else if (
      a.status.type !== "inprogress" &&
      b.status.type === "inprogress"
    ) {
      return 1; // b przed a
    }
    return 0; // bez zmiany kolejności
  });
  // Deklaracja zmiennej do śledzenia poprzedniej kolejki
  let prevRound = null;

  return (
    <>
      <div
        className="card"
        style={{ width: "25rem", background: "#689577", position: "relative" }}
      >
        <div className="football-logo">
          {/* Use tournamentLogo for the src attribute */}
          <img src={tournamentLogo} alt="Tournament Logo" />
        </div>

        <div className="card-body">
          {sortedMatches.map((match) => {
            // Jeśli bieżąca kolejka jest inna niż poprzednia, ustaw poprzednią kolej na bieżącą i wyświetl nazwę kolejki
            const isNewRound = prevRound !== match?.roundInfo?.round;
            prevRound = match?.roundInfo?.round;

            return (
              <React.Fragment key={match.id}>
                {isNewRound && match?.roundInfo?.round && (
                  <div className="round">
                    <p>Kolejka {match?.roundInfo?.round}</p>
                  </div>
                )}
                <button
                  className="favorite-button"
                  onClick={() => {
                    const isFav = props.isFavorite(match.id);
                    isFav
                      ? props.removeFromFavorites(match.id)
                      : props.addToFavorites(match);
                  }}
                  aria-label={
                    props.isFavorite(match.id)
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  {user ? (
                    props.isFavorite(match.id) ? (
                      "❤️"
                    ) : (
                      "🤍"
                    )
                  ) : (
                    <div></div>
                  )}

                  {/* Filled heart if favorite, empty heart if not */}
                </button>
                <Teams
                  homeTeam={match?.homeTeam}
                  homeScore={match?.homeScore}
                  awayTeam={match?.awayTeam}
                  awayScore={match?.awayScore}
                  startTimestamp={match?.startTimestamp}
                  statusTime={match?.statusTime}
                  time={match?.time}
                  changes={match?.changes?.changeTimestamp}
                  matchStatus={match?.status?.description}
                  matchStatusType={match?.status?.type}
                  currentPeriodStartTimestamp={
                    match?.time?.currentPeriodStartTimestamp
                  }
                 
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
}

// CardBoxForMatches.propTypes = {
//   matches: PropTypes.arrayOf(PropTypes.object).isRequired,

// };
import { CardBoxForMatches } from "./CardBoxForMatches";
import { useState, useEffect, useContext } from "react";
import { DateSlider } from "../Slider/DateSlider";
import {
  getTurnamentImgURL,
  divideMatchesToLeagues,
  tournaments,
  tournamentIds,
  addMatchesTotempAllMatchesData,
  getAllMatchesDays,
  filterMatchesByDate,
  getDaysWithoutMatches,
  sendMatches,
} from "../../Services/apiService";
import "../../css/Matches.css";
import { FavoritesContext } from "../../Context/FavoritesContext";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export function MatchesSection() {
  const { addFavorite, removeFavorite, favorites, removeFavoriteid } =
    useContext(FavoritesContext);
  const [matchesData, setMatchesData] = useState({});
  const localData = localStorage.getItem("daysWithNoMatches");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const apiFormatDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const apiFormatNextDate = `${tomorrow.getFullYear()}-${String(
    tomorrow.getMonth() + 1
  ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  const [selectedDate, setSelectedDate] = useState(apiFormatDate);
  const [selectedNextDate, setSelectedNextDate] = useState(apiFormatNextDate);

  // Adres URL endpointu, na który będą wysyłane mecze
  const endpoint = "http://localhost:3000/";

  useEffect(() => {
    const firestore = getFirestore();
    const fetchDaysWithNoMatches = async () => {
      // First, try to load the data from localStorage

      if (localData) {
        // If data is found in localStorage, parse it and use it directly
        const daysWithNoMatchesData = JSON.parse(localData);
        console.log("Loaded from localStorage:", daysWithNoMatchesData);
        // Here you can set state or perform other operations with daysWithNoMatchesData
      } else {
        // If not found in localStorage, fetch from Firestore
        const daysWithNoMatchesRef = doc(
          firestore,
          "matchesData",
          "daysWithNoMatches"
        );
        try {
          const docSnap = await getDoc(daysWithNoMatchesRef);
          if (docSnap.exists()) {
            // Save the data to localStorage for future access
            localStorage.setItem(
              "daysWithNoMatches",
              JSON.stringify(docSnap.data().dates)
            );
            console.log(
              "Fetched from Firestore and saved to localStorage:",
              docSnap.data().dates
            );
            // Here you can set state or perform other operations with docSnap.data().dates
          } else {
            console.log("No such document in Firestore!");
          }
        } catch (error) {
          console.error(
            "Error fetching days with no matches from Firestore:",
            error
          );
        }
      }
    };

    fetchDaysWithNoMatches();
  }, []); // The empty dependency array ensures this effect runs once when the component mounts

  const handleDateSelect = (date, nextDate) => {
    setSelectedDate(date);
    setSelectedNextDate(nextDate); // Ustawienie wybranej daty
  };

  useEffect(() => {
    const firestore = getFirestore();
    const leagues = [];
    const allMatches = {};

    tournaments.map((tournament) => {
      leagues.push(tournament.name);
    });
    const unsubscribeFromSnapshots = leagues.map((league) => {
      const matchesRef = collection(firestore, `matchesData/${league}/matches`);
      const selectedDateObj = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const q = query(
        matchesRef,
        where("startTimestamp", ">=", selectedDateObj.getTime() / 1000),
        where("startTimestamp", "<=", endDate.getTime() / 1000)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const matches = [];
        querySnapshot.forEach((doc) => {
          matches.push(doc.data());
        });
        allMatches[league] = matches;
        setMatchesData({ ...allMatches });
      });

      return unsubscribe;
    });

    // Czyszczenie subskrypcji
    return () => {
      unsubscribeFromSnapshots.forEach((unsubscribe) => unsubscribe());
    };
  }, [selectedDate]);

  useEffect(() => {
    const today = new Date();

    const formattedToday = today.toISOString().split("T")[0];

    //console.log(formattedToday);

    // Sprawdź, czy selectedDate jest dzisiejszą datą i wyślij mecze, jeśli tak
    if (selectedDate === formattedToday) {
      console.log(matchesData);
      sendMatches(matchesData, endpoint)
        .then((data) => {
          console.log("Dane zostały wysłane i otrzymano odpowiedź:", data);
        })
        .catch((error) => {
          console.error("Wystąpił błąd:", error);
        });
    }
  }, [selectedDate, matchesData]);

  console.log(matchesData);

  const isMatchFavorite = (matchId) => {
    return favorites.some((m) => m === matchId);
  };

  return (
    <>
      <div className="slider-margin-top" id="matchesSection">
        <DateSlider
          onDateSelect={handleDateSelect}
          disabledDates={localData}
          timeBackNumber={120}
        />
      </div>
      <div className="container">
        <div className="row">
          {tournaments.map((tournament) => {
            const tournamentMatches = matchesData[tournament.name];
            if (tournamentMatches?.length > 0) {
              return (
                <div
                  className="col-md-auto d-flex justify-content-center mb-5 mt-4"
                  key={tournament.id}
                >
                  <CardBoxForMatches
                    matches={tournamentMatches}
                    tournamentId={tournament.id}
                    addToFavorites={addFavorite}
                    removeFromFavorites={removeFavoriteid}
                    isFavorite={(matchId) => isMatchFavorite(matchId)}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </>
  );
}
import "../../css/Matches.css";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import { ReturnTeamImage } from "../../Services/apiService";
import { getDownloadURL, getStorage, ref } from "firebase/storage";

const convertDate = (timestamp) => {
  let date = new Date(timestamp * 1000);
  let hours = date.getHours().toString().padStart(2, "0"); // Używaj getHours zamiast getUTCHours
  let minutes = date.getMinutes().toString().padStart(2, "0"); // Używaj getMinutes zamiast getUTCMinutes
  return `${hours}:${minutes}`;
};

const calculateMatchTimeInMinutes = (time) => {
  // const currentTime = Date.now() / 1000; // Aktualny czas w sekundach
  const currentTime = Date.now() / 1000; // Aktualny czas w sekundach

  const timik = currentTime - time.currentPeriodStartTimestamp + time?.initial;
  const elapsed_minutes = Math.floor(timik / 60);
  return elapsed_minutes + 1; // Pierwsza połowa
};

export function Teams(props) {
  const {
    homeTeam,
    homeScore,
    awayTeam,
    awayScore,
    startTimestamp,
    statusTime,
    time,
    changes,
    matchStatus,
    matchStatusType,
    currentPeriodStartTimestamp,
  } = props;
  //console.log(homeTeam.id)
  const homeTeamImg = ReturnTeamImage(homeTeam.id);
  const awayTeamImg = ReturnTeamImage(awayTeam.id);

  //console.log(homeTeamImg);
  const [homeColor, setHomeColor] = useState(""); // Kolor dla wyniku homeTeam
  const [awayColor, setAwayColor] = useState(""); // Kolor dla wyniku awayTeam

  const [key, setKey] = useState(Math.random()); // początkowy klucz
  const [isLive, setIsLive] = useState(false);


  const [homeTeamLogo, setHomeTeamLogo] = useState('');
  const [awayTeamLogo, setAwayTeamLogo] = useState('');

useEffect(() => {
  const fetchTeamLogo = async () => {
    // Check if the logo URL is already in local storage
    const storedLogos = JSON.parse(localStorage.getItem('teamsLogos')) || {};
    const storage = getStorage();

    if (storedLogos[props.homeTeam.id]) {
      // Use the URL from local storage if it exists
      setHomeTeamLogo(storedLogos[props.homeTeam.id]);
    } else {
      // If not, fetch it from Firebase and store it in local storage
      const logoRef = ref(storage, `teamsLogos/${props.homeTeam.id}.png`);
      try {
        const url = await getDownloadURL(logoRef);
        setHomeTeamLogo(url);
        storedLogos[props.homeTeam.id] = url;
        localStorage.setItem('teamsLogos', JSON.stringify(storedLogos));
      } catch (error) {
        console.error("Error fetching tournament logo: ", error);
     
      }
    }
  };

  fetchTeamLogo();
}, [homeTeam]);
  
useEffect(() => {
  const fetchTeamLogo = async () => {
    // Check if the logo URL is already in local storage
    const storedLogos = JSON.parse(localStorage.getItem('teamsLogos')) || {};
    const storage = getStorage();

    if (storedLogos[props.awayTeam.id]) {
      // Use the URL from local storage if it exists
      setAwayTeamLogo(storedLogos[props.awayTeam.id]);
    } else {
      // If not, fetch it from Firebase and store it in local storage
      const logoRef = ref(storage, `teamsLogos/${props.awayTeam.id}.png`);
      try {
        const url = await getDownloadURL(logoRef);
        setAwayTeamLogo(url);
        storedLogos[props.awayTeam.id] = url;
        localStorage.setItem('teamsLogos', JSON.stringify(storedLogos));
      } catch (error) {
        console.error("Error fetching tournament logo: ", error);
        
      }
    }
  };

  fetchTeamLogo();
}, [awayTeam]);



  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
  useEffect(() => {
    // Aktualizuj klucz za każdym razem, gdy komponent się renderuje
    const redColor = "#CD4439";
    const greenColor = "#72B896";
    const grayColor = "#A9A9A9";
    if (
      typeof homeScore.display === "undefined" ||
      typeof awayScore.display === "undefined" ||
      homeScore.display === null ||
      awayScore.display === null
    ) {
      // jeśli jedno z wyświetleń wyniku jest niezdefiniowane lub null
      setHomeColor(null);
      setAwayColor(null);
    } else if (homeScore.display > awayScore.display) {
      setHomeColor(greenColor);
      setAwayColor(redColor);
    } else if (homeScore.display < awayScore.display) {
      setHomeColor(redColor);
      setAwayColor(greenColor);
    } else if (homeScore.display == awayScore.display) {
      setHomeColor(grayColor); // jeśli wynik jest równy
      setAwayColor(grayColor); // jeśli wynik jest równy
    }

    setKey(Math.random());
  }, [homeTeam, awayTeam, awayScore.display, homeScore.display]); // możesz tu dodać zależności, które powodują ponowne renderowanie
  useEffect(() => {
    // Sprawdź, czy mecz jest na żywo
    if (matchStatus && matchStatusType === "inprogress") {
      setIsLive(true);
    } else {
      setIsLive(false);
    }
  }, [matchStatus]); // Zależność od matchStatus, który może się zmieniać
  return (
    <div className={`team-container ${isLive ? "match-live" : ""}`}>
      <div className="teams fadeanime" key={key}>
        <div className="single-team">
          <img src={homeTeamLogo} alt="Barcelona" className="team-logo" />
          <span className="team-name">{homeTeam?.name}</span>
          {typeof homeScore.display !== "undefined" && (
            <div className="match-time">
              <span className="score" style={{ backgroundColor: homeColor }}>
                {homeScore?.display}
              </span>
            </div>
          )}
        </div>
        <div className="single-team">
          <img src={awayTeamLogo} alt="Szachtar" className="team-logo" />
          <span className="team-name">{awayTeam?.name}</span>
          {typeof awayScore.display !== "undefined" && (
            <div className="match-time">
              <span className="score" style={{ backgroundColor: awayColor }}>
                {awayScore?.display}
              </span>
            </div>
          )}
        </div>
      </div>

      {typeof homeScore.display === "undefined" && (
        <div className="match-time">
          <span className="clock-icon">⏰</span> {convertDate(startTimestamp)}
        </div>
      )}
      {Object.keys(time).length !== 0 &&
        matchStatus !== "Halftime" &&
        matchStatus !== "Ended" && (
          <div className="match-time">
            <span className="clock-icon"></span>{" "}
            {calculateMatchTimeInMinutes(time)}'
          </div>
        )}
      {matchStatus === "Halftime" && (
        <div className="match-time">
          <span className="clock-icon"></span> Przerwa
        </div>
      )}
    </div>
  );
}
Teams.propTypes = {
  homeTeam: PropTypes.string.isRequired,
  awayTeam: PropTypes.string.isRequired,
  startTimestamp: PropTypes.number.isRequired,
  awayScore: PropTypes.object.isRequired,
  homeScore: PropTypes.object.isRequired,
};
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
import "../../css/SearchBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
// SearchBar.js

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    onSearch(event.target.value); // Call the onSearch callback passed by the parent
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch(""); // Reset search
  };

  return (
    <div className="search-bar">
      <FontAwesomeIcon icon={faSearch} className="search-icon" />
      <input
        className="search-input"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search..."
      />
      <FontAwesomeIcon
        icon={faTimes}
        className="search-clear"
        onClick={clearSearch}
      />
    </div>
  );
};

export default SearchBar;
import "../../css/DateSlider.css";
import { useRef, useState, useEffect, useCallback } from "react";

export function DateSlider({ onDateSelect, disabledDates, timeBackNumber }) {
  const sliderRef = useRef(null);
  const [dates, setDates] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleResize = () => {
    // Zaktualizuj stan tylko gdy szerokość okna się zmieniła
    if (window.innerWidth !== windowWidth) {
      setWindowWidth(window.innerWidth);
    }
  };

  const todayFormatted = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState(todayFormatted);

  useEffect(() => {
    const today = new Date();
    const weekBefore = new Date(today); // Nowa data reprezentująca tydzień przed dzisiaj
    weekBefore.setDate(today.getDate() - timeBackNumber); // Odejmujemy 7 dni, aby uzyskać datę sprzed tygodnia
    const currentYear = today.getFullYear();
  
    const numberOfDates = 218 + 60 ; // Dodajemy 7 dni do istniejącej liczby dni

    const handleDateClick = (date, nextDate) => {
      onDateSelect(date, nextDate);
      setSelectedDate(date);
      console.log("Wybrana data:", date);
    };

    const daysOfWeek = ["niedz.", "pon.", "wt.", "śr.", "czw.", "pt.", "sob."];

    const dateButtons = Array.from({ length: numberOfDates }, (_, index) => {
      const date = new Date(weekBefore);
      date.setDate(weekBefore.getDate() + index);
  
      const dayOfWeek = daysOfWeek[date.getDay()];  // Dodajemy to, aby pobrać nazwę dnia tygodnia
  
      let formattedDate;
      if (date.toDateString() === today.toDateString()) {
        formattedDate = "dziś";
      } else {
        // Jeśli rok danej daty jest równy obecnemu roku, pomiń rok w formacie
        if (date.getFullYear() === currentYear) {
          formattedDate = `${dayOfWeek} ${date.getDate()}.${date.getMonth() + 1}`; // Dodajemy tu dzień tygodnia
        } else {
          formattedDate = `${dayOfWeek} ${date.getDate()}.${date.getMonth() + 1
            }.${date.getFullYear()}`;
        }
      }
      const apiFormatDate = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const apiFormatNextDate = `${nextDate.getFullYear()}-${String(
        nextDate.getMonth() + 1
      ).padStart(2, "0")}-${String(nextDate.getDate()).padStart(2, "0")}`;

      return (
        <button
          key={index}
          onClick={(e) => handleDateClick(apiFormatDate, apiFormatNextDate, e)}
          className={
            apiFormatDate === selectedDate
              ? "button-selected"
              : disabledDates.includes(apiFormatDate)
                ? "button-disabled"
                : ""
          }
          data-raw-date={apiFormatDate} // Dodaj to
          disabled={disabledDates.includes(apiFormatDate)}
        >
          {formattedDate}
        </button>
      );
    });

    setDates(dateButtons);
    

 
  }, [selectedDate,disabledDates]);

 
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // Czyszczenie nasłuchiwania
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize,windowWidth]); // Teraz useEffect reaguje tylko na zmianę szerokości okna

  const centerSelectedDate = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;
  
    const itemsPerScreen = parseInt(
      getComputedStyle(slider).getPropertyValue("--items-per-screen"),
      10
    );
  console.log(itemsPerScreen)
    // Znalezienie indeksu wybranej daty
    const selectedIndex = Array.from(sliderRef.current.children).findIndex(
      (child) => child.getAttribute('data-raw-date') === selectedDate
    );
    
    console.log(selectedIndex)
    if (selectedIndex >= 0) {
      let howMuchAdd;
      if (itemsPerScreen === 8) {
        howMuchAdd = -0.02
      } else if(itemsPerScreen === 4){
        howMuchAdd = 0.75
      } else if(itemsPerScreen === 2){
        howMuchAdd = 1.5
      } else if(itemsPerScreen === 1){
        howMuchAdd = 1.5
      }
      let sliderIndex = selectedIndex / Math.floor(itemsPerScreen)+howMuchAdd;
      console.log(sliderIndex)
      // sliderIndex = Math.max(0, sliderIndex); // Zapewnienie, że indeks nie jest ujemny
      // sliderIndex = Math.min(sliderIndex, dates.length - itemsPerScreen); // Zapewnienie, że nie przesuniemy za daleko na koniec
    
      // Ustawienie właściwości CSS
      slider.style.setProperty("--slider-index", sliderIndex);
  }
    
  }, [dates, selectedDate, windowWidth]);
  
  useEffect(() => {
    // Teraz centerSelectedDate zostanie wywołane tylko wtedy, gdy zmieni się szerokość okna
    centerSelectedDate();
  }, [windowWidth]); // Dodano zależność od windowWidth


  useEffect(() => {
// Nowy kod do ustawienia suwaka na dzisiejszą datę
//const todayIndex = 11.8; // Ponieważ odejmujesz 30 dni od dzisiejszej daty, indeks dla 'dziś' to 30
const todayIndex = 23; // Ponieważ odejmujesz 30 dni od dzisiejszej daty, indeks dla 'dziś' to 30
const slider = sliderRef.current;
    const itemsPerScreen = parseInt(
      getComputedStyle(slider).getPropertyValue("--items-per-screen"),
      10
    );
    console.log(itemsPerScreen)
    let sliderIndex
    // Ustaw właściwość CSS, aby przesunąć suwak do 'dzisiaj'
    if (itemsPerScreen === 4) {
      sliderIndex = 34.4 - Math.floor(itemsPerScreen);
    }
    else if (itemsPerScreen === 8) {
      sliderIndex = 23 - Math.floor(itemsPerScreen);
    } else if (itemsPerScreen === 2) {
      sliderIndex = 63.1 -  Math.floor(itemsPerScreen)
    } else if (itemsPerScreen === 1) {
      sliderIndex = 122.5 -  Math.floor(itemsPerScreen)
    }

    slider.style.setProperty("--slider-index", sliderIndex >= 0 ? sliderIndex : 0);
   
  },[])
  
  const handleLeftClick = () => {
    // Obsługa kliknięcia w lewy przycisk
    const slider = sliderRef.current;
    let sliderIndex =
      parseInt(slider.style.getPropertyValue("--slider-index"), 10) || 0;
      const itemsPerScreen =
      parseInt(
        getComputedStyle(slider).getPropertyValue("--items-per-screen"),
        10
      ) || 1;
    if (sliderIndex > 0) {
      sliderIndex--;
      let howMuchAdd;
      if (itemsPerScreen === 8) {
        howMuchAdd = 0
      } else if(itemsPerScreen === 4){
        howMuchAdd = 0.
      } else if(itemsPerScreen === 2){
        howMuchAdd = 0
      } else if(itemsPerScreen === 1){
        howMuchAdd = 0.5
      }
      slider.style.setProperty("--slider-index", sliderIndex+howMuchAdd);
      console.log(sliderIndex);
    }
  };

  const handleRightClick = () => {
    // Obsługa kliknięcia w prawy przycisk
    const slider = sliderRef.current;
    const itemsPerScreen =
      parseInt(
        getComputedStyle(slider).getPropertyValue("--items-per-screen"),
        10
      ) || 1;
    let sliderIndex =
      parseInt(slider.style.getPropertyValue("--slider-index"), 10) || 0;
    const maxIndex = Math.ceil(slider.children.length / itemsPerScreen) - 1;

    if (sliderIndex < maxIndex) {
      sliderIndex++;

      slider.style.setProperty("--slider-index", sliderIndex+0.5);
      console.log("ceil" + Math.ceil(slider.children.length / itemsPerScreen));
      console.log("items per scr" + itemsPerScreen);
      console.log("len " + slider.children.length);
      console.log(sliderIndex);
    }
  };

  return (
    <>
      <div className="container1">
        <div className="row">
          <div className="col-sm">
            <div className="container">
              <button className="handle left-handle" onClick={handleLeftClick}>
                <div className="text">&#8249;</div>
              </button>
              <div className="over">
                <div className="slider" ref={sliderRef}>
                  {dates}
                </div>
              </div>
              <button
                className="handle right-handle "
                onClick={handleRightClick}
                
              >
                <div className="text">&#8250;</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const TextSlider = ({ texts, autoPlayInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to handle next slide
  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % texts.length;
    setCurrentIndex(newIndex);
  };

  // Function to handle previous slide
  const prevSlide = () => {
    const newIndex = (currentIndex - 1 + texts.length) % texts.length;
    setCurrentIndex(newIndex);
  };

  // Auto play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoPlayInterval]);

  return (
    <div className="text-slider">
      <div className="text-slider-item">
        {texts[currentIndex]}
      </div>
      <div className="text-slider-controls">
        <button onClick={prevSlide}>Previous</button>
        <button onClick={nextSlide}>Next</button>
      </div>
    </div>
  );
};

TextSlider.propTypes = {
    texts: PropTypes.arrayOf(PropTypes.string).isRequired,
    autoPlayInterval: PropTypes.number,
  };
  

export default TextSlider;
import { useState } from "react";
import LoginModal from "./Accounts/LoginModal";
import RegisterModal from "./Accounts/RegisterModal";
import "../css/login.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";

export function HeroSection() {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [registerModalIsOpen, setRegisterModalIsOpen] = useState(false);
  function handleRegisterLink() {
    setLoginModalIsOpen(false);
    setRegisterModalIsOpen(true);
  }

  function handleForgotPassword() {
    // Logic for forgot password
    // Possibly set another modal state for forgot password or redirect
  }
  return (
    <>
      <div className="container15">
        <div className="row hero-row">
          <div className="col-sm">
            <div className="container1 tekst">
              <div className="row">
                <div className="home-slogan">
                  Wszystko <br></br> o piłce nożnej
                </div>
              </div>
              <div className="row">
                <div className="home-title">
                  Przegladaj mecze, obstawiaj transfery, baw się ze <br></br>{" "}
                  znajomymi w obstawianie.
                </div>
              </div>
              <div className="row">
                {!user ? (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={() => setLoginModalIsOpen(true)}
                      className="buttonik"
                    >
                      zaloguj się
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterModalIsOpen(true)}
                      className="buttonik2"
                    >
                      zarejestruj się
                    </button>{" "}
                  </>
                ) : (
                  <div> </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-sm d-flex align-items-center justify-content-left image-column">
            <img
              className="img-fluid"
              src="/src/assets/footballerpicture.png"
            ></img>
          </div>
        </div>
      </div>
      <LoginModal
        isOpen={loginModalIsOpen}
        onRequestClose={() => setLoginModalIsOpen(false)}
        onRegisterClick={handleRegisterLink}
        onForgotPasswordClick={handleForgotPassword}
      />
      <RegisterModal
        isOpen={registerModalIsOpen}
        onRequestClose={() => setRegisterModalIsOpen(false)}
      />
    </>
  );
}
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { signOut } from 'firebase/auth';



export function Navbar() {

  const auth = getAuth();
  const user = auth.currentUser; // If you're using Firebase authentication
  console.log(user)
  function getUsernameFromEmail(email) {
    return email.split('@')[0];
  }
  return (
    <>
      <nav className="navbar navbar-expand-sm "data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            betting-score
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          {user &&
            <div className="collapse navbar-collapse -xxl" id="navbarNav">
              <ul className="navbar-nav">
              
                <li className="nav-item">
                  <a className="nav-link" aria-current="page" href="/#matchesSection">
                    mecze
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/betting">
                    obstawianie
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/betting#podium">ranking</a>
                </li>
                {user ? <a className="nav-link" href="/#" onClick={() => signOut(auth)}>wyloguj się</a> : <div></div>}
                {user && <>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      {user?.displayName || getUsernameFromEmail(user?.email)}
                    </a>
                  </li></>}
              </ul>
            
            </div>
          }
        </div>
      </nav>
    </>
  );
}
//import { Buttons } from "./Buttons";

export function Pblogos() {
    return (
      <>  
        <div className="container logos-con">
          <div className="row ">
            <div className="col img-logo d-flex align-items-center justify-content-center pb-logo navbar-brand2 ">Praca wykonana na potrzebę pracy inżynierskiej</div>
          </div>
        </div>
      </>
    );
  }
  import React, { useEffect, useState } from 'react';
import '../css/Podium.css';
import { collection, getFirestore, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Podium = () => {
  const ITEMS_PER_PAGE = 5;
  const [userScores, setUserScores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser; // If you're using Firebase authentication

  useEffect(() => {
    const scoresRef = collection(firestore, 'userScores');
    const unsubscribe = onSnapshot(scoresRef, (querySnapshot) => {
      const scores = querySnapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      }));
      scores.sort((a, b) => b.totalPoints - a.totalPoints);
      setUserScores(scores);
    });
    return unsubscribe; // Detach listener on unmount
  }, [firestore]);

  // Calculate total pages
  const totalPages = Math.ceil(userScores.length / ITEMS_PER_PAGE);

  // Function to handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Calculate the slice of userScores to display
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUserScores = userScores.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  console.log(userScores)
  return (
    <div className="main-container betting-text-style" id="podium">
      <h2 className="podium-title">Ranking wszystkich użytkowników</h2>
      <div className="podium">
        {userScores.slice(0, 3).map((user, index) => (
          <div
            key={user.userId}
            className={`podium-place ${
              index === 0 ? 'first-place' : index === 1 ? 'second-place' : 'third-place'
            }`}
          >
            <div className={`podium-number ${index === 0 ? 'first' : index === 1 ? 'second' : 'third'}`}>
              {index + 1}
            </div>
            <span className="rank-name">
              {user.displayName}
            </span>
            <div className="points">{user.totalPoints} pkt</div>
            <div className="matches">{user.totalBets} meczy</div>
          </div>
        ))}
      </div>
      <ul className="additional-rankings">
        {paginatedUserScores.slice(3).map((user, index) => (
          <li key={user.userId} className="additional-place">
            <span className="additional-rank">{index + 4}</span>
            <span className="additional-name">{user.displayName}</span>
            <span className="points">{user.totalPoints} pkt</span>
            <span className="matches">{user.totalBets} meczy</span>
          </li>
        ))}
      </ul>
      <div className="pagination-controls">
        <button onClick={() => handlePageChange(currentPage - 1)}>{"<"}</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={currentPage === number ? 'active' : ''}
          >
            {number}
          </button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)}>{">"}</button>
      </div>
    </div>
  );
};

export default Podium;
import React, { useEffect, useState } from 'react';
import '../css/Podium.css';
import { collection, getFirestore, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const PodiumForFriendsBets = ({kuba}) => {
  const ITEMS_PER_PAGE = 5;
  const [userScores, setUserScores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser; // If you're using Firebase authentication

  console.log(kuba)
  let sortedData;
  let pointsForRanking = []
  const calucatePointsForRanking = function () {
    const userPoints = {};
  
    kuba.forEach((tab) => {
      const userUid = tab.userUid;
      const points = tab.points;
  
      if (!userPoints[userUid]) {
        userPoints[userUid] = { userUid, displayName: user.displayName, points: 0 };
      }
      
      userPoints[userUid].points += points;
  
      tab?.mecze?.forEach((match) => {
        const matchUserUid = match.userUid;
        const matchPoints = match.points;
  
        if (!userPoints[matchUserUid]) {
          userPoints[matchUserUid] = { userUid: matchUserUid, displayName: match.displayName, points: 0 };
        }
  
        userPoints[matchUserUid].points += matchPoints;
      });
    });
  
    // Wyniki zapisane jako tablica obiektów
    sortedData = Object.values(userPoints);
    // Sortuj dane po liczbie punktów od największej do najmniejszej
    sortedData.sort((a, b) => b.points - a.points);
  };
  
  calucatePointsForRanking();
  console.log(sortedData);

  console.log(pointsForRanking)
  // Calculate total pages
  const totalPages = Math.ceil(userScores.length / ITEMS_PER_PAGE);

  // Function to handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
    };
    

  // Calculate the slice of userScores to display
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUserScores = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="main-container" id="podium">
  
      <div className="podium">
        {sortedData.slice(0, 3).map((user, index) => (
          <div
            key={user.userUid}
            className={`podium-place ${
              index === 0 ? 'first-place' : index === 1 ? 'second-place' : 'third-place'
            }`}
          >
            <div className={`podium-number ${index === 0 ? 'first' : index === 1 ? 'second' : 'third'}`}>
              {index + 1}
            </div>
            <span className="rank-name">
              {user.displayName}
            </span>
            <div className="points">{user.points} pkt</div>
            {/* <div className="matches">{user.totalBets} meczy</div> */}
          </div>
        ))}
      </div>
      <ul className="additional-rankings">
        {paginatedUserScores.slice(3).map((user, index) => (
          <li key={user.userUid} className="additional-place">
            <span className="additional-rank">{index + 4}</span>
            <span className="additional-name">{user.displayName}</span>
            <span className="points">{user.points} pkt</span>
            {/* <span className="matches">{user.totalBets} meczy</span> */}
          </li>
        ))}
      </ul>
      <div className="pagination-controls">
        <button onClick={() => handlePageChange(currentPage - 1)}>{"<"}</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={currentPage === number ? 'active' : ''}
          >
            {number}
          </button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)}>{">"}</button>
      </div>
    </div>
  );
};

export default PodiumForFriendsBets;
import { createContext, useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

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
import { Navbar } from "../componenets/Nabar";
import TabsBar from "../componenets/BetTabs/TabsBar";

export default function Betting() {
  const rankings = [
    { name: "Alice", points: 150 },
    { name: "Bob", points: 120 },
    { name: "Charlie", points: 110 },
    // Additional rankings
    { name: "Dave", points: 100 },
    { name: "Eve", points: 90 },
    { name: "Frank", points: 85 },
    // ... more rankings if needed
  ];
  return (
    <>
      <Navbar></Navbar>
      <TabsBar></TabsBar>
    </>
  );
}
import { HeroSection } from "../componenets/HeroSection";
import { MatchesSection } from "../componenets/MatchesData/MatchesSection";
import { Navbar } from "../componenets/Nabar";
import { Pblogos } from "../componenets/Pblogos";

export default function Home() {
  return (
    <>
      <Navbar></Navbar>
      <HeroSection></HeroSection>
      <Pblogos></Pblogos>
      <MatchesSection></MatchesSection>
    </>
  );
}
import "bootstrap/dist/css/bootstrap.css";
import "./css/App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Account from "./pages/Betting";
import { FavoritesProvider } from "./Context/FavoritesContext";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";

import { getFirestore } from "firebase/firestore";
import { collection } from "firebase/firestore";

import { onSnapshot } from "firebase/firestore";

import { doc, setDoc, writeBatch } from "firebase/firestore";
import { query, where, getDocs } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import Podium from "./componenets/Podium";
import FriendsList from "./componenets/FriendsList";
import Betting from "./pages/Betting";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBkSEz109STYK02nQ-Kcij3eqpOMZ31R58",
//   authDomain: "inzynierka-e7180.firebaseapp.com",
//   projectId: "inzynierka-e7180",
//   storageBucket: "inzynierka-e7180.appspot.com",
//   messagingSenderId: "932466898301",
//   appId: "1:932466898301:web:9700bdf9cae9ba07a00814"
// };

// Your web app's Firebase configuration

export default function App() {
  const firebaseConfig = {
    apiKey: "AIzaSyBkSEz109STYK02nQ-Kcij3eqpOMZ31R58",
    authDomain: "inzynierka-e7180.firebaseapp.com",
    databaseURL:
      "https://inzynierka-e7180-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "inzynierka-e7180",
    storageBucket: "inzynierka-e7180.appspot.com",
    messagingSenderId: "932466898301",
    appId: "1:932466898301:web:9700bdf9cae9ba07a00814",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  // Get the current user's auth information
  const auth = getAuth();

  const [laLigaMatches, setLaLigaMatches] = useState([]);

  useEffect(() => {
    const fetchMatchesInRange = async (
      tournament,
      startDateStr,
      endDateStr
    ) => {
      const firestore = getFirestore(app);
      const matchesRef = collection(
        firestore,
        `matchesData/${tournament}/matches`
      );

      const startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);

      const q = query(
        matchesRef,
        where("startTimestamp", ">=", startDate.getTime() / 1000),
        where("startTimestamp", "<=", endDate.getTime() / 1000)
      );

      try {
        const querySnapshot = await getDocs(q);
        const matches = [];
        querySnapshot.forEach((doc) => {
          matches.push(doc.data());
        });
        setLaLigaMatches(matches);
      } catch (error) {
        console.error("Error fetching matches in range:", error);
      }
    };

    fetchMatchesInRange("laLiga", "2023-12-24", "2024-01-07");
  }, []);

  // console.log(laLigaMetches)
  console.log(laLigaMatches);

  const [user, loading, error] = useAuthState(auth);
  return (
    <>
      <div className="App">
        <section>
          <FavoritesProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />}>
                  {" "}
                  /
                </Route>
                <Route path="/betting" element={<Betting />} />
                <Route path="#podium" element={<Podium />} />
                <Route path="/friends" element={<FriendsList />} />
              </Routes>
            </BrowserRouter>
            </FavoritesProvider>
        </section>
      </div>
    </>
  );
}
const BASE_URL = "https://66rlxf-3000.csb.app/api/v1/";
const SOFASCORE_URL = "https://api.sofascore.app/api/v1/";

// export const tournaments = [
//     { id: 202, name: "Ekstraklasa", season: 52176 },
//     { id: 8, name: "LaLiga", season: 52376 },
//     { id: 7, name: "ChampionsLeague", season: 52162 },
//     { id: 17, name: "PremierLeague", season: 52186 },
//     { id: 35, name: "Bundesliga", season: 52608 },
//     { id: 23, name: "SerieA", season: 52760 },
//     { id: 679, name: "UEFAEuropaLeague", season: 53654 },
//     { id: 17015, name: "UEFAEuropaConferenceLeague", season: 52327 },
//     //{ id: 325, name: "BrasileiroSerieA", season: 48982 },
//     { id: 242, name: "MLS", season: 47955 },
//     //{ id: 13475, name: "CopadelaLigaProfesional", season: 13475 },
//     //{ id: 649, name: "CFASuperLeague", season: 49950 },
//     //{ id: 682, name: "PremierLeagueKaz", season: 48738 },
//     //{ id: 544, name: "SegundaFederación", season: 53413 },
//     { id: 34, name: "Ligue1", season: 52571 },
//     { id: 37, name: "Eredivisie", season: 52554 },
//     { id: 808, name: "PremierLeagueEG", season: 55005 },
//     { id: 955, name: "SaudiProfessionalLeague", season: 53241 },
//     { id: 281, name: "PucharPolski", season: 52567 },
//     { id: 329, name: "CopadelRey", season: 55373 },
// ];

export const tournaments = [
  { id: 8, name: "laLiga", season: 52376 },
  { id: 17, name: "premierLeague", season: 52186 },
  { id: 23, name: "serieA", season: 52760 },
  { id: 915, name: "persianGulfProLeague", season: 52957 },
  { id: 202, name: "ekstraklasa", season: 52176 },
];

// export const tournaments = [
//   { id: 202, name: "Ekstraklasa", season: 52176 },
//   { id: 8, name: "LaLiga", season: 52376 },
//   { id: 7, name: "ChampionsLeague", season: 52162 },
//   { id: 17, name: "PremierLeague", season: 52186 },
//   { id: 35, name: "Bundesliga", season: 52608 },
//   { id: 23, name: "SerieA", season: 52760 },
//   { id: 679, name: "UEFAEuropaLeague", season: 53654 },
//   { id: 17015, name: "UEFAEuropaConferenceLeague", season: 52327 },
//   { id: 34, name: "Ligue1", season: 52571 },
//   { id: 37, name: "Eredivisie", season: 52554 },
//   { id: 281, name: "PucharPolski", season: 52567 },
//   { id: 281, name: "PucharPolski", season: 52567 },
//   { id: 27, name: "EuropeanChampionshipQualification", season: 46599 },
//   { id: 54, name: "LaLiga2", season: 52563 },
// ];

export const tournamentIds = tournaments.map((t) => t.id);

export const fetchMatchesPage = async (
  tournament,
  time,
  pageNumber = 0,
  accumulatedMatches = []
) => {
  const response = await fetch(
    `${BASE_URL}unique-tournament/${tournament.id}/season/${tournament.season}/events/${time}/${pageNumber}`
  );

  try {
    const data = await response.json();
    if (data.error && data.error.code === 404) {
      return accumulatedMatches;
    }

    if (!data || data.length === 0 || pageNumber >= 10) {
      return accumulatedMatches;
    }

    return await fetchMatchesPage(
      tournament,
      time,
      pageNumber + 1,
      accumulatedMatches.concat(data)
    );
  } catch (error) {
    console.error(
      "Error fetching page",
      pageNumber,
      "for",
      tournament.name,
      ":",
      error
    );
    return accumulatedMatches;
  }
};

export const getTurnamentImgURL = function (turnamentName) {
  const turnamentObj = tournaments.find(
    (turnament) => turnament.name === turnamentName
  );
  if (!turnamentObj) return null;
  return `${BASE_URL}unique-tournament/${turnamentObj.id}/image/light`;
};

export const getTurnamentImgURLbyId = function (id) {
  
  return `${BASE_URL}unique-tournament/${id}/image/light`;
};
export function ReturnTeamImage(teamId) {
  const baseUrl = "https://api.sofascore.app/api/v1/team";
  const url = `${BASE_URL}/${teamId}/image`;
  return url;
}
export const fetchAllMatchesLive = async () => {
  const response = await fetch(`${BASE_URL}sport/football/events/live`);
  if (response.status === 404) {
    console.error("Błąd serwera");
    return;
  }
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching", error);
  }
};

export const divideMatchesToLeagues = (lastOrNextMatches) =>
  tournaments.map(async (tournament) => {
    const matches = await fetchMatchesPage(tournament, lastOrNextMatches);
    return { ...tournament, matches };
  });

export const addMatchesTotempAllMatchesData = function (
  tempAllMatchesData,
  arr,
  pushOrUnshift
) {
  Object.keys(arr).forEach((key) => {
    if (tempAllMatchesData[key]) {
      // Dodawanie tylko tych meczów, które jeszcze nie istnieją w tempAllMatchesData
      arr[key].forEach((liveMatch) => {
        if (
          !tempAllMatchesData[key].some((match) => match.id === liveMatch.id)
        ) {
          if (pushOrUnshift === "push") tempAllMatchesData[key].push(liveMatch);
          else tempAllMatchesData[key].unshift(liveMatch);
        }
      });
    } else {
      tempAllMatchesData[key] = arr[key];
    }
  });
  return tempAllMatchesData;
};

export const getAllMatchesDays = function (obj, arrayToSaveDates) {
  obj.forEach((match) => {
    const matchDate = new Date(match.startTimestamp * 1000);
    const apiFormatMatchDate = `${matchDate.getFullYear()}-${String(
      matchDate.getMonth() + 1
    ).padStart(2, "0")}-${String(matchDate.getDate()).padStart(2, "0")}`;
    arrayToSaveDates.push(apiFormatMatchDate);
  });
  console.log(arrayToSaveDates);
  return arrayToSaveDates;
};

export const getDaysWithoutMatches = function (allMatchesDates) {
  const today = new Date();
  const uniqueMatchDates = [...new Set(allMatchesDates)];
  const daysWithoutMatches = Array.from({ length: 218 + 120 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 30 - 90 + index);
    const apiFormatDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return uniqueMatchDates.includes(apiFormatDate) ? null : apiFormatDate;
  }).filter(Boolean);
  return daysWithoutMatches;
};

export const filterMatchesByDate = (allData, date) => {
  const newMatchesData = {};

  Object.keys(allData).forEach((tournamentName) => {
    newMatchesData[tournamentName] = allData[tournamentName].filter((match) => {
      const matchDate = new Date(match.startTimestamp * 1000);
      const apiFormatMatchDate = `${matchDate.getFullYear()}-${String(
        matchDate.getMonth() + 1
      ).padStart(2, "0")}-${String(matchDate.getDate()).padStart(2, "0")}`;
      return apiFormatMatchDate === date;
    });
  });

  return newMatchesData;
};

export const filterMatchesByDate2 = (allData, date) => {
  const newMatchesData = {};
  console.log("matchesdata2.........");
  console.log(allData);
  Object.keys(allData).forEach((match) => {
    const matchDate = new Date(match.startTimestamp * 1000);
    const apiFormatMatchDate = `${matchDate.getFullYear()}-${String(
      matchDate.getMonth() + 1
    ).padStart(2, "0")}-${String(matchDate.getDate()).padStart(2, "0")}`;
    return apiFormatMatchDate === date;
  });

  return newMatchesData;
};

export const sendMatches = async (matches, endpoint) => {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ matches }), // Zserializuj tablicę meczów do formatu JSON
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Odpowiedź z serwera:", data);
    return data;
  } catch (error) {
    console.error("Błąd podczas wysyłania meczów:", error);
    throw error;
  }
};
