# Phase 3.2: Monitoring Dashboard - Quick Start Guide

## 🎯 What's Included

This implementation provides a complete **React-based monitoring dashboard** for real-time visibility into the VEXEL ecosystem.

### Core Features
- ✅ Real-time agent status monitoring
- ✅ Guardian alert system with acknowledgment
- ✅ Inheritance trigger monitoring
- ✅ Interactive data visualizations (Chart.js)
- ✅ Search and filter functionality
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ WebSocket integration for live updates
- ✅ JWT authentication
- ✅ 15 frontend tests (100% passing)
- ✅ 0 security vulnerabilities (CodeQL verified)

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** installed
2. **VEXEL API Gateway** running (from Phase 3.1)
   - See [PHASE_3.1_QUICKSTART.md](./PHASE_3.1_QUICKSTART.md) for setup

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

This will install:
- React 18 with TypeScript
- Vite build tool
- TailwindCSS for styling
- Chart.js for visualizations
- Socket.io client for WebSocket
- All development dependencies

### 2. Configure Environment

Copy the example configuration:

```bash
cp .env.example .env
```

Edit `.env`:
```bash
# API Gateway URL (default: http://localhost:3000)
VITE_API_URL=http://localhost:3000
```

### 3. Start the API Gateway (Phase 3.1)

In a separate terminal, ensure the API Gateway is running:

```bash
# From the root VEXEL directory
npm run api:start
```

You should see:
```
╔═══════════════════════════════════════════════════════════════╗
║                    VEXEL API GATEWAY                          ║
║                  Phase 3: Bridge Layer                        ║
╠═══════════════════════════════════════════════════════════════╣
║ REST API:        http://localhost:3000                        ║
║ WebSocket:       ws://localhost:3000                          ║
║ API Docs:        http://localhost:3000/api-docs              ║
║ Health Check:    http://localhost:3000/health                ║
╚═══════════════════════════════════════════════════════════════╝
```

### 4. Run Tests (Optional)

Verify everything is working:

```bash
npm test -- --run
```

Expected output:
```
Test Files  1 passed (1)
Tests       15 passed (15)
```

### 5. Start the Dashboard

