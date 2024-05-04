import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BsAward, BsTrophy } from "react-icons/bs";
import { QuizResult } from "shared/quiz-types";
type ResultCard = {
  result: DeepReadonly<QuizResult>;
};

const WinnerQuiz: React.FC<ResultCard> = ({ result }) => {
  return (
    <Card className="md:col-span-7">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-2xl font-bold">Winner</CardTitle>
        <BsAward />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-3/5">
        <BsTrophy className="mr-4" stroke="gold" size={50} />
        <div className="flex flex-col text-2xl font-semibold text-purple-600 text-center">
          <span className="">
            {result.name} : {result.score}{" "}
          </span>
          <span className="text-sm text-center text-black opacity-50">
            Selamat untuk pencapaianmu yang luar biasa! 🎉🏆
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WinnerQuiz;
