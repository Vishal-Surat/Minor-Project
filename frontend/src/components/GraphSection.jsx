// src/components/GraphSection.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GraphSection = ({ data }) => {
  // Default empty data structure if no data provided
  const defaultData = {
    labels: ['low', 'medium', 'high', 'critical'],
    datasets: [
      {
        label: 'Severity Distribution',
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
      }
    ]
  };

  // If no data provided or empty data, use default
  const chartData = data && data.labels && data.datasets ? data : defaultData;

  // Options for the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Security Events by Severity',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Count: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        },
        title: {
          display: true,
          text: 'Number of Events'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Severity Level'
        }
      }
    }
  };

  // Prepare data for display - convert data objects to simple array if needed
  const preparedData = {
    ...chartData,
    datasets: chartData.datasets.map(dataset => {
      if (dataset.data && dataset.data.length > 0 && typeof dataset.data[0] === 'object') {
        // If data is array of objects with severity and count properties
        return {
          ...dataset,
          data: chartData.labels.map(label => {
            const matchingItem = dataset.data.find(item => item.severity === label);
            return matchingItem ? matchingItem.count : 0;
          })
        };
      }
      return dataset;
    })
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Security Analytics</h3>
        <p className="text-sm text-gray-500">Distribution of security events by severity</p>
      </div>
      <div className="p-4">
        <div style={{ height: '300px', position: 'relative' }}>
          <Bar data={preparedData} options={options} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded p-3 text-center">
            <div className="text-2xl font-bold">
              {preparedData.datasets[0].data.reduce((acc, val) => acc + val, 0)}
            </div>
            <div className="text-xs text-gray-500">Total Events</div>
          </div>
          <div className="bg-red-50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-red-600">
              {preparedData.datasets[0].data[3] || 0}
            </div>
            <div className="text-xs text-gray-500">Critical Events</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphSection;
