import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Set } from "@/models/Set";

const SetListItem = ({ set }: { set: Set }) => {
  return (
    <View>
      <Text>{set.order}</Text>
    </View>
  );
};

export default SetListItem;

const styles = StyleSheet.create({});
