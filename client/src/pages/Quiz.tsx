import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { checkAnswerSchema } from "@/schemas/question";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useSnapshot } from "valtio";
import { AppPage, actions, state } from "@/state";
import { MdOutlineLeaderboard, MdOutlineTimer } from "react-icons/md";
import { LuChevronRight, LuLoader2 } from "react-icons/lu";
import LeaderBoardQuiz from "@/components/LeaderboardQuiz";

const Quiz: React.FC = () => {
  const currentState = useSnapshot(state);
  const questionLength =
    Object.keys(currentState.quiz?.questions || {}).length ?? 0;

  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [hasEnded, setHasEnded] = React.useState(false);
  const [selectedChoice, setSelectedChoice] = React.useState<number>(0);
  const [timer, setTimer] = React.useState<number>(10);
  const id = React.useRef<number | null>(null);
  const [isLeaderboardQuizOpen, setIsLeaderboardQuizOpen] =
    React.useState(false);
  const currentQuestionID = React.useMemo(() => {
    return Object.keys(currentState.quiz?.questions || {})[questionIndex];
  }, [questionIndex, currentState.quiz?.questions]);

  const currentQuestion = React.useMemo(() => {
    return currentState.quiz?.questions
      ? currentState.quiz.questions[currentQuestionID]
      : null;
  }, [currentQuestionID, currentState.quiz?.questions]);

  const options = React.useMemo(() => {
    console.log("currentQuestion", currentQuestion);
    if (!currentQuestion) return [];
    if (!currentQuestion.answers) return [];
    return currentQuestion.answers.map((answer) => ({
      id: answer.id,
      text: answer.text,
    }));
  }, [currentQuestion]);

  const { toast } = useToast();

  const handleNext = React.useCallback(() => {
    actions.startLoading();
    if (!currentQuestion) {
      setHasEnded(true);
      actions.setPage(AppPage.QuizResults);
      return;
    }
    // Periksa apakah selectedChoice telah terdefinisi
    if (selectedChoice !== undefined && options[selectedChoice] !== undefined) {
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionID: currentQuestion?.id ?? "",
        answerID: options[selectedChoice].id,
        timestamp: timer,
      };
      console.log(payload);
      actions.submitUserQuiz(payload);
    }
    setQuestionIndex((questionIndex) => questionIndex + 1);
    toast({
      title: "Correct",
      description: "You got it right!",
      variant: "default",
    });
    actions.stopLoading();
  }, [toast, options, selectedChoice, currentQuestion, timer]);

  React.useEffect(() => {
    setTimer(10);
  }, [questionIndex]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      console.log(key);
      if (key === "1") {
        setSelectedChoice(0);
      } else if (key === "2") {
        setSelectedChoice(1);
      } else if (key === "3") {
        setSelectedChoice(2);
      } else if (key === "4") {
        setSelectedChoice(3);
      } else if (key === "Enter") {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext]);

  const clear = () => {
    if (id.current) {
      window.clearInterval(id.current);
    }
  };

  React.useEffect(() => {
    id.current = window.setInterval(() => {
      setTimer((time) => time - 1);
    }, 1000);
    return () => clear();
  }, []);

  React.useEffect(() => {
    if (timer === 0) {
      handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  return (
    <>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 md:w-[25vw] max-w-4xl w-[90vw] top-1/2 left-1/2 pt-20">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            {/* topic */}
            <p>
              <span className="text-slate-400">Topic</span> &nbsp;
              <span className="px-2 py-1 text-white rounded-lg bg-slate-800">
                {currentState.quiz?.topic}
              </span>
            </p>
            <div className="flex self-start mt-3 text-slate-400">
              <MdOutlineTimer size={24} className="mr-2" />
              {timer}
            </div>
          </div>
        </div>
        <div className="flex self-end justify-end mt-3 text-slate-400">
          <button
            className="box btn-orange mx-2 pulsate"
            onClick={() => setIsLeaderboardQuizOpen(true)}
          >
            <MdOutlineLeaderboard size={24} /> <span>Leaderboard</span>
          </button>
        </div>
        <Card className="w-full mt-4">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="mr-5 text-center divide-y divide-zinc-600/50">
              <div>{questionIndex + 1}</div>
              <div className="text-base text-slate-400">{questionLength}</div>
            </CardTitle>
            <CardDescription className="flex-grow text-lg">
              {currentQuestion?.text}
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="flex flex-col items-center justify-center w-full mt-4">
          {options.map((option, index) => {
            return (
              <Button
                key={option.id}
                variant={selectedChoice === index ? "default" : "outline"}
                className="justify-start w-full py-8 mb-4"
                onClick={() => setSelectedChoice(index)}
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
          <Button
            variant="default"
            className="mt-2"
            size="lg"
            disabled={currentState.isLoading || hasEnded}
            onClick={() => {
              handleNext();
            }}
          >
            {currentState.isLoading && (
              <LuLoader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {hasEnded ? "Finish" : "Next"}{" "}
            <LuChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
      <LeaderBoardQuiz
        isOpen={isLeaderboardQuizOpen}
        onClose={() => setIsLeaderboardQuizOpen(false)}
        results={currentState.quiz?.results || []}
      />
    </>
  );
};

export default Quiz;
