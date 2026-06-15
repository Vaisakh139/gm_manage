import { useEffect, useState } from 'react';
import type { Equipment, EquipmentFormData, EquipmentStatus, Gym } from '../../types';
import {
  getAllEquipments,
  adminCreateEquipment,
  adminUpdateEquipment,
  adminDeleteEquipment,
} from '../../services/equipmentService';
import { adminApi } from '../../api/axios';
import EquipmentCard from '../../components/equipment/EquipmentCard';
import EquipmentForm from '../../components/equipment/EquipmentForm';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const statusVariant: Record<EquipmentStatus, 'green' | 'yellow' | 'red'> = {
  AVAILABLE:         'green',
  UNDER_MAINTENANCE: 'yellow',
  OUT_OF_SERVICE:    'red',
};

export default function AdminEquipment() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'grid' | 'table'>('table');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [eq, gymList] = await Promise.all([
        getAllEquipments(),
        adminApi.getGyms().then((r) => r.data.data as Gym[]),
      ]);
      setEquipments(eq);
      setGyms(gymList);
      setError('');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setSelectedGymId(null); setModalOpen(true); };
  const openEdit = (eq: Equipment) => {
    setEditing(eq);
    setSelectedGymId(eq.gymId);
    setModalOpen(true);
  };

  const handleSubmit = async (data: EquipmentFormData) => {
    setSaving(true);
    try {
      if (editing) await adminUpdateEquipment(editing.id, data);
      else {
        if (!selectedGymId) throw new Error('Select a gym');
        await adminCreateEquipment(selectedGymId, data);
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await adminDeleteEquipment(deleteId);
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          All Equipment ({equipments.length})
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setView(v => v === 'grid' ? 'table' : 'grid')}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            {view === 'grid' ? '☰ Table' : '⊞ Grid'}
          </button>
          <button onClick={openCreate}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            + Add Equipment
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {equipments.map((eq) => (
            <EquipmentCard key={eq.id} equipment={eq} onEdit={openEdit} onDelete={setDeleteId} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Gym', 'Description', 'Qty', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {equipments.map((eq) => (
                <tr key={eq.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{eq.name}</td>
                  <td className="px-5 py-3 text-gray-500">{eq.gymName}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{eq.description ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-900 font-semibold">{eq.quantity}</td>
                  <td className="px-5 py-3">
                    <Badge label={eq.status.replace('_', ' ')} variant={statusVariant[eq.status]} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(eq)} className="text-xs font-medium px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">Edit</button>
                      <button onClick={() => setDeleteId(eq.id)} className="text-xs font-medium px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded hover:bg-red-100">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {equipments.length === 0 && <p className="text-center text-gray-400 py-10">No equipment found.</p>}
        </div>
      )}

      {/* Form Modal */}
      <Modal open={modalOpen} title={editing ? 'Edit Equipment' : 'Add Equipment'} onClose={() => setModalOpen(false)} size="lg">
        {!editing && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gym <span className="text-red-500">*</span></label>
            <select value={selectedGymId ?? ''} onChange={(e) => setSelectedGymId(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900">
              <option value="">Select a gym…</option>
              {gyms.map((g) => <option key={g.id} value={g.id}>{g.gymName}</option>)}
            </select>
          </div>
        )}
        <EquipmentForm defaultValues={editing ?? undefined} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} loading={saving} />
      </Modal>

      <Modal open={deleteId !== null} title="Delete Equipment" onClose={() => setDeleteId(null)} size="sm">
        <p className="text-gray-600 text-sm">Delete this equipment? This cannot be undone.</p>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
