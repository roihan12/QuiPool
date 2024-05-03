import { z } from "zod";

export const checkAnswerSchema = z.object({
  questionID: z.string(),
  answerID: z.string(),
  timestamp: z.number(),
});

export const endQuizSchema = z.object({
  quizId: z.string(),
});
