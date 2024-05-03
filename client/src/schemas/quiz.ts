import { z } from "zod";

export const quizCreationSchema = z.object({
  topic: z
    .string()
    .min(4, {
      message: "Topic must be at least 4 characters long",
    })
    .max(100, {
      message: "Topic must be at most 50 characters long",
    }),
  name: z
    .string()
    .min(4, {
      message: "Name must be at least 4 characters long",
    })
    .max(25, {
      message: "Name must be at most 100 characters long",
    }),
  description: z
    .string()
    .min(4, {
      message: "Description must be at least 4 characters long",
    })
    .max(200, {
      message: "Description must be at most 50 characters long",
    }),
  maxParticipants: z.number().min(1).max(20),
  maxQuestions: z.number().min(1).max(25),
});

export const joinQuiz = z.object({
  quizID: z
    .string()
    .min(6, {
      message: "Code must be 6 characters",
    })
    .max(6, {
      message: "Code must be 6 characters",
    }),
  name: z
    .string()
    .min(4, {
      message: "Name must be at least 4 characters long",
    })
    .max(25, {
      message: "Name must be at most 25 characters long",
    }),
});


const AnswerOptionSchema = z.object({
  option: z.string(),
  isCorrect: z.boolean(),
});

export const QuestionSchema = z.object({
  question: z.string(),
  answersOptions: z.array(AnswerOptionSchema),
});


