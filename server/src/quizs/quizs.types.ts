import { Answer } from 'shared';
import { Socket } from 'socket.io';

// service types
export type CreateQuizFields = {
  topic: string;
  maxParticipants: number;
  name: string;
};

export type JoinQuizFields = {
  quizID: string;
  name: string;
};

export type RejoinQuizFields = {
  quizID: string;
  userID: string;
  name: string;
};
export type AddParticipantQuizFields = {
  quizID: string;
  userID: string;
  name: string;
};

export type AddQuestionFields = {
  quizID: string;
  userID: string;
  text: string;
};

export type AddAnswerFields = {
  quizID: string;
  userID: string;
  text: string;
};

export type AddChatQuizFields = {
 quizID: string;
  userID: string;
  name: string;
  text: string;
};

// repository types
export type CreateQuizData = {
  quizID: string;
  userID: string;
  topic: string;
  maxParticipants: number;
};

export type AddParticipantData = {
  quizID: string;
  userID: string;
  name: string;
};

export type AddQuestionData = {
  quizID: string;
  questionID: string;
  text: string;
  answer: Answer[];
};

export type AddAnswerData = {
  quizID: string;
  questionID: string;
  answerID: string;
  text: string;
  isCorrect: boolean;
};

export type UserAnswerData = {
  quizID: string;
  userID: string;
  questionID: string;
  answerID: string;
};

// Guard types
export type QuizAuthPayload = {
  userID: string;
  quizID: string;
  name: string;
};

export type RequestWithAuth = Request & QuizAuthPayload;
export type SocketWithAuth = Socket & QuizAuthPayload;
