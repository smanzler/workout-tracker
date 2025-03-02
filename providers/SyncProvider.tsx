import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs, { Dayjs } from "dayjs";

type SyncContextType = {
  lastSync: Dayjs | null;
  updateLastSync: (timestamp: number) => Promise<void>;
};

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [lastSync, setLastSync] = useState<Dayjs | null>(null);

  useEffect(() => {
    const getLastSync = async () => {
      const storedLastSync = await AsyncStorage.getItem("lastSync");
      if (storedLastSync) setLastSync(dayjs(Number(storedLastSync)));
    };

    getLastSync();
  }, []);

  const updateLastSync = async (newSyncTime: number) => {
    setLastSync(dayjs(newSyncTime));
    await AsyncStorage.setItem("lastSync", newSyncTime.toString());
  };

  return (
    <SyncContext.Provider value={{ lastSync, updateLastSync }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error("useSync must be used within a SyncProvider");
  return context;
};
