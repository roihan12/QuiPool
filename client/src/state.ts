import { Poll } from "shared/poll-types";
import { proxy, ref } from "valtio";
import { subscribeKey } from "valtio/utils";
import { getTokenPayload } from "./util";
import { Socket } from "socket.io-client";
import {
  createSocketQuizWithHandlers,
  createSocketWithHandlers,
  socketIOUrl,
  socketIOUrlQuiz,
} from "./socket-io";
import { nanoid } from "nanoid";
import { Quiz } from "shared/quiz-types";

export enum AppPage {
  Welcome = "welcome",
  CreatePoll = "create-poll",
  CreateQuiz = "create-quiz",
  JoinPoll = "join-poll",
  JoinQuiz = "join-quiz",
  WaitingRoom = "waiting-room",
  WaitingQuizRoom = "waiting-quiz-room",
  Voting = "voting",
  Quiz = "quiz",
  QuizResults = "quizs-results",
  Results = "results",
}

type Me = {
  id: string;
  name: string;
};

type WsError = {
  type: string;
  message: string;
};

interface AnswerOption {
  option: string;
  isCorrect: boolean;
}

export interface QuestionProps {
  question: string;
  answersOptions: AnswerOption[];
}

export interface AnswerUserProps {
  questionID: string;
  answerID: string;
  timestamp: number;
}

type WsErrorUnique = WsError & {
  id: string;
};
export type AppState = {
  isLoading: boolean;
  currentPage: AppPage;
  poll?: Poll;
  quiz?: Quiz;
  accessToken?: string;
  accessQuizToken?: string;
  socket?: Socket;
  wsErrors: WsErrorUnique[];
  me?: Me;
  meQuiz?: Me;
  isAdmin: boolean;
  isQuizAdmin: boolean;
  nominationCount: number;
  quizCount: number;
  participantCount: number;
  participantQuizCount: number;
  chatCount: number;
  chatQuizCount: number;
  canStartVote: boolean;
  canStartQuiz: boolean;
  hasVoted: boolean;
  hasAnswered: boolean;
  rangkingCount: number;
  userAnwersCount: number;
};

const state = proxy<AppState>({
  isLoading: false,
  currentPage: AppPage.Welcome,
  wsErrors: [],
  get me() {
    const accessToken = this.accessToken;
    if (!accessToken) {
      return;
    }
    const token = getTokenPayload(accessToken);
    return {
      id: token.sub,
      name: token.name,
    };
  },
  get meQuiz() {
    const accessQuizToken = this.accessQuizToken;
    if (!accessQuizToken) {
      return;
    }
    const token = getTokenPayload(accessQuizToken);
    return {
      id: token.sub,
      name: token.name,
    };
  },
  get isAdmin() {
    if (!this.me) {
      return false;
    }
    return this.me?.id === this.poll?.adminID;
  },
  get isQuizAdmin() {
    if (!this.meQuiz) {
      return false;
    }
    return this.meQuiz?.id === this.quiz?.adminID;
  },
  get participantCount() {
    return Object.keys(this.poll?.participants || {}).length;
  },
  get participantQuizCount() {
    return Object.keys(this.quiz?.participants || {}).length;
  },
  get nominationCount() {
    return Object.keys(this.poll?.nominations || {}).length;
  },
  get quizCount() {
    return Object.keys(this.quiz?.questions || {}).length;
  },
  get chatCount() {
    return Object.keys(this.poll?.chats || {}).length;
  },
  get chatQuizCount() {
    return Object.keys(this.quiz?.chats || {}).length;
  },
  get canStartVote() {
    const votesPerVoter = this.poll?.votesPerVoter ?? 100;

    return this.nominationCount >= votesPerVoter;
  },
  get canStartQuiz() {
    const maxQuestion = this.quiz?.maxQuestions ?? 100;

    return this.quizCount >= maxQuestion;
  },
  get hasVoted() {
    const rangkings = this.poll?.rangkings || {};
    const userID = this.me?.id || "";
    return rangkings[userID] !== undefined ? true : false;
  },
  get hasAnswered() {
    const answerUsers = this.quiz?.userAnswers || {};
    const userID = this.meQuiz?.id || "";

    // Periksa apakah kuis sudah dimulai
    const quizStarted = this.quiz?.hasStarted || false;

    if (!quizStarted) {
      // Jika kuis belum dimulai, kembalikan false
      return false;
    }
    // Ambil total pertanyaan yang harus dijawab
    const totalQuestions = Object.keys(this.quiz?.questions || {}).length;
    // Ambil total jawaban yang telah diberikan oleh pengguna
    const answeredQuestions = answerUsers[userID]?.length || 0;
    // Periksa apakah pengguna telah menjawab semua pertanyaan
    const allQuestionsAnswered = answeredQuestions === totalQuestions;
    console.log(totalQuestions, answeredQuestions);
    // Jika pengguna telah menjawab semua pertanyaan, redirect ke halaman hasil
    return allQuestionsAnswered;
  },
  get rangkingCount() {
    return Object.keys(this.poll?.rangkings || {}).length;
  },
  get userAnwersCount() {
    return Object.keys(this.quiz?.userAnswers || {}).length;
  },
});

