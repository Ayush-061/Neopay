import "@walletconnect/react-native-compat";

import {
  AppKit,
  createAppKit,
  defaultWagmiConfig,
} from "@reown/appkit-wagmi-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, polygonAmoy } from "@wagmi/core/chains";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { WagmiProvider } from "wagmi";
const queryClient = new QueryClient();

const projectId = "fc6d54ff01402f5c51264e4192dd6289";
const metadata = {
  name: "Neo Pay",
  description: "Neo Pay",
  url: "https://money-2025.vercel.app/",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "neopay://",
  },
};

const amoy = {
  chainId: 80002,
  name: "Amoy",
  currency: "POL",
  explorerUrl: "https://amoy.polygonscan.com",
  rpcUrl: "https://polygon-amoy.g.alchemy.com/v2/G4BZQj8f0QjtctYnCYzteihYMYGxMSRJ",
};
const chains = [polygonAmoy];
//@ts-ignore
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });


createAppKit({
  projectId,
  wagmiConfig,
  defaultChain: mainnet, // Optional
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

// import * as SplashScreen from 'expo-splash-screen';


// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
 
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
 
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}> 

   <AppKit /> 
    <>
      <Stack>

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />

      </Stack>
      <StatusBar style="auto" />
      </>
      </QueryClientProvider> 

      </WagmiProvider> 
  )
}
 // const [authenticated, setAuthenticated] = useState(false);
  // const [authAttempted, setAuthAttempted] = useState(false); // avoid infinite loop
  // useEffect(() => {
  //   const authenticate = async () => {
  //     if (Platform.OS !== 'android') {
  //       Alert.alert("Only Android fingerprint is supported.");
  //       return;
  //     }

  //     const hasHardware = await LocalAuthentication.hasHardwareAsync();
  //     const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  //     const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();

  //     const hasFingerprint = supported.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

  //     if (!hasHardware || !isEnrolled || !hasFingerprint) {
  //       Alert.alert("Error", "Fingerprint authentication not set up.");
  //       return;
  //     }

  //     const result = await LocalAuthentication.authenticateAsync({
  //       promptMessage: 'Tap to unlock Neo Pay',
  //       fallbackLabel: '',
  //       disableDeviceFallback: true, // important: disables PIN fallback
  //     });

  //     setAuthenticated(result.success);
  //     setAuthAttempted(true);
  //   };

  //   authenticate();
  // }, []);

  // if (!loaded || !authAttempted || !authenticated) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }


// const config = defaultConfig({ metadata });

// 3. Define your chains
// const mainnet = {
//   chainId: 1,
//   name: "Ethereum",
//   currency: "ETH",
//   explorerUrl: "https://etherscan.io",
//   rpcUrl: "https://cloudflare-eth.com",
// };

// const polygon = {
//   chainId: 137,
//   name: "Polygon",
//   currency: "MATIC",
//   explorerUrl: "https://polygonscan.com",
//   rpcUrl: "https://polygon-rpc.com",
// };

// const chains = [mainnet, polygon];
