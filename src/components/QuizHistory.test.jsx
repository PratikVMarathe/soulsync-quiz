import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuizHistory from './QuizHistory';

// Mock the quiz attempt service
vi.mock('../services/quizAttemptService', () => ({
  loadUserAttemptsForQuiz: vi.fn().mockResolvedValue([
    {
      id: 'attempt1',
      status: 'COMPLETED',
      score: 8,
      totalQuestions: 10,
      percentage: 80,
      totalTimeTaken: 120,
      startedAt: { toMillis: () => 1000 },
      answers: []
    },
    {
      id: 'attempt2',
      status: 'IN_PROGRESS',
      score: 0,
      totalQuestions: 10,
      percentage: 0,
      totalTimeTaken: 50,
      startedAt: { toMillis: () => 2000 },
      answers: []
    }
  ])
}));

describe('QuizHistory Component', () => {
  it('renders loading state initially', () => {
    render(<QuizHistory quiz={{ slug: 'test-quiz', title: 'Test Quiz' }} user={{ uid: 'user1' }} onExit={() => {}} />);
    expect(screen.getAllByText('Loading history...').length).toBeGreaterThan(0);
  });

  it('renders history stats and list after loading', async () => {
    render(<QuizHistory quiz={{ slug: 'test-quiz', title: 'Test Quiz' }} user={{ uid: 'user1' }} onExit={() => {}} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading history...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Latest Score')).toBeInTheDocument();
    expect(screen.getAllByText('8/10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Best Score').length).toBeGreaterThan(0);
    
    // Check if the attempts are listed
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
  });
});
