import { format } from 'date-fns';
import './TimeSelector.css';

const TimeSelector = ({ activeTime, onTimeChange }) => {
  const timeOptions = [
    { id: 'Today', label: 'Today' },
    { id: 'Week', label: 'This Week' },
    { id: 'Month', label: 'This Month' },
    { id: 'Year', label: 'This Year' }
  ];

  const today = format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="time-selector-container">
      <div className="date-display">
        <span className="current-date">{today}</span>
        <span className="date-label">Dashboard Overview</span>
      </div>
      <div className="toggle-group">
        {timeOptions.map((option) => (
          <button
            key={option.id}
            className={`toggle-button ${activeTime === option.id ? 'active' : ''}`}
            onClick={() => onTimeChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSelector;