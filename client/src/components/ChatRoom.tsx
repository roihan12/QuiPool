import React, { useState } from "react";
import { AllMessages } from "shared/poll-types";
import BottomSheet, { BottemSheetProps } from "./ui/BottomSheet";
import { useSnapshot } from "valtio";
import { state } from "../state";
import Chat from "./ui/Chat";
import ChatContainer from "./ui/ChatContainer";

type ChatRoomProps = {
  title?: string;
  allMessages?: AllMessages;
  userID?: string;
  isAdmin: boolean;
  onSubmitChat: (text: string) => void;
} & BottemSheetProps;

const ChatRoom: React.FC<ChatRoomProps> = ({
  isOpen,
  onClose,
  title,
  allMessages = {},
  onSubmitChat,
  userID,
  isAdmin,
}) => {
  const [chatText, setChatText] = useState<string>("");
  const currentState = useSnapshot(state);

  const handleSubmitChat = (chatText: string) => {
    onSubmitChat(chatText);
    setChatText("");
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="text-center text-xl my-4 font-medium">
        Room Chat {title}
      </h2>
      <div className="flex flex-row h-full w-full overflow-x-hidden pb-8">
        <div className="flex flex-col flex-auto h-full p-6">
          <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
            <div className="flex flex-col h-full overflow-x-auto mb-4">
              <div className="flex flex-col h-full">
                <ChatContainer>
                  {Object.entries(allMessages).map(([chatID, chat]) => {
                    const isUserChat = currentState.me?.id === chat.userID;
                    return (
                      <Chat
                        key={chatID}
                        chat={chat}
                        isAdmin={isAdmin}
                        isUserChat={isUserChat}
                        userID={userID!}
                      />
                    );
                  })}
                </ChatContainer>
              </div>
            </div>
            <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
              <div className="flex-grow ml-4">
                <div className="relative w-full">
                  <input
                    type="text"
                    className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                    value={chatText}
                    onChange={(e) => setChatText(e.currentTarget.value)}
                  />
                  <button className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="ml-4">
                <button
                  className="flex items-center justify-center bg-purple hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0 cursor-pointer"
                  disabled={!chatText.length || chatText.length > 100}
                  onClick={() => handleSubmitChat(chatText)}
                >
                  <span>Send</span>
                  <span className="ml-2">
                    <svg
                      className="w-4 h-4 transform rotate-45 -mt-px"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      ></path>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};

export default ChatRoom;
