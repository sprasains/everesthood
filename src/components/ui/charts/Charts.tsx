import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

interface LineChartProps {
  labels: (string | number | Date)[];
  datasets: { label: string; data: (number | null)[]; borderColor?: string; backgroundColor?: string }[];
  time?: boolean; // if true, use time scale for x axis
}

export const LineChart: React.FC<LineChartProps> = ({ labels, datasets, time = false }) => {
  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      tension: 0.3,
    })),
  };

  const options: any = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: time
      ? {
          x: {
            type: 'time',
            time: {
              unit: 'day',
            },
          },
          y: {
            beginAtZero: true,
          },
        }
      : {},
  };

  return <Line data={data} options={options} />;
};

export default LineChart;
