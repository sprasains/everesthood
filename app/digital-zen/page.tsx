"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface DetoxPlan {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  createdAt: string;
}

export default function DigitalZenPlansPage() {
  const [plans, setPlans] = useState<DetoxPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/digital-zen/plans")
      .then((res) => res.json())
      .then((data) => {
        setPlans(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Digital Detox Plans</h1>
      <p className="mb-8 text-center text-gray-600">Choose a plan to start your digital wellness journey.</p>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Link key={plan.id} href={`/digital-zen/${plan.id}`} className="block group">
              <div className="rounded-lg shadow-lg bg-white hover:shadow-2xl transition overflow-hidden flex flex-col h-full border border-gray-100 hover:border-blue-400">
                <Image src={plan.coverImage} alt={plan.title} width={400} height={160} className="h-40 w-full object-cover" />
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition">{plan.title}</h2>
                  <p className="text-gray-600 text-sm flex-1">{plan.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 