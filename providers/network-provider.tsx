import { createContext, useContext, type PropsWithChildren } from 'react';

type NetworkContextValue = {
  isOnline: boolean;
  connectionType: string;
};

const NetworkContext = createContext<NetworkContextValue>({
  isOnline: true,
  connectionType: 'web',
});

export function NetworkProvider({ children }: PropsWithChildren) {
  return (
    <NetworkContext.Provider value={{ isOnline: true, connectionType: 'web' }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
