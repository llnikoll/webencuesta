import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // En una aplicación real, se cargarían las encuestas desde la API
    // Para este ejemplo, usaremos una encuesta predeterminada
    const defaultPoll = {
      id: 'poll_1',
      title: '¿Cuál es tu lenguaje de programación favorito?',
    };
    setPolls([defaultPoll]);
    setLoading(false);
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
          ) : (
            <div className="grid gap-6">
              {polls.map((poll) => (
                <Link key={poll.id} href={`/poll/${poll.id}`}>
                  <div className="card cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all hover:scale-105 transform">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{poll.title}</h2>
                    <p className="text-gray-600">Haz clic para votar →</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/admin">
              <a className="text-sm text-indigo-600 hover:text-indigo-700">
                Panel de administración
              </a>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
