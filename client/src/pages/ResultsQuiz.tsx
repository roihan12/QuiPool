import React, { useState } from "react";
import { useSnapshot } from "valtio";
import { actions, state } from "../state";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";
import WinnerQuiz from "@/components/WinnerQuiz";
import ResultQuizList from "@/components/ResultsQuizList";

const ResultsQuiz: React.FC = () => {
  const { quiz, isQuizAdmin, participantQuizCount, userAnwersCount } =
    useSnapshot(state);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  return (
    <>
      <div className="mx-auto flex flex-col w-full justify-between items-center h-full max-w-sm">
        <div className="w-full">
          <h1 className="text-center mt-12 mb-4">Results</h1>
          {quiz?.results.length ? (
            <>
              <WinnerQuiz result={quiz?.results[0]} />
              <ResultQuizList results={quiz?.results} />
            </>
          ) : (
            <p className="text-center text-xl">
              <span className="text-orange-600">{userAnwersCount}</span> of
              <span className="text-purple-600">
                {participantQuizCount}
              </span>{" "}
              participant have answered
            </p>
          )}
        </div>
        <div className="flex flex-col justify-center">
          {isQuizAdmin && !quiz?.results.length && (
            <>
              <button
                className="box btn-orange my-2"
                onClick={() => setIsConfirmationOpen(true)}
              >
                End Quiz
              </button>
            </>
          )}
          {!isQuizAdmin && !quiz?.results.length && (
            <div className="my-2 italic">
              {" "}
              Waiting for admin,{" "}
              <span className="font-semibold">
                {quiz?.participants[quiz?.adminID]}
              </span>
              , to finalize the quiz
            </div>
          )}
          {!!quiz?.results.length && (
            <button
              className="box btn-purple my-2"
              onClick={() => setIsLeaveOpen(true)}
            >
              Leave Quiz
            </button>
          )}
        </div>
      </div>

      {isQuizAdmin && (
        <ConfirmationDialog
          message="Are you sure you want to end the quiz and show the results?"
          showDialog={isConfirmationOpen}
          onCancel={() => setIsConfirmationOpen(false)}
          onConfirm={() => {
            actions.closeQuiz();
            setIsConfirmationOpen(false);
          }}
        />
      )}
      {isLeaveOpen && (
        <ConfirmationDialog
          message="You will be kicked out of the quiz"
          showDialog={isLeaveOpen}
          onCancel={() => setIsLeaveOpen(false)}
          onConfirm={() => actions.startOver()}
        />
      )}
    </>
  );
};

export default ResultsQuiz;
