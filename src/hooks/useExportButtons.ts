export function useExportButtons(data: any[]) {
  return {
    exportCSV: () => alert('Exported CSV!'),
    exportExcel: () => alert('Exported Excel!'),
    exportPDF: () => alert('Exported PDF!'),
  };
} 