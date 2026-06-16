import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Gym, Member, Trainer, TrainerFormData } from '../../types';
import { trainerApi, gymOwnerApi } from '../../api/axios';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/common/Toast';

const IMAGE_BASE = 'http://localhost:8080';

export default function Trainers() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [gyms, setGyms]           = useState<Gym[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(
    searchParams.get('gymId') ? Number(searchParams.get('gymId')) : null
  );
  const [trainers, setTrainers]   = useState<Trainer[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState<Trainer | null>(null);
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState<number | null>(null);

  // Assign members modal
  const [assignModal, setAssignModal]         = useState(false);
  const [assignTrainer, setAssignTrainer]     = useState<Trainer | null>(null);
  const [assignedMembers, setAssignedMembers] = useState<Member[]>([]);
  const [allMembers, setAllMembers]           = useState<Member[]>([]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<TrainerFormData>({
      defaultValues: { name: '', phone: '', email: '', specialization: '', experienceYears: '', imageUrl: '' },
    });

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const imageUrl = watch('imageUrl');

  // Load gyms
  useEffect(() => {
    gymOwnerApi.getMyGyms().then((r) => {
      const list: Gym[] = r.data.data;
      setGyms(list);
      if (!selectedGymId && list.length > 0) setSelectedGymId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedGymId) setSearchParams({ gymId: String(selectedGymId) }, { replace: true });
  }, [selectedGymId]);

  const load = useCallback(() => {
    if (!selectedGymId) return;
    setLoading(true);
    trainerApi.getTrainers(selectedGymId)
      .then((r) => { setTrainers(r.data.data); setError(''); })
      .catch(() => setError('Failed to load trainers'))
      .finally(() => setLoading(false));
  }, [selectedGymId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', phone: '', email: '', specialization: '', experienceYears: '', imageUrl: '' });
    setModal(true);
  };

  const openEdit = (t: Trainer) => {
    setEditing(t);
    reset({ name: t.name, phone: t.phone ?? '', email: t.email ?? '',
      specialization: t.specialization ?? '', experienceYears: t.experienceYears ?? '',
      imageUrl: t.imageUrl ?? '' });
    setModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await trainerApi.uploadImage(file);
      setValue('imageUrl', res.data.data.imageUrl);
      showToast('Image uploaded', 'success');
    } catch { showToast('Upload failed', 'error'); }
    finally { setUploading(false); }
  };

  const onSubmit = async (data: TrainerFormData) => {
    if (!selectedGymId) return;
    setSaving(true);
    try {
      const payload = { ...data, experienceYears: data.experienceYears || null };
      if (editing) await trainerApi.updateTrainer(editing.id, payload);
      else await trainerApi.createTrainer(selectedGymId, payload);
      showToast(editing ? 'Trainer updated' : 'Trainer added', 'success');
      setModal(false);
      load();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await trainerApi.deleteTrainer(deleteId); showToast('Trainer deleted', 'success'); load(); }
    catch { showToast('Failed to delete', 'error'); }
    finally { setDeleteId(null); }
  };

  const openAssign = async (trainer: Trainer) => {
    setAssignTrainer(trainer);
    const [assigned, all] = await Promise.all([
      trainerApi.getAssignedMembers(trainer.id).then((r) => r.data.data as Member[]),
      gymOwnerApi.getMembers(trainer.gymId, '', 0, 200).then((r) => r.data.data.content as Member[]),
    ]);
    setAssignedMembers(assigned);
    setAllMembers(all);
    setAssignModal(true);
  };

  const handleAssignToggle = async (member: Member) => {
    if (!assignTrainer) return;
    const isAssigned = assignedMembers.some((m) => m.id === member.id);
    try {
      if (isAssigned) {
        await trainerApi.unassignMember(assignTrainer.id, member.id);
        setAssignedMembers((prev) => prev.filter((m) => m.id !== member.id));
        showToast('Member unassigned', 'success');
      } else {
        await trainerApi.assignMember(assignTrainer.id, member.id);
        setAssignedMembers((prev) => [...prev, member]);
        showToast('Member assigned', 'success');
      }
      load();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error', 'error');
    }
  };

  const selectedGym = gyms.find((g) => g.id === selectedGymId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Trainers</h3>
          {selectedGym && <p className="text-sm text-gray-500 mt-0.5">📍 {selectedGym.gymName}</p>}
        </div>
        {selectedGymId && (
          <button onClick={openCreate}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            + Add Trainer
          </button>
        )}
      </div>

      {/* Gym selector */}
      {gyms.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {gyms.map((g) => (
            <button key={g.id} onClick={() => setSelectedGymId(g.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedGymId === g.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}>
              🏢 {g.gymName}
            </button>
          ))}
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">{error}</div>}

      {/* Trainer cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : trainers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🏋️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No trainers yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add your first trainer.</p>
          {selectedGymId && (
            <button onClick={openCreate} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700">
              + Add Trainer
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                {t.imageUrl
                  ? <img src={`${IMAGE_BASE}${t.imageUrl}`} alt={t.name} className="w-full h-full object-cover" />
                  : <div className="text-5xl text-gray-300">👤</div>
                }
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-gray-900 text-base">{t.name}</h4>
                  <Badge label={t.active ? 'Active' : 'Inactive'} variant={t.active ? 'green' : 'red'} />
                </div>
                {t.specialization && <p className="text-sm text-gray-500">{t.specialization}</p>}
                {t.experienceYears != null && (
                  <p className="text-xs text-gray-400 mt-0.5">{t.experienceYears} yr{t.experienceYears !== 1 ? 's' : ''} experience</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  👥 {t.assignedMembersCount} member{t.assignedMembersCount !== 1 ? 's' : ''} assigned
                </p>
              </div>
              {/* Actions */}
              <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
                <button onClick={() => openEdit(t)}
                  className="py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">Edit</button>
                <button onClick={() => openAssign(t)}
                  className="py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors">Assign</button>
                <button onClick={() => setDeleteId(t.id)}
                  className="py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modal} title={editing ? 'Edit Trainer' : 'Add Trainer'} onClose={() => setModal(false)} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input {...register('name', { required: 'Name is required', maxLength: { value: 100, message: 'Max 100 chars' } })}
                placeholder="Full name"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input {...register('specialization')} placeholder="e.g. Strength & Conditioning"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" {...register('email')} placeholder="trainer@email.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} placeholder="+1 234 567 8900"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
            <input type="number" min={0} {...register('experienceYears', { valueAsNumber: true })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <div className="flex items-center gap-3">
              {imageUrl && <img src={`${IMAGE_BASE}${imageUrl}`} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                {uploading ? 'Uploading…' : imageUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
              {imageUrl && (
                <button type="button" onClick={() => setValue('imageUrl', '')}
                  className="text-xs text-red-500 hover:underline">Remove</button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageUpload} className="hidden" />
            <input type="hidden" {...register('imageUrl')} />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving || uploading}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Update' : 'Add Trainer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Members Modal */}
      <Modal open={assignModal} title={`Assign Members — ${assignTrainer?.name}`} onClose={() => setAssignModal(false)} size="lg">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {allMembers.length === 0 && <p className="text-gray-400 text-center py-6">No members in this gym.</p>}
          {allMembers.map((m) => {
            const assigned = assignedMembers.some((a) => a.id === m.id);
            return (
              <div key={m.id}
                className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{m.fullName}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </div>
                <button onClick={() => handleAssignToggle(m)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    assigned
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}>
                  {assigned ? 'Unassign' : 'Assign'}
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={() => setAssignModal(false)}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700">Done</button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteId !== null} title="Delete Trainer" onClose={() => setDeleteId(null)} size="sm">
        <p className="text-gray-600 text-sm">Delete this trainer? Assigned members will be unassigned automatically.</p>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
