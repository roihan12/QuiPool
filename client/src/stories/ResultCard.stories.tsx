import React from "react";
import { Meta, StoryFn } from "@storybook/react";

import ResultCard from "../components/ui/ResultCard";
import { Results } from "shared/poll-types";

export default {
  title: "ResultCard",
  component: ResultCard,
} as Meta<typeof ResultCard>;

const Template: StoryFn<typeof ResultCard> = (args) => (
  <div className="max-w-sm m-auto h-screen">
    <ResultCard {...args} />
  </div>
);

const results: Results = [
  {
    nominationID: "1",
    score: 2.34,
    nominationText: "Taco Bell",
  },
  {
    nominationID: "2",
    score: 1.23,
    nominationText: "Taqueros",
  },
  {
    nominationID: "3",
    score: 3.2,
    nominationText: "Tacos",
  },
  {
    nominationID: "4",
    score: 1,
    nominationText: "Taco Bell",
  },
];

export const ResultCardLong = Template.bind({});
ResultCardLong.args = {
  results,
};
