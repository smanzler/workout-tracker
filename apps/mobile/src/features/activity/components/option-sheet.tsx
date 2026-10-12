import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Check } from "lucide-react-native";
import { useRef } from "react";
import { Modal, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCSSVariable } from "uniwind";
import { keysOf } from "../lib/keys-of";

function OptionRow({
  label,
  selected,
  muted = false,
  onPress,
}: {
  label: string;
  selected: boolean;
  muted?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="min-h-12 flex-row items-center gap-3 border-b border-border py-2 pl-5 pr-4"
    >
      <Text
        className={cn(
          "flex-1 text-[15px]",
          muted && "text-muted-foreground",
          selected && "font-semibold",
        )}
      >
        {label}
      </Text>
      {selected && <Icon as={Check} className="size-[18px] text-brand" />}
    </Pressable>
  );
}

const Backdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.32}
  />
);

/**
 * A bottom sheet that lists the values in `labels` under `title`, with
 * `noneLabel` first for no value. It opens when it mounts and calls `onClose`
 * when it is gone.
 */
export function OptionSheet<TValue extends string>({
  title,
  labels,
  value,
  noneLabel = "None",
  onChange,
  onClose,
}: {
  title: string;
  noneLabel?: string;
  labels: Record<TValue, string>;
  value: TValue | null;
  onChange: (value: TValue | null) => void;
  onClose: () => void;
}) {
  const sheetRef = useRef<BottomSheet>(null);
  const border = String(useCSSVariable("--color-border"));

  const pick = (next: TValue | null) => {
    onChange(next);
    sheetRef.current?.close();
  };

  return (
    // A modal puts the sheet over the native tab bar and over modal screens.
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => sheetRef.current?.close()}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheet
          ref={sheetRef}
          enablePanDownToClose
          onClose={onClose}
          backdropComponent={Backdrop}
          backgroundComponent={({ style }) => (
            <View style={style} className="rounded-t-2xl bg-background" />
          )}
          handleIndicatorStyle={{
            width: 36,
            height: 5,
            backgroundColor: border,
          }}
        >
          <BottomSheetView className="pb-safe-offset-4">
            <View className="flex-row items-baseline border-b border-foreground px-5 pb-2 pt-1.5">
              <Text className="flex-1 font-mono text-[11px] font-semibold uppercase tracking-wider">
                {title}
              </Text>
              <Text className="font-mono text-[11px] tracking-wider text-muted-foreground">
                PICK ONE
              </Text>
            </View>
            <OptionRow
              label={noneLabel}
              selected={value === null}
              muted
              onPress={() => pick(null)}
            />
            {keysOf(labels).map((key) => (
              <OptionRow
                key={key}
                label={labels[key]}
                selected={value === key}
                onPress={() => pick(key)}
              />
            ))}
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
}
