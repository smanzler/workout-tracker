import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Button as RNButton,
  Button,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import database, { exercisesCollection } from "@/db";
import { useAuth } from "@/providers/auth-provider";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "expo-router/react-navigation";
import TextInput from "@/components/text-input";
import { Ionicons } from "@expo/vector-icons";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { useMenu } from "@/hooks/use-menu";
import ButtonWithIcon from "./button-with-icon";

const CATEGORIES = [
  "Barbell",
  "Dumbbell",
  "Machine",
  "Bodyweight",
  "Assisted Bodyweight",
  "Reps Only",
  "Duration",
];

const MUSCLE_GROUPS = [
  "Chest",
  "Shoulders",
  "Arms",
  "Legs",
  "Back",
  "Core",
  "Cardio",
  "None",
];

function OptionRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const { colors } = useTheme();
  const showMenu = useMenu();

  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          backgroundColor: String(colors.text)
            .replace("rgb", "rgba")
            .replace(")", ", 0.1)"),
        },
      ]}
      onPress={() =>
        showMenu(
          options.map((option) => ({
            label: option,
            onSelect: () => onChange(option),
          })),
        )
      }
    >
      <ThemedText style={styles.label}>{label}</ThemedText>

      <View style={{ flexDirection: "row", gap: 5 }}>
        <ThemedText style={styles.label}>{value}</ThemedText>
        <Ionicons
          style={{ opacity: 0.6 }}
          name="chevron-expand"
          size={22}
          color={colors.text}
        />
      </View>
    </TouchableOpacity>
  );
}

const ExerciseModal = ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Reps Only");
  const [muscleGroup, setMuscleGroup] = useState("None");
  const { user } = useAuth();
  const { colors } = useTheme();

  const handleAdd = () => {
    if (!title) {
      return;
    }

    try {
      database.write(async () => {
        await exercisesCollection.create((e) => {
          e.title = title;
          e.category = category;
          e.muscleGroup = muscleGroup;
          e.isDefault = false;
          user && (e.userId = user.id);
        });
      });
    } catch (error) {
      console.log("Error creating Exercise", error);
    }

    handleClose();
  };

  const handleClose = () => {
    setCategory("Rep Only");
    setMuscleGroup("None");
    setTitle("");
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <ActionSheetProvider>
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <BlurView intensity={40} style={styles.blurView} />
          </TouchableWithoutFeedback>

          <BlurView
            intensity={100}
            tint="systemChromeMaterial"
            style={[
              styles.card,
              {
                backgroundColor: String(colors.text)
                  .replace("rgb", "rgba")
                  .replace(")", ", 0.1)"),
              },
            ]}
          >
            <View style={styles.headerContainer}>
              <ThemedText style={styles.modalTitle}>Add Exercise</ThemedText>
              <ButtonWithIcon onPress={handleClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </ButtonWithIcon>
              <RNButton title="Save" onPress={handleAdd} disabled={!title} />
            </View>

            <TextInput
              label="Exercise Name"
              size="sm"
              value={title}
              onChangeText={setTitle}
              variant="ghost"
              inputStyle={{
                backgroundColor: String(colors.text)
                  .replace("rgb", "rgba")
                  .replace(")", ", 0.1)"),
                borderRadius: 12,
              }}
            />

            <OptionRow
              label="Category"
              value={category}
              options={CATEGORIES}
              onChange={setCategory}
            />

            <OptionRow
              label="Muscle Group"
              value={muscleGroup}
              options={MUSCLE_GROUPS}
              onChange={setMuscleGroup}
            />
          </BlurView>
        </KeyboardAvoidingView>
      </ActionSheetProvider>
    </Modal>
  );
};

export default ExerciseModal;

const styles = StyleSheet.create({
  blurView: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    width: "90%",

    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 5,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  modalTitle: {
    textAlign: "center",
    position: "absolute",
    left: 0,
    right: 0,
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  label: {
    fontWeight: 600,
    opacity: 0.6,
  },
});
