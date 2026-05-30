"use client";

import { useEffect, useState } from "react";

interface RadarChartProps {
  data: Record<string, number>;
  labels: Record<string, string>;
  color?: string;
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

export default function RadarChart({ data, labels, color = "oklch(0.6 0.2 250)", size = 240 }: RadarChartProps) {
  const keys = Object.keys(data);
  const count = keys.length;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const levels = 5;
  const angleStep = 360 / count;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const gridLines = Array.from({ length: levels }, (_, i) => {
    const r = (radius / levels) * (i + 1);
    const points = keys.map((_, j) => {
      const p = polarToCartesian(cx, cy, r, j * angleStep);
      return `${p.x},${p.y}`;
    });
    return points.join(" ");
  });

  const axisLines = keys.map((_, j) => {
    const p = polarToCartesian(cx, cy, radius, j * angleStep);
    return { x1: cx, y1: cy, x2: p.x, y2: p.y };
  });

  const dataPoints = keys.map((key, i) => {
    const val = (data[key] || 0) / 99;
    const r = radius * val;
    const p = polarToCartesian(cx, cy, r * (animated ? 1 : 0.05), i * angleStep);
    return { x: p.x, y: p.y, label: labels[key] || key, value: data[key] };
  });

  const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
      {/* Grid */}
      {gridLines.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeWidth={1}
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((line, i) => (
        <line key={i} {...line} stroke="currentColor" strokeOpacity={0.06} strokeWidth={1} />
      ))}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill={color}
        fillOpacity={0.2}
        stroke={color}
        strokeWidth={2}
        className="transition-all duration-1000 ease-out"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={color}
          className="transition-all duration-1000 ease-out"
        />
      ))}

      {/* Labels */}
      {dataPoints.map((p, i) => {
        const labelR = radius * 1.22;
        const lp = polarToCartesian(cx, cy, labelR, i * angleStep);
        return (
          <text
            key={i}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-muted-foreground text-[9px] font-bold uppercase tracking-wider"
          >
            {p.label}
          </text>
        );
      })}

      {/* Values */}
      {dataPoints.map((p, i) => {
        const vr = radius * 0.78;
        const vp = polarToCartesian(cx, cy, vr, i * angleStep);
        return (
          <text
            key={`v-${i}`}
            x={vp.x}
            y={vp.y}
            textAnchor="middle"
            dominantBaseline="central"
            className={`fill-foreground text-[11px] font-black tabular-nums transition-all duration-1000 ease-out ${animated ? "opacity-100" : "opacity-0"}`}
          >
            {p.value}
          </text>
        );
      })}
    </svg>
  );
}
