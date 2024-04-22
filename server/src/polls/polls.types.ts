import { Request } from 'express';
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



// Guard types
export type AuthPayload = {
  userID: string;
  pollID: string;
  name: string;
};

export type RequestWithAuth = Request & AuthPayload;
export type SocketWithAuth = Socket & AuthPayload;
