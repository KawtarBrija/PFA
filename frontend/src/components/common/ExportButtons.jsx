import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { exportToExcel, exportToPdf } from '../../utils/tableExport';

export default function ExportButtons({ columns, rows, filename }) {
  const disabled = !rows.length;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => exportToPdf(columns, rows, filename)}
        className="flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-sm text-ink-muted transition hover:border-brand-500 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FaFilePdf className="text-rose-500" /> PDF
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => exportToExcel(columns, rows, filename)}
        className="flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-sm text-ink-muted transition hover:border-brand-500 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FaFileExcel className="text-emerald-500" /> Excel
      </button>
    </div>
  );
}
