import { Poll } from "shared/poll-types";
import { proxy, ref } from "valtio";
import { subscribeKey } from "valtio/utils";
import { getTokenPayload } from "./util";
import { Socket } from "socket.io-client";
import { createSocketWithHandlers, socketIOUrl } from "./socket-io";
import { nanoid } from "nanoid";

export enum AppPage {
  Welcome = "welcome",
  CreatePoll = "create-poll",
  JoinPoll = "join-poll",
  WaitingRoom = "waiting-room",
  Voting = "voting",
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
  accessToken?: string;
  socket?: Socket;
  wsErrors: WsErrorUnique[];
  me?: Me;
  isAdmin: boolean;
  nominationCount: number;
  participantCount: number;
  chatCount: number;
  canStartVote: boolean;
  hasVoted: boolean;
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
  get isAdmin() {
    if (!this.me) {
      return false;
    }
    return this.me?.id === this.poll?.adminID;
  },
  get participantCount() {
    return Object.keys(this.poll?.participants || {}).length;
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
  setPollAccessToken: (accessToken?: string): void => {
    state.accessToken = accessToken;
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
  updatedPoll: (poll: Poll): void => {
    state.poll = poll;
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
  startOver: (): void => {
    actions.reset();
    localStorage.removeItem("accessToken");
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

export type AppActions = typeof actions;

export { state, actions };
