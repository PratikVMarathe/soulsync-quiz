import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import QuestionCard from './QuestionCard';

describe('QuestionCard Component', () => {
  const mockQuestion = {
    correctAnswer: 1,
    eyebrow: 'Mindfulness Concept',
    id: 'q1',
    insight: 'Breath grounds the active mind.',
    options: [
      { text: 'Your phone' },
      { text: 'Your breath' },
      { text: 'Past memories' },
      { text: 'Future plans' },
    ],
    prompt: 'What is the most accessible tool to bring your mind back?',
  };

  it('renders question prompt, options in selectable state initially', () => {
    const handleSelect = vi.fn();

    render(
      <QuestionCard
        isRevealed={false}
        onNext={vi.fn()}
        onSelectAnswer={handleSelect}
        question={mockQuestion}
        selectedAnswer={null}
      />
    );

    expect(screen.getByText('What is the most accessible tool to bring your mind back?')).toBeInTheDocument();
    expect(screen.getByText('Your phone')).toBeInTheDocument();
    expect(screen.getByText('Your breath')).toBeInTheDocument();

    const optionBtn = screen.getByRole('button', { name: /Your breath/i });
    expect(optionBtn).not.toBeDisabled();

    fireEvent.click(optionBtn);
    expect(handleSelect).toHaveBeenCalledWith(1);
  });

  it('renders correct green treatment and Next button immediately when correct answer is revealed', () => {
    const handleNext = vi.fn();

    render(
      <QuestionCard
        isRevealed={true}
        onNext={handleNext}
        onSelectAnswer={vi.fn()}
        question={mockQuestion}
        selectedAnswer={1}
      />
    );

    expect(screen.getByText(/Correct answer!/i)).toBeInTheDocument();
    expect(screen.getByText(/Breath grounds the active mind./i)).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Next/i });
    expect(nextBtn).toBeInTheDocument();

    fireEvent.click(nextBtn);
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('renders red treatment for wrong answer and highlights correct answer in green immediately', () => {
    render(
      <QuestionCard
        isRevealed={true}
        onNext={vi.fn()}
        onSelectAnswer={vi.fn()}
        question={mockQuestion}
        selectedAnswer={0}
      />
    );

    expect(screen.getByText(/Here is the correct answer/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('handles time expired with no option selected (marked as skipped)', () => {
    render(
      <QuestionCard
        isRevealed={false}
        isTimeExpired={true}
        onNext={vi.fn()}
        onSelectAnswer={vi.fn()}
        question={mockQuestion}
        selectedAnswer={null}
      />
    );

    expect(screen.getAllByText(/marked as skipped/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('handles time expired with correct option selected', () => {
    render(
      <QuestionCard
        isRevealed={true}
        isTimeExpired={true}
        onNext={vi.fn()}
        onSelectAnswer={vi.fn()}
        question={mockQuestion}
        selectedAnswer={1}
      />
    );

    expect(screen.getByText(/Correct answer!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });
});
