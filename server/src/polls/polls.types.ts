import { Request } from 'express';
import { Nomination, ChatMessage } from 'shared';
import { Socket } from 'socket.io';

// service types
export type CreatePollFields = {
  topic: string;
  votesPerVoter: number;
  name: string;
};

export type JoinPollFields = {
  pollID: string;
  name: string;
};

export type RejoinPollFields = {
  pollID: string;
  userID: string;
  name: string;
};
export type AddParticipantFields = {
  pollID: string;
  userID: string;
  name: string;
};

export type AddNominationFields = {
  pollID: string;
  userID: string;
  text: string;
};

export type AddChatFields = {
  pollID: string;
  userID: string;
  name: string;
  text: string;
};

export type SubmitRangkingsFields = {
  pollID: string;
  userID: string;
  rangkings: string[];
};

// repository types
export type CreatePollData = {
  pollID: string;
  userID: string;
  topic: string;
  votesPerVoter: number;
};

export type AddParticipantData = {
  pollID: string;
  userID: string;
  name: string;
};

export type AddNominationData = {
  pollID: string;
  nominationID: string;
  nomination: Nomination;
};

export type AddChatData = {
  pollID: string;
  chatID: string;
  chat: ChatMessage;
};

export type AddParticipantRangkingsData = {
  pollID: string;
  userID: string;
  rangkings: string[];
};

// Guard types
export type AuthPayload = {
  userID: string;
  pollID: string;
  name: string;
};

export type RequestWithAuth = Request & AuthPayload;
export type SocketWithAuth = Socket & AuthPayload;
