import React from "react";
import { ChatMessage } from "shared/poll-types";
import { colorizeText } from "../../util";
type ChatProps = {
  chat: ChatMessage;
  isAdmin: boolean;
  isUserChat: boolean;
  userID: string;
};

const Chat: React.FC<ChatProps> = ({ chat, isAdmin, isUserChat, userID }) => {
  const getBoxStyle = (id: string): string => {
    return id === userID
      ? "bg-orange-100 flex-row"
      : "bg-gray-100 flex-row-reverse";
  };
  return (
    <div
      className={`col-start-${isUserChat ? "1" : "6"} col-end-${
        isUserChat ? "8" : "13"
      } p-3 rounded-lg`}
    >
      <div
        className={`flex items-center justify-${isUserChat ? "start" : "end"} ${
          isUserChat ? "flex-row" : "flex-row-reverse"
        }`}
      >
        <div
          className={`flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0 ${
            isAdmin && getBoxStyle(chat.userID)
          }`}
        >
          {chat.name[0]}
        </div>
        <div
          className={`relative ml-3 mr-3 text-sm bg-${
            isUserChat ? "white" : "indigo-100"
          } py-2 px-4 shadow rounded-xl ${isUserChat ? "" : "bg-indigo-100"}`}
        >
          <div className="mb-1 font-semibold">{colorizeText(chat.name)}</div>
          <div>{chat.chat}</div>
          <div className="text-xs text-gray-500">
            {new Date(chat.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
