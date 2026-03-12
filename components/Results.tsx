import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ResultsProps {
  options: Array<{ id: string; text: string; votes: number }>;
  totalVotes: number;
}

export default function Results({ options, totalVotes }: ResultsProps) {
  const labels = options.map((opt) => opt.text);
  const data = options.map((opt) => opt.votes);
  const percentages = options.map((opt) =>
    totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : '0'
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Votos',
        data,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(139, 92, 246)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieChartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4">
        {options.map((option, idx) => (
          <div key={option.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800">{option.text}</span>
              <span className="text-sm text-gray-500">{option.votes} votos ({percentages[idx]}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                style={{ width: `${totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Gráfico de Barras</h3>
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Gráfico Circular</h3>
          <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
      </div>

      <div className="card bg-gradient-to-r from-indigo-50 to-purple-50">
        <p className="text-center text-2xl font-bold text-indigo-600">
          Total de votos: <span className="text-purple-600">{totalVotes}</span>
        </p>
      </div>
    </div>
  );
}
