# Obsidian Trade — Virtual Stock Trading Simulator

A full-stack, real-time virtual stock trading platform built for the Indian NSE market. Trade 150+ Nifty 200 stocks with live price simulation, manage your portfolio, track P&L, and compete on a global leaderboard — all without risking real capital.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Obsidian Trade is a paper trading application designed to simulate real-world equity trading on the Indian National Stock Exchange (NSE). It features a live market engine that updates prices every 2 seconds via WebSockets, a responsive trading terminal, interactive portfolio analytics, and AI-driven bot traders to create a competitive environment.

Whether you are learning the basics of investing, testing trading strategies, or building financial literacy, this simulator provides a risk-free sandbox with realistic market mechanics.

---

## Features

- **Real-Time Market Simulation** — Live price ticks for 150+ Nifty 200 stocks updated every 2 seconds via Socket.io.
- **Paper Trading Engine** — Buy and sell stocks with a virtual wallet. Transactions are tracked with real-time balance updates.
- **Portfolio & P&L Analytics** — Visualize holdings, invested value, current value, and profit/loss with interactive charts powered by Recharts.
- **Global Leaderboard** — Compete against built-in trading bots and other users ranked by portfolio value.
- **Transaction History** — Complete audit trail of every buy and sell order with timestamps and prices.
- **Secure Authentication** — JWT-based auth with HTTP-only cookie principles and bcrypt password hashing.
- **Trading Bots** — Five built-in institutional-style bots that autonomously trade to simulate market activity and competition.
- **Responsive Dashboard** — Dark-themed, Tailwind CSS-powered UI optimized for desktop and mobile with Framer Motion animations.
- **Zero-Config Database** — Automatically connects to a local MongoDB instance; seamlessly falls back to an in-memory database if MongoDB is not running.

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **MongoDB + Mongoose** | Document database & ODM |
| **Socket.io** | Real-time bidirectional market data streaming |
| **JWT (jsonwebtoken)** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **express-validator** | Input validation |
| **cors** | Cross-origin resource sharing |
| **dotenv** | Environment configuration |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite** | Build tool & dev server |
| **React Router DOM** | Client-side routing |
| **Tailwind CSS** | Utility-first CSS framework |
| **Zustand** | Lightweight global state management |
| **Recharts** | Interactive data visualization |
| **Framer Motion** | Animations & transitions |
| **Axios** | HTTP client |
| **Lucide React** | Modern icon set |
| **React Toastify** | Notification system |
| **Socket.io-client** | Real-time client connection |

---

## Project Structure

```
.
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic (auth, trade, portfolio, stocks, leaderboard)
│   ├── middleware/      # Auth guards & validation
│   ├── models/          # Mongoose schemas (User, Stock, Portfolio, Transaction)
│   ├── routes/          # Express route definitions
│   ├── services/        # Socket.io market simulation engine
│   ├── .env             # Environment variables (not tracked in git)
│   ├── package.json
│   └── server.js        # Entry point
│
├── frontend/
│   ├── public/          # Static assets & icons
│   ├── src/
│   │   ├── assets/      # Images & media
│   │   ├── components/  # Reusable UI components (Navbar, etc.)
│   │   ├── pages/       # Route-level views (Dashboard, Market, Terminal, Portfolio, Leaderboard, Login, Register)
│   │   ├── store/       # Zustand stores (auth, etc.)
│   │   ├── App.jsx      # Root component & routing
│   │   ├── main.jsx     # Entry point
│   │   └── index.css    # Global styles & Tailwind directives
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (recommended: v20 LTS)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) (optional — the app falls back to an in-memory database if MongoDB is not running)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/obsidian-trade.git
cd obsidian-trade
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/obsidian_trade
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

> **Note:** If `MONGO_URI` is omitted or the connection fails, the server will automatically spin up an in-memory MongoDB instance via `mongodb-memory-server` so you can start developing immediately.

---

## Usage

### Running the Development Servers

You need two terminal windows (or use a process manager like `concurrently`):

**Terminal 1 — Start the backend API**

```bash
cd backend
npm start        # or: npx nodemon server.js
```

The server will start on `http://localhost:5000` and begin seeding 150+ Indian stocks plus five trading bots.

**Terminal 2 — Start the frontend dev server**

```bash
cd frontend
npm run dev
```

The Vite dev server will start on `http://localhost:5173` (or the next available port).

### Accessing the App

Open your browser and navigate to `http://localhost:5173`. Register a new account or log in to begin trading. Each new user starts with a virtual balance of **₹1,000,000**.

---

## API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register a new user | Public |
| `POST` | `/auth/login` | Login & receive JWT | Public |
| `GET` | `/stocks` | List all stocks | Protected |
| `GET` | `/stocks/:id` | Get stock details by ID | Protected |
| `POST` | `/trade/buy` | Buy stock shares | Protected |
| `POST` | `/trade/sell` | Sell stock shares | Protected |
| `GET` | `/portfolio` | Get user portfolio | Protected |
| `GET` | `/transactions` | Get transaction history | Protected |
| `GET` | `/leaderboard` | Get ranked leaderboard | Protected |

### WebSocket Events

Connect to the server via Socket.io to receive live market data:

- **Event:** `market-update`  
  **Payload:** Array of all stocks with updated `currentPrice`, `previousPrice`, and price history.

---



## Contributing

Contributions are welcome! If you have a bug fix, feature idea, or improvement:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate comments where necessary.

---

## License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">Built with ❤️ for the trading community.</p>
