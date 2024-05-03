import React, { useEffect } from "react";
import Welcome from "./pages/Welcome";
import { AppPage, actions, state } from "./state";
import { CSSTransition } from "react-transition-group";
import CreatePoll from "./pages/CreatePoll";
import JoinPoll from "./pages/JoinPoll";
import { useSnapshot } from "valtio";
import WaitingRoom from "./pages/WaitingRoom";
import Voting from "./pages/Voting";
import Results from "./pages/Results";
import Navbar from "./components/Navbar";
import CreateQuiz from "./pages/CreateQuiz";
import WaitingQuizRoom from "./pages/WaitingQuizRoom";
import Quiz from "./pages/Quiz";

const routeConfig = {
  [AppPage.Welcome]: Welcome,
  [AppPage.CreatePoll]: CreatePoll,
  [AppPage.CreateQuiz]: CreateQuiz,
  [AppPage.JoinPoll]: JoinPoll,
  [AppPage.WaitingRoom]: WaitingRoom,
  [AppPage.WaitingQuizRoom]: WaitingQuizRoom,
  [AppPage.Voting]: Voting,
  [AppPage.Quiz]: Quiz,
  [AppPage.Results]: Results,
};

const Pages: React.FC = () => {
  const currentState = useSnapshot(state);

  useEffect(() => {
    if (
      currentState.me?.id &&
      currentState.poll &&
      !currentState.poll?.hasStarted
    ) {
      actions.setPage(AppPage.WaitingRoom);
    }
    if (currentState.me?.id && currentState.poll?.hasStarted) {
      actions.setPage(AppPage.Voting);
    }

    if (currentState.me?.id && currentState.hasVoted) {
      actions.setPage(AppPage.Results);
    }

    if (
      currentState.meQuiz?.id &&
      currentState.quiz &&
      !currentState.quiz?.hasStarted
    ) {
      actions.setPage(AppPage.WaitingQuizRoom);
    }
    if (currentState.meQuiz?.id && currentState.quiz?.hasStarted) {
      actions.setPage(AppPage.Quiz);
    }

    if (currentState.meQuiz?.id && currentState.hasAnswered) {
      actions.setPage(AppPage.QuizResults);
    }
  }, [
    currentState.me?.id,
    currentState.meQuiz?.id,
    currentState.poll,
    currentState.poll?.hasStarted,
    currentState.hasVoted,
    currentState.quiz,
    currentState.quiz?.hasStarted,
    currentState.hasAnswered,
  ]);

  return (
    <>
      {Object.entries(routeConfig).map(([Page, Component]) => (
        <CSSTransition
          key={Page}
          in={Page === currentState.currentPage}
          timeout={300}
          classNames="page"
          unmountOnExit
        >
          <div className="page mobile-height max-w-screen-sm mx-auto py-8 px-4 overflow-y-auto">
            <Navbar />
            <Component />
          </div>
        </CSSTransition>
      ))}
    </>
  );
};

export default Pages;
