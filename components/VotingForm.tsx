import React, { useState } from 'react';

interface VoteOption {
  id: string;
  text: string;
  name?: string;
  party?: string;
  image?: string;
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
      <div className="space-y-4">
        {options.map((option) => (
          <label
            key={option.id}
            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedOption === option.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            }`}
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
            
            <div className="ml-4 flex items-center gap-4 flex-1">
              {option.image && (
                <img
                  src={option.image}
                  alt={option.text}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-800">
                  {option.text}
                </p>
                {option.party && (
                  <span className="inline-block mt-1 text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                    {option.party}
                  </span>
                )}
              </div>
            </div>
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
