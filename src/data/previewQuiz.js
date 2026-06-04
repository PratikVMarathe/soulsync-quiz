// Standalone preview data for developing the quiz remote without a host route or Firestore lookup.
export const previewQuiz = {
  title: 'Concept 1: Focus',
  description: 'Learn to maintain clarity during stressful situations.',
  time: '1 min',
  status: 'Active',
  questions: [
    {
      text: 'How can one maintain focus during stressful situations?',
      options: [
        'Practice mindfulness',
        'Avoid thinking',
        'Ignore stress',
        'Overwork',
      ],
      correctIndex: 0,
      time: 30,
      tips: 'The Bhagavad Gita (6.35) states that the restless mind can be controlled by constant practice (abhyasa) and detachment (vairagya).',
    },
    {
      text: 'What is the primary cause of anger according to the Gita?',
      options: [
        'Unfulfilled desires',
        'Other people',
        'Lack of sleep',
        'Bad luck',
      ],
      correctIndex: 0,
      time: 30,
      tips: 'Chapter 2, Verse 62 explains that attachment leads to desire, and from unfulfilled desire, anger arises.',
    },
  ],
};
