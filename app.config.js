export default {
  expo: {
    name: "Delta Coin",
    slug: "delta-coin",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    owner:'Arnob28',
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
      "expo-camera",
      
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
        "projectId": ""     
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
};
