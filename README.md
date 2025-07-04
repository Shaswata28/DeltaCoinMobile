# 🪙 DeltaCoin Mobile App

A comprehensive digital wallet and payment management app built with React Native and Expo, designed specifically for students to manage their finances efficiently.

## 📱 Overview

DeltaCoin is a modern mobile application that provides students with a secure and intuitive platform to manage their digital finances, track expenses, make payments, and analyze spending patterns. The app integrates with Supabase for backend services and includes features like QR code payments, budget management, and real-time transaction tracking.

## ✨ Features

### 🔐 Authentication & Security
- Secure user registration and login
- PIN-based security for transactions
- Password recovery functionality
- Profile picture upload and management

### 💰 Wallet Management
- Real-time balance tracking
- Digital wallet with secure transactions
- Monthly spending limits and monitoring
- Transaction history with detailed categorization

### 💳 Payment System
- QR code generation and scanning for payments
- Stripe integration for card payments
- Money transfer between users
- Transaction status tracking (completed, pending, failed)

### 📊 Analytics & Budgeting
- Spending analytics and insights
- Monthly budget planning by categories (Canteen, Library, Lab, Club, Other)
- Visual charts and spending patterns
- Budget vs actual spending comparison

### 🔔 Notifications
- Real-time transaction notifications
- Budget alerts and reminders
- Friend request notifications

### 👥 Social Features
- Friends system for easy transfers
- User discovery and connection
- Social payment features

### 🎨 User Experience
- Dark/Light theme support
- Smooth animations with Reanimated
- Responsive design for all screen sizes
- Intuitive navigation with tab-based layout

## 🏗️ Project Structure

