export type Participants = {
  [participantID: string]: string;
};

export type Nomination = {
  userID: string;
  text: string;
};

export type ChatMessage = {
  chat: string;
  userID: string;
  name: string;
  timestamp: number; // Anda bisa menyesuaikan dengan tipe data yang digunakan untuk timestamp
};

type NominationID = string;
type ChatID = string;
export type Nominations = {
  [nominationID: NominationID]: Nomination;
};

export type AllMessages = {
  [chatID: ChatID]: ChatMessage;
};

export type Rangkings = {
  [userID: string]: NominationID[];
};

export type Results = Array<{
  nominationID: NominationID;
  nominationText: string;
  score: number;
}>;

export type Poll = {
  id: string;
  topic: string;
  votesPerVoter: number;
  participants: Participants;
  adminID: string;
  nominations: Nominations;
  rangkings: Rangkings;
  chats: AllMessages;
  results: Results;
  hasStarted: boolean;
};
