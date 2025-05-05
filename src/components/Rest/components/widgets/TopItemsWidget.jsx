import './TopItemsWidget.css';

const TopItemsWidget = ({ title, items, timeFrame }) => {
  if (!items || items.length === 0) {
    return (
      <div className="widget-container">
        <div className="widget-header">
          <h3 className="widget-title">{title}</h3>
        </div>
        <div className="empty-state">No items to display</div>
      </div>
    );
  }

  return (
      <div className="widget-container">
          <div className="widget-header">
              <h3 className="widget-title">{title}</h3>
          </div>
          <div className="items-list">
              {items.map((item, index) => (
                  <div key={index} className="item-row">
                      <div className="item-infos">
                          <div className="item-image">
                              {item.name.charAt(0)}
                          </div>
                          <div>
                              <div className="item-name">{item.name}</div>
                              <div className="item-category">
                                  {item.category_name}
                              </div>
                          </div>
                      </div>
                      <div className="item-stats">
                          <div className="item-count">
                              {item.total_orders} orders
                          </div>
                          {/* <div className="item-revenue">
                              ${item.revenue.toLocaleString()}
                          </div> */}
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );
};

export default TopItemsWidget;