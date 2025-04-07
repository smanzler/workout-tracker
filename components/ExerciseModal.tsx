import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  View,
  Button as RNButton,
} from "react-native";
import React, { useState } from "react";
import { Button } from "react-native";
import database, { exercisesCollection } from "@/db";
import { useAuth } from "@/providers/AuthProvider";
import { TouchableWithoutFeedback } from "react-native";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@react-navigation/native";
import TextInput from "./TextInput";
import { Ionicons } from "@expo/vector-icons";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/zeego/drop-down";
import Animated from "react-native-reanimated";
import ButtonWithIcon from "./ButtonWithIcon";

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
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <BlurView intensity={40} style={styles.blurView} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.card, { backgroundColor: colors.card }]}>
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
              backgroundColor: colors.text
                .replace("rgb", "rgba")
                .replace(")", ", 0.1)"),
              borderRadius: 12,
            }}
          />

          <DropdownMenuRoot>
            <DropdownMenuTrigger>
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.text
                      .replace("rgb", "rgba")
                      .replace(")", ", 0.1)"),
                  },
                ]}
              >
                <ThemedText style={styles.label}>Category</ThemedText>

                <View style={{ flexDirection: "row", gap: 5 }}>
                  <ThemedText style={styles.label}>{category}</ThemedText>
                  <Ionicons
                    style={{ opacity: 0.6 }}
                    name="chevron-expand"
                    size={22}
                    color={colors.text}
                  />
                </View>
              </View>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                key="barbell"
                onSelect={() => {
                  setCategory("Barbell");
                }}
              >
                <DropdownMenuItemTitle>Barbell</DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="dumbbell"
                onSelect={() => {
                  setCategory("Dumbbell");
                }}
              >
                <DropdownMenuItemTitle>Dumbbell</DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="Machine"
                onSelect={() => {
                  setCategory("Machine");
                }}
              >
                <DropdownMenuItemTitle>Machine</DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="Bodyweight"
                onSelect={() => {
                  setCategory("Bodyweight");
                }}
              >
                <DropdownMenuItemTitle>Bodyweight</DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="assisted_bodyweight"
                onSelect={() => {
                  setCategory("Assisted Bodyweight");
                }}
              >
                <DropdownMenuItemTitle>
                  Assisted Bodyweight
                </DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="reps_only"
                onSelect={() => {
                  setCategory("Reps Only");
                }}
              >
                <DropdownMenuItemTitle>Reps Only</DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="duration"
                onSelect={() => {
                  setCategory("Duration");
                }}
              >
                <DropdownMenuItemTitle>Duration</DropdownMenuItemTitle>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuRoot>

          <DropdownMenuRoot>
            <DropdownMenuTrigger>
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.text
                      .replace("rgb", "rgba")
                      .replace(")", ", 0.1)"),
                  },
                ]}
              >
                <ThemedText style={styles.label}>Muscle Group</ThemedText>

                <View style={{ flexDirection: "row", gap: 5 }}>
                  <ThemedText style={styles.label}>{muscleGroup}</ThemedText>
                  <Ionicons
                    style={{ opacity: 0.6 }}
                    name="chevron-expand"
                    size={22}
                    color={colors.text}
                  />
                </View>
              </View>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                key="chest"
                onSelect={() => {
                  setMuscleGroup("Chest");
                }}
              >
                <DropdownMenuItemTitle>Chest</DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="shoulders"
                onSelect={() => {
                  setMuscleGroup("Shoulders");
                }}
              >
                <DropdownMenuItemTitle>Shoulders</DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="arms"
                onSelect={() => {
                  setMuscleGroup("Arms");
                }}
              >
                <DropdownMenuItemTitle>Arms</DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="legs"
                onSelect={() => {
                  setMuscleGroup("Legs");
                }}
              >
                <DropdownMenuItemTitle>Legs</DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="back"
                onSelect={() => {
                  setMuscleGroup("Back");
                }}
              >
                <DropdownMenuItemTitle>Back</DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="core"
                onSelect={() => {
                  setMuscleGroup("Core");
                }}
              >
                <DropdownMenuItemTitle>Core</DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="cardio"
                onSelect={() => {
                  setMuscleGroup("Cardio");
                }}
              >
                <DropdownMenuItemTitle>Cardio</DropdownMenuItemTitle>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="none"
                onSelect={() => {
                  setMuscleGroup("None");
                }}
              >
                <DropdownMenuItemTitle>None</DropdownMenuItemTitle>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </Animated.View>
      </KeyboardAvoidingView>
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
    marginBottom: 12,
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
    marginBottom: 4,
    opacity: 0.6,
  },
});