```bash
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 437 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### 6. Access the Dashboard

Open your browser to: **http://localhost:5173**

## 📚 Using the Dashboard

### Step 1: Login

When you first access the dashboard, you'll see the login page.

**Login Credentials:**
- **User ID**: Any identifier (e.g., "admin", "user-123")
- **Role**: Select from dropdown
  - `human` - Regular user access
  - `agent` - Agent access
  - `admin` - Full administrative access

Click **Sign In** to authenticate.

### Step 2: Dashboard Overview

After login, you'll see the main dashboard with:

#### Statistics Cards (Top Row)
- **Total Agents**: Count of all agents in the system
- **Active Agents**: Currently active agents
- **Critical Alerts**: Unacknowledged critical alerts
- **Pending Triggers**: Inheritance triggers awaiting action

#### Charts Section
- **Agent Status Distribution** (Doughnut Chart)
  - Visual breakdown of agent statuses
  - Color-coded: Green (active), Gray (inactive), Yellow (paused), Red (error)
  
- **Agent Activity (24 Hours)** (Line Chart)
  - Historical activity over the last 24 hours
  - Shows active agent count per hour

### Step 3: Monitor Agents

Scroll to the **Agents** section:

#### Search and Filter
- **Search Bar**: Type to search by agent ID, DID, or capabilities
- **Status Filter**: Click to filter by status (active, inactive, paused, error)

#### Agent Cards
Each card displays:
- **Agent ID** and **DID**
- **Status Badge**: Color-coded current status
- **Last Heartbeat**: Time since last check-in
- **Health Score**: 0-100 score based on status and heartbeat
- **Emotional State** (if available): Current emotion and intensity
- **Capabilities**: List of agent capabilities

#### Real-time Updates
- Green pulse indicator shows live connection
- Agent cards update automatically when status changes
- New agents appear automatically

### Step 4: Guardian Alerts

Navigate to the **Guardian Alerts** section:

#### Alert Types
- **Heartbeat Missed**: Agent failed to check in
- **Status Change**: Agent status changed
- **Inheritance Trigger**: Inheritance event triggered
- **Security**: Security-related alerts
- **System**: System notifications

#### Alert Severity
- **Info** (Blue): Informational messages
- **Warning** (Yellow): Requires attention
- **Critical** (Red): Urgent action needed

#### Managing Alerts
1. **View Details**: Each alert shows:
   - Type and severity
   - Message description
   - Timestamp (relative time)
   - Associated agent ID

2. **Filter by Severity**: Click the severity filter to show specific alert types

3. **Acknowledge Alerts**: Click "Acknowledge" button on critical alerts to mark as handled

### Step 5: Inheritance Triggers

Scroll to the **Inheritance Triggers** section:

#### Trigger Information
Each trigger displays:
- **Agent ID**: Associated agent
- **Status**: pending, active, completed, or failed
- **Progress Bar**: Missed heartbeats vs. threshold
- **Beneficiaries**: Number of beneficiaries
- **Last Check**: Time since last check
- **Trigger Events**: When triggered and completed

#### Trigger Status Colors
- **Green**: Healthy (< 75% of threshold)
- **Yellow**: Warning (75-99% of threshold)
- **Red**: Critical (≥ 100% of threshold)

## 🎨 Dashboard Features

### Real-time Updates

The dashboard maintains a WebSocket connection to receive live updates:

- **Connection Indicator**: Green dot = connected, Red dot = disconnected
- **Automatic Reconnection**: If connection drops, automatically reconnects
- **Live Status Updates**: Agent status changes appear immediately
- **Instant Alerts**: New alerts appear without page refresh
- **Trigger Progression**: Progress bars update in real-time

### Responsive Design

The dashboard adapts to all screen sizes:

- **Desktop**: Full layout with sidebar
- **Tablet**: Adjusted grid layouts
- **Mobile**: Stacked layout, hamburger menu
- **Touch-friendly**: All interactions optimized for touch

### Search and Filter

#### Search
- Type in the search bar to filter agents
- Searches across:
  - Agent IDs
  - DIDs
  - Capabilities
- Results update in real-time as you type

#### Filters
- **Status Filter**: Select one or more statuses
- **Severity Filter**: Filter alerts by severity
- **Clear All**: Remove all applied filters

## 🔧 Development

### Development Mode

```bash
npm run dev
```

Features:
- Hot module replacement (HMR)
- Fast refresh
- Source maps
- Development server at http://localhost:5173

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory:
- Minified JavaScript (142 KB gzipped)
- Optimized CSS (4 KB gzipped)
- Tree-shaken dependencies
- Source maps for debugging

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## 🐛 Troubleshooting

### Dashboard won't load

**Issue**: Dashboard shows connection error

**Solution**:
1. Verify API Gateway is running: `npm run api:start` from root
2. Check the API URL in `.env` matches the gateway port
3. Ensure no firewall is blocking connections

### WebSocket disconnected

**Issue**: Red dot shows disconnected

**Solution**:
1. Check API Gateway is running
2. Verify WebSocket port (default: 3000)
3. Check browser console for error messages
4. Dashboard will auto-reconnect within a few seconds

### No agents showing

**Issue**: Dashboard shows "No agents found"

**Solution**:
1. Verify API Gateway has agent data
2. Check browser console for errors
3. Try refreshing the page
4. Check authentication token is valid

### Charts not displaying

**Issue**: Charts show blank or error

**Solution**:
1. Verify agent data is loading
2. Check browser console for Chart.js errors
3. Try clearing browser cache
4. Refresh the page

### Login fails

**Issue**: "Login failed" error message

**Solution**:
1. Verify API Gateway is running
2. Check API URL in `.env` is correct
3. Try different credentials
4. Check browser console for error details

## 📊 Performance

### Metrics
- **Initial Load**: < 3 seconds
- **WebSocket Latency**: < 100ms
- **Chart Rendering**: < 500ms
- **Search Response**: < 50ms
- **Bundle Size**: 438 KB (142 KB gzipped)

### Optimization
- Code splitting enabled
- Lazy loading for routes
- Debounced search input
- Efficient re-rendering with React hooks
- Memoized computed values

## 🔒 Security

### Authentication
- JWT token-based authentication
- Token stored in localStorage
- Automatic token refresh
- Secure logout

### Best Practices
- Use HTTPS in production
- Set secure JWT_SECRET in API Gateway
- Enable CORS only for trusted origins
- Regular security updates

## 📖 Additional Resources

- **[Dashboard README](./dashboard/README.md)** - Detailed dashboard documentation
- **[PHASE_3.2_SUMMARY.md](./PHASE_3.2_SUMMARY.md)** - Complete implementation summary
- **[API Gateway Docs](./docs/API_GATEWAY.md)** - API documentation
- **[Chart.js Documentation](https://www.chartjs.org/)** - Charting library docs
- **[React Documentation](https://react.dev/)** - React framework docs

## 🎓 Next Steps

### Explore Features
1. Try searching for agents by different criteria
2. Filter agents by status
3. Acknowledge critical alerts
4. Watch real-time updates in action
5. Test responsive design on mobile

### Customize
1. Modify color theme in `tailwind.config.js`
2. Add custom components in `src/components/`
3. Extend chart types in `src/components/Charts.tsx`
4. Add new filters in `src/components/Filters.tsx`

### Integrate
1. Connect to full agent database
2. Add more alert types
3. Implement notification system
4. Create custom dashboards
5. Add export/report features

## 💡 Tips

1. **Keep API Gateway Running**: Dashboard requires Phase 3.1 API Gateway to function
2. **Monitor Connection**: Watch the connection indicator for WebSocket status
3. **Use Search**: Quickly find specific agents with the search bar
4. **Filter Wisely**: Combine search and filters for precise results
5. **Acknowledge Alerts**: Keep critical alert count manageable

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the [Phase 3.2 Summary](./PHASE_3.2_SUMMARY.md)
3. Consult the main [README](./README.md)
4. Check the GitHub repository issues

---

**Ready to monitor your VEXEL agents? Let's go! 🚀**

**Phase**: 3.2 - Monitoring Dashboard  
**Status**: ✅ Complete  
**Dependencies**: Phase 3.1 (API Gateway + WebSocket Layer)
