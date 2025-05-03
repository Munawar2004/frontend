import { useState, useEffect } from 'react';
import SummaryWidget from './components/widgets/SummaryWidget';
import TimeSelector from './components/common/TimeSelector';
import ChartWidget from './components/widgets/ChartWidget';
import TopItemsWidget from './components/widgets/TopItemsWidget';
import { fetchOrderData } from './services/orderService';
import './Dashboard.css';

const DashboardSummary = () => {
  const [timeFrame, setTimeFrame] = useState('day');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchOrderData(timeFrame);
      setOrderData(data);
      setLoading(false);
    };
    
    loadData();
  }, [timeFrame]);

  if (loading) {
    return <div className="loading-overlay">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      <TimeSelector 
        activeTime={timeFrame} 
        onTimeChange={setTimeFrame} 
      />
      
      <div className="widget-row">
        <SummaryWidget 
          title="Total Orders"
          value={orderData.totalOrders}
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