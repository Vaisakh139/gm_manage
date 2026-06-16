import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Gym, MembershipPlan, MembershipPlanFormData } from '../../types';
import { planApi, gymOwnerApi } from '../../api/axios';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/common/Toast';

export default function MembershipPlans() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [gyms, setGyms]               = useState<Gym[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(
    searchParams.get('gymId') ? Number(searchParams.get('gymId')) : null
  );
  const [plans, setPlans]             = useState<MembershipPlan[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [modal, setModal]             = useState(false);
  const [editing, setEditing]         = useState<MembershipPlan | null>(null);
  const [saving, setSaving]           = useState(false);
  const [deleteId, setDeleteId]       = useState<number | null>(null);

  const {
    register, handleSubmit, reset, setValue,
    formState: { errors },
  } = useForm<MembershipPlanFormData>({
    defaultValues: { name: '', description: '', durationInMonths: 1, price: 0 },
  });

  // Load gym list
  useEffect(() => {
    gymOwnerApi.getMyGyms().then((r) => {
      const list: Gym[] = r.data.data;
      setGyms(list);
      if (!selectedGymId && list.length > 0) setSelectedGymId(list[0].id);
    });
  }, []);

  // Sync gym to URL
  useEffect(() => {
    if (selectedGymId) setSearchParams({ gymId: String(selectedGymId) }, { replace: true });
  }, [selectedGymId]);

  const load = useCallback(() => {
    if (!selectedGymId) return;
    setLoading(true);
    planApi.getPlans(selectedGymId)
      .then((r) => { setPlans(r.data.data); setError(''); })
      .catch(() => setError('Failed to load plans'))
      .finally(() => setLoading(false));
  }, [selectedGymId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '', durationInMonths: 1, price: 0 });
    setModal(true);
  };

  const openEdit = (plan: MembershipPlan) => {
    setEditing(plan);
    setValue('name', plan.name);
    setValue('description', plan.description ?? '');
    setValue('durationInMonths', plan.durationInMonths);
    setValue('price', plan.price);
    setModal(true);
  };

  const onSubmit = async (data: MembershipPlanFormData) => {
    if (!selectedGymId) return;
    setSaving(true);
    try {
      if (editing) {
        await planApi.updatePlan(editing.id, data);
        showToast('Plan updated', 'success');
      } else {
        await planApi.createPlan(selectedGymId, data);
        showToast('Plan created', 'success');
      }
      setModal(false);
      load();
    } catch (err: unknown) {
      showToast(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (plan: MembershipPlan) => {
    try {
      await planApi.toggleStatus(plan.id, !plan.active);
      showToast(plan.active ? 'Plan deactivated' : 'Plan activated', 'success');
      load();
    } catch { showToast('Failed to update status', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await planApi.deletePlan(deleteId);
      showToast('Plan deleted', 'success');
      load();
    } catch { showToast('Failed to delete plan', 'error'); }
    finally { setDeleteId(null); }
  };

  const selectedGym = gyms.find((g) => g.id === selectedGymId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Membership Plans</h3>
          {selectedGym && <p className="text-sm text-gray-500 mt-0.5">📍 {selectedGym.gymName}</p>}
        </div>
        {selectedGymId && (
          <button onClick={openCreate}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            + Add Plan
          </button>
        )}
      </div>

      {/* Gym selector */}
      {gyms.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {gyms.map((g) => (
            <button key={g.id} onClick={() => setSelectedGymId(g.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
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

      {/* Plans grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No plans yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first membership plan.</p>
          {selectedGymId && (
            <button onClick={openCreate}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700">
              + Add Plan
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id}
              className={`bg-white rounded-xl border-2 p-5 flex flex-col gap-3 transition-all ${
                plan.active ? 'border-gray-200 hover:border-gray-400' : 'border-dashed border-gray-200 opacity-60'
              }`}>
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-gray-900 text-base leading-tight">{plan.name}</h4>
                <Badge label={plan.active ? 'Active' : 'Inactive'} variant={plan.active ? 'green' : 'gray'} />
              </div>

              {plan.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{plan.description}</p>
              )}

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                <div>
                  <p className="text-2xl font-bold text-gray-900">₹{Number(plan.price).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{plan.durationInMonths} month{plan.durationInMonths !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(plan)}
                    className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-medium">
                    Edit
                  </button>
                  <button onClick={() => handleToggle(plan)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      plan.active
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-100 hover:bg-yellow-100'
                        : 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100'
                    }`}>
                    {plan.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => setDeleteId(plan.id)}
                    className="text-xs px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-lg hover:bg-red-100 font-medium">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modal} title={editing ? 'Edit Plan' : 'Add Membership Plan'} onClose={() => setModal(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name <span className="text-red-500">*</span></label>
            <input {...register('name', { required: 'Name is required', maxLength: { value: 100, message: 'Max 100 chars' } })}
              placeholder="e.g. Monthly Basic"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description', { maxLength: { value: 500, message: 'Max 500 chars' } })}
              rows={2} placeholder="Optional description…"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 resize-none" />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months) <span className="text-red-500">*</span></label>
              <input type="number" min={1} {...register('durationInMonths', {
                required: 'Duration is required',
                min: { value: 1, message: 'Min 1 month' },
                valueAsNumber: true,
              })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
              {errors.durationInMonths && <p className="mt-1 text-xs text-red-600">{errors.durationInMonths.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" min={0} step="0.01" {...register('price', {
                required: 'Price is required',
                min: { value: 0, message: 'Price must be ≥ 0' },
                valueAsNumber: true,
              })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteId !== null} title="Delete Plan" onClose={() => setDeleteId(null)} size="sm">
        <p className="text-gray-600 text-sm">Delete this membership plan? This cannot be undone.</p>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
