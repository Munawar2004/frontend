import { useState, useEffect } from 'react';
import SummaryWidget from './components/widgets/SummaryWidget';
import TimeSelector from './components/common/TimeSelector';
import ChartWidget from './components/widgets/ChartWidget';
import TopItemsWidget from './components/widgets/TopItemsWidget';
import { fetchRestaurantDashboardData } from './services/orderService';
import './Dashboard.css';

const DashboardSummary = () => {
  const [timeFrame, setTimeFrame] = useState('Today');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapTimeFrame = (tf) => {
    switch (tf) {
      case 'Today': return 'today';
      case 'week': return 'Week';
      case 'month': return 'Month';
      case 'year': return 'Year';
      default: return 'Day';
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchRestaurantDashboardData(mapTimeFrame(timeFrame));
        // Provide fallback values if fields are missing
        const safeData = {
          orderCount: data?.orderCount ?? 0,
          orderChange: data?.orderChange ?? 0,
          totalRevenue: data?.totalRevenue ?? 0,
          revenueChange: data?.revenueChange ?? 0,
          newCustomers: data?.newCustomers ?? 0,
          customerChange: data?.customerChange ?? 0,
          chartData: Array.isArray(data?.chartData) ? data.chartData : [],
          popularItems: Array.isArray(data?.popularItems) ? data.popularItems : [],
        };
        setOrderData(safeData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setOrderData({
          orderCount: 0,
          orderChange: 0,
          totalRevenue: 0,
          revenueChange: 0,
          newCustomers: 0,
          customerChange: 0,
          chartData: [],
          popularItems: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeFrame]);

  if (loading) {
    return <div className="loading-overlay">Loading dashboard data...</div>;
  }

  if (!orderData) {
    return <div className="error-message">Failed to load dashboard data.</div>;
  }

  return (
    <div className="dashboard-container">
      <TimeSelector activeTime={timeFrame} onTimeChange={setTimeFrame} />

      <div className="widget-row">
        <SummaryWidget
          title="Total Orders"
          value={orderData.orderCount}
          change={orderData.orderChange}
          icon="orders"
          timeFrame={timeFrame}
        />
        <SummaryWidget
          title="Total Revenue"
          value={orderData.totalRevenue}
          change={orderData.revenueChange}
          icon="revenue"
          timeFrame={timeFrame}
          isCurrency
        />
        <SummaryWidget
          title="New Customers"
          value={orderData.newCustomers}
          change={orderData.customerChange}
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
            items={orderData.popularItems}
            timeFrame={timeFrame}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