const actions = {
  setPage: (page: AppPage): void => {
    state.currentPage = page;
  },
  startLoading: (): void => {
    state.isLoading = true;
  },
  stopLoading: (): void => {
    state.isLoading = false;
  },
  initializePoll: (poll?: Poll): void => {
    state.poll = poll;
  },
  initializeQuiz: (quiz?: Quiz): void => {
    state.quiz = quiz;
  },
  setPollAccessToken: (accessToken?: string): void => {
    state.accessToken = accessToken;
  },
  setQuizAccessToken: (accessQuizToken?: string): void => {
    state.accessQuizToken = accessQuizToken;
  },
  initializeSocket: (): void => {
    if (!state.socket) {
      state.socket = ref(
        createSocketWithHandlers({
          socketIOUrl,
          state,
          actions,
        })
      );
      return;
    }
    if (!state.socket.connected) {
      state.socket.connect();
      return;
    }

    actions.stopLoading();
  },
  initializeQuizSocket: (): void => {
    if (!state.socket) {
      state.socket = ref(
        createSocketQuizWithHandlers({
          socketIOUrlQuiz,
          state,
          actions,
        })
      );
      return;
    }
    if (!state.socket.connected) {
      state.socket.connect();
      return;
    }

    actions.stopLoading();
  },
  updatedPoll: (poll: Poll): void => {
    state.poll = poll;
  },
  updatedQuiz: (quiz: Quiz): void => {
    state.quiz = quiz;
  },
  nominate: (text: string): void => {
    state.socket?.emit("nominate", {
      text,
    });
  },
  submitQuiz: (quiz: QuestionProps): void => {
    state.socket?.emit("question_with_answer", quiz);
  },
  chat: (text: string): void => {
    state.socket?.emit("chat_message", {
      text,
    });
  },
  chatQuiz: (text: string): void => {
    state.socket?.emit("chat_quiz_message", {
      text,
    });
  },
  startOver: (): void => {
    actions.reset();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accessQuizToken");
    actions.setPage(AppPage.Welcome);
  },
  reset: (): void => {
    state.poll = undefined;
    state.accessToken = undefined;
    state.isLoading = false;
    state.socket?.disconnect();
    state.socket = undefined;
    state.wsErrors = [];
  },
  removeNomination: (nominationID: string): void => {
    state.socket?.emit("remove_nomination", { nominationID });
  },
  removeQuestion: (questionID: string): void => {
    state.socket?.emit("remove_question", { id: questionID });
  },
  removeParticipant: (userID: string): void => {
    console.log(userID);
    state.socket?.emit("remove_participant", { id: userID });
  },
  startVote: (): void => {
    state.socket?.emit("start_vote");
  },
  startQuiz: (): void => {
    state.socket?.emit("start_quiz");
  },
  submitRangkings: (rangkings: string[]): void => {
    state.socket?.emit("submit_rangkings", { rangkings });
  },
  submitUserQuiz: (answerUser: AnswerUserProps): void => {
    state.socket?.emit("submit_user_answer", { answerUser });
  },
  cancelPoll: (): void => {
    state.socket?.emit("cancel_poll");
  },
  closePoll: (): void => {
    state.socket?.emit("close_poll");
  },
  closeQuiz: (): void => {
    state.socket?.emit("close_quiz");
  },
  addWsError: (error: WsError): void => {
    state.wsErrors = [...state.wsErrors, { ...error, id: nanoid(6) }];
  },
  removeWsError: (id: string): void => {
    state.wsErrors = state.wsErrors.filter((error) => error.id !== id);
  },
};

subscribeKey(state, "accessToken", () => {
  if (state.accessToken) {
    localStorage.setItem("accessToken", state.accessToken);
  }
});

subscribeKey(state, "accessQuizToken", () => {
  if (state.accessQuizToken) {
    localStorage.setItem("accessQuizToken", state.accessQuizToken);
  }
});

export type AppActions = typeof actions;

export { state, actions };
