import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * columns: [{ key: 'registrationNumber', label: 'Matricule' }, ...]
 * rows: array of plain objects; columns[].key is looked up on each row.
 */
export function exportToPdf(columns, rows, filename) {
  const doc = new jsPDF({ orientation: 'landscape' });
  autoTable(doc, {
    head: [columns.map((c) => c.label)],
    body: rows.map((row) => columns.map((c) => row[c.key] ?? '')),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 140, 42] }
  });
  doc.save(`${filename}.pdf`);
}

export function exportToExcel(columns, rows, filename) {
  const data = rows.map((row) => {
    const record = {};
    columns.forEach((c) => {
      record[c.label] = row[c.key] ?? '';
    });
    return record;
  });
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
