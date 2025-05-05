import { useState, useEffect } from "react";
import SummaryWidget from "./components/widgets/SummaryWidget";
import TimeSelector from "./components/common/TimeSelector";
import ChartWidget from "./components/widgets/ChartWidget";
import TopItemsWidget from "./components/widgets/TopItemsWidget";
import { fetchOrderData } from "./services/orderService";
import "./Dashboard.css";

const DashboardSummary = () => {
    const [timeFrame, setTimeFrame] = useState("Today");
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //   const loadData = async () => {
    //     setLoading(true);
    //     const data = await fetchOrderData(timeFrame);
    //     setOrderData(data);
    //     setLoading(false);
    //   };

    //   loadData();
    // }, [timeFrame]);

    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem("token");
            setLoading(true);
            if (!token) {
                alert("Authentication failed. Please login again.");
                return;
            }

            console.log("Time Frame", timeFrame);

            try {
                const response = await fetch(
                    `http://localhost:5191/api/dashboards/restaurant?statsOf=${timeFrame}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Failed to fetch orders"
                    );
                }

                const data = await response.json();
                console.log("Fetched data:", data.data);
                setOrderData(data.data);
            } catch (err) {
                console.error("Fetch orders error:", err.message);
                //  setError(err.message);
            }
            // setOrderData(data);
            setLoading(false);
        };

        loadData();
    }, [timeFrame]);

    if (loading) {
        return <div className="loading-overlay">Loading dashboard data...</div>;
    }

    return (
        <div className="dashboard-container">
            <TimeSelector activeTime={timeFrame} onTimeChange={setTimeFrame} />

            <div className="widget-row">
                <SummaryWidget
                    title="Total Orders"
                    value={orderData.ordersCount}
                    change={null}
                    icon="orders"
                    timeFrame={timeFrame}
                />
                <SummaryWidget
                    title="Total Revenue"
                    value={orderData.revenue}
                    change={null}
                    icon="revenue"
                    timeFrame={timeFrame}
                    isCurrency
                />
                <SummaryWidget
                    title="Menu Items"
                    value={orderData.menuItemsCount}
                    change={null}
                    icon="customers"
                    timeFrame={timeFrame}
                />
            </div>

            <div className="main-section">
                <div className="chart-section">
                    <ChartWidget
                        title="Orders Overview"
                        data={orderData.chartData}
                        timeFrame={timeFrame}
                    />
                </div>
                <div className="table-section">
                    <TopItemsWidget
                        title="Popular Items"
                        items={orderData.topItems}
                        timeFrame={timeFrame}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardSummary;
