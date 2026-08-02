import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.shebloomswealth.ios",
  appName: "Bloom",
  webDir: "out",
  server: {
    url: "https://shebloomswealth.app",
    cleartext: false,
  },
  ios: {
    scheme: "Bloom",
    backgroundColor: "#0E1B30",
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scrollEnabled: true,
  },
};

export default config;
