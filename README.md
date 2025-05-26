# Delta Coin Mobile App

## Project Structure

```
project/
├── app/                      # Main application screens and navigation
│   ├── (tabs)/              # Tab-based navigation screens
│   │   ├── index.tsx        # Home screen
│   │   ├── profile.tsx      # Profile screen
│   │   ├── analytics.tsx    # Analytics screen
│   │   ├── history.tsx      # Transaction history
│   │   └── transactions.tsx # Transactions screen
│   ├── account-settings/    # Account settings related screens
│   ├── _layout.tsx          # Root layout configuration
│   ├── login.tsx            # Login screen
│   ├── signup.tsx           # Signup screen
│   ├── forgot-password.tsx  # Password recovery
│   ├── settings.tsx         # App settings
│   └── help.tsx             # Help and support
│
├── components/              # Reusable UI components
│   ├── auth/               # Authentication related components
│   │   └── LoginForm.tsx   # Login form component
│   ├── common/             # Common UI components
│   │   ├── Button.tsx      # Custom button component
│   │   ├── FormInput.tsx   # Form input component
│   │   ├── ErrorMessage.tsx# Error display component
│   │   ├── PinInput.tsx    # PIN input component
│   │   └── TextNavigation.tsx # Text navigation component
│   ├── payment/            # Payment related components
│   ├── help/               # Help section components
│   ├── signup/             # Signup related components
│   └── Stepper.tsx         # Stepper component
│
├── utils/                  # Utility functions and helpers
│   ├── validation.ts       # Form validation utilities
│   └── format.ts           # Data formatting utilities
│
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── lib/                    # Library configurations
├── config/                 # App configuration files
├── assets/                 # Static assets (images, fonts, etc.)
├── supabase/              # Supabase configuration and utilities
│
├── app.json               # Expo app configuration
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── .prettierrc            # Prettier code formatting config
└── README.md              # Project documentation
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

## Features

- User Authentication (Login/Signup)
- Profile Management
- Transaction History
- Analytics Dashboard
- Payment Processing
- Account Settings
- Help & Support

## Tech Stack

- React Native
- Expo
- TypeScript
- Supabase (Backend)
- TailwindCSS (Styling)