import CrudManager from "@/components/ui/CrudManager";

export default function DocsPage() {
  return (
    <CrudManager
      title="Documents"
      apiBase="/api/v1/docs"
      itemLabel="Document"
      fields={[
        { name: "fileName", label: "File Name", required: true },
        { name: "fileUrl", label: "File URL", required: true },
        { name: "category", label: "Category", required: true },
      ]}
    />
  );
} 