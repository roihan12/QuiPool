export interface Participants {
  [participantID: string]: string;
}

export type Nomination = {
  userID: string;
  text: string;
};

export interface Nominations {
  [nominationID: string]: Nomination;
}
export interface Poll {
  id: string;
  topic: string;
  votesPerVoter: number;
  participants: Participants;
  adminID: string;
  nominations: Nominations;
  //   rangkings: Rangkings;
  //   results: Resuults;
  hasStarted: boolean;
}
