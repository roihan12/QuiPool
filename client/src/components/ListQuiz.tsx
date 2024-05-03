import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { QuestionWithAnswers, QuestionsAnswers } from "shared/quiz-types";
import { Button } from "./ui/button";
import BottomSheet, { BottemSheetProps } from "./ui/BottomSheet";
import { string } from "zod";

type Props = {
  topic?: string;
  questions: QuestionsAnswers | object;
  isOpen: boolean;
  onClose: () => void;
} & BottemSheetProps;

const ListQuiz = (props: Props) => {
  return (
    <BottomSheet isOpen={props.isOpen} onClose={props.onClose}>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 md:w-[25vw] max-w-4xl top-1/2 left-1/2 h-full overflow-y-auto overflow-x-hidden">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            {/* topic */}
            <p>
              <span className="text-slate-400">Topic</span> &nbsp;
              <span className="px-2 py-1 text-white rounded-lg bg-slate-800">
                {props.topic}
              </span>
            </p>
          </div>
        </div>
        {props.questions &&
          Object.keys(props.questions).map((questionID, index) => {
            const question: QuestionWithAnswers =
              props.questions[questionID as keyof typeof string];
            return (
              <>
                <Card className="w-full mt-4" key={questionID}>
                  <CardHeader className="flex flex-row items-center">
                    <CardTitle className="mr-5 text-center divide-y divide-zinc-600/50">
                      <div>{index + 1}</div>
                      <div className="text-base text-slate-400">
                        {Object.entries(props.questions).length}
                      </div>
                    </CardTitle>
                    <CardDescription className="flex-grow text-lg">
                      {question.text}
                    </CardDescription>
                  </CardHeader>
                </Card>
                <div className="flex flex-col items-center justify-center w-full mt-4">
                  {question.answers.map((option, index) => {
                    return (
                      <Button
                        key={option.id}
                        className="justify-start w-full py-8 mb-4"
                      >
                        <div className="flex items-center justify-start">
                          <div className="p-2 px-3 mr-5 border rounded-md">
                            {index + 1}
                          </div>
                          <div className="text-start">{option.text}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </>
            );
          })}
      </div>
    </BottomSheet>
  );
};

export default ListQuiz;
