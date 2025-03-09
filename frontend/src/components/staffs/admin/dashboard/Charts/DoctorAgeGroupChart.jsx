import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'react-bootstrap';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';

function DoctorAgeGroupChart() {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [chartData, setChartData] = useState({ labels: [], data: [] });

    useEffect(() => {
        // Fetch patient age group data from the backend
        axios.get(`${ip.address}/api/admin/api/doctors/age-group/count`)  // Use the correct API endpoint
            .then(response => {
                const data = response.data.data;

                // Extract labels and counts from the API response
                const labels = data.map(item => item.label);
                const counts = data.map(item => item.count);

                setChartData({ labels, data: counts });
            })
            .catch(error => console.error('Error fetching age group data:', error));
    }, []);

    useEffect(() => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        chartInstanceRef.current = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartData.labels,  // Age groups: ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', 'Above 64']
                datasets: [{
                    label: 'Doctor Age Distribution',
                    backgroundColor: ["#FF5733", "#33FF57", "#3357FF", "#57FF33", "#FF33A6", "#33A6FF", "#A6FF33"], // Customize the colors
                    data: chartData.data,  // Corresponding counts for each age group
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                const label = chartData.labels[tooltipItem.dataIndex];
                                return label + ': ' + tooltipItem.raw;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    },
                },
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [chartData]);

    return (
        <Card className="card-bar-chart shadow">
            <Card.Header className="py-3">
                <h6 className="m-0 font-weight-bold text-primary">Patient Age Group Distribution</h6>
            </Card.Header>
            <Card.Body>
                <div className="chart-pie">
                    <canvas ref={chartRef}></canvas>
                </div>
            </Card.Body>
        </Card>
    );
}

export default DoctorAgeGroupChart;
