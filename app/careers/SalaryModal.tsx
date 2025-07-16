"use client";
import React, { useState } from "react";

export const SalaryModal = ({ open, onClose, jobTitle, location }: { open: boolean; onClose: () => void; jobTitle: string; location: string }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salary, setSalary] = useState<any>(null);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setSalary(null);
    fetch(`/api/salary?job_title=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(location)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch salary");
        return res.json();
      })
      .then((data) => {
        setSalary(data.data?.[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [open, jobTitle, location]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">&times;</button>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Estimated Salary</h2>
        <div className="mb-2 text-gray-700 dark:text-gray-200 text-sm">{jobTitle} in {location}</div>
        {loading ? (
          <div className="animate-pulse h-20 bg-gray-200 dark:bg-gray-800 rounded" />
        ) : error ? (
          <div className="text-red-600 dark:text-red-400">{error}</div>
        ) : salary ? (
          <div className="space-y-2">
            <div><span className="font-semibold">Median:</span> ${salary.median_salary?.toLocaleString(undefined, { maximumFractionDigits: 0 })} {salary.salary_currency} / {salary.salary_period?.toLowerCase()}</div>
            <div><span className="font-semibold">Range:</span> ${salary.min_salary?.toLocaleString(undefined, { maximumFractionDigits: 0 })} - ${salary.max_salary?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-gray-500">Source: {salary.publisher_name} ({salary.salaries_updated_at?.slice(0, 10)})</div>
            {salary.publisher_link && <a href={salary.publisher_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">View on {salary.publisher_name}</a>}
          </div>
        ) : (
          <div className="text-gray-500">No salary data found.</div>
        )}
      </div>
    </div>
  );
};

export default SalaryModal; 