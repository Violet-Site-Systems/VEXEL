// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Chart Components using Chart.js
 */
import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Agent } from '../types';

Chart.register(...registerables);

interface AgentStatusChartProps {
  agents: Agent[];
}

export function AgentStatusChart({ agents }: AgentStatusChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const statusCounts = agents.reduce(
      (acc, agent) => {
        acc[agent.status] = (acc[agent.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts).map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
        datasets: [
          {
            data: Object.values(statusCounts),
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)', // active - green
              'rgba(156, 163, 175, 0.8)', // inactive - gray
              'rgba(245, 158, 11, 0.8)',  // paused - yellow
              'rgba(239, 68, 68, 0.8)',   // error - red
            ],
            borderColor: [
              'rgb(16, 185, 129)',
              'rgb(156, 163, 175)',
              'rgb(245, 158, 11)',
              'rgb(239, 68, 68)',
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.87)',
              padding: 15,
            },
          },
          title: {
            display: true,
            text: 'Agent Status Distribution',
            color: 'rgba(255, 255, 255, 0.87)',
            font: {
              size: 16,
            },
          },
        },
      },
    };

    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      chartRef.current?.destroy();
    };
  }, [agents]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div style={{ height: '300px' }}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}

interface AgentActivityChartProps {
  agents: Agent[];
}

export function AgentActivityChart({ agents }: AgentActivityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Group agents by hour in the last 24 hours
    const now = new Date();
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now);
      hour.setHours(now.getHours() - (23 - i));
      return hour;
    });

    const activityData = hours.map((hour) => {
      return agents.filter((agent) => {
        const heartbeat = new Date(agent.lastHeartbeat);
        return (
          heartbeat >= hour &&
          heartbeat < new Date(hour.getTime() + 60 * 60 * 1000)
        );
      }).length;
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: hours.map((h) => h.getHours() + ':00'),
        datasets: [
          {
            label: 'Agents with Heartbeats',
            data: activityData,
            borderColor: 'rgb(14, 165, 233)',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Agent Heartbeat Activity (Last 24 Hours)',
            color: 'rgba(255, 255, 255, 0.87)',
            font: {
              size: 16,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          y: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              stepSize: 1,
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
      },
    };

    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      chartRef.current?.destroy();
    };
  }, [agents]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div style={{ height: '300px' }}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}
