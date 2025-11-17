"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeSeriesScale,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, TimeSeriesScale, Tooltip, Legend, Filler, CategoryScale);

export type Series = { t: number; y: number }[];

function makeDataset(label: string, series: Series, color: string) {
  return {
    label,
    data: series.map((p) => ({ x: p.t, y: p.y })),
    borderColor: color,
    backgroundColor: color + "33",
    pointRadius: 0,
    fill: false,
    tension: 0.1,
  };
}

export function MultiLineChart({
  series,
  labels,
}: {
  series: Series[];
  labels: string[];
}) {
  const colors = ["#2563eb", "#16a34a", "#ef4444", "#7c3aed", "#f59e0b", "#0ea5e9"];
  const datasets = series.map((s, i) => makeDataset(labels[i] ?? `S${i + 1}`, s, colors[i % colors.length]));
  const minT = Math.min(...series.flat().map((p) => p.t));
  const maxT = Math.max(...series.flat().map((p) => p.t));
  return (
    <Line
      data={{ datasets }}
      options={{
        responsive: true,
        scales: {
          x: {
            type: "linear",
            min: minT,
            max: maxT,
            ticks: { color: "#374151" },
            grid: { color: "#e5e7eb" },
          },
          y: {
            ticks: { color: "#374151" },
            grid: { color: "#e5e7eb" },
          },
        },
        plugins: {
          legend: { position: "top" as const },
          tooltip: { mode: "index", intersect: false },
        },
        interaction: { mode: "index" as const, intersect: false },
      }}
    />
  );
}
