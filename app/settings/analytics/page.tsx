"use client";
import React from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale
);

const guideViews = [
  { title: "How to Create Your First Budget", views: 120, favorites: 40 },
  { title: "Decoding Your Paycheck", views: 90, favorites: 25 },
  { title: "5 Steps to Start a Side Hustle", views: 150, favorites: 60 },
  { title: "Building a Winning Resume", views: 70, favorites: 15 },
];

const categoryCounts = [
  { category: "Finance", count: 210 },
  { category: "Career", count: 220 },
];

const readingActivity = [
  { date: "2024-06-01", count: 2 },
  { date: "2024-06-02", count: 1 },
  { date: "2024-06-03", count: 3 },
  { date: "2024-06-04", count: 2 },
  { date: "2024-06-05", count: 4 },
  { date: "2024-06-06", count: 1 },
  { date: "2024-06-07", count: 2 },
];

export default function AnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Most Popular Guides</h2>
          <Bar
            data={{
              labels: guideViews.map((g) => g.title),
              datasets: [
                {
                  label: "Views",
                  data: guideViews.map((g) => g.views),
                  backgroundColor: "#60a5fa",
                },
                {
                  label: "Favorites",
                  data: guideViews.map((g) => g.favorites),
                  backgroundColor: "#fbbf24",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" as const },
                title: { display: false },
              },
            }}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
          <Pie
            data={{
              labels: categoryCounts.map((c) => c.category),
              datasets: [
                {
                  data: categoryCounts.map((c) => c.count),
                  backgroundColor: ["#34d399", "#60a5fa"],
                },
              ],
            }}
            options={{
              plugins: {
                legend: { position: "bottom" as const },
              },
            }}
          />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Reading Activity Over Time</h2>
        <Line
          data={{
            labels: readingActivity.map((r) => r.date),
            datasets: [
              {
                label: "Guides Read",
                data: readingActivity.map((r) => r.count),
                borderColor: "#6366f1",
                backgroundColor: "#a5b4fc",
                fill: true,
                tension: 0.4,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: {
                title: { display: true, text: "Date" },
              },
              y: {
                title: { display: true, text: "Guides Read" },
                beginAtZero: true,
                ticks: { stepSize: 1 },
              },
            },
          }}
        />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Insights & Tips</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>&quot;5 Steps to Start a Side Hustle&quot; is the most favorited guide.</li>
          <li>Finance and Career guides are equally popular among users.</li>
          <li>Reading activity peaks mid-week; consider publishing new guides on Wednesdays.</li>
          <li>Encourage users to favorite guides for quick access and recommendations.</li>
        </ul>
      </div>
    </div>
  );
} 