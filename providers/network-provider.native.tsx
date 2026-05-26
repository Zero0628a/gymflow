import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

type NetworkContextValue = {
  isOnline: boolean;
  connectionType: string;
};

const NetworkContext = createContext<NetworkContextValue>({
  isOnline: true,
  connectionType: 'unknown',
});

function deriveOnline(state: NetInfoState): boolean {
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}

export function NetworkProvider({ children }: PropsWithChildren) {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(deriveOnline(state));
      setConnectionType(state.type);
    });

    NetInfo.fetch()
      .then((state) => {
        setIsOnline(deriveOnline(state));
        setConnectionType(state.type);
      })
      .catch(() => {
        setIsOnline(true);
      });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, connectionType }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
