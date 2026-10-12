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
  const [brand, input, foreground] = useCSSVariable([
    "--color-brand",
    "--color-input",
    "--color-foreground",
  ]).map((color) => String(color));

  return (
    <OtpEntryInput
      ref={ref}
      numberOfDigits={numberOfDigits}
      focusColor={brand}
      theme={{
        containerStyle: { gap: 8 },
        pinCodeContainerStyle: {
          flex: 1,
          height: 58,
          borderWidth: 0,
          borderBottomWidth: 1.5,
          borderRadius: 0,
          borderColor: input,
        },
        filledPinCodeContainerStyle: { borderColor: foreground },
        focusedPinCodeContainerStyle: {
          borderBottomWidth: 2,
          borderColor: brand,
        },
        pinCodeTextStyle: {
          fontFamily: "IBM Plex Mono",
          fontSize: 28,
          fontWeight: "500",
          color: foreground,
        },
      }}
      {...props}
    />
  );
});
