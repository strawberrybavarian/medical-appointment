import React, { useEffect, useRef, useState } from 'react';
import { Container, Card } from 'react-bootstrap';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';

function BarAppointment() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [chartData, setChartData] = useState({ labels: [], data: [] });

  useEffect(() => {
    // Fetch appointment stats from the backend
    axios.get(`${ip.address}/admin/api/appointments/stats`)
      .then(response => {
        const data = response.data;

        // Ensure we have labels and counts for all required statuses
        const requiredStatuses = ['Completed', 'Scheduled', 'Pending', 'Cancelled'];
        const labels = [];
        const counts = [];

        requiredStatuses.forEach(status => {
          const stat = data.find(item => item.status === status);
          labels.push(status);
          counts.push(stat ? stat.count : 0);
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
      type: 'bar',
      data: {
        labels: chartData.labels, // ['Completed', 'Scheduled', 'Pending', 'Cancelled']
        datasets: [{
          label: 'Appointment Statuses', // General label for the dataset
          backgroundColor: "#4e73df",
          hoverBackgroundColor: "#2e59d9",
          borderColor: "#4e73df",
          data: chartData.data, // Data points corresponding to each status
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
              maxTicksLimit: 6
            },
            maxBarThickness: 25,
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
            display: false
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
    
        <Card className="card-bar-chart shadow mb-4">
            <Card.Header className="py-3">
            <h6 className="m-0 font-weight-bold text-primary">Appointment Statuses</h6>
            </Card.Header>
            <Card.Body>
            <div className="chart-bar">
                <canvas id="myBarChart" ref={chartRef}></canvas>
            </div>
            </Card.Body>
        </Card>



  );
}

export default BarAppointment;
