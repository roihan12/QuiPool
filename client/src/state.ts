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
  nominationCount: number;
  participantCount: number;
  participantQuizCount: number;
  chatCount: number;
  canStartVote: boolean;
  hasVoted: boolean;
  hasAnswered: boolean;
  rangkingCount: number;
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
  get participantCount() {
    return Object.keys(this.poll?.participants || {}).length;
  },
  get participantQuizCount() {
    return Object.keys(this.quiz?.participants || {}).length;
  },
  get nominationCount() {
    return Object.keys(this.poll?.nominations || {}).length;
  },
  get chatCount() {
    return Object.keys(this.poll?.chats || {}).length;
  },
  get canStartVote() {
    const votesPerVoter = this.poll?.votesPerVoter ?? 100;

    return this.nominationCount >= votesPerVoter;
  },
  get hasVoted() {
    const rangkings = this.poll?.rangkings || {};
    const userID = this.me?.id || "";
    return rangkings[userID] !== undefined ? true : false;
  },
  get hasAnswered() {
    const answerUsers = this.quiz?.userAnswers || {};
    const userID = this.me?.id || "";
    return answerUsers[userID] !== undefined ? true : false;
  },
  get rangkingCount() {
    return Object.keys(this.poll?.rangkings || {}).length;
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
  removeParticipant: (userID: string): void => {
    console.log(userID);
    state.socket?.emit("remove_participant", { id: userID });
  },
  startVote: (): void => {
    state.socket?.emit("start_vote");
  },
  submitRangkings: (rangkings: string[]): void => {
    state.socket?.emit("submit_rangkings", { rangkings });
  },
  cancelPoll: (): void => {
    state.socket?.emit("cancel_poll");
  },
  closePoll: (): void => {
    state.socket?.emit("close_poll");
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
