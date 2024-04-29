import React, { ReactNode, useEffect, useRef } from "react";

export type ChatContainerProps = {
  children?: ReactNode;
};
const ChatContainer: React.FC<ChatContainerProps> = ({ children }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk melakukan auto-scroll ke bagian bawah chat container
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // Auto-scroll ke bagian bawah setiap kali ada perubahan pada children (daftar chat)
  useEffect(() => {
    scrollToBottom();
  }, [children]);

  return (
    <div
      ref={chatContainerRef}
      className="grid grid-cols-12 gap-y-2 overflow-y-auto"
      style={{ maxHeight: "650px" }}
    >
      {children}
    </div>
  );
};

export default ChatContainer;
