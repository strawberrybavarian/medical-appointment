import React, { useEffect, useRef, useState } from 'react';
import { Container, Card } from 'react-bootstrap';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';

function LineCompletedAppointments() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [chartData, setChartData] = useState({ labels: [], data: [] });

  useEffect(() => {
    // Fetch appointment stats from the backend
    axios.get(`${ip.address}/api/admin/api/appointments/completed-by-month`)
      .then(response => {
        const data = response.data;

        const labels = [];
        const counts = [];

        data.forEach(item => {
          const monthName = new Date(item.year, item.month - 1).toLocaleString('default', { month: 'long' });
          labels.push(`${monthName} ${item.year}`);
          counts.push(item.count);
        });

        setChartData({ labels, data: counts });
      })
      .catch(error => console.error('Error fetching appointment stats:', error));
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels, // ['January 2023', 'February 2023', ...]
        datasets: [{
          label: 'Completed Appointments',
          borderColor: "#4e73df",
          pointBackgroundColor: "#4e73df",
          pointBorderColor: "#4e73df",
          fill: false,
          data: chartData.data, // Data points corresponding to each month
        }],
      },
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 10,
            right: 25,
            top: 25,
            bottom: 0
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              maxTicksLimit: 12
            },
          },
          y: {
            ticks: {
              min: 0,
              maxTicksLimit: 5,
              padding: 10,
              callback: function(value) {
                return value; // Just display the number
              }
            },
            grid: {
              color: "rgb(234, 236, 244)",
              zeroLineColor: "rgb(234, 236, 244)",
              drawBorder: false,
              borderDash: [2],
              zeroLineBorderDash: [2]
            }
          },
        },
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            titleMarginBottom: 10,
            titleFont: {
              size: 14,
              family: 'Nunito, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            },
            backgroundColor: "rgb(255,255,255)",
            bodyColor: "#858796",
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            caretPadding: 10,
            callbacks: {
              label: function(tooltipItem) {
                const label = chartData.labels[tooltipItem.dataIndex]; // Get the correct label
                return label + ': ' + tooltipItem.raw;
              }
            }
          },
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
    <Card className="card-line-chart shadow">
      <Card.Header className="py-3">
        <h6 className="m-0 font-weight-bold text-primary">Completed Appointments by Month</h6>
      </Card.Header>
      <Card.Body>
        <div className="chart-line">
          <canvas id="myLineChart" ref={chartRef}></canvas>
        </div>
      </Card.Body>
    </Card>
  );
}

export default LineCompletedAppointments;
