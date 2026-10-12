import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import QuizCompletionModal from './QuizCompletionModal';

describe('QuizCompletionModal Component', () => {
  it('renders the celebration dialog with the achievement badge, headline, and choices', () => {
    const handleViewResult = vi.fn();
    const handleExploreGitaClass = vi.fn();

    render(
      <QuizCompletionModal
        onExploreGitaClass={handleExploreGitaClass}
        onViewResult={handleViewResult}
      />
    );

    expect(screen.getByText('Achievement Unlocked!')).toBeInTheDocument();
    expect(
      screen.getByText(/Congratulations! You have successfully completed the quiz!/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A 100% Free ISKCON Gita Masterclass!/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Deepen your understanding and discover life-changing wisdom/i)
    ).toBeInTheDocument();

    const rewardBtn = screen.getByRole('button', { name: /view reward!/i });
    const laterBtn = screen.getByRole('button', { name: /maybe later/i });

    expect(rewardBtn).toBeInTheDocument();
    expect(laterBtn).toBeInTheDocument();
  });

  it('triggers onViewResult when clicking Maybe Later', () => {
    const handleViewResult = vi.fn();
    const handleExploreGitaClass = vi.fn();

    render(
      <QuizCompletionModal
        onExploreGitaClass={handleExploreGitaClass}
        onViewResult={handleViewResult}
      />
    );

    const laterBtn = screen.getByRole('button', { name: /maybe later/i });
    fireEvent.click(laterBtn);

    expect(handleViewResult).toHaveBeenCalledTimes(1);
    expect(handleExploreGitaClass).not.toHaveBeenCalled();
  });

  it('triggers onExploreGitaClass when clicking View Reward!', () => {
    const handleViewResult = vi.fn();
    const handleExploreGitaClass = vi.fn();

    render(
      <QuizCompletionModal
        onExploreGitaClass={handleExploreGitaClass}
        onViewResult={handleViewResult}
      />
    );

    const rewardBtn = screen.getByRole('button', { name: /view reward!/i });
    fireEvent.click(rewardBtn);

    expect(handleExploreGitaClass).toHaveBeenCalledTimes(1);
    expect(handleViewResult).not.toHaveBeenCalled();
  });
});
