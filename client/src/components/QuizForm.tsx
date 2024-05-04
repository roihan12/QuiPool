import React from "react";

import BottomSheet, { BottemSheetProps } from "./ui/BottomSheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { QuestionSchema } from "@/schemas/quiz";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";
import { QuestionProps } from "@/state";

type QuizFormProps = {
  title?: string;
  onSubmitQuestion: (question: QuestionProps) => void;
} & BottemSheetProps;

const QuizForm: React.FC<QuizFormProps> = ({
  isOpen,
  onClose,
  title,
  onSubmitQuestion,
}) => {
  const form = useForm<z.infer<typeof QuestionSchema>>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      question: "",
      answersOptions: [{ option: "test", isCorrect: false }],
    },
    mode: "onBlur",
  });
  const { fields, append, remove } = useFieldArray({
    name: "answersOptions",
    control: form.control,
  });

  function onSubmit(data: z.infer<typeof QuestionSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    console.log(data);
    onSubmitQuestion(data);
    form.reset();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 ">
        <Card
          className={cn(
            "w-[480px] border-2 border-b-4 border-r-4 border-violet-500 max-sm:w-[380px]"
          )}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold ">
              Create Question {title}
            </CardTitle>
            <CardDescription>Choose a topic</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                <div className="space-y-4 overflow-y-auto md:h-72 lg:h-[280px]">
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Input placeholder="shadcn" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your question.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    className="box btn-orange mx-2"
                    variant={"outline"}
                    size={"default"}
                    onClick={() =>
                      append({
                        option: "",
                        isCorrect: false,
                      })
                    }
                  >
                    Add option
                  </Button>
                  {fields.map((field, index) => {
                    return (
                      <div key={field.id} className="flex flex-col ">
                        <section className={"space-y-2"} key={field.id}>
                          <FormField
                            control={form.control}
                            name={`answersOptions.${index}.option`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Option</FormLabel>
                                <FormControl className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <Input placeholder="shadcn" {...field} />
                                </FormControl>
                                <FormDescription>
                                  This is your option.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`answersOptions.${index}.isCorrect`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-1">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-sm">
                                    IsCorrect
                                  </FormLabel>
                                  <FormDescription>
                                    If is option is correct please check
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <Button
                            variant={"destructive"}
                            size={"sm"}
                            type="button"
                            onClick={() => remove(index)}
                          >
                            DELETE
                          </Button>
                        </section>
                      </div>
                    );
                  })}
                </div>

                <Button
                  className="box btn-purple"
                  variant={"outline"}
                  type="submit"
                >
                  Submit
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </BottomSheet>
  );
};

export default QuizForm;
