import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

interface WorkoutContextType {
  seconds: number;
  startWorkout: () => void;
  stopWorkout: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  const startTimer = () => {
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current === "active" && nextAppState === "background") {
      stopTimer();
    } else if (appState.current === "background" && nextAppState === "active") {
      startTimer();
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      stopTimer();
      appStateListener.remove();
    };
  }, []);

  const startWorkout = () => {
    setSeconds(0);
    startTimer();
  };

  const stopWorkout = () => {
    stopTimer();
  };

  return (
    <WorkoutContext.Provider value={{ seconds, startWorkout, stopWorkout }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};

// import React, {
//     createContext,
//     useContext,
//     useEffect,
//     useRef,
//     useState,
//   } from "react";
//   import { AppState, AppStateStatus } from "react-native";
//   import BackgroundTimer from "react-native-background-timer";
//   import AsyncStorage from "@react-native-async-storage/async-storage";

//   interface WorkoutContextType {
//     seconds: number;
//     startWorkout: () => void;
//     stopWorkout: () => void;
//   }

//   const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

//   export const WorkoutProvider = ({
//     children,
//   }: {
//     children: React.ReactNode;
//   }) => {
//     const [seconds, setSeconds] = useState(0);
//     const timerRef = useRef<number | null>(null);
//     const appState = useRef(AppState.currentState);

//     const saveStartTime = async () => {
//       try {
//         await AsyncStorage.setItem(
//           "workoutStartTime",
//           JSON.stringify(Date.now())
//         );
//       } catch (error) {
//         console.error("Failed to save workout start time", error);
//       }
//     };

//     const loadStartTime = async () => {
//       try {
//         const startTime = await AsyncStorage.getItem("workoutStartTime");
//         if (startTime) {
//           const startTimestamp = JSON.parse(startTime);
//           const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
//           setSeconds(elapsed);
//           startTimer();
//         }
//       } catch (error) {
//         console.error("Failed to load workout start time", error);
//       }
//     };

//     const startTimer = () => {
//       if (!timerRef.current) {
//         timerRef.current = BackgroundTimer.setInterval(() => {
//           setSeconds((prev) => prev + 1);
//         }, 1000);
//       }
//     };

//     const stopTimer = async () => {
//       if (timerRef.current) {
//         BackgroundTimer.clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//       try {
//         await AsyncStorage.removeItem("workoutStartTime");
//       } catch (error) {
//         console.error("Failed to clear workout start time", error);
//       }
//     };

//     const handleAppStateChange = (nextAppState: AppStateStatus) => {
//       if (appState.current === "active" && nextAppState === "background") {
//         startTimer();
//       }
//       appState.current = nextAppState;
//     };

//     useEffect(() => {
//       loadStartTime();

//       const appStateListener = AppState.addEventListener(
//         "change",
//         handleAppStateChange
//       );

//       return () => {
//         stopTimer();
//         appStateListener.remove();
//       };
//     }, []);

//     const startWorkout = async () => {
//       setSeconds(0);
//       startTimer();
//       await saveStartTime();
//     };

//     const stopWorkout = async () => {
//       stopTimer();
//     };

//     return (
//       <WorkoutContext.Provider value={{ seconds, startWorkout, stopWorkout }}>
//         {children}
//       </WorkoutContext.Provider>
//     );
//   };

//   export const useWorkout = () => {
//     const context = useContext(WorkoutContext);
//     if (!context) {
//       throw new Error("useWorkout must be used within a WorkoutProvider");
//     }
//     return context;
//   };
