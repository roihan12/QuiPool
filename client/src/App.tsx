import React, { useEffect } from "react";
import "./index.css";
import Pages from "./Pages";
import { devtools } from "valtio/utils";
import { actions, state } from "./state";
import Loader from "./components/ui/Loader";
import { useSnapshot } from "valtio";
import { getTokenPayload } from "./util";
import SnackBar from "./components/ui/SnackBar";

devtools(state, "app state");
const App: React.FC = () => {
  const currentState = useSnapshot(state);

  useEffect(() => {
    console.log(" App use effect - check token and send it to server");
    actions.startLoading();

    const accessToken = localStorage.getItem("accessToken");
    const accessQuizToken = localStorage.getItem("accessQuizToken");

    if (accessToken) {
      const { exp: tokenExp } = getTokenPayload(accessToken);
      const currentTimeInSeconds = Date.now() / 1000;

      if (tokenExp >= currentTimeInSeconds - 10) {
        actions.setPollAccessToken(accessToken);
        actions.initializeSocket();
        return;
      }
    }

    if (accessQuizToken) {
      const { exp: tokenQuizExp } = getTokenPayload(accessQuizToken);
      const currentTimeInSeconds = Date.now() / 1000;

      if (tokenQuizExp >= currentTimeInSeconds - 10) {
        actions.setQuizAccessToken(accessQuizToken);
        actions.initializeQuizSocket();
        return;
      }
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("accessQuizToken");
    actions.stopLoading();
  }, []);

  useEffect(() => {
    console.log("App use effect - check current participant");

    const myID = currentState.me?.id;
    const myIDQuiz = currentState.meQuiz?.id;

    // Memeriksa apakah nilai myID, currentState.socket, dan currentState.poll/participants serta currentState.quiz/participants telah didefinisikan.
    if (
      myID !== undefined &&
      currentState.socket?.connected &&
      ((currentState.poll &&
        currentState.poll.participants &&
        !currentState.poll.participants[myID]) ||
        (currentState.quiz &&
          currentState.quiz.participants &&
          !currentState.quiz.participants[myIDQuiz!]))
    ) {
      // Tindakan yang harus diambil jika peserta tidak ada dalam daftar peserta polling atau kuis.
      actions.startOver();
    }
  }, [
    currentState.poll?.participants,
    currentState.quiz?.participants,
    currentState.me?.id,
    currentState.meQuiz?.id,
    currentState.poll,
    currentState.quiz,
    currentState.socket,
  ]);

  return (
    <>
      <Loader isLoading={currentState.isLoading} color="orange" width={120} />
      {currentState.wsErrors.map((error) => (
        <SnackBar
          key={error.id}
          type="error"
          title={error.type}
          message={error.message}
          show={true}
          onClose={() => actions.removeWsError(error.id)}
          autoCloseDuration={5000}
        />
      ))}
      <Pages />
    </>
  );
};

export default App;
