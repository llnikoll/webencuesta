import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import VotingForm from '@/components/VotingForm';
import Countdown from '@/components/Countdown';
import Results from '@/components/Results';

interface Option {
  id: string;
  text: string;
  votes: number;
  name?: string;
  party?: string;
  image?: string;
}

interface Poll {
  id: string;
  title: string;
  options: Option[];
  revealAt: string;
}

export default function PollPage() {
  const router = useRouter();
  const { pollId } = router.query;
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState<string>();
  const [resultsRevealed, setResultsRevealed] = useState(false);

  // Cargar datos de la encuesta
  useEffect(() => {
    if (!pollId || typeof pollId !== 'string') return;

    const fetchPoll = async () => {
      try {
        const response = await fetch(`/api/poll?pollId=${pollId}`);
        if (!response.ok) throw new Error('Encuesta no encontrada');
        const data = await response.json();
        setPoll(data);

        // Verificar si debería mostrar resultados
        const revealTime = new Date(data.revealAt).getTime();
        if (revealTime <= Date.now()) {
          setResultsRevealed(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando encuesta');
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [pollId]);

  // Verificar periódicamente si se deben revelar los resultados
  useEffect(() => {
    if (!poll || resultsRevealed) return;

    const checkReveal = setInterval(() => {
      const revealTime = new Date(poll.revealAt).getTime();
      if (revealTime <= Date.now()) {
        setResultsRevealed(true);
      }
    }, 1000);

    return () => clearInterval(checkReveal);
  }, [poll, resultsRevealed]);

  const handleVote = async (optionId: string) => {
    setVoting(true);
    setVoteError(undefined);

    try {
      // Generar device fingerprint
      const deviceFingerprint = generateFingerprint();

      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          optionId,
          deviceFingerprint,
          userAgent: navigator.userAgent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error registrando voto');
      }

      // Actualizar la encuesta para mostrar el nuevo voto
      if (poll) {
        const updatedOptions = poll.options.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        setPoll({ ...poll, options: updatedOptions });
      }
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setVoting(false);
    }
  };

  const generateFingerprint = (): string => {
    // Usar información del navegador para generar fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Browser Fingerprint', 2, 15);
    }

    // Hash del canvas + user agent + timezone
    const fingerprint = JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvasData: canvas.toDataURL(),
    });

    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return hash.toString(16);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
        <div className="card max-w-md w-full">
          <p className="text-red-600 font-semibold text-center">⚠ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{poll.title} - Votación</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
            {poll.title}
          </h1>

          {resultsRevealed ? (
            <div>
              <div className="mb-8">
                <Results options={poll.options} totalVotes={poll.options.reduce((sum, opt) => sum + opt.votes, 0)} />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="card">
                <VotingForm
                  options={poll.options}
                  onVote={handleVote}
                  isLoading={voting}
                  error={voteError}
                />
              </div>

              <Countdown revealAt={poll.revealAt} isRevealed={resultsRevealed} />
            </div>
          )}

          <div className="text-center mt-8">
            <a href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
              ← Volver a encuestas
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
