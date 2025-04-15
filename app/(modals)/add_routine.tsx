import {
  StyleSheet,
  Text,
  View,
  Button as RNButton,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import { ThemedText } from "@/components/ThemedText";
import RoutineExerciseList from "@/components/RoutineExerciseList";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Routine } from "@/models/Routine";
import database, { routinesCollection } from "@/db";
import Button from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRoutine } from "@/providers/RoutineProvider";

const AddRoutine = () => {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const { colors } = useTheme();
  const [routineName, setRoutineName] = useState<string>("");
  const { activeRoutineId, deleteRoutine, saveRoutine } = useRoutine();

  useEffect(() => {
    const load = async () => {
      if (activeRoutineId) {
        console.log("activeRoutineId:", activeRoutineId);
        const r = await routinesCollection.find(activeRoutineId);
        setRoutine(r);
      }
    };

    load();
  }, [activeRoutineId]);

  const handleSave = async () => {
    await saveRoutine(routineName);
  };

  const handleBack = () => {
    Alert.alert(
      "Discard Routine",
      "Are you sure you want to discard this routine?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Discard",
          onPress: async () => {
            await deleteRoutine();
            router.back();
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <BodyScrollView style={{ paddingHorizontal: 20 }}>
      <Stack.Screen
        options={{
          headerRight: () => <RNButton title="Cancel" onPress={handleBack} />,
        }}
      />

      <TextInput
        style={{
          fontSize: 24,
          fontWeight: "600",
          color: colors.text,
          marginVertical: 20,
        }}
        value={routineName}
        onChangeText={setRoutineName}
        placeholder="Routine Name"
        placeholderTextColor={colors.text
          .replace("rgb", "rgba")
          .replace(")", ", 0.4)")}
      />

      {routine && <RoutineExerciseList routine={routine} />}

      <Button
        variant="outline"
        onPress={() => {
          router.push({
            pathname: "/(modals)/add_routine_exercises",
            params: { activeRoutineId },
          });
        }}
      >
        Add Exercises
      </Button>

      <Button onPress={handleSave} style={{ marginTop: 10 }}>
        Save
      </Button>

      <View style={{ height: 50 }} />
    </BodyScrollView>
  );
};

export default AddRoutine;

const styles = StyleSheet.create({});
