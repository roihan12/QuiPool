import { Quiz, QuizResult } from 'shared';

export default (quiz: Quiz): QuizResult[] => {
  const quizResults: QuizResult[] = [];

  // Iterasi setiap partisipan dalam userAnswers
  for (const userID in quiz.userAnswers) {
    if (quiz.userAnswers.hasOwnProperty(userID)) {
      const userName = quiz.participants[userID];
      const userAnswers = quiz.userAnswers[userID];

      // Cari pengguna dalam hasil kuis sebelumnya
      let userResultIndex = quizResults.findIndex(
        (result) => result.userID === userID,
      );

      // Hitung skor pengguna
      const score = calculateUserScore(userAnswers, quiz.questions);

      // Jika pengguna sudah ada dalam hasil kuis sebelumnya, tambahkan skor baru dengan skor sebelumnya
      if (userResultIndex !== -1) {
        quizResults[userResultIndex].score += score;
      } else {
        // Buat objek hasil kuis baru untuk pengguna
        const userResult = { userID, name: userName, score };

        // Tambahkan hasil kuis baru ke dalam hasil kuis
        quizResults.push(userResult);
      }
    }
  }

  return quizResults;
};

function calculateUserScore(userAnswers: any[], questions: any): number {
  const maxScorePerQuestion = 100; // Skor maksimum yang diberikan untuk setiap jawaban benar
  let totalScore = 0;

  // Iterasi setiap jawaban pengguna
  for (const userAnswer of userAnswers) {
    const questionID = userAnswer.questionId;
    const answerID = userAnswer.answerId;

    // Dapatkan pertanyaan yang sesuai dengan jawaban pengguna
    const question = questions[questionID];

    // Pastikan pertanyaan ada dan jawaban diberikan oleh pengguna
    if (question && question.answers && question.answers[answerID]) {
      const userAnswerIsCorrect = question.answers[answerID].isCorrect;

      // Jika jawaban benar, tambahkan skor maksimum per pertanyaan
      if (userAnswerIsCorrect) {
        totalScore += maxScorePerQuestion;
      }
    }
  }

  return totalScore;
}
