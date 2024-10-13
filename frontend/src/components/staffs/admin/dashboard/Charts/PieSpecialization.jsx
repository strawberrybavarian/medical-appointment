import React, { useEffect, useRef, useState } from 'react';
import { Container, Card } from 'react-bootstrap';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';

function PieSpecialization() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [chartData, setChartData] = useState({ labels: [], data: [] });

  useEffect(() => {
    // Fetch doctor specialty stats from the backend
    axios.get(`${ip.address}/api/api/doctor-specialty-stats`)
      .then(response => {
        const data = response.data;
        const labels = data.map(item => item.specialty);
        const counts = data.map(item => item.count);

        setChartData({ labels, data: counts });
      })
      .catch(error => console.error('Error fetching doctor specialty stats:', error));
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Number of Doctors',
          data: chartData.data,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6347', '#ADFF2F', '#FFD700', '#B0E0E6',
            '#B22222', '#8B4513', '#2E8B57', '#4682B4', '#D2691E', '#00CED1', '#1E90FF'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return tooltipItem.label + ': ' + tooltipItem.raw;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData]);

  return (
 
      <Card className="card-bar-chart shadow mb-4">
        <Card.Header className="py-3">
          <h6 className="m-0 font-weight-bold text-primary">Doctor Specialties</h6>
        </Card.Header>
        <Card.Body>
          <div className="chart-pie">
            <canvas ref={chartRef}></canvas>
          </div>
        </Card.Body>
      </Card>
    
  );
}

export default PieSpecialization;
