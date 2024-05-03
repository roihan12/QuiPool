import { Answer, Question, QuestionWithAnswers, UserAnswer } from 'shared';
import { Socket } from 'socket.io';
import { Request } from 'express';

// service types
export type CreateQuizFields = {
  topic: string;
  maxParticipants: number;
  maxQuestions: number;
  description: string;
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

export type AddQuestionWithAnswerFields = {
  quizID: string;
  userID: string;
  text: string;
  answers: AddQusetionAnswerFields[];
};

export type AddAnswerFields = {
  quizID: string;
  questionID: string;
  text: string;
  isCorrect: boolean;
};

export type AddQusetionAnswerFields = {
  text: string;
  isCorrect: boolean;
};

export type AddChatQuizFields = {
  quizID: string;
  userID: string;
  name: string;
  text: string;
};
export type UserAnswerFields = {
  quizID: string;
  userID: string;
  userAnswer: UserAnswer;
};
// repository types
export type CreateQuizData = {
  quizID: string;
  userID: string;
  topic: string;
  maxParticipants: number;
  maxQuestions: number;
  description: string;
};

export type AddQuizParticipantData = {
  quizID: string;
  userID: string;
  name: string;
};

export type AddQuestionData = {
  quizID: string;
  questionID: string;
  question: Question;
};

export type AddQuestionWithAnswerData = {
  quizID: string;
  questionID: string;
  question: QuestionWithAnswers;
};

export type AddAnswerData = {
  quizID: string;
  questionID: string;
  answer: Answer;
};

export type UserAnswerData = {
  quizID: string;
  userID: string;
  userAnswer: UserAnswer;
};

// Guard types
export type QuizAuthPayload = {
  userID: string;
  quizID: string;
  name: string;
};

export type RequestQuizWithAuth = Request & QuizAuthPayload;
export type SocketQuizWithAuth = Socket & QuizAuthPayload;
