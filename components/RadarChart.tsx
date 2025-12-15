"use client";
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RadarChart({ labels, data }: { labels: string[]; data: number[] }) {
  const dataset = {
    labels,
    datasets: [
      {
        label: 'Scores',
        data,
        backgroundColor: 'rgba(59,107,255,0.15)',
        borderColor: 'rgba(59,107,255,0.9)',
        borderWidth: 2,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgba(59,107,255,0.9)',
      },
    ],
  };

  const options = {
    maintainAspectRatio: true,
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: { stepSize: 1 },
      },
    },
  } as any;

  return <Radar data={dataset} options={options} />;
}
