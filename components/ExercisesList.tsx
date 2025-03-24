import { SectionList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { exercisesCollection } from "@/db";
import { Exercise } from "@/models/Exercise";
import { useTheme } from "@react-navigation/native";

const ExercisesList = ({
  sections,
  renderItem,
}: {
  sections: any[];
  renderItem: ({ item }: { item: Exercise }) => React.JSX.Element;
}) => {
  const theme = useTheme();

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={({ section: { title } }) => (
        <View
          style={[
            styles.sectionHeader,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <Text
            style={[styles.sectionHeaderText, { color: theme.colors.text }]}
          >
            {title}
          </Text>
        </View>
      )}
      ListFooterComponent={<View style={{ height: 150 }} />}
      keyboardShouldPersistTaps="handled"
    />
  );
};

const enhance = withObservables([], () => ({
  exercises: exercisesCollection.query(),
}));

export default enhance(ExercisesList);

const styles = StyleSheet.create({
  sectionHeader: {
    height: 40,
    paddingLeft: 20,
    borderBottomWidth: 1,
    justifyContent: "flex-end",
  },
  sectionHeaderText: {
    fontWeight: "bold",
    fontSize: 24,
  },
});
