import { useState } from 'react';
import './index.css';

export default function App() {
  // --- STATE MANAGEMENT ---
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15); // Mock timer state

  // --- MOCK DATA (Later this will come from Firebase/Gemini) ---
  const question = "How can one maintain focus during stressful situations?";
  const options = ["Meditation", "Avoid thinking", "Ignore stress", "Overwork"];
  const correctIndex = 0; // "Meditation" is the correct answer

  // --- LOGIC ---
  const handleOptionClick = (index) => {
    // If they already answered, don't let them change it
    if (selectedOption !== null) return; 
    setSelectedOption(index);
  };

  // Dynamic Tailwind classes based on whether the answer is right or wrong
  const getOptionStyle = (index) => {
    // 1. Default State (Before any click)
    if (selectedOption === null) {
      return "bg-white border-gray-200 text-gray-700 hover:border-[#2F4F4F] hover:shadow-md active:scale-[0.98]";
    }
    
    // 2. Correct Answer Highlight (Always show correct answer after click)
    if (index === correctIndex) {
      return "bg-[#A7D7C5] border-[#2F4F4F] text-[#1F2937] font-bold scale-[1.02] shadow-md transition-all";
    }
    
    // 3. Incorrect Answer Highlight (If they clicked the wrong one)
    if (selectedOption === index) {
      return "bg-[#F4A6A6] border-red-400 text-red-900 transition-all";
    }
    
    // 4. Unselected Options (Fade out the ones they didn't pick)
    return "bg-gray-50 border-gray-200 text-gray-400 opacity-60";
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between p-4 font-sans">

      {/* --- HEADER --- */}
      <div className="mb-6 pt-2">
        {/* Question counter and timer row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-700 font-semibold text-sm">Question 3 / 10</span>
          <span className={`text-sm font-semibold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-[#2F4F4F] rounded-full w-3/12 transition-all duration-500"></div>
        </div>
      </div>

      {/* --- QUESTION AREA --- */}
      <div className="text-center mb-8 mt-6 px-2">
        <h2 className="text-2xl font-semibold text-gray-800 leading-relaxed tracking-tight">
          {question}
        </h2>
      </div>

      {/* --- OPTIONS --- */}
      <div className="space-y-4 flex-1 mt-4">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleOptionClick(i)}
            disabled={selectedOption !== null}
            className={`w-full p-5 rounded-2xl shadow-sm border text-left font-medium transition-all duration-200 ${getOptionStyle(i)}`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* --- FOOTER CTA --- */}
      <div className="mt-8 mb-6">
        <button 
          disabled={selectedOption === null}
          className={`w-full py-4 rounded-xl font-bold shadow-md text-lg transition-all duration-300
            ${selectedOption !== null 
              ? 'bg-[#E3B448] text-white hover:bg-[#cfa13c] active:scale-[0.98]' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {selectedOption !== null ? "Next Concept →" : "Select an answer"}
        </button>
      </div>

    </div>
  );
}