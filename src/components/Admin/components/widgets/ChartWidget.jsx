import { useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";
import "./ChartWidget.css";

Chart.register(...registerables);

const ChartWidget = ({ title, data, timeFrame }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartRef.current && data) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext("2d");

            chartInstance.current = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: data.labels, // Use the 'labels' from your data
                    datasets: [
                        {
                            label: "Orders",
                            data: data.orders,
                            backgroundColor: "rgba(255, 165, 0, 0.8)", // Orange color
                            borderColor: "#FF8C00", // Darker orange border
                            borderWidth: 1,
                            borderRadius: 6,
                            borderSkipped: false,
                            yAxisID: "y",
                            barPercentage: 0.6,
                            categoryPercentage: 0.8,
                        },
                        {
                            label: "Revenue",
                            data: data.revenues,
                            type: "line",
                            borderColor: "#2E7D32",
                            backgroundColor: "rgba(46, 125, 50, 0.1)",
                            borderWidth: 2.5,
                            pointRadius: 4,
                            pointBackgroundColor: "#FFFFFF",
                            pointBorderColor: "#2E7D32",
                            pointBorderWidth: 2,
                            pointHoverRadius: 6,
                            pointHoverBorderWidth: 2,
                            pointHoverBackgroundColor: "#2E7D32",
                            fill: true,
                            tension: 0.4,
                            yAxisID: "revenue",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            mode: "index",
                            intersect: false,
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            titleColor: "#333",
                            bodyColor: "#666",
                            borderColor: "#e0e0e0",
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 8,
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            titleFont: {
                                size: 14,
                                weight: "bold",
                                family: "'SF Pro Display', sans-serif",
                            },
                            bodyFont: {
                                size: 13,
                                family: "'SF Pro Display', sans-serif",
                            },
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || "";
                                    if (label) {
                                        label += ": ";
                                    }
                                    if (context.parsed.y !== null) {
                                        if (
                                            context.dataset.yAxisID ===
                                            "revenue"
                                        ) {
                                            label += new Intl.NumberFormat(
                                                "en-US",
                                                {
                                                    style: "currency",
                                                    currency: "USD",
                                                    minimumFractionDigits: 0,
                                                }
                                            ).format(context.parsed.y);
                                        } else {
                                            label += context.parsed.y;
                                        }
                                    }
                                    return label;
                                },
                            },
                        },
                        legend: {
                            position: "top",
                            align: "end",
                            labels: {
                                usePointStyle: true,
                                boxWidth: 6,
                                padding: 20,
                                font: {
                                    size: 12,
                                    family: "'SF Pro Display', sans-serif",
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false,
                            },
                            ticks: {
                                display: true, // Set this to true to show ticks
                                font: {
                                    size: 11,
                                    family: "'SF Pro Display', sans-serif",
                                },
                                color: "#666",
                                padding: 8,
                            },
                            border: {
                                display: false,
                            },
                        },
                        y: {
                            position: "left",
                            grid: {
                                color: "rgba(247, 143, 24, 0.06)",
                                drawBorder: false,
                            },
                            ticks: {
                                font: {
                                    size: 11,
                                    family: "'SF Pro Display', sans-serif",
                                },
                                color: "#666",
                                padding: 8,
                            },
                            border: {
                                display: false,
                            },
                        },
                        revenue: {
                            position: "right",
                            grid: {
                                display: false,
                            },
                            ticks: {
                                callback: function (value) {
                                    return "₹" + value;
                                },
                                font: {
                                    size: 11,
                                    family: "'SF Pro Display', sans-serif",
                                },
                                color: "#666",
                                padding: 8,
                            },
                            border: {
                                display: false,
                            },
                        },
                    },
                    interaction: {
                        mode: "index",
                        intersect: false,
                    },
                    animation: {
                        duration: 1000,
                        easing: "easeOutQuart",
                    },
                },
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, timeFrame]);

    return (
        <div className="widget-container">
            <div className="widget-header">
                <h3 className="widget-title">{title}</h3>
            </div>
            <div className="chart-container">
                <canvas ref={chartRef} />
            </div>
        </div>
    );
};

export default ChartWidget;
