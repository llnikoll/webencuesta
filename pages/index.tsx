import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Poll {
  id: string;
  title: string;
  revealAt: string;
  options: Array<{
    id: string;
    text: string;
    image?: string;
    votes: number;
  }>;
}

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await fetch('/api/admin/polls');
        if (response.ok) {
          const data = await response.json();
          setPolls(data.polls || []);
        }
      } catch (err) {
        console.error('Error cargando encuestas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  return (
    <>
      <Head>
        <title>Plataforma de Votación Segura</title>
        <meta name="description" content="Votación segura sin registro" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
              Votación Segura
            </h1>
            <p className="text-xl text-gray-600">
              Participa en encuestas de forma rápida y segura. Un voto por dispositivo.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay encuestas disponibles.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {polls.map((poll) => (
                <Link key={poll.id} href={`/poll/${poll.id}`}>
                  <div className="card cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all hover:scale-105 transform">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{poll.title}</h2>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {poll.options.slice(0, 4).map((opt, idx) => (
                          opt.image && (
                            <img
                              key={idx}
                              src={opt.image}
                              alt={opt.text}
                              className="w-10 h-10 rounded-full border-2 border-white object-cover"
                            />
                          )
                        ))}
                        {poll.options.length > 4 && (
                          <span className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                            +{poll.options.length - 4}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">Haz clic para votar →</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/admin" className="text-sm text-indigo-600 hover:text-indigo-700">
              Panel de administración
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
