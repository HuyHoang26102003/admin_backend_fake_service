const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const ADMIN_BACKEND_URL = 'http://127.0.0.1:1310';
const FAKE_BACKEND_URL = 'http://127.0.0.1:3000';
const INTERVAL_SECONDS = 30;

// Helper function to generate realistic daily data arrays
function generateDailyData(days = 30, baseValue = 1000, variance = 0.3) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const value = Math.floor(baseValue + (Math.random() - 0.5) * 2 * baseValue * variance);
    data.push({
      date: dateStr,
      total_amount: Math.max(0, value)
    });
  }
  return data;
}

// Helper function to generate order stats data
function generateOrderStats(days = 30) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const completed = Math.floor(Math.random() * 50) + 20;
    const cancelled = Math.floor(Math.random() * 10) + 2;
    
    data.push({
      date: dateStr,
      completed,
      cancelled
    });
  }
  return data;
}

// Helper function to generate user growth data
function generateUserGrowthData(days = 30) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    data.push({
      date: dateStr,
      driver: Math.floor(Math.random() * 15) + 5,
      restaurant: Math.floor(Math.random() * 8) + 2,
      customer: Math.floor(Math.random() * 100) + 50,
      customer_care: Math.floor(Math.random() * 3) + 1
    });
  }
  return data;
}

// Generate completely fake admin chart data
function generateFakeChartData() {
  const now = Date.now();
  const startOfDay = Math.floor(now / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000) / 1000;
  const endOfDay = startOfDay + (24 * 60 * 60) - 1;

  // Generate realistic but fake metrics
  const totalUsers = Math.floor(Math.random() * 200) + 600; // 600-800 users
  const newUsersThisWeek = Math.floor(Math.random() * 50) + 100; // 100-150 new users
  const soldPromotions = Math.floor(Math.random() * 20) + 5; // 5-25 promotions
  const grossFromPromotion = (Math.random() * 2000 + 1000).toFixed(2); // $1000-3000
  const avgSatisfaction = (Math.random() * 1 + 4).toFixed(1); // 4.0-5.0
  const avgDeliveryTime = Math.floor(Math.random() * 10) + 30; // 30-40 minutes
  const cancellationRate = (Math.random() * 0.1 + 0.05).toFixed(3); // 5-15%
  const orderVolume = Math.floor(Math.random() * 50) + 180; // 180-230 orders
  const churnRate = (Math.random() * 0.05 + 0.02).toFixed(3); // 2-7%

  return {
    id: `FF_ADMIN_CHART_${uuidv4()}`,
    period_type: 'daily',
    period_start: startOfDay,
    period_end: endOfDay,
    total_users: totalUsers,
    sold_promotions: soldPromotions,
    net_income: generateDailyData(30, 800, 0.4), // Net income (lower than gross)
    gross_income: generateDailyData(30, 1200, 0.3), // Gross income
    order_stats: generateOrderStats(30),
    user_growth_rate: generateUserGrowthData(30),
    gross_from_promotion: parseFloat(grossFromPromotion),
    average_customer_satisfaction: parseFloat(avgSatisfaction),
    average_delivery_time: avgDeliveryTime * 60, // Convert to seconds
    order_cancellation_rate: parseFloat(cancellationRate),
    order_volume: orderVolume,
    churn_rate: parseFloat(churnRate),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Direct database insertion via fake backend
async function insertChartDataDirectly() {
  try {
    const chartData = generateFakeChartData();
    
    // Log current metrics being generated
    console.log(`📊 [${new Date().toLocaleTimeString()}] Generating new chart data...`);
    console.log(`👥 Total Users: ${chartData.total_users} (+${chartData.user_growth_rate.slice(-7).reduce((sum, day) => sum + day.customer, 0)} this week)`);
    console.log(`💰 Gross Income: $${chartData.gross_income.slice(-1)[0]?.total_amount || 0} (today)`);
    console.log(`⭐ Avg Satisfaction: ${chartData.average_customer_satisfaction}/5.0`);
    console.log(`🚚 Avg Delivery: ${Math.floor(chartData.average_delivery_time / 60)}min`);
    console.log(`📦 Order Volume: ${chartData.order_volume}`);
    console.log(`📈 Sold Promotions: ${chartData.sold_promotions}`);
    console.log(`💸 Promotion Revenue: $${chartData.gross_from_promotion}`);
    console.log(`❌ Cancellation Rate: ${(chartData.order_cancellation_rate * 100).toFixed(1)}%`);
    console.log(`🔄 Churn Rate: ${(chartData.churn_rate * 100).toFixed(1)}%`);

    // Try to insert directly into database via fake backend
    const response = await axios.post(`${FAKE_BACKEND_URL}/direct-db-insert/admin-chart`, chartData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    if (response.status === 201 || response.status === 200) {
      console.log('✅ Chart data inserted directly into database!');
      console.log(`📊 Record ID: ${chartData.id}`);
    } else {
      console.log('⚠️  Unexpected response from direct database insertion');
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Error inserting chart data: Fake backend not running on port 3000');
      console.log('💡 Please start the fake backend server first: npm run start:dev');
    } else if (error.response?.status === 404) {
      console.log('❌ Direct database insertion endpoint not found');
      console.log('💡 Creating the endpoint in fake backend...');
      await createDirectInsertEndpoint();
    } else {
      console.log('❌ Error inserting chart data:', error.message);
      console.log('💡 Falling back to admin-chart/update endpoint...');
      await fallbackToUpdateEndpoint();
    }
  }
}

// Fallback to the original update endpoint
async function fallbackToUpdateEndpoint() {
  try {
    const now = Date.now();
    const startOfDay = Math.floor(now / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000) / 1000;
    const endOfDay = startOfDay + (24 * 60 * 60) - 1;

    const response = await axios.post(`${ADMIN_BACKEND_URL}/admin-chart/update`, {
      startDate: startOfDay,
      endDate: endOfDay,
      periodType: 'daily'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    if (response.status === 201 || response.status === 200) {
      console.log('✅ Chart data generated successfully via admin-chart/update!');
    }
  } catch (fallbackError) {
    console.log('❌ Fallback also failed:', fallbackError.message);
  }
}

// Create the direct insert endpoint in fake backend
async function createDirectInsertEndpoint() {
  console.log('🔧 Setting up direct database insertion endpoint...');
  // This function would create the endpoint if we had access to modify the fake backend
  // For now, we'll fall back to the update endpoint
  await fallbackToUpdateEndpoint();
}

// Start the live chart data generator
function startLiveChartGenerator() {
  console.log('🚀 Starting Live Chart Data Generator...');
  console.log(`📊 Generating dynamic admin chart data every ${INTERVAL_SECONDS} seconds`);
  console.log(`🎯 Target: All fields will be completely dynamic and realistic`);
  console.log(`🗄️  Mode: Direct database insertion (bypassing business logic)`);
  console.log('─'.repeat(80));

  // Generate initial data
  insertChartDataDirectly();

  // Set up interval for continuous generation
  setInterval(() => {
    insertChartDataDirectly();
  }, INTERVAL_SECONDS * 1000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Live Chart Data Generator...');
  console.log('👋 Chart data generation stopped');
  process.exit(0);
});

// Start the generator
startLiveChartGenerator(); 