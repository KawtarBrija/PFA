import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';

/**
 * `sort` follows Spring's "field,direction" convention (e.g. "entryDateTime,desc").
 */
export default function SortableHeader({ field, label, sort, onSortChange }) {
  const [activeField, direction] = sort.split(',');
  const isActive = activeField === field;

  const toggle = () => {
    if (!isActive) {
      onSortChange(`${field},asc`);
    } else {
      onSortChange(`${field},${direction === 'asc' ? 'desc' : 'asc'}`);
    }
  };

  const Icon = !isActive ? FaSort : direction === 'asc' ? FaSortUp : FaSortDown;

  return (
    <th className="py-3">
      <button type="button" onClick={toggle} className="flex items-center gap-1.5 text-left transition hover:text-slate-100">
        {label}
        <Icon className={isActive ? 'text-brand-400' : 'text-slate-600'} />
      </button>
    </th>
  );
}
