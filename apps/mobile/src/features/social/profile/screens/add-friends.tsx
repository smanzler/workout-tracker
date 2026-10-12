import { QueryView } from "@/components/query-view";
import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { ProfileRow } from "../components/profile-row";
import { useDebounce } from "../hooks/use-debounce";
import { useProfiles, useSuggestedProfiles } from "../hooks/use-profiles";

type Mode = "search" | "suggested";

const modeStates: Record<
  Mode,
  {
    heading: (count: number) => string;
    title: string;
    description: (search: string) => string;
  }
> = {
  search: {
    heading: (count) => `RESULTS · ${count}`,
    title: "No one found",
    description: (search) =>
      `No username matches "${search}". Check the spelling, or try part of the name.`,
  },
  suggested: {
    heading: () => "NEW ON REP",
    title: "No one new yet",
    description: () =>
      "New people show here when they join. Search by username to find a friend.",
  },
};

export default function AddFriends() {
  const [search, setSearch] = useState("");
  const trimmedSearch = useDebounce(search, 500).trim();
  const mode: Mode = trimmedSearch ? "search" : "suggested";

  const searchQuery = useProfiles(
    { search: trimmedSearch },
    { enabled: mode === "search" },
  );
  const suggestedQuery = useSuggestedProfiles({
    enabled: mode === "suggested",
  });
  const state = modeStates[mode];

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Friends",
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
        }}
      />
      <Stack.SearchBar
        placeholder="Search for friends"
        hideNavigationBar={false}
        obscureBackground={false}
        onChangeText={(event) => setSearch(event.nativeEvent.text)}
        onCancelButtonPress={() => setSearch("")}
      />

      <QueryView
        query={mode === "search" ? searchQuery : suggestedQuery}
        errorTitle="Couldn't load people"
      >
        {(profiles) => (
          <FlatList
            data={profiles}
            keyExtractor={({ id }) => id}
            contentInsetAdjustmentBehavior="automatic"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <Text className="border-b border-foreground px-5 pb-1.5 pt-2.5 font-mono text-[11px] font-semibold tracking-wider">
                {state.heading(profiles.length)}
              </Text>
            }
            ListEmptyComponent={
              <View className="gap-1.5 border-b border-border px-5 py-4">
                <Text className="text-[15px] font-medium">{state.title}</Text>
                <Text className="text-sm leading-5 text-muted-foreground">
                  {state.description(trimmedSearch)}
                </Text>
              </View>
            }
            renderItem={({ item }) => <ProfileRow profile={item} />}
          />
        )}
      </QueryView>
    </>
  );
}
