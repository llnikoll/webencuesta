import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLogin from '@/components/AdminLogin';
import AdminVotesTable from '@/components/AdminVotesTable';

const POLL_ID = 'poll_1';

interface AdminStats {
  totalVotes: number;
  totalOptions: number;
  options: Array<{ text: string; votes: number }>;
  votes: Array<any>;
}

export default function AdminPanel() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [loginError, setLoginError] = useState<string>();
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Cargar estadísticas si está autenticado
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/stats?pollId=${POLL_ID}`);
        if (!response.ok) {
          if (response.status === 401) {
            setIsAuthenticated(false);
            return;
          }
          throw new Error('Error cargando estadísticas');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Actualizar cada 5 segundos
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = async (username: string, password: string) => {
    setIsLoginLoading(true);
    setLoginError(undefined);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Autenticación fallida');
      }

      setIsAuthenticated(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStats(null);
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/export?pollId=${POLL_ID}`);
      if (!response.ok) throw new Error('Error exportando CSV');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'votos.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al exportar');
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Panel Administrador - Login</title>
        </Head>
        <AdminLogin
          onLogin={handleLogin}
          isLoading={isLoginLoading}
          error={loginError}
        />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Panel Administrador</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Panel Administrador</h1>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Cerrar sesión
            </button>
          </div>

          {loading && !stats ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="card bg-red-50 border border-red-200">
              <p className="text-red-700 font-medium">⚠ {error}</p>
            </div>
          ) : stats ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200">
                  <p className="text-indigo-700 text-sm font-medium">Total de Votos</p>
                  <p className="text-4xl font-bold text-indigo-600">{stats.totalVotes}</p>
                </div>

                <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                  <p className="text-purple-700 text-sm font-medium">Opciones Disponibles</p>
                  <p className="text-4xl font-bold text-purple-600">{stats.totalOptions}</p>
                </div>
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Resultados por Opción</h2>
                <div className="space-y-4">
                  {stats.options.map((option, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-1">{option.text}</p>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                            style={{
                              width: `${stats.totalVotes > 0 ? (option.votes / stats.totalVotes) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                      <p className="ml-4 text-right text-gray-700 font-semibold min-w-16">
                        {option.votes} ({stats.totalVotes > 0 ? ((option.votes / stats.totalVotes) * 100).toFixed(1) : 0}%)
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <AdminVotesTable votes={stats.votes} onExport={handleExport} />
            </div>
          ) : null}

          <div className="text-center mt-12">
            <a href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
              ← Volver a votación
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
