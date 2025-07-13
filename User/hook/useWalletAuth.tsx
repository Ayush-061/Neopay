import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export const useWalletAuth = () => {
  const { isConnected, address } = useAccount();
  const [isAuthResolved, setIsAuthResolved] = useState(false);

  useEffect(() => {
    // Delay to ensure wagmi hydration finishes
    const timeout = setTimeout(() => {
      setIsAuthResolved(true);
    }, 100); // tweak if needed

    return () => clearTimeout(timeout);
  }, []);

  return {
    isLoggedIn: isConnected,
    isAuthResolved,
    walletAddress: address,
  };
};
