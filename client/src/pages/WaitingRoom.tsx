import React, { useEffect, useState } from "react";
import { actions, state } from "../state";
import { useCopyToClipboard } from "react-use";
import { useSnapshot } from "valtio";
import { colorizeText } from "../util";
import { MdContentCopy, MdPeopleOutline } from "react-icons/md";
import { BsPencilSquare } from "react-icons/bs";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";
import ParticipantList from "../components/ParticipantList";
import NominationForm from "../components/NominationForm";

const WaitingRoom: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_copiedText, copyToClipboard] = useCopyToClipboard();
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const [isFormNominationOpen, setIsFormNominationOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [participantRemoved, setParticipantRemoved] = useState<string>();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currentState = useSnapshot(state);

  const confirmRemoveParticipant = (id: string) => {
    setConfirmationMessage(
      `Are you sure you want to remove ${currentState.poll?.participants[id]} from poll?`
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
    actions.initializeSocket();
  }, []);

  return (
    <>
      <div className="flex flex-col w-full justify-between items-center h-full">
        <div>
          <h2 className="text-center">Poll Topic</h2>
          <p className="italic text-center mb-4">{currentState.poll?.topic}</p>
          <h2 className="text-center">Poll ID</h2>
          <h3 className="text-center mb-2">Click to copy!</h3>

          <div
            className="mb-4 flex justify-center align-middle cursor-pointer"
            onClick={() => copyToClipboard(currentState.poll?.id || "")}
          >
            <div className="font-extrabold text-center mr-2">
              {currentState.poll && colorizeText(currentState.poll?.id)}
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
            <span>{currentState.participantCount}</span>
          </button>

          <button
            className="box btn-purple mx-2 pulsate"
            onClick={() => setIsFormNominationOpen(true)}
          >
            <BsPencilSquare size={24} />{" "}
            <span>{currentState.nominationCount}</span>
          </button>
        </div>
        <div className="flex flex-col justify-center">
          {currentState.isAdmin ? (
            <>
              <div className="my-2 italic">
                {currentState.poll?.votesPerVoter} Nominations Required to
                Start!
              </div>
              <button
                className="box btn-orange my-2"
                disabled={!currentState.canStartVote}
                onClick={() => actions.startVote()}
              >
                Start Voting
              </button>
            </>
          ) : (
            <div className="my-2 italic">
              Waiting For Admin,{" "}
              <span className="font-bold">
                {currentState.poll?.participants[currentState.poll?.adminID]}
              </span>
              , to start voting.
            </div>
          )}

          <button
            className="box btn-purple my-2"
            onClick={() => setShowConfirmation(true)}
          >
            Leave Poll
          </button>

          <ConfirmationDialog
            message="You will be kicked out of the poll"
            showDialog={showConfirmation}
            onCancel={() => setShowConfirmation(false)}
            onConfirm={() => actions.startOver()}
          />
        </div>
      </div>
      <ParticipantList
        isOpen={isParticipantListOpen}
        onClose={() => setIsParticipantListOpen(false)}
        participants={currentState.poll?.participants}
        onRemoveParticipant={confirmRemoveParticipant}
        userID={currentState.me?.id}
        isAdmin={currentState.isAdmin || false}
      />

      <NominationForm
        title={currentState.poll?.topic}
        isOpen={isFormNominationOpen}
        onClose={() => setIsFormNominationOpen(false)}
        onSubmitNomination={(nominationText) =>
          actions.nominate(nominationText)
        }
        nominations={currentState.poll?.nominations || {}}
        onRemoveNomination={(nominationID) =>
          actions.removeNomination(nominationID)
        }
        userID={currentState.me?.id}
        isAdmin={currentState.isAdmin || false}
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

export default WaitingRoom;
