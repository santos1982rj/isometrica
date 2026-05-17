import { useEffect, useState } from 'react';
import { fetchHealth } from '../../services/api';

export default function HealthPage() {
  const [status, setStatus] = useState<string>('Conectando...');
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setStatus(data.mensagem || data.status);
        setError(false);
      })
      .catch((err) => {
        console.error(err);
        setStatus('Falha na conexão com o servidor');
        setError(true);
      });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-blue-50">
      <div className="bg-white/80 backdrop-blur-xs shadow-2xl rounded-3xl p-10 max-w-lg text-center animate-fade-in">
        {/* Ícone decorativo */}
        <div className="w-16 h-16 mx-auto mb-4 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          N
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">
          Nó na Armadura
        </h1>
        <p className="text-gray-500 mb-6">
          Plataforma educacional de dimensionamento de estruturas
        </p>

        <div className="flex items-center justify-center gap-2 mb-4">
          {/* Indicador luminoso */}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              error ? 'bg-red-500' : 'bg-green-500 animate-pulse'
            }`}
          />
          <span className="text-sm text-gray-600">
            Status do servidor: <strong>{status}</strong>
          </span>
        </div>

        {/* Botão para testar novamente */}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Testar novamente
        </button>
      </div>
    </main>
  );
}