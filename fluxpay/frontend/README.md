# FluxPay Frontend

A modern, responsive Next.js application for Solana SPL payment processing.

## Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
frontend/
├── src/
│   ├── pages/          # Next.js pages and routes
│   ├── components/     # Reusable React components
│   ├── styles/         # Global styles and CSS
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   └── config/         # Configuration files
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── postcss.config.js   # PostCSS configuration
```

## Features

- 🚀 **Instant SPL Settlement** - Receive USDC, SOL, or any SPL token directly in seconds
- 🔐 **Non-Custodial** - Your keys, your tokens. We never hold your funds
- 💳 **Multi-SPL Token** - Accept all top Solana SPL tokens
- ⚡ **Developer First** - Simple, powerful API with excellent documentation
- 📊 **Analytics Dashboard** - Track your payments in real-time

## Available Pages

- `/` - Home page with hero section and features
- `/pricing` - Pricing plans
- `/docs` - API documentation
- `/features` - Detailed features list
- `/contact` - Contact sales
- `/status` - System status

## Technology Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Remix Icon
- **Language**: TypeScript

## Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Environment Variables

Create a `.env.local` file in the frontend directory for environment-specific variables:

```
NEXT_PUBLIC_API_URL=https://api.fluxpay.io
```

## Support

For issues and questions, please visit our documentation or contact our support team.
