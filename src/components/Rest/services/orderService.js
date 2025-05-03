// This is a mock service that would normally fetch data from an API
// In a real application, you would replace this with actual API calls

// Helper function to generate random dates within a range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random order data
const generateOrders = (count, startDate, endDate) => {
  const orders = [];
  const statuses = ['completed', 'in-progress', 'delivered', 'cancelled'];
  const customers = [
    'John Smith', 'Emma Johnson', 'Michael Brown', 'Sophia Davis', 
    'William Miller', 'Olivia Wilson', 'James Moore', 'Isabella Taylor'
  ];
  
  for (let i = 1; i <= count; i++) {
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const total = (Math.random() * 100 + 20).toFixed(2);
    
    orders.push({
      id: 1000 + i,
      customer: customers[Math.floor(Math.random() * customers.length)],
      date: randomDate(startDate, endDate),
      items: `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`,
      total: parseFloat(total),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }
  
  // Sort by date, newest first
  return orders.sort((a, b) => b.date - a.date);
};

// Helper function to generate chart data
const generateChartData = (timeFrame) => {
  let labels = [];
  const now = new Date();
  const orders = [];
  const revenue = [];
  
  switch (timeFrame) {
    case 'day':
      // Hourly data for today
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`;
        const date = new Date(now);
        date.setHours(i, 0, 0, 0);
        labels.push(date);
        
        // More orders and revenue during lunch and dinner times
        const isPeakHour = (i >= 11 && i <= 14) || (i >= 17 && i <= 20);
        const orderCount = isPeakHour 
          ? Math.floor(Math.random() * 15) + 10 
          : Math.floor(Math.random() * 5) + 1;
        const revenueAmount = orderCount * (Math.random() * 20 + 15);
        
        orders.push(orderCount);
        revenue.push(revenueAmount);
      }
      break;
      
    case 'week':
      // Daily data for the week
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        labels.push(date);
        
        // More orders on weekends
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const orderCount = isWeekend 
          ? Math.floor(Math.random() * 50) + 100 
          : Math.floor(Math.random() * 40) + 60;
        const revenueAmount = orderCount * (Math.random() * 20 + 15);
        
        orders.push(orderCount);
        revenue.push(revenueAmount);
      }
      break;
      
    case 'month':
      // Weekly data for the month
      for (let i = 0; i < 4; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - (i * 7));
        labels.push(date);
        
        const orderCount = Math.floor(Math.random() * 200) + 300;
        const revenueAmount = orderCount * (Math.random() * 20 + 15);
        
        orders.push(orderCount);
        revenue.push(revenueAmount);
      }
      labels.reverse();
      orders.reverse();
      revenue.reverse();
      break;
      
    case 'year':
      // Monthly data for the year
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), i, 1);
        labels.push(date);
        
        // More orders during summer and holidays
        const isSummer = i >= 5 && i <= 7;
        const isHoliday = i === 11 || i === 0;
        let orderCount;
        
        if (isHoliday) {
          orderCount = Math.floor(Math.random() * 500) + 1500;
        } else if (isSummer) {
          orderCount = Math.floor(Math.random() * 400) + 1200;
        } else {
          orderCount = Math.floor(Math.random() * 300) + 800;
        }
        
        const revenueAmount = orderCount * (Math.random() * 20 + 15);
        
        orders.push(orderCount);
        revenue.push(revenueAmount);
      }
      break;
  }
  
  return { labels, orders, revenue };
};

// Helper function to generate popular items data
const generatePopularItems = () => {
  return [
    {
      name: 'Margherita Pizza',
      category: 'Main Course',
      count: Math.floor(Math.random() * 50) + 100,
      revenue: Math.floor(Math.random() * 1000) + 2000
    },
    {
      name: 'Caesar Salad',
      category: 'Appetizer',
      count: Math.floor(Math.random() * 30) + 70,
      revenue: Math.floor(Math.random() * 500) + 1000
    },
    {
      name: 'Fettuccine Alfredo',
      category: 'Main Course',
      count: Math.floor(Math.random() * 40) + 60,
      revenue: Math.floor(Math.random() * 800) + 1500
    },
    {
      name: 'Chocolate Cake',
      category: 'Dessert',
      count: Math.floor(Math.random() * 20) + 50,
      revenue: Math.floor(Math.random() * 400) + 800
    },
    {
      name: 'Iced Tea',
      category: 'Beverage',
      count: Math.floor(Math.random() * 60) + 120,
      revenue: Math.floor(Math.random() * 300) + 600
    }
  ];
};

// Main function to fetch order data based on time frame
export const fetchOrderData = (timeFrame) => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date();
      let startDate, endDate;
      let totalOrders, totalRevenue, averageOrder, newCustomers;
      let orderChange, revenueChange, avgOrderChange, customerChange;
      
      // Set date ranges and summary metrics based on time frame
      switch (timeFrame) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date();
          totalOrders = Math.floor(Math.random() * 50) + 100;
          totalRevenue = Math.floor(Math.random() * 2000) + 3000;
          averageOrder = totalRevenue / totalOrders;
          newCustomers = Math.floor(Math.random() * 10) + 5;
          orderChange = Math.floor(Math.random() * 30) - 15;
          revenueChange = Math.floor(Math.random() * 30) - 10;
          avgOrderChange = Math.floor(Math.random() * 20) - 5;
          customerChange = Math.floor(Math.random() * 40) - 10;
          break;
          
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          endDate = new Date();
          totalOrders = Math.floor(Math.random() * 200) + 500;
          totalRevenue = Math.floor(Math.random() * 10000) + 15000;
          averageOrder = totalRevenue / totalOrders;
          newCustomers = Math.floor(Math.random() * 30) + 20;
          orderChange = Math.floor(Math.random() * 25) - 10;
          revenueChange = Math.floor(Math.random() * 30) - 5;
          avgOrderChange = Math.floor(Math.random() * 15) - 5;
          customerChange = Math.floor(Math.random() * 35) - 5;
          break;
          
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          endDate = new Date();
          totalOrders = Math.floor(Math.random() * 500) + 2000;
          totalRevenue = Math.floor(Math.random() * 40000) + 60000;
          averageOrder = totalRevenue / totalOrders;
          newCustomers = Math.floor(Math.random() * 100) + 80;
          orderChange = Math.floor(Math.random() * 20) - 5;
          revenueChange = Math.floor(Math.random() * 25) - 5;
          avgOrderChange = Math.floor(Math.random() * 15) - 5;
          customerChange = Math.floor(Math.random() * 30) + 5;
          break;
          
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          endDate = new Date();
          totalOrders = Math.floor(Math.random() * 5000) + 20000;
          totalRevenue = Math.floor(Math.random() * 400000) + 600000;
          averageOrder = totalRevenue / totalOrders;
          newCustomers = Math.floor(Math.random() * 1000) + 800;
          orderChange = Math.floor(Math.random() * 30) + 5;
          revenueChange = Math.floor(Math.random() * 35) + 10;
          avgOrderChange = Math.floor(Math.random() * 15) + 2;
          customerChange = Math.floor(Math.random() * 40) + 15;
          break;
      }
      
      // Generate orders data
      const recentOrders = generateOrders(10, startDate, endDate);
      const chartData = generateChartData(timeFrame);
      const popularItems = generatePopularItems();
      
      resolve({
        totalOrders,
        totalRevenue,
        averageOrder,
        newCustomers,
        orderChange,
        revenueChange,
        avgOrderChange,
        customerChange,
        recentOrders,
        chartData,
        popularItems
      });
    }, 800);
  });
};