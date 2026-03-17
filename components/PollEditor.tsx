import React, { useState } from 'react';

interface PollOption {
  id?: string;
  text: string;
  name?: string;
  party?: string;
  image?: string;
}

interface PollEditorProps {
  poll?: {
    id: string;
    title: string;
    revealAt: string;
    options: PollOption[];
  } | null;
  onSave: (poll: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function PollEditor({ poll, onSave, onCancel, isLoading }: PollEditorProps) {
  const [title, setTitle] = useState(poll?.title || '');
  const [revealAt, setRevealAt] = useState(
    poll?.revealAt 
      ? new Date(poll.revealAt).toISOString().slice(0, 16)
      : new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [options, setOptions] = useState<PollOption[]>(
    poll?.options?.length 
      ? poll.options 
      : [{ text: '', name: '', party: '', image: '' }]
  );

  const addOption = () => {
    setOptions([...options, { text: '', name: '', party: '', image: '' }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: keyof PollOption, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pollData = {
      pollId: poll?.id,
      title,
      revealAt: new Date(revealAt).toISOString(),
      options: options.filter(opt => opt.text.trim() !== ''),
    };
    
    await onSave(pollData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {poll ? 'Editar Encuesta' : 'Nueva Encuesta'}
          </h2>
          <p className="text-gray-600 mt-1">
            Configura los candidatos/partidos para la votación
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título de la encuesta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título de la Encuesta *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Elecciones Presidenciales 2026"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Fecha de revelación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de revelación de resultados
            </label>
            <input
              type="datetime-local"
              value={revealAt}
              onChange={(e) => setRevealAt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Los resultados se mostrarán automáticamente después de esta fecha
            </p>
          </div>

          {/* Opciones/Candidatos */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Candidatos / Opciones *
              </label>
              <button
                type="button"
                onClick={addOption}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Agregar candidato
              </button>
            </div>

            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Candidato {index + 1}
                    </span>
                    {options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder="Nombre completo *"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <input
                      type="text"
                      value={option.party || ''}
                      onChange={(e) => updateOption(index, 'party', e.target.value)}
                      placeholder="Partido Político"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="url"
                      value={option.image || ''}
                      onChange={(e) => updateOption(index, 'image', e.target.value)}
                      placeholder="URL de imagen (foto del candidato)"
                      className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {option.image && (
                    <div className="mt-3">
                      <img
                        src={option.image}
                        alt={option.text}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || options.every(o => !o.text.trim())}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : (poll ? 'Guardar Cambios' : 'Crear Encuesta')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
