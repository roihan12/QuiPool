import { joinQuiz, quizCreationSchema } from "@/schemas/quiz";
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
import { state } from "@/state";
import { cn } from "@/lib/utils";

type Input = z.infer<typeof joinQuiz>;

const JoinQuiz = () => {
  const currentState = useSnapshot(state);
  const form = useForm<Input>({
    resolver: zodResolver(quizCreationSchema),
  });
  const onSubmit = async () => {};
  form.watch();
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card
        className={cn(
          "w-[480px] mt-10 border-2 border-b-4 border-r-4 border-violet-500  max-sm:w-[380px]"
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
                name="quizID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Code Provided by Host"
                        {...field}
                      />
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

              <Button
                disabled={currentState.isLoading}
                type="submit"
                className={cn(
                  "rounded-lg border-2 border-b-4 border-r-4 border-violet-500 px-2 py-1 text-base font-medium transition-all hover:-translate-y-[2px] md:block font-Nunito "
                )}
                variant={"ghost"}
              >
                Join
              </Button>

              <Button
                disabled={currentState.isLoading}
                type="submit"
                className={cn(
                  "rounded-lg border-2 border-b-4 border-r-4 border-violet-500 px-2 py-1 text-base font-medium transition-all hover:-translate-y-[2px] md:block font-Nunito "
                )}
                variant={"default"}
              >
                Start Over
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinQuiz;
