import 'dotenv/config';

export default {
  expo: {
    name: "Delta Coin",
    slug: "delta-coin",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    owner:'shaswata28',
    ios: {
      supportsTablet: true,
      infoPlist: {
        "NSCameraUsageDescription": "This app uses the camera to scan QR codes and barcodes."
      }
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-secure-store",
      [
        "expo-barcode-scanner",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access camera to scan QR codes and barcodes."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    android: {
      package: "com.deltacoin.app",
      permissions: ["CAMERA"]
    },
    extra: {
      "eas": {
        "projectId": "bd13c48b-637f-47c5-9b26-9ab3ce0d1ecf"     
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
}; 