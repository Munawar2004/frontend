import { FaShoppingCart, FaUsers,FaRupeeSign  } from 'react-icons/fa';
import './SummaryWidget.css';

const SummaryWidget = ({ title, value, change, icon, timeFrame, isCurrency = false }) => {
  const isPositive = change >= 0;
  const changeValue = Math.abs(change);
  const changeFormatted = isPositive ? `+${changeValue}%` : `-${changeValue}%`;
  
  const getIcon = (iconType) => {
    switch (iconType) {
      case 'orders': return <FaShoppingCart />;
      case 'revenue': return <FaRupeeSign />;
      case 'customers': return <FaUsers />;
      default: return <FaShoppingCart />;
    }
  };

  const formatValue = (value, isCurrency) => {
    if (isCurrency) {
      return `₹${value.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
    return value.toLocaleString();
  };

  const getTimePeriodText = (timeFrame) => {
    switch (timeFrame) {
      case 'day': return 'vs yesterday';
      case 'week': return 'vs last week';
      case 'month': return 'vs last month';
      case 'year': return 'vs last year';
      default: return '';
    }
  };
  
  return (
    <div className="summary-widget">
      <div className="summary-header">
        <h3 className="summary-title">{title}</h3>
        <div className={`icon-box ${icon}`}>
          {getIcon(icon)}
        </div>
      </div>
      <div className="summary-value">{formatValue(value, isCurrency)}</div>
      <div className={`change-container ${isPositive ? 'change-positive' : 'change-negative'}`}>
        {changeFormatted}
        <span className="time-period">{getTimePeriodText(timeFrame)}</span>
      </div>
    </div>
  );
};

export default SummaryWidget;