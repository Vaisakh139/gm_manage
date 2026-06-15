import type { Equipment, EquipmentStatus } from '../../types';

interface Props {
  equipment: Equipment;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (id: number) => void;
  readOnly?: boolean;
}

const statusConfig: Record<EquipmentStatus, { label: string; cls: string }> = {
  AVAILABLE:         { label: 'Available',          cls: 'bg-green-100 text-green-800' },
  UNDER_MAINTENANCE: { label: 'Under Maintenance',  cls: 'bg-yellow-100 text-yellow-800' },
  OUT_OF_SERVICE:    { label: 'Out of Service',      cls: 'bg-red-100 text-red-800' },
};

const IMAGE_BASE = 'http://localhost:8080';

export default function EquipmentCard({ equipment, onEdit, onDelete, readOnly = false }: Props) {
  const statusInfo = statusConfig[equipment.status];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
        {equipment.imageUrl ? (
          <img
            src={`${IMAGE_BASE}${equipment.imageUrl}`}
            alt={equipment.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
          />
        ) : (
          <div className="text-5xl text-gray-300">🏋️</div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{equipment.name}</h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${statusInfo.cls}`}>
            {statusInfo.label}
          </span>
        </div>

        {equipment.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{equipment.description}</p>
        )}

        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="text-base">📦</span>
          <span>Qty: <strong>{equipment.quantity}</strong></span>
        </div>
      </div>

      {/* Actions */}
      {!readOnly && (onEdit || onDelete) && (
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(equipment)}
              className="flex-1 text-sm font-medium border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(equipment.id)}
              className="flex-1 text-sm font-medium bg-red-50 text-red-700 border border-red-100 rounded-lg py-1.5 hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
