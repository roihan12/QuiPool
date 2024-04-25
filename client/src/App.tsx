import React, { useEffect } from "react";
import "./index.css";
import Pages from "./Pages";
import { devtools } from "valtio/utils";
import { actions, state } from "./state";
import Loader from "./components/ui/Loader";
import { useSnapshot } from "valtio";
import { getTokenPayload } from "./util";

devtools(state, "app state");
const App: React.FC = () => {
  const currentState = useSnapshot(state);

  useEffect(() => {
    console.log(" App use effect - check token and send it to server");
    actions.startLoading();

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      actions.stopLoading();
      return;
    }

    const { exp: tokenExp } = getTokenPayload(accessToken!);
    const currentTimeInSeconds = Date.now() / 1000;

    if (tokenExp < currentTimeInSeconds - 10) {
      localStorage.removeItem("accessToken");
      actions.stopLoading();
      return;
    }
    // reconnect to poll
    actions.setPollAccessToken(accessToken!);
    actions.initializeSocket();
  }, []);

  return (
    <>
      <Loader isLoading={currentState.isLoading} color="orange" width={120} />
      <Pages />
    </>
  );
};

export default App;
