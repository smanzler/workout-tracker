import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from "@react-native-community/netinfo";
import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "expo-router/react-navigation";

type NetworkContextType = {
  isOnline: boolean;
  isInternetReachable: boolean | null;
};

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isInternetReachable: null,
});

export function NetworkProvider({ children }: PropsWithChildren) {
  const [networkState, setNetworkState] = useState<NetInfoState>({
    isConnected: true,
    isInternetReachable: true,
    type: NetInfoStateType.none,
    details: null,
  });
  const { colors } = useTheme();

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(setNetworkState);

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(setNetworkState);

    return () => {
      unsubscribe();
    };
  }, []);

  const showOfflineBanner =
    !networkState.isConnected || networkState.isInternetReachable === false;

  return (
    <NetworkContext.Provider
      value={{
        isOnline: !!networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable,
      }}
    >
      {showOfflineBanner && (
        <View
          style={{
            backgroundColor: colors.notification,
            padding: 8,
            alignItems: "center",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <ThemedText style={{ color: colors.text }}>
            You&apos;re offline. Some features may be limited.
          </ThemedText>
        </View>
      )}
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => useContext(NetworkContext);
