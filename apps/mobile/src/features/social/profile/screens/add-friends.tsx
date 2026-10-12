import { QueryView } from "@/components/query-view";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
import { SearchX, UserSearch, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { FlatList } from "react-native";
import { ProfileRow } from "../components/profile-row";
import { useDebounce } from "../hooks/use-debounce";
import { useProfiles, useSuggestedProfiles } from "../hooks/use-profiles";

type Mode = "search" | "suggested";

const modeStates: Record<
  Mode,
  {
    icon: LucideIcon;
    title: string;
    description: (search: string) => string;
    heading: (count: number) => string;
  }
> = {
  search: {
    heading: (count) => `RESULTS · ${count}`,
    icon: SearchX,
    title: "No results found",
    description: (search) => `No one matches "${search}".`,
  },
  suggested: {
    heading: () => "NEW ON REP",
    icon: UserSearch,
    title: "No suggestions yet",
    description: () => "Check back later for people to follow.",
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
        placement="stacked"
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
              profiles.length > 0 ? (
                <Text className="border-b border-foreground px-5 pb-1.5 pt-2.5 font-mono text-[11px] font-semibold tracking-wider">
                  {state.heading(profiles.length)}
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Icon as={state.icon} />
                  </EmptyMedia>
                  <EmptyTitle>{state.title}</EmptyTitle>
                  <EmptyDescription>
                    {state.description(trimmedSearch)}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            }
            renderItem={({ item }) => <ProfileRow profile={item} />}
          />
        )}
      </QueryView>
    </>
  );
}
