"use client";
import React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuizResults } from "shared/quiz-types";

type ResultsQuizList = {
  results?: DeepReadonly<QuizResults>;
};

const ResultQuizList: React.FC<ResultsQuizList> = ({ results }) => {
  return (
    <Table className="mt-4">
      <TableCaption>End of list.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[10px]">No.</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <>
          {results?.map((result, index) => {
            return (
              <TableRow key={result.userID}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <span className="font-semibold">{result.name}</span>
                </TableCell>
                <TableCell className={`font-semibold`}>
                  {result.score.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </>
      </TableBody>
    </Table>
  );
};

export default ResultQuizList;
