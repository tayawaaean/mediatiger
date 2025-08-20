# 🚀 Final Analytics API Server

A production-ready API server that serves analytics data from your Supabase database.

## 🏗️ **Setup**

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Environment Variables**
Create a `.env` file in the `final_server` directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server Configuration
PORT=3002
FRONTEND_URL=http://localhost:3000

# Optional: Environment
NODE_ENV=production
```

### 3. **Start Server**
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

## 📊 **API Endpoints**

### **Base URL**: `http://localhost:3002/api/v1`

---

### **1. Get Analytics Data**
```http
GET /api/v1/analytics
```

**Query Parameters:**
- `channel_id` (optional): Filter by specific channel
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)
- `limit` (optional): Number of records (default: 100)
- `offset` (optional): Pagination offset (default: 0)
- `sort_by` (optional): Sort field (default: scraped_at)
- `sort_order` (optional): asc/desc (default: desc)

**Example:**
```bash
curl "http://localhost:3002/api/v1/analytics?channel_id=UCmSy2p4qeO3cr_BPCF4oSeQ&start_date=2025-05-01&end_date=2025-05-31&limit=50"
```

---

### **2. Get Analytics Summary**
```http
GET /api/v1/analytics/summary
```

**Query Parameters:**
- `channel_id` (optional): Filter by specific channel
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)

**Example:**
```bash
curl "http://localhost:3002/api/v1/analytics/summary?start_date=2025-05-01&end_date=2025-05-31"
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalViews": 1500000,
    "totalPremiumViews": 165000,
    "totalRevenue": 75.50,
    "averageRPM": 0.05,
    "dataPoints": 93,
    "channels": 3
  }
}
```

---

### **3. Get Daily Analytics (for Charts)**
```http
GET /api/v1/analytics/daily
```

**Query Parameters:**
- `channel_id` (optional): Filter by specific channel
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)
- `group_by` (optional): "date" or "channel" (default: "date")

**Example:**
```bash
curl "http://localhost:3002/api/v1/analytics/daily?channel_id=UCmSy2p4qeO3cr_BPCF4oSeQ&group_by=date"
```

---

### **4. Get Channel List**
```http
GET /api/v1/channels
```

**Query Parameters:**
- `include_analytics` (optional): "true" or "false" (default: "false")

**Example:**
```bash
# Just channel IDs
curl "http://localhost:3002/api/v1/channels"

# With analytics summary
curl "http://localhost:3002/api/v1/channels?include_analytics=true"
```

---

### **5. Health Check**
```http
GET /health
```

**Example:**
```bash
curl "http://localhost:3002/health"
```

## 🔧 **Features**

✅ **Production Ready**: Security headers, rate limiting, error handling  
✅ **Flexible Filtering**: By channel, date range, pagination  
✅ **Optimized Queries**: Efficient Supabase queries with proper indexing  
✅ **Real-time Data**: Serves data from your live Supabase database  
✅ **CORS Enabled**: Works with any frontend  
✅ **Comprehensive Logging**: Request tracking and error logging  
✅ **Rate Limiting**: 100 requests per 15 minutes per IP  

## 📱 **Frontend Integration**

### **React/Next.js Example:**
```javascript
// Fetch analytics summary
const fetchSummary = async (startDate, endDate) => {
  const response = await fetch(
    `http://localhost:3002/api/v1/analytics/summary?start_date=${startDate}&end_date=${endDate}`
  );
  const data = await response.json();
  return data.summary;
};

// Fetch daily data for charts
const fetchDailyData = async (channelId, startDate, endDate) => {
  const response = await fetch(
    `http://localhost:3002/api/v1/analytics/daily?channel_id=${channelId}&start_date=${startDate}&end_date=${endDate}&group_by=date`
  );
  const data = await response.json();
  return data.daily_data;
};
```

### **Vue.js Example:**
```javascript
// Fetch channels with analytics
const fetchChannels = async () => {
  const response = await fetch(
    'http://localhost:3002/api/v1/channels?include_analytics=true'
  );
  const data = await response.json();
  return data.channels;
};
```

## 🚦 **Rate Limiting**

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Response**: 429 status with retry information

## 🔒 **Security**

- **Helmet.js**: Security headers
- **CORS**: Configurable origin
- **Input Validation**: Query parameter sanitization
- **Error Handling**: No sensitive information leakage

## 📊 **Data Structure**

The API serves data from your `analytics_data` table with this structure:

```sql
CREATE TABLE analytics_data (
    id BIGSERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    scraped_at TIMESTAMPTZ NOT NULL,
    total_views BIGINT DEFAULT 0,
    total_premium_views BIGINT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_rpm DECIMAL(10,4) DEFAULT 0,
    daily_data JSONB,
    raw_data JSONB,
    -- ... other fields
);
```

## 🚀 **Deployment**

### **PM2 (Recommended)**
```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start server.js --name "analytics-api"

# Make it restart on server reboot
pm2 startup
pm2 save
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
```

## 📝 **Logs**

The server logs all requests and errors to console. For production, consider using a logging service or redirecting to files.

## 🔄 **Updates**

This API automatically serves the latest data from your Supabase database. When your cron scraper adds new data, it's immediately available through these endpoints.

---

**🎯 Perfect for your frontend analytics dashboard!**


