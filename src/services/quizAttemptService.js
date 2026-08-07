import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  ATTEMPT_STATUSES,
  createInitialAnswerState,
  formatAnswersForFirestore,
  getDeviceMetadata,
} from '../utils/quizAttempt';

function getAttemptCollectionReference(userId) {
  return collection(db, 'users', userId, 'quizAttempts');
}

function getAttemptDocumentReference(userId, attemptId) {
  return doc(db, 'users', userId, 'quizAttempts', attemptId);
}

export async function loadActiveQuizAttempt({ quizSlug, userId }) {
  if (!userId || !quizSlug) return null;

  const q = query(
    getAttemptCollectionReference(userId),
    where('quizSlug', '==', quizSlug),
    where('status', '==', ATTEMPT_STATUSES.IN_PROGRESS),
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const activeDocs = snapshot.docs.map((documentSnapshot) => ({
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  }));

  if (activeDocs.length > 1) {
    activeDocs.sort((a, b) => {
      const aTime = a.startedAt?.toMillis ? a.startedAt.toMillis() : 0;
      const bTime = b.startedAt?.toMillis ? b.startedAt.toMillis() : 0;
      return bTime - aTime;
    });
    const [latest, ...duplicates] = activeDocs;
    for (const duplicate of duplicates) {
      updateDoc(getAttemptDocumentReference(userId, duplicate.id), {
        canResume: false,
        status: ATTEMPT_STATUSES.ABANDONED,
        updatedAt: serverTimestamp(),
      }).catch((error) => console.error('Failed to abandon duplicate attempt:', error));
    }
    return latest;
  }

  return activeDocs[0];
}

export async function loadUserAttemptsForQuiz({ userId, quizSlug }) {
  if (!userId || !quizSlug) return [];

  const q = query(
    getAttemptCollectionReference(userId),
    where('quizSlug', '==', quizSlug)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })).sort((a, b) => {
    const aTime = a.startedAt?.toMillis ? a.startedAt.toMillis() : 0;
    const bTime = b.startedAt?.toMillis ? b.startedAt.toMillis() : 0;
    return bTime - aTime;
  });
}

export async function loadUserQuizAttempts(userId) {
  if (!userId) return {};

  const snapshot = await getDocs(getAttemptCollectionReference(userId));
  const summary = {};

  snapshot.docs.forEach((documentSnapshot) => {
    const data = documentSnapshot.data();
    const slug = data.quizSlug;
    if (!slug) return;

    if (!summary[slug]) {
      summary[slug] = {
        activeAttempt: null,
        completedAttempts: [],
      };
    }

    const attemptObj = { id: documentSnapshot.id, ...data };
    if (data.status === ATTEMPT_STATUSES.IN_PROGRESS) {
      if (!summary[slug].activeAttempt) {
        summary[slug].activeAttempt = attemptObj;
      }
    } else if (data.status === ATTEMPT_STATUSES.COMPLETED) {
      summary[slug].completedAttempts.push(attemptObj);
    }
  });

  return summary;
}

export async function createQuizAttempt({ quiz, user }) {
  if (!user?.uid) {
    throw new Error('Your sign-in session is not available. Please sign in again.');
  }

  const existingActive = await loadActiveQuizAttempt({ quizSlug: quiz.slug, userId: user.uid });
  if (existingActive) {
    throw new Error('An active attempt already exists for this quiz. Please resume it instead of starting a new one.');
  }

  const attemptDocRef = doc(getAttemptCollectionReference(user.uid));
  const initialAnswers = formatAnswersForFirestore(createInitialAnswerState(quiz.questions));

  await setDoc(attemptDocRef, {
    answers: initialAnswers,
    canResume: true,
    completedAt: null,
    correctAnswers: 0,
    currentQuestionIndex: 0,
    device: getDeviceMetadata(),
    percentage: 0,
    quizSlug: quiz.slug,
    quizTitle: quiz.title,
    resumeCount: 0,
    runtime: {
      currentQuestionIndex: 0,
      remainingSeconds: Number(quiz.questions?.[0]?.timeRemainingSeconds ?? 30),
      updatedAt: serverTimestamp(),
    },
    score: 0,
    skippedAnswers: 0,
    startedAt: serverTimestamp(),
    status: ATTEMPT_STATUSES.IN_PROGRESS,
    submittedAt: null,
    totalQuestions: quiz.totalQuestions,
    totalTimeTaken: 0,
    updatedAt: serverTimestamp(),
    userId: user.uid,
    wrongAnswers: 0,
  });

  return attemptDocRef.id;
}

export async function updateQuizAttemptRuntime({
  answers,
  attemptId,
  currentQuestionIndex,
  isResume = false,
  remainingSeconds,
  totalTimeTaken = 0,
  userId,
}) {
  if (!userId || !attemptId) return;

  const updatePayload = {
    answers: formatAnswersForFirestore(answers),
    currentQuestionIndex: Number(currentQuestionIndex) || 0,
    runtime: {
      currentQuestionIndex: Number(currentQuestionIndex) || 0,
      remainingSeconds: Number(remainingSeconds ?? 0),
      updatedAt: serverTimestamp(),
    },
    totalTimeTaken: Number(totalTimeTaken) || 0,
    updatedAt: serverTimestamp(),
  };

  if (isResume) {
    updatePayload.resumeCount = increment(1);
  }

  await updateDoc(getAttemptDocumentReference(userId, attemptId), updatePayload);
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

  const attemptDocRef = getAttemptDocumentReference(user.uid, attemptId);

  await updateDoc(attemptDocRef, {
    answers: formatAnswersForFirestore(result.answers),
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
    updatedAt: serverTimestamp(),
    wrongAnswers: result.wrongAnswers,
  });
}

