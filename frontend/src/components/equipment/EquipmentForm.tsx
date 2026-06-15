import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Equipment, EquipmentFormData, EquipmentStatus } from '../../types';
import { uploadEquipmentImage } from '../../services/equipmentService';

interface Props {
  defaultValues?: Partial<Equipment>;
  onSubmit: (data: EquipmentFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const STATUS_OPTIONS: { value: EquipmentStatus; label: string }[] = [
  { value: 'AVAILABLE',         label: 'Available' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
  { value: 'OUT_OF_SERVICE',    label: 'Out of Service' },
];

const IMAGE_BASE = 'http://localhost:8080';

export default function EquipmentForm({ defaultValues, onSubmit, onCancel, loading }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    defaultValues: {
      name:        defaultValues?.name        ?? '',
      description: defaultValues?.description ?? '',
      quantity:    defaultValues?.quantity    ?? 1,
      status:      defaultValues?.status      ?? 'AVAILABLE',
      imageUrl:    defaultValues?.imageUrl    ?? '',
    },
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [preview, setPreview] = useState<string>(
    defaultValues?.imageUrl ? `${IMAGE_BASE}${defaultValues.imageUrl}` : ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = watch('imageUrl');

  useEffect(() => {
    if (imageUrl && imageUrl.startsWith('/')) {
      setPreview(`${IMAGE_BASE}${imageUrl}`);
    }
  }, [imageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only jpg, jpeg, and png files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must not exceed 5 MB');
      return;
    }

    setUploadError('');
    setUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const result = await uploadEquipmentImage(file);
      setValue('imageUrl', result.imageUrl, { shouldValidate: true });
    } catch (err: unknown) {
      setUploadError((err as Error).message ?? 'Upload failed');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Equipment Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name', {
            required: 'Equipment name is required',
            maxLength: { value: 100, message: 'Max 100 characters' },
          })}
          placeholder="e.g. Treadmill"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description', {
            maxLength: { value: 500, message: 'Max 500 characters' },
          })}
          rows={3}
          placeholder="Optional description…"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Quantity + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('quantity', {
              required: 'Quantity is required',
              min: { value: 0, message: 'Must be ≥ 0' },
              valueAsNumber: true,
            })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-red-600">{errors.quantity.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            {...register('status')}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Image</label>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-gray-500 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="preview" className="h-36 mx-auto object-contain rounded-lg" />
          ) : (
            <div className="py-4 text-gray-400">
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm">Click to upload</p>
              <p className="text-xs mt-1">JPG, JPEG, PNG — max 5 MB</p>
            </div>
          )}
          {uploading && (
            <p className="text-xs text-blue-600 mt-2">Uploading…</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* hidden field to store the URL returned by the server */}
        <input type="hidden" {...register('imageUrl')} />

        {uploadError && (
          <p className="mt-1 text-xs text-red-600">{uploadError}</p>
        )}
        {preview && !uploading && (
          <button
            type="button"
            onClick={() => { setValue('imageUrl', ''); setPreview(''); }}
            className="mt-1 text-xs text-gray-400 hover:text-red-500"
          >
            Remove image
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save Equipment'}
        </button>
      </div>
    </form>
  );
}
