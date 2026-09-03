import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

function toMillis(value) {
  if (!value) return null;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.toDate === 'function') return value.toDate().getTime();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

export function isQuizAvailableNow(quiz, now = Date.now()) {
  const publishAt = toMillis(quiz?.publishAt);
  const expireAt = toMillis(quiz?.expireAt);

  return quiz?.status === 'ACTIVE'
    && (publishAt === null || publishAt <= now)
    && (expireAt === null || expireAt > now);
}

export async function loadActiveQuizBySlug(slug) {
  const quizSnapshot = await getDocs(query(
    collection(db, 'quizzes'),
    where('slug', '==', slug),
    where('status', '==', 'ACTIVE'),
    limit(1),
  ));

  if (quizSnapshot.empty) {
    throw new Error('This concept does not exist, is inactive, or was removed.');
  }

  const quizDocument = quizSnapshot.docs[0];
  const quiz = {
    id: quizDocument.id,
    ...quizDocument.data(),
  };

  if (!isQuizAvailableNow(quiz)) {
    throw new Error('This concept is not available right now.');
  }

  return quiz;
}
