import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Set } from "@/models/Set";
import { FontAwesome5 } from "@expo/vector-icons";

const SetListItem = ({ set }: { set: Set }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.item, styles.order]}>{set.order}</Text>
      <Text>-</Text>
      <View style={styles.rightContainer}>
        <TextInput style={[styles.item, styles.weight]} />
        <TextInput style={[styles.item, styles.reps]} />
        <TouchableOpacity style={[styles.button, styles.completed]}>
          <FontAwesome5 name="check" size={16} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SetListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 5,
  },
  item: {
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "#e8e8e8",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#e8e8e8",
    borderRadius: 5,
  },
  order: {
    width: 30,
  },
  rightContainer: {
    flexDirection: "row",
    gap: 10,
  },
  weight: {
    width: 40,
    textAlign: "center",
  },
  reps: {
    width: 40,
    textAlign: "center",
  },
  completed: {
    width: 30,
    alignItems: "center",
  },
});
