import React, { useEffect, useState } from "react";
import { actions, state } from "../state";
import { useCopyToClipboard } from "react-use";
import { useSnapshot } from "valtio";
import { colorizeText } from "../util";
import { MdContentCopy, MdPeopleOutline } from "react-icons/md";
import { BsChat, BsListCheck, BsPencilSquare } from "react-icons/bs";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";
import ParticipantList from "../components/ParticipantList";
import ChatRoom from "../components/ChatRoom";
import QuizForm from "@/components/QuizForm";
import ListQuiz from "@/components/ListQuiz";

const WaitingQuizRoom: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_copiedText, copyToClipboard] = useCopyToClipboard();
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const [isFormQuizOpen, setIsFormQuizOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isListQuizOpen, setIsListQuizOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [participantRemoved, setParticipantRemoved] = useState<string>();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currentState = useSnapshot(state);

  const confirmRemoveParticipant = (id: string) => {
    setConfirmationMessage(
      `Are you sure you want to remove ${currentState.quiz?.participants[id]} from quiz?`
    );
    setParticipantRemoved(id);
    setIsConfirmationOpen(true);
  };

  const submitRemoveParticipant = async () => {
    participantRemoved && actions.removeParticipant(participantRemoved);
    setIsConfirmationOpen(false);
  };

  useEffect(() => {
    console.log("waiting room");
    actions.initializeQuizSocket();
  }, []);

  return (
    <>
      <div className="flex flex-col w-full justify-between items-center h-full">
        <div>
          <h2 className="text-center">Quiz Topic</h2>
          <p className="italic text-center mb-4">{currentState.quiz?.topic}</p>
          <h2 className="text-center">Quiz Code</h2>
          <h3 className="text-center mb-2">Click to copy!</h3>

          <div
            className="mb-4 flex justify-center align-middle cursor-pointer"
            onClick={() => copyToClipboard(currentState.quiz?.id || "")}
          >
            <div className="font-extrabold text-center mr-2">
              {currentState.quiz && colorizeText(currentState.quiz?.id)}
            </div>
            <MdContentCopy size={24} />
          </div>
        </div>
        <div className="flex justify-center">
          <button
            className="box btn-orange mx-2 pulsate"
            onClick={() => setIsParticipantListOpen(true)}
          >
            <MdPeopleOutline size={24} />{" "}
            <span>{currentState.participantQuizCount}</span>
          </button>

          <button
            className="box border-violet-500 mx-2 pulsate"
            onClick={() => setIsFormQuizOpen(true)}
          >
            <BsPencilSquare size={24} /> <span>{currentState.quizCount}</span>
          </button>

          <button
            className="box btn-orange mx-2 pulsate"
            onClick={() => setIsChatOpen(true)}
          >
            <BsChat size={24} /> <span>{currentState.chatCount}</span>
          </button>

          {currentState.isQuizAdmin && (
            <button
              className="box btn-orange mx-2 pulsate"
              onClick={() => setIsListQuizOpen(true)}
            >
              <BsListCheck size={24} /> <span>{currentState.quizCount}</span>
            </button>
          )}
        </div>
        <div className="flex flex-col justify-center">
          {currentState.isQuizAdmin ? (
            <>
              <div className="my-2 italic">
                {currentState.quiz?.maxQuestions} Question Required to Start!
              </div>
              <button
                className="box btn-orange my-2"
                disabled={!currentState.canStartQuiz}
                onClick={() => actions.startQuiz()}
              >
                Start Quiz
              </button>
            </>
          ) : (
            <div className="my-2 italic">
              Waiting For Admin,{" "}
              <span className="font-bold">
                {currentState.quiz?.participants[currentState.quiz?.adminID]}
              </span>
              , to start the quiz.
            </div>
          )}

          <button
            className="box  border-violet-500 my-2"
            onClick={() => setShowConfirmation(true)}
          >
            Leave Quiz
          </button>

          <ConfirmationDialog
            message="You will be kicked out of the quiz."
            showDialog={showConfirmation}
            onCancel={() => setShowConfirmation(false)}
            onConfirm={() => actions.startOver()}
          />
        </div>
      </div>
      <ParticipantList
        isOpen={isParticipantListOpen}
        onClose={() => setIsParticipantListOpen(false)}
        participants={currentState.quiz?.participants}
        onRemoveParticipant={confirmRemoveParticipant}
        userID={currentState.me?.id}
        isAdmin={currentState.isAdmin || false}
      />

      <QuizForm
        title={currentState.quiz?.topic}
        isOpen={isFormQuizOpen}
        onClose={() => setIsFormQuizOpen(false)}
        onSubmitQuestion={(question) => actions.submitQuiz(question)}
      />

      <ChatRoom
        title={currentState.quiz?.topic}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSubmitChat={(chatText) => actions.chatQuiz(chatText)}
        allMessages={currentState.quiz?.chats || {}}
        userID={currentState.meQuiz?.id}
        isAdmin={currentState.isAdmin || false}
      />

      <ListQuiz
        topic={currentState.quiz?.topic}
        isOpen={isListQuizOpen}
        onClose={() => setIsListQuizOpen(false)}
        questions={currentState.quiz?.questions || {}}
      />

      <ConfirmationDialog
        showDialog={isConfirmationOpen}
        message={confirmationMessage}
        onCancel={() => setIsConfirmationOpen(false)}
        onConfirm={submitRemoveParticipant}
      />
    </>
  );
};

export default WaitingQuizRoom;
