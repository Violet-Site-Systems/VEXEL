# VEXEL Monitoring Dashboard

Real-time monitoring dashboard for VEXEL agent status, guardian alerts, and inheritance triggers.

## Features

- **Real-time Agent Monitoring**: Live updates of agent status via WebSocket
- **Guardian Alert System**: Critical alerts with severity filtering and acknowledgment
- **Inheritance Trigger Monitoring**: Track heartbeat failures and inheritance events
- **Data Visualizations**: Interactive charts for agent activity and status distribution
- **Search & Filter**: Comprehensive search and filter capabilities
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Charts**: Chart.js
- **Real-time**: Socket.io Client
- **Testing**: Vitest
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- VEXEL API Gateway running (from Phase 3.1)

## Installation

```bash
cd dashboard
npm install
```

## Configuration

Create a `.env` file in the dashboard directory:

```bash
VITE_API_URL=http://localhost:3000
```

## Development

Start the development server:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## Testing

Run tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Project Structure

```
dashboard/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── AgentCard.tsx
│   │   ├── AlertList.tsx
│   │   ├── Charts.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── Filters.tsx
│   │   ├── StatsCard.tsx
│   │   └── TriggerList.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useApi.ts
│   │   └── useWebSocket.ts
│   ├── pages/           # Page components
│   │   ├── DashboardPage.tsx
│   │   └── LoginPage.tsx
│   ├── services/        # API and WebSocket services
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── helpers.ts
│   │   └── helpers.test.ts
│   ├── test/            # Test utilities
│   │   ├── setup.ts
│   │   └── helpers.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # TailwindCSS configuration
└── README.md            # This file
```

## Usage

### Login

1. Enter your User ID
2. Select your role (Human, Agent, or Admin)
3. Click "Sign In"

The dashboard will authenticate with the VEXEL API Gateway and establish a WebSocket connection for real-time updates.

### Dashboard Features

#### Overview Section
- View total agents, active agents, critical alerts, and pending triggers
- Interactive charts showing agent status distribution and 24-hour activity

#### Agents Section
- Browse all agents with real-time status updates
- Search by agent ID, DID, or capabilities
- Filter by status (active, inactive, paused, error)
- View agent health scores and emotional states

#### Guardian Alerts Section
- Monitor critical system alerts
- Filter by severity (info, warning, critical)
- Acknowledge alerts to mark them as handled
- View alert history and timestamps

#### Inheritance Triggers Section
- Track inheritance trigger status
- View missed heartbeat counts and thresholds
- Monitor beneficiaries and trigger progression
- See trigger history and completion status

## API Integration

The dashboard connects to the VEXEL API Gateway endpoints:

- `POST /api/auth/login` - Authentication
- `GET /api/agents` - Fetch agents
- `GET /api/agents/:id` - Fetch specific agent
- WebSocket events:
  - `agent_status` - Real-time agent updates
  - `guardian_alert` - New alerts
  - `inheritance_trigger` - Trigger updates

## Performance

- Initial page load: < 3s
- Real-time updates: < 100ms latency
- Responsive design: Optimized for all screen sizes
- Efficient rendering: Uses React best practices

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

See the main VEXEL repository for contribution guidelines.

## License

See the main VEXEL repository for license information.

## Phase Information

**Phase**: 3.2 - Monitoring Dashboard  
**Status**: Complete  
**Dependencies**: Phase 3.1 (API Gateway + WebSocket Layer)

## Support

For issues or questions, please refer to the main VEXEL repository.
