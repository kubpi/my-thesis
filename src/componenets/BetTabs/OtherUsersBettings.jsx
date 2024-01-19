import PropTypes from "prop-types";
import "../../css/OtherUsersBettings.css";
const OtherUsersBettings = ({
  user,
  friendGamesTabs,
  tab1,
  getTimeUntilMatch,
  tournamentLogos,
  homeTeamLogo,
  awayTeamLogo,
}) => {
  const isCorrectBet = (
    betScoreHome,
    betScoreAway,
    matchScoreHome,
    matchScoreAway
  ) => {
    const isCorrect =
      betScoreHome == matchScoreHome && betScoreAway == matchScoreAway;
    return isCorrect;
  };

  return (
    <>
      <h2 className="podium-title podium-title1">Podsumowanie: </h2>
      <div className="users-table ">
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
        </div>
        <div className="users-table-body betting-text-style">
          {tab1.map((user) => (
            <>
              <div className="table-row " key={user.match.id}>
                <div className="row-item">
                  <img
                    src={
                      tournamentLogos[user.match.tournament.uniqueTournament.id]
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
                        <div
                          className={` ${
                            isCorrectBet(
                              user.betHomeScore,
                              user.betAwayScore,
                              user.match.homeScore.display,
                              user.match.awayScore.display
                            )
                              ? "correct-bet"
                              : ""
                          }`}
                        >
                          {user.betHomeScore}
                        </div>
                        <div
                          className={` ${
                            isCorrectBet(
                              user.betHomeScore,
                              user.betAwayScore,
                              user.match.homeScore.display,
                              user.match.awayScore.display
                            )
                              ? "correct-bet"
                              : ""
                          }`}
                        >
                          {user.betAwayScore}
                        </div>
                      </>
                    ) : (
                      <div>Nieobstawiono</div>
                    )}
                  </>
                </div>
                {user?.mecze?.map((mecz, index) =>
                  mecz.betHomeScore && mecz.betAwayScore ? (
                    <div className={`row-item `} key={index}>
                      <div
                        className={`${
                          isCorrectBet(
                            mecz.betHomeScore,
                            mecz.betAwayScore,
                            user.match.homeScore.display,
                            user.match.awayScore.display
                          )
                            ? "correct-bet"
                            : ""
                        }`}
                      >
                        {mecz.betHomeScore}
                      </div>
                      <div
                        className={`${
                          isCorrectBet(
                            mecz.betHomeScore,
                            mecz.betAwayScore,
                            user.match.homeScore.display,
                            user.match.awayScore.display
                          )
                            ? "correct-bet"
                            : ""
                        }`}
                      >
                        {mecz.betAwayScore}
                      </div>
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
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
};

export default OtherUsersBettings;

OtherUsersBettings.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string,
  }).isRequired,
  friendGamesTabs: PropTypes.arrayOf(
    PropTypes.shape({
      userUid: PropTypes.string,
      userName: PropTypes.string,
    })
  ).isRequired,
  tab1: PropTypes.arrayOf(
    PropTypes.shape({
      match: PropTypes.object,
    })
  ).isRequired,
  getTimeUntilMatch: PropTypes.func,
  tournamentLogos: PropTypes.object,
  homeTeamLogo: PropTypes.string,
  awayTeamLogo: PropTypes.string,
};
