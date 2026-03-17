import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLogin from '@/components/AdminLogin';
import AdminVotesTable from '@/components/AdminVotesTable';
import PollEditor from '@/components/PollEditor';

const DEFAULT_POLL_ID = 'poll_1';

interface AdminStats {
  totalVotes: number;
  totalOptions: number;
  options: Array<{ 
    text: string; 
    votes: number;
    name?: string;
    party?: string;
    image?: string;
  }>;
  votes: Array<any>;
}

interface Poll {
  id: string;
  title: string;
  revealAt: string;
  createdAt: string;
  options: Array<{
    id: string;
    text: string;
    name?: string;
    party?: string;
    image?: string;
    votes: number;
  }>;
}

export default function AdminPanel() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [loginError, setLoginError] = useState<string>();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [showPollEditor, setShowPollEditor] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPollId, setSelectedPollId] = useState<string>(DEFAULT_POLL_ID);
  const [isSavingPoll, setIsSavingPoll] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'polls'>('results');

  // Cargar estadísticas si está autenticado
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/stats?pollId=${selectedPollId}`);
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
  }, [isAuthenticated, selectedPollId]);

  // Cargar lista de encuestas
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPolls = async () => {
      try {
        const response = await fetch('/api/admin/polls');
        if (response.ok) {
          const data = await response.json();
          setPolls(data.polls || []);
        }
      } catch (err) {
        console.error('Error cargando encuestas:', err);
      }
    };

    fetchPolls();
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
      const response = await fetch(`/api/admin/export?pollId=${selectedPollId}`);
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

  const handleSavePoll = async (pollData: any) => {
    setIsSavingPoll(true);
    try {
      const url = '/api/admin/polls';
      const method = editingPoll ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pollData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error guardando encuesta');
      }

      const result = await response.json();
      
      // Actualizar lista de encuestas
      if (editingPoll) {
        setPolls(polls.map(p => p.id === result.poll.id ? result.poll : p));
      } else {
        setPolls([result.poll, ...polls]);
      }

      setShowPollEditor(false);
      setEditingPoll(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSavingPoll(false);
    }
  };

  const handleEditPoll = async (pollId: string) => {
    try {
      const response = await fetch(`/api/admin/polls?pollId=${pollId}`);
      if (response.ok) {
        const data = await response.json();
        setEditingPoll(data.poll);
        setShowPollEditor(true);
      }
    } catch (err) {
      console.error('Error cargando encuesta:', err);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta encuesta? Se perderán todos los votos.')) return;

    try {
      const response = await fetch(`/api/admin/polls?pollId=${pollId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPolls(polls.filter(p => p.id !== pollId));
        if (selectedPollId === pollId) {
          setSelectedPollId(DEFAULT_POLL_ID);
        }
      }
    } catch (err) {
      alert('Error eliminando encuesta');
    }
  };

  const handleNewPoll = () => {
    setEditingPoll(null);
    setShowPollEditor(true);
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

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('results')}
              className={`pb-2 px-4 font-medium ${
                activeTab === 'results'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Resultados
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`pb-2 px-4 font-medium ${
                activeTab === 'polls'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Gestionar Encuestas
            </button>
          </div>

          {activeTab === 'results' && (
            <>
              {/* Selector de encuesta */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encuesta seleccionada
                </label>
                <select
                  value={selectedPollId}
                  onChange={(e) => setSelectedPollId(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {polls.map((poll) => (
                    <option key={poll.id} value={poll.id}>
                      {poll.title}
                    </option>
                  ))}
                </select>
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
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Resultados por Candidato</h2>
                    <div className="space-y-4">
                      {stats.options.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          {option.image && (
                            <img
                              src={option.image}
                              alt={option.text}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-800">{option.text}</p>
                              {option.party && (
                                <span className="text-sm px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                                  {option.party}
                                </span>
                              )}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                                style={{
                                  width: `${stats.totalVotes > 0 ? (option.votes / stats.totalVotes) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                          <p className="text-right text-gray-700 font-semibold min-w-20">
                            {option.votes} ({stats.totalVotes > 0 ? ((option.votes / stats.totalVotes) * 100).toFixed(1) : 0}%)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <AdminVotesTable votes={stats.votes} onExport={handleExport} />
                </div>
              ) : null}
            </>
          )}

          {activeTab === 'polls' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Encuestas</h2>
                <button
                  onClick={handleNewPoll}
                  className="btn-primary"
                >
                  + Nueva Encuesta
                </button>
              </div>

              <div className="grid gap-4">
                {polls.map((poll) => (
                  <div key={poll.id} className="card bg-white border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{poll.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {poll.options.length} opciones • Creada: {new Date(poll.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Resultados: {new Date(poll.revealAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPoll(poll.id)}
                          className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePoll(poll.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {poll.options.slice(0, 3).map((opt, idx) => (
                        opt.image && (
                          <img
                            key={idx}
                            src={opt.image}
                            alt={opt.text}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )
                      ))}
                      {poll.options.length > 3 && (
                        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                          +{poll.options.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <a href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
              ← Volver a votación
            </a>
          </div>
        </div>
      </main>

      {showPollEditor && (
        <PollEditor
          poll={editingPoll}
          onSave={handleSavePoll}
          onCancel={() => {
            setShowPollEditor(false);
            setEditingPoll(null);
          }}
          isLoading={isSavingPoll}
        />
      )}
    </>
  );
}
