import { useExportButtons } from '../../../src/hooks/useExportButtons';

export default function ExportButtons({ data }: any) {
  const { exportCSV, exportExcel, exportPDF } = useExportButtons(data);
  return (
    <div>
      <button onClick={exportCSV}>Export CSV</button>
      <button onClick={exportExcel}>Export Excel</button>
      <button onClick={exportPDF}>Export PDF</button>
    </div>
  );
} 