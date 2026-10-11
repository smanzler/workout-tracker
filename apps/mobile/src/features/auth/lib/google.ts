import { env } from "@/env";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";

const webClientId = env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/**
 * Whether the build has Google client IDs. Without them, there is no Google
 * sign-in.
 */
export const isGoogleSignInEnabled = !!webClientId && !!iosClientId;

if (webClientId && iosClientId) {
  GoogleOneTapSignIn.configure({ webClientId, iosClientId });
}

/** Signs out of Google too, so that the next sign-in can choose an account. */
export const signOutOfGoogle = async () => {
  if (isGoogleSignInEnabled) await GoogleOneTapSignIn.signOut();
};
