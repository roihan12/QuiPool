import { Poll } from "shared/poll-types";
import { proxy } from "valtio";
import { derive } from "valtio/utils";
import { getTokenPayload } from "./util";

export enum AppPage {
  Welcome = "welcome",
  CreatePoll = "create-poll",
  JoinPoll = "join-poll",
  WaitingRoom = "waiting-room",
}

type Me = {
  id: string;
  name: string;
};
export type AppState = {
  isLoading: boolean;
  currentPage: AppPage;
  poll?: Poll;
  accessToken?: string;
  me?: Me;
};

const state: AppState = proxy({
  isLoading: false,
  currentPage: AppPage.Welcome,
});

const stateWithComputed: AppState = derive(
  {
    me: (get) => {
      const accessToken = get(state).accessToken;
      if (!accessToken) {
        return;
      }
      const token = getTokenPayload(accessToken);
      return {
        id: token.sub,
        name: token.name,
      };
    },
    isAdmin: (get) => {
      if (!get(state).me) {
        return false;
      }
      return get(state).me?.id === get(state).poll?.adminID;
    },
  },
  { proxy: state }
);

const actions = {
  setPage: (page: AppPage): void => {
    state.currentPage = page;
  },
  startOver: (): void => {
    actions.setPage(AppPage.Welcome);
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
};

export { stateWithComputed as state, actions };
