import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Equipment, EquipmentFormData, Gym } from '../../types';
import {
  getOwnerEquipments,
  createOwnerEquipment,
  updateOwnerEquipment,
  deleteOwnerEquipment,
} from '../../services/equipmentService';
import { gymOwnerApi } from '../../api/axios';
import EquipmentCard from '../../components/equipment/EquipmentCard';
import EquipmentForm from '../../components/equipment/EquipmentForm';
import Modal from '../../components/ui/Modal';

export default function OwnerEquipment() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(
    searchParams.get('gymId') ? Number(searchParams.get('gymId')) : null
  );

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Load gyms
  useEffect(() => {
    gymOwnerApi.getMyGyms().then((r) => {
      const list: Gym[] = r.data.data;
      setGyms(list);
      if (!selectedGymId && list.length > 0) setSelectedGymId(list[0].id);
    });
  }, []);

  // Sync gymId to URL
  useEffect(() => {
    if (selectedGymId) setSearchParams({ gymId: String(selectedGymId) }, { replace: true });
  }, [selectedGymId]);

  const load = useCallback(async () => {
    if (!selectedGymId) return;
    setLoading(true);
    try {
      const data = await getOwnerEquipments(selectedGymId);
      setEquipments(data);
      setError('');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  }, [selectedGymId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (eq: Equipment) => { setEditing(eq); setModalOpen(true); };

  const handleSubmit = async (data: EquipmentFormData) => {
    if (!selectedGymId) return;
    setSaving(true);
    try {
      if (editing) await updateOwnerEquipment(editing.id, data);
      else await createOwnerEquipment(selectedGymId, data);
      setModalOpen(false);
      load();
    } catch (e: unknown) {
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteOwnerEquipment(deleteId);
    setDeleteId(null);
    load();
  };

  const selectedGym = gyms.find((g) => g.id === selectedGymId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Equipment</h3>
          {selectedGym && <p className="text-sm text-gray-500 mt-0.5">📍 {selectedGym.gymName}</p>}
        </div>
        {selectedGymId && (
          <button onClick={openCreate}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            + Add Equipment
          </button>
        )}
      </div>

      {/* Gym selector */}
      {gyms.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {gyms.map((g) => (
            <button key={g.id} onClick={() => setSelectedGymId(g.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                selectedGymId === g.id
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}>
              🏢 {g.gymName}
            </button>
          ))}
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">{error}</div>}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : equipments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🏋️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No equipment yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add your first piece of equipment to get started.</p>
          {selectedGymId && (
            <button onClick={openCreate}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
              + Add Equipment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipments.map((eq) => (
            <EquipmentCard key={eq.id} equipment={eq} onEdit={openEdit} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} title={editing ? 'Edit Equipment' : 'Add Equipment'} onClose={() => setModalOpen(false)} size="lg">
        <EquipmentForm
          defaultValues={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          loading={saving}
        />
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteId !== null} title="Delete Equipment" onClose={() => setDeleteId(null)} size="sm">
        <p className="text-gray-600 text-sm">Are you sure you want to delete this equipment?</p>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
