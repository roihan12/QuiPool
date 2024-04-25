import { proxy } from "valtio";

export enum AppPage {
  Welcome = "welcome",
  CreatePoll = "create-poll",
  JoinPoll = "join-poll",
}

export type AppState = {
  currentPage: AppPage;
};

const state: AppState = proxy({
  currentPage: AppPage.Welcome,
});

const actions = {
  setPage: (page: AppPage): void => {
    state.currentPage = page;
  },
};

export { state, actions };
