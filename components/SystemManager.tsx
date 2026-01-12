import React, { useState } from 'react';
import { useSystemManager, useSystem } from '../app/lib/store';

export default function SystemManager() {
  const { systems, currentSystemId, setCurrentSystemId, addSystem } = useSystemManager();
  const { currentSystem } = useSystem();
  const [newName, setNewName] = useState('');

  function handleCreateSystem(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const id = `system-${Date.now()}`;
    addSystem({ id, name: newName, organizationIds: [], userIds: [] });
    setCurrentSystemId(id);
    setNewName('');
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-2">Gestion des systèmes</h2>
      <div className="flex gap-2 mb-2">
        <select
          value={currentSystemId || ''}
          onChange={e => setCurrentSystemId(e.target.value)}
          className="border rounded p-2"
        >
          {systems.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <form onSubmit={handleCreateSystem} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nom du système"
            className="border rounded p-2"
          />
          <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded">Créer</button>
        </form>
      </div>
      {currentSystem && (
        <div className="text-sm text-gray-600">Système actif : <span className="font-semibold">{currentSystem.name}</span></div>
      )}
    </div>
  );
}