```
DeltaCoinMobile-main/
├── 📁 app/                          # Main application screens and navigation
│   ├── 📁 (tabs)/                  # Tab-based navigation screens
│   │   ├── index.tsx               # 🏠 Home screen with wallet overview
│   │   ├── profile.tsx             # 👤 User profile management
│   │   ├── analytics.tsx           # 📊 Analytics and spending insights
│   │   ├── history.tsx             # 📋 Transaction history
│   │   ├── transactions.tsx        # 💸 Transaction management
│   │   ├── friends.tsx             # 👥 Friends and social features
│   │   └── notifications.tsx       # 🔔 Notifications center
│   ├── 📁 account-settings/        # Account settings related screens
│   │   ├── edit-profile.tsx        # ✏️ Profile editing
│   │   ├── notifications.tsx       # 🔔 Notification settings
│   │   ├── payment-methods.tsx     # 💳 Payment method management
│   │   └── security.tsx            # 🔒 Security settings
│   ├── _layout.tsx                 # 🎯 Root layout configuration
│   ├── index.tsx                   # 🚀 App entry point
│   ├── login.tsx                   # 🔑 Login screen
│   ├── signup.tsx                  # 📝 Registration screen
│   ├── forgot-password.tsx         # 🔄 Password recovery
│   ├── money-transfer.tsx          # 💸 Money transfer interface
│   ├── settings.tsx                # ⚙️ App settings
│   ├── help.tsx                    # ❓ Help and support
│   ├── about.tsx                   # ℹ️ About the app
│   └── +not-found.tsx              # 404 error page
│
├── 📁 components/                   # Reusable UI components
│   ├── 📁 auth/                    # Authentication components
│   │   ├── AppLogo.tsx             # 🏷️ App logo component
│   │   ├── LoginForm.tsx           # 📝 Login form
│   │   └── SignUpLink.tsx          # 🔗 Sign up navigation
│   ├── 📁 common/                  # Common UI components
│   │   ├── Button.tsx              # 🔘 Custom button component
│   │   ├── CheckBox.tsx            # ☑️ Custom checkbox
│   │   ├── ErrorMessage.tsx        # ❌ Error display component
│   │   ├── FilterModal.tsx         # 🔍 Filter modal component
│   │   ├── FormInput.tsx           # 📝 Form input component
│   │   ├── LoadingContext.tsx      # ⏳ Loading state management
│   │   ├── MonthYearPicker.tsx     # 📅 Date picker component
│   │   ├── PinInput.tsx            # 🔢 PIN input component
│   │   ├── SimpleLoadingIndicator.tsx # ⏳ Loading indicator
│   │   └── TextNavigation.tsx      # 🧭 Text navigation component
│   ├── 📁 payment/                 # Payment related components
│   │   ├── AmountInput.tsx         # 💰 Amount input component
│   │   ├── PaymentSummary.tsx      # 📋 Payment summary display
│   │   ├── QRGenerator.tsx         # 📱 QR code generator
│   │   ├── QRScanner.tsx           # 📷 QR code scanner
│   │   └── StripePayment.tsx       # 💳 Stripe payment integration
│   ├── 📁 help/                    # Help section components
│   │   ├── BugReport.tsx           # 🐛 Bug reporting component
│   │   └── chatbot.tsx             # 🤖 Chatbot interface
│   ├── 📁 signup/                  # Registration components
│   │   ├── PinInput.tsx            # 🔢 PIN setup component
│   │   ├── PinStep.tsx             # 🔢 PIN setup step
│   │   ├── SecurityStep.tsx        # 🔒 Security setup step
│   │   └── StudentInfoStep.tsx     # 🎓 Student information step
│   ├── 📁 constants/               # App constants
│   │   └── images.ts               # 🖼️ Image constants
│   └── Stepper.tsx                 # 📊 Stepper component
│
├── 📁 supabase/                     # Supabase backend integration
│   ├── auth.ts                     # 🔐 Authentication functions
│   ├── client.ts                   # 🌐 Supabase client configuration
│   ├── db.ts                       # 🗄️ Database operations
│   ├── friends.ts                  # 👥 Friends management
│   └── stripe.ts                   # 💳 Stripe integration
│
├── 📁 utils/                        # Utility functions and helpers
│   ├── validation.ts               # ✅ Form validation utilities
│   ├── format.ts                   # 📝 Data formatting utilities
│   └── pdfGenerator.ts             # 📄 PDF generation utilities
│
├── 📁 hooks/                        # Custom React hooks
│   └── useFrameworkReady.ts        # ⚡ Framework readiness hook
│
├── 📁 config/                       # App configuration files
│   └── env.ts                      # 🌍 Environment configuration
│
├── 📁 assets/                       # Static assets
│   └── 📁 images/                  # Image assets
│       ├── background.png          # 🖼️ Background images
│       ├── background1.png
│       ├── coins.png               # 🪙 Coin graphics
│       ├── d2icon.png              # 🏷️ App icons
│       ├── dark1.png
│       ├── favicon.png
│       └── icon.png
│
├── 📁 android/                      # Android specific configuration
│   ├── build.gradle                # 🔧 Android build configuration
│   ├── gradle.properties           # ⚙️ Gradle properties
│   ├── settings.gradle             # 🔧 Gradle settings
│   └── 📁 app/                     # Android app configuration
│       ├── build.gradle            # 🔧 App build configuration
│       ├── debug.keystore          # 🔑 Debug keystore
│       ├── proguard-rules.pro      # 🛡️ ProGuard configuration
│       └── 📁 src/                 # Android source files
│           ├── 📁 debug/           # Debug configuration
│           └── 📁 main/            # Main Android configuration
│               ├── AndroidManifest.xml # 📋 App manifest
│               └── 📁 res/         # Android resources
│
├── app.config.js                   # 📱 Expo app configuration
├── package.json                    # 📦 Project dependencies
├── tsconfig.json                   # 🔧 TypeScript configuration
├── tailwind.config.js              # 🎨 Tailwind CSS configuration
├── Database schema.txt             # 🗄️ Database schema documentation
└── README.md                       # 📖 Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd DeltaCoinMobile-main
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env` file in the root directory and add your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase database:**
- Create a new Supabase project
- Run the SQL schema from `Database schema.txt` in your Supabase SQL editor
- Enable Row Level Security (RLS) for all tables

5. **Start the development server:**
```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run build:web` - Build for web platform
- `npm run lint` - Run ESLint for code quality

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation
- **React Native Reanimated** - Smooth animations
- **NativeWind (Tailwind CSS)** - Styling framework
- **Lucide React Native** - Icon library

### Backend & Services
- **Supabase** - Backend-as-a-Service
  - Authentication
  - PostgreSQL Database
  - Real-time subscriptions
  - Row Level Security
- **Stripe** - Payment processing
- **Expo Camera** - QR code scanning
- **React Native SVG** - QR code generation

### Development Tools
- **Expo Dev Client** - Development builds
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🗄️ Database Schema

The app uses Supabase with PostgreSQL and includes the following main tables:

### Users Table
- User profiles with student ID validation
- PIN-based security
- Profile picture support

### Wallets Table
- Individual user wallets
- Real-time balance tracking
- Transaction history

### Transactions Table
- Income and expense tracking
- Category-based organization
- Date and description metadata

### Budgets Table
- Monthly budget planning
- Category-wise budget allocation
- Spending tracking and alerts

## 🔐 Security Features

- **Row Level Security (RLS)** - Database-level security
- **PIN Authentication** - Additional security layer
- **Secure Storage** - Sensitive data encryption
- **Input Validation** - Comprehensive form validation
- **Environment Variables** - Secure configuration management

## 📱 Platform Support

- **iOS** - Full support with camera permissions
- **Android** - Full support with camera permissions
- **Web** - Basic support for development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 📞 Support

For support and questions, please contact the development team or refer to the in-app help section.

---

**Built with ❤️ for student financial management**
