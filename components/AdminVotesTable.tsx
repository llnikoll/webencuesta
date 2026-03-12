import React from 'react';

interface VoteData {
  id: string;
  pollId: string;
  optionId: string;
  ipHash: string;
  deviceFingerprint: string;
  userAgent: string;
  createdAt: string;
  option: { text: string };
}

interface AdminVotesTableProps {
  votes: VoteData[];
  onExport: () => void;
}

export default function AdminVotesTable({ votes, onExport }: AdminVotesTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Registro de Votos</h3>
        <button
          onClick={onExport}
          className="btn-secondary text-sm"
        >
          📥 Exportar a CSV
        </button>
      </div>

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Opción</th>
              <th className="px-4 py-2 text-left">IP Hash</th>
              <th className="px-4 py-2 text-left">Device Fingerprint</th>
              <th className="px-4 py-2 text-left">User Agent</th>
              <th className="px-4 py-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {votes.map((vote) => (
              <tr key={vote.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">
                  {vote.option.text}
                </td>
                <td className="px-4 py-2 text-gray-600 font-mono text-xs">
                  {vote.ipHash.substring(0, 16)}...
                </td>
                <td className="px-4 py-2 text-gray-600 font-mono text-xs">
                  {vote.deviceFingerprint.substring(0, 16)}...
                </td>
                <td className="px-4 py-2 text-gray-600 text-xs">
                  {vote.userAgent.substring(0, 30)}...
                </td>
                <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                  {new Date(vote.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {votes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay votos registrados aún</p>
        </div>
      )}
    </div>
  );
}
