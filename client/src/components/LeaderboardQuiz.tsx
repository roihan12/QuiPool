import React from "react";
import HorizontalSwipeList from "./ui/HorizontalSwipeList";
import { QuizResults } from "shared/quiz-types";
import ResultCardQuiz from "./ui/ResultCardQuiz";
import BottomSheet, { BottemSheetProps } from "./ui/BottomSheet";

type ResultsList = {
  results?: DeepReadonly<QuizResults>;
} & BottemSheetProps;

const LeaderBoardQuiz: React.FC<ResultsList> = ({
  results,
  isOpen,
  onClose,
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="mx-auto max-h-full flex flex-col p-10">
        <HorizontalSwipeList>
          {results?.map((result, i) => (
            // Can use index as we'll never change list
            <ResultCardQuiz key={i} result={result} />
          ))}
        </HorizontalSwipeList>
      </div>
    </BottomSheet>
  );
};

export default LeaderBoardQuiz;
