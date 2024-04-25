import React from "react";
import Welcome from "./pages/Welcome";
import { AppPage, state } from "./state";
import { CSSTransition } from "react-transition-group";
import CreatePoll from "./pages/CreatePoll";
import JoinPoll from "./pages/JoinPoll";
import { useSnapshot } from "valtio";
import WaitingRoom from "./pages/WaitingRoom";

const routeConfig = {
  [AppPage.Welcome]: Welcome,
  [AppPage.CreatePoll]: CreatePoll,
  [AppPage.JoinPoll]: JoinPoll,
  [AppPage.WaitingRoom]: WaitingRoom,
};

const Pages: React.FC = () => {
  const currentState = useSnapshot(state);

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
            <Component />
          </div>
        </CSSTransition>
      ))}
    </>
  );
};

export default Pages;
