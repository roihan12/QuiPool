import { AllMessages, ChatMessage, Participants } from "./poll-types";

type QuestionID = string;
type UserID = string;
type AnswerID = string;

export type Answer = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Answers = {
  [answerID: AnswerID]: Answer;
};

export type Question = {
  id: string;
  userID: string;
  text: string;
  answers: Answers;
};

export type QuestionWithAnswers = {
  id: string;
  userID: string;
  text: string;
  answers: Answer[];
};

export type UserAnswer = {
  questionId: string;
  answerId: string;
  timestamp: number;
};

export type Questions = {
  [questionID: QuestionID]: Question;
};

export type QuestionsAnswers = {
  [questionID: QuestionID]: QuestionWithAnswers;
};

export type ListUserAnswers = {
  [userID: string]: [UserAnswer];
};

export type QuizResults = Array<QuizResult>;

export type QuizResult = {
  userID: string;
  name: string;
  score: number;
};

export type AddQuizChatData = {
  quizID: string;
  chatID: string;
  chat: ChatMessage;
};
export type Quiz = {
  id: string;
  topic: string;
  maxParticipants: number;
  maxQuestions: number;
  participants: Participants;
  adminID: string;
  description: string;
  questions: QuestionsAnswers;
  userAnswers: ListUserAnswers;
  chats: AllMessages;
  results: QuizResults;
  hasStarted: boolean;
};
