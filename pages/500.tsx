import React from 'react';

export default function Custom500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
        <p className="text-xl text-gray-700 mb-2">Error interno del servidor</p>
        <p className="text-gray-600 mb-6">Algo salió mal. Por favor intenta más tarde.</p>
        <a href="/" className="btn-primary">Volver al inicio</a>
      </div>
    </div>
  );
}
