import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
} from "react-native";
import { EULA, EULA_SUMMARY_POINTS } from "@/utils/eula";
import { useTheme } from "expo-router/react-navigation";
import { ThemedText } from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
interface EulaAgreementProps {
  onAgree: () => void;
  onDecline: () => void;
}

export const EulaAgreement = ({ onAgree, onDecline }: EulaAgreementProps) => {
  const { colors } = useTheme();

  const handleAgree = () => {
    Alert.alert(
      "Agree to Terms",
      "By agreeing, you confirm that you have read and accept our terms, including our zero-tolerance policy for objectionable content and abusive behavior.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "I Agree", onPress: onAgree },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen
        options={{ headerTitle: "Terms of Use", headerBackTitle: "Sign Up" }}
      />

      <View style={styles.summary}>
        {EULA_SUMMARY_POINTS.map((point, index) => (
          <View key={index} style={styles.summaryRow}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.primary}
              style={styles.icon}
            />
            <ThemedText style={styles.summaryText}>{point}</ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.eulaContainer, { borderColor: colors.border }]}>
        <ScrollView>
          <ThemedText style={styles.eulaText}>{EULA}</ThemedText>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleAgree}
        >
          <ThemedText style={[styles.buttonText, { color: colors.background }]}>
            I Agree
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onDecline}
        >
          <ThemedText style={styles.buttonText}>Decline</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  summary: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
    fontSize: 15,
  },
  eulaContainer: {
    flex: 1,
    margin: 20,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  eulaText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 16,
    gap: 12,
  },
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "transparent",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
