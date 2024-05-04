import { quizCreationSchema } from "@/schemas/quiz";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSnapshot } from "valtio";
import { AppPage, state } from "@/state";
import { cn } from "@/lib/utils";
import { actions } from "../state";
import { useToast } from "@/components/ui/use-toast";
import { makeRequest } from "@/api";
import { Quiz } from "shared/quiz-types";

type Input = z.infer<typeof quizCreationSchema>;

const CreateQuiz: React.FC = () => {
  const currentState = useSnapshot(state);
  const { toast } = useToast();

  const form = useForm<Input>({
    resolver: zodResolver(quizCreationSchema),
    defaultValues: {
      topic: "",
      maxParticipants: 2,
      maxQuestions: 5,
    },
  });
  const onSubmit = async (dataForm: Input) => {
    actions.startLoading();

    const { data, error } = await makeRequest<{
      quiz: Quiz;
      accessToken: string;
    }>("/quizs", {
      method: "POST",
      body: JSON.stringify({
        topic: dataForm.topic,
        maxParticipants: dataForm.maxParticipants,
        name: dataForm.name,
        maxQuestions: dataForm.maxQuestions,
        description: dataForm.description,
      }),
    });
    console.log(data, error);

    if (error && error.statusCode === 400) {
      console.log("400 error", error);
      toast({
        title: "Error",
        description: error.messages[0],
        variant: "destructive",
      });
    } else if (error && error.statusCode !== 400) {
      toast({
        title: "Error",
        description: error.messages[0],
        variant: "destructive",
      });
    } else {
      actions.initializeQuiz(data.quiz);
      actions.setQuizAccessToken(data.accessToken);
      actions.setPage(AppPage.WaitingQuizRoom);
    }

    actions.stopLoading();
  };
  form.watch();
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 pt-20">
      <Card
        className={cn(
          "w-[480px]  border-2 border-b-4 border-r-4 border-violet-500  max-sm:w-[280px]"
        )}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold ">Create Quiz</CardTitle>
          <CardDescription>Choose a topic</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a topic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="How many questions?"
                        type="number"
                        {...field}
                        onChange={(e) => {
                          form.setValue(
                            "maxQuestions",
                            parseInt(e.target.value)
                          );
                        }}
                        min={1}
                        max={25}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Participants</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="How many questions?"
                        type="number"
                        {...field}
                        onChange={(e) => {
                          form.setValue(
                            "maxParticipants",
                            parseInt(e.target.value)
                          );
                        }}
                        min={1}
                        max={20}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center items-center space-x-4">
                <Button
                  disabled={currentState.isLoading}
                  type="submit"
                  className={cn(
                    "rounded-lg border-2 border-b-4 border-r-4 border-violet-500 px-2 py-1 text-base font-medium transition-all hover:-translate-y-[2px] md:block font-Nunito "
                  )}
                  variant={"ghost"}
                >
                  Create Quiz
                </Button>
                <Button
                  onClick={() => actions.startOver()}
                  className={cn(
                    "rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-base font-medium transition-all hover:-translate-y-[2px] md:block font-Nunito "
                  )}
                  variant={"ghost"}
                >
                  Back
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateQuiz;
