import { forwardRef } from "react";
import {
  OtpInput as OtpEntryInput,
  type OtpInputProps as OtpEntryInputProps,
  type OtpInputRef,
} from "react-native-otp-entry";
import { useCSSVariable } from "uniwind";

export type { OtpInputRef };

export const OtpInput = forwardRef<
  OtpInputRef,
  Omit<OtpEntryInputProps, "theme">
>(function OtpInput({ numberOfDigits = 6, ...props }, ref) {
  const [ring, input, background, foreground] = useCSSVariable([
    "--color-ring",
    "--color-input",
    "--color-background",
    "--color-foreground",
  ]).map((color) => String(color));

  return (
    <OtpEntryInput
      ref={ref}
      numberOfDigits={numberOfDigits}
      focusColor={ring}
      theme={{
        containerStyle: { gap: 8 },
        pinCodeContainerStyle: {
          flex: 1,
          height: 56,
          borderRadius: 8,
          borderColor: input,
          backgroundColor: background,
        },
        focusedPinCodeContainerStyle: {
          borderColor: ring,
        },
        pinCodeTextStyle: {
          fontSize: 20,
          fontWeight: "500",
          color: foreground,
        },
      }}
      {...props}
    />
  );
});
