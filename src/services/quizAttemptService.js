import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ATTEMPT_STATUSES } from '../utils/quizAttempt';

function getAttemptCollectionReference(userId) {
  return collection(db, 'users', userId, 'quizAttempts');
}

function getAttemptDocumentReference(userId, attemptId) {
  return doc(db, 'users', userId, 'quizAttempts', attemptId);
}

export async function createQuizAttempt({ quiz, user }) {
  if (!user?.uid) {
    throw new Error('Your sign-in session is not available. Please sign in again.');
  }

  const attemptReference = await addDoc(getAttemptCollectionReference(user.uid), {
    answers: [],
    canResume: true,
    completedAt: null,
    correctAnswers: 0,
    currentQuestionIndex: 0,
    percentage: 0,
    quizSlug: quiz.slug,
    quizTitle: quiz.title,
    score: 0,
    skippedAnswers: 0,
    startedAt: serverTimestamp(),
    status: ATTEMPT_STATUSES.IN_PROGRESS,
    submittedAt: null,
    totalQuestions: quiz.totalQuestions,
    totalTimeTaken: 0,
    userId: user.uid,
    wrongAnswers: 0,
  });

  return attemptReference.id;
}

export async function completeQuizAttempt({
  attemptId,
  currentQuestionIndex,
  result,
  user,
}) {
  if (!user?.uid || !attemptId) {
    throw new Error('This quiz attempt could not be completed because the session is missing.');
  }

  await updateDoc(getAttemptDocumentReference(user.uid, attemptId), {
    answers: result.answers,
    canResume: false,
    completedAt: serverTimestamp(),
    correctAnswers: result.correctAnswers,
    currentQuestionIndex,
    percentage: result.percentage,
    score: result.score,
    skippedAnswers: result.skippedAnswers,
    status: ATTEMPT_STATUSES.COMPLETED,
    submittedAt: serverTimestamp(),
    totalQuestions: result.totalQuestions,
    totalTimeTaken: result.totalTimeTaken,
    wrongAnswers: result.wrongAnswers,
  });
}
