import React from "react";
import { QuizResult} from "shared/quiz-types";

type ResultCard = {
  result: DeepReadonly<QuizResult>;
};

const ResultCardQuiz: React.FC<ResultCard> = ({ result }) => {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 pb-2 my-2 border-b-2 border-solid border-purple-70 pr-4">
        <div className="col-span-2 font-semibold">Name</div>
        <div className="col-span-1 font-semibold text-right">Score</div>
      </div>
      <div className="divide-y-2 overflow-y-auto pr-4">
          <div
            key={result.userID}
            className="grid grid-cols-3 gap-4 my-1 items-center"
          >
            <div className="col-span-2">{result.name}</div>
            <div className="col-span-1 text-right">
              {result.score.toFixed(2)}
            </div>
          </div>
      </div>
    </>
  );
};

export default ResultCardQuiz;
