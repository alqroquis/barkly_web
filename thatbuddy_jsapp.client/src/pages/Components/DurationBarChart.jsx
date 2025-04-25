import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';


const PetActivityChart = ({ data, type }) => {
    const chartRef = useRef(null);
    const canvasRef = useRef(null);
    const [averageValues, setAverageValues] = useState({ distance: 0, duration: 0 });

    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (!data || data.length === 0) return;

        const groupedData = data.reduce((acc, item) => {
            const dateKey = new Date(item.createdat).toLocaleDateString();

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    distancekm: 0,
                    durationminutes: 0,
                    date: dateKey
                };
            }

            acc[dateKey].distancekm += item.distancekm || 0;
            acc[dateKey].durationminutes += item.durationminutes || 0;

            return acc;
        }, {});

        const summedData = Object.values(groupedData);

        const calculateAverages = () => {
            const totalDistance = summedData.reduce((sum, item) => sum + item.distancekm, 0);
            const totalDuration = summedData.reduce((sum, item) => sum + item.durationminutes, 0);

            return {
                distance: (totalDistance / summedData.length).toFixed(2),
                duration: Math.round(totalDuration / summedData.length)
            };
        };

        setAverageValues(calculateAverages());

        const generateLast30DaysLabels = () => {
            const days = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                days.push(date.toLocaleDateString());
            }
            return days;
        };

        const labels = generateLast30DaysLabels();

        const dataByDate = {};
        summedData.forEach(item => {
            dataByDate[item.date] = item;
        });

        const chartValues = labels.map(date => {
            const item = dataByDate[date];
            return item ? (type === 'distance' ? item.distancekm : item.durationminutes) : 0;
        });

        const chartData = {
            labels: labels,
            datasets: [{
                label: type === 'distance'
                    ? 'Пройденное расстояние (км)'
                    : 'Длительность прогулок (минуты)',
                data: chartValues,
                backgroundColor: type === 'distance'
                    ? 'rgba(153, 102, 255, 0.6)'
                    : 'rgba(75, 192, 192, 0.6)',
                borderColor: type === 'distance'
                    ? 'rgba(153, 102, 255, 1)'
                    : 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };

        const ctx = canvasRef.current.getContext('2d');

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: type === 'distance' ? 'Километры' : 'Минуты'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Дата'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${context.parsed.y} ${type === 'distance' ? 'км' : 'мин'}`;
                            }
                        }
                    }
                }
            }
        });

    }, [data, type]);

    return (
        <div className="w-100">
            <div className="mb-2">
                {type === 'distance'
                    ? <p className="mb-0">Среднее расстояние: <strong>{averageValues?.distance} км</strong></p>
                    : <p className="mb-0">Среднее время: <strong>{averageValues?.duration} мин</strong></p>}
            </div>
            <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};


export const TrainingChart = ({ data }) => {
    const chartRef = useRef(null);
    const canvasRef = useRef(null);
    const [averageDuration, setAverageDuration] = useState(0);

    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (!data || data.length === 0) return;

        const groupedData = data.reduce((acc, item) => {
            const dateKey = new Date(item.createdat).toLocaleDateString();

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    durationminutes: 0,
                    date: dateKey
                };
            }

            acc[dateKey].durationminutes += item.durationminutes || 0;

            return acc;
        }, {});

        const summedData = Object.values(groupedData);

        const avgDuration = summedData.reduce((sum, item) => sum + item.durationminutes, 0) / summedData.length;
        setAverageDuration(Math.round(avgDuration));

        const generateLast30DaysLabels = () => {
            const days = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                days.push(date.toLocaleDateString());
            }
            return days;
        };

        const labels = generateLast30DaysLabels();

        const dataByDate = {};
        summedData.forEach(item => {
            dataByDate[item.date] = item;
        });

        const chartValues = labels.map(date => {
            const item = dataByDate[date];
            return item ? item.durationminutes : 0;
        });

        const ctx = canvasRef.current.getContext('2d');

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Длительность тренировок (минуты)',
                    data: chartValues,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Минуты'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Дата'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `Тренировка: ${context.parsed.y} мин`;
                            }
                        }
                    }
                }
            }
        });
    }, [data]);

    return (
        <div className="w-100">
            <div className="mb-2">
                <p className="mb-0">Средняя продолжительность тренировок: <strong>{averageDuration} мин/день</strong></p>
            </div>
            <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};


export const WeightChart = ({ data }) => {
    const chartRef = useRef(null);
    const canvasRef = useRef(null);
    const [averageWeight, setAverageWeight] = useState(0);

    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (!data || data.length === 0) return;

        const groupedData = data.reduce((acc, item) => {
            const dateKey = new Date(item.createdAt).toLocaleDateString();
            const existingItem = acc[dateKey];

            if (existingItem) {
                const currentTime = new Date(item.createdAt).getTime();
                const existingTime = new Date(existingItem.createdAt).getTime();

                if (currentTime > existingTime) {
                    acc[dateKey] = item;
                }
            } else {
                acc[dateKey] = item;
            }

            return acc;
        }, {});

        const uniqueData = Object.values(groupedData)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const avg = uniqueData.reduce((sum, item) => sum + item.weightKg, 0) / uniqueData.length;
        setAverageWeight(avg.toFixed(2));

        const labels = uniqueData.map(item => new Date(item.createdAt).toLocaleDateString());
        const weights = uniqueData.map(item => item.weightKg);

        const ctx = canvasRef.current.getContext('2d');

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Вес питомца (кг)',
                    data: weights,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Вес (кг)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Дата'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const date = new Date(data.find(
                                    item => new Date(item.createdAt).toLocaleDateString() === context.label
                                ).createdAt);
                                return `Вес: ${context.parsed.y} кг (${date.toLocaleTimeString()})`;
                            }
                        }
                    }
                }
            }
        });
    }, [data]);

    return (
        <div className="w-100">
            <div className="mb-2">
                <p className="mb-0">Средний вес: <strong>{averageWeight} кг</strong></p>
            </div>
            <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};


export default PetActivityChart;