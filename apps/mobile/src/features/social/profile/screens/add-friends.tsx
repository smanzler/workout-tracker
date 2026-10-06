import { QueryView } from "@/components/query-view";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Stack } from "expo-router";
import { SearchX, UserSearch, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { FlatList } from "react-native";
import { ProfileCard } from "../components/profile-card";
import { useDebounce } from "../hooks/use-debounce";
import { useProfiles, useSuggestedProfiles } from "../hooks/use-profiles";

type Mode = "search" | "suggested";

const emptyStates: Record<
  Mode,
  { icon: LucideIcon; title: string; description: (search: string) => string }
> = {
  search: {
    icon: SearchX,
    title: "No results found",
    description: (search) => `No one matches "${search}".`,
  },
  suggested: {
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
  const empty = emptyStates[mode];

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Friends",
          headerBackButtonDisplayMode: "minimal",
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
            contentContainerClassName="gap-3 p-4"
            ListEmptyComponent={
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Icon as={empty.icon} />
                  </EmptyMedia>
                  <EmptyTitle>{empty.title}</EmptyTitle>
                  <EmptyDescription>
                    {empty.description(trimmedSearch)}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            }
            renderItem={({ item }) => <ProfileCard profile={item} />}
          />
        )}
      </QueryView>
    </>
  );
}
