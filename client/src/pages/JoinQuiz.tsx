import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppPage, actions } from "@/state";
import { cn } from "@/lib/utils";
import { Quiz } from "shared/quiz-types";
import { makeRequest } from "@/api";

const JoinQuiz: React.FC = () => {
  const [quizID, setQuizID] = useState("");
  const [name, setName] = useState("");
  const [apiError, setApiError] = useState("");

  const areFieldsValid = (): boolean => {
    if (quizID.length < 6 || quizID.length > 6) {
      return false;
    }
    if (name.length < 1 || name.length > 25) {
      return false;
    }
    return true;
  };

  const handleJoinQuiz = async () => {
    try {
      actions.startLoading();
      setApiError("");

      const { data, error } = await makeRequest<{
        quiz: Quiz;
        accessToken: string;
      }>("/quizs/join", {
        method: "POST",
        body: JSON.stringify({
          quizID,
          name,
        }),
      });

      if (error) {
        if (error.statusCode === 400) {
          setApiError("Name and Quiz ID are both required!");
        } else {
          setApiError(error.messages[0]);
        }
      } else {
        actions.initializeQuiz(data.quiz);
        actions.setQuizAccessToken(data.accessToken);
        actions.setPage(AppPage.WaitingQuizRoom);
      }
    } catch (err) {
      console.error("An error occurred while joining quiz:", err);
      setApiError(
        "An error occurred while joining quiz. Please try again later."
      );
    } finally {
      actions.stopLoading();
    }
  };

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card
        className={cn(
          "w-[480px] mt-10 border-2 border-b-4 border-r-4 border-violet-500  max-sm:w-[280px]"
        )}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold ">Join Quiz</CardTitle>
          <CardDescription>Enter your quiz code</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="mb-12">
            <div className="my-4">
              <h3 className="text-center">
                {" "}
                Enter Code Provided by &quot;Friend&quot;
              </h3>
              <div className="text-center w-full">
                <input
                  maxLength={6}
                  onChange={(e) => setQuizID(e.target.value.toUpperCase())}
                  className="box info w-full"
                  autoCapitalize="characters"
                  style={{ textTransform: "uppercase" }}
                />
              </div>
            </div>
            <div className="my-4">
              <h3 className="text-center">Enter Your Name</h3>
              <div className="text-center w-full">
                <input
                  maxLength={25}
                  onChange={(e) => setName(e.target.value)}
                  className="box info w-full"
                />
              </div>
            </div>
            {apiError && (
              <p className="text-red-600 text-center font-light mt-8">
                {apiError}
              </p>
            )}
          </div>
          <div className="my-12 flex flex-col justify-center items-center">
            <button
              className="box btn-orange w-32 my-2"
              disabled={!areFieldsValid()}
              onClick={handleJoinQuiz}
            >
              Join
            </button>
            <button
              className="box btn-purple w-32 my-2"
              onClick={() => actions.startOver()}
            >
              Start Over
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinQuiz;
