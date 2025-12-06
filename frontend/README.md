# Ovozly Frontend

> Modern React dashboard for call center analytics and speech analysis.

## Overview

Ovozly Frontend is a React-based web application that provides a user interface for managing and analyzing call center recordings. It connects to the Ovozly Backend API to display call analytics, speech transcriptions, and AI-generated insights.

## Features

- **Authentication** - Secure JWT-based login system
- **Call Management** - View, filter, and manage call recordings
- **Audio Upload** - Upload new audio files for processing
- **Speech Analysis** - View transcriptions with speaker diarization
- **AI Insights** - Sentiment analysis, intent detection, and recommendations
- **Analytics Dashboard** - Visualize call center performance metrics

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | React | 18.3.1 |
| **Language** | TypeScript | 5.6.2 |
| **Build Tool** | Vite | 6.0.1 |
| **Routing** | React Router DOM | 7.0.2 |
| **UI Library** | Ant Design | 5.22.3 |
| **CSS Framework** | Bootstrap | 5.3.3 |
| **Charts** | ApexCharts | 4.2.0 |
| **HTTP Client** | Axios | 1.7.9 |
| **Date Utils** | date-fns | 4.1.0 |
| **Alerts** | SweetAlert2 | 11.15.10 |
| **Styling** | SASS | 1.82.0 |

## Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images and static files
│   ├── components/           # Reusable UI components
│   │   ├── header/          # App header with navigation
│   │   ├── sidebar/         # Navigation sidebar
│   │   ├── loading/         # Loading spinner
│   │   ├── notifications/   # Notification badge
│   │   ├── questions/       # Help icon
│   │   └── userAvatar/      # User profile dropdown
│   │
│   ├── config/              # Configuration files
│   │   └── api.ts           # API endpoint configuration
│   │
│   ├── pages/               # Page components
│   │   ├── auth/
│   │   │   ├── login/       # Login page
│   │   │   └── signup/      # Registration page
│   │   ├── analytics/       # Analytics dashboard
│   │   ├── calls/           # Call list page
│   │   │   ├── components/  # Call-specific components
│   │   │   ├── data/        # Mock data
│   │   │   └── types/       # TypeScript interfaces
│   │   ├── dashboard/       # Main dashboard layout
│   │   └── singleCall/      # Call detail page
│   │       └── components/  # Analysis components
│   │
│   ├── router/              # Routing configuration
│   │   ├── AppRoutes.tsx    # Route definitions
│   │   └── ProtectedRoute.tsx # Auth guard
│   │
│   ├── services/            # API service layer
│   │   ├── api.ts           # Axios client configuration
│   │   ├── auth.service.ts  # Authentication API
│   │   └── calls.service.ts # Calls API
│   │
│   ├── styles/              # Global styles
│   │   ├── index.scss       # Main stylesheet
│   │   ├── _global.scss     # Global variables
│   │   └── _scroll.scss     # Scrollbar styles
│   │
│   ├── utils/               # Utility functions
│   │   └── helpers.tsx      # Date/string formatters
│   │
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite type definitions
│
├── .env.example             # Environment template
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite configuration
└── eslint.config.js         # ESLint configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set the API URL:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app runs at: http://localhost:5173

### Production Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

### Path Aliases

The project uses `@/` as an alias for the `src/` directory:
```typescript
import { login } from "@/services/auth.service";
```

## API Integration

The frontend communicates with the Ovozly Backend API:

### Authentication
- `POST /users/authorize` - Login and get JWT token

### Calls
- `GET /stt/calls` - List all calls
- `POST /stt/submit-audio` - Upload audio file
- `GET /stt/task-status?task_id=` - Get processing status

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Code Style

- TypeScript with strict mode
- ESLint + Prettier for formatting
- Component files use PascalCase
- Utility files use camelCase
- CSS uses BEM methodology

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - All rights reserved.

---

**Ovozly** - Transforming call center conversations into actionable insights.
