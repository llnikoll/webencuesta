import React, { useState } from 'react';

interface VoteOption {
  id: string;
  text: string;
}

interface VotingFormProps {
  options: VoteOption[];
  onVote: (optionId: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export default function VotingForm({ options, onVote, isLoading, error }: VotingFormProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [voted, setVoted] = useState(false);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return;

    try {
      await onVote(selectedOption);
      setVoted(true);
      setTimeout(() => setVoted(false), 3000);
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  return (
    <form onSubmit={handleVote} className="space-y-6">
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all"
          >
            <input
              type="radio"
              name="vote"
              value={option.id}
              checked={selectedOption === option.id}
              onChange={(e) => setSelectedOption(e.target.value)}
              disabled={isLoading}
              className="w-5 h-5 text-indigo-600"
            />
            <span className="ml-4 text-lg font-medium text-gray-800">{option.text}</span>
          </label>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">⚠ {error}</p>
        </div>
      )}

      {voted && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg success-animation">
          <p className="text-green-700 font-semibold text-lg">✓ Tu voto fue registrado correctamente</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedOption || isLoading || voted}
        className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Registrando voto...' : 'Votar'}
      </button>
    </form>
  );
}
