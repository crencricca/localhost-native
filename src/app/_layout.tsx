import "../global.css";
import { Caveat_600SemiBold, Caveat_700Bold } from "@expo-google-fonts/caveat";
import {
  ChakraPetch_500Medium,
  ChakraPetch_600SemiBold,
  ChakraPetch_700Bold,
} from "@expo-google-fonts/chakra-petch";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Colors, Fonts } from "@/constants/theme";
import { EventsProvider } from "@/state/events";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Keys come from Fonts so the registered names match the theme.
  const [loaded, error] = useFonts({
    [Fonts.sans[400]]: SpaceGrotesk_400Regular,
    [Fonts.sans[500]]: SpaceGrotesk_500Medium,
    [Fonts.sans[600]]: SpaceGrotesk_600SemiBold,
    [Fonts.sans[700]]: SpaceGrotesk_700Bold,
    [Fonts.display[500]]: ChakraPetch_500Medium,
    [Fonts.display[600]]: ChakraPetch_600SemiBold,
    [Fonts.display[700]]: ChakraPetch_700Bold,
    [Fonts.handwritten[600]]: Caveat_600SemiBold,
    [Fonts.handwritten[700]]: Caveat_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <EventsProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.canvas },
          headerTintColor: Colors.ink,
          headerTitleStyle: { fontFamily: Fonts.display[600] },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.canvas },
        }}
      >
        {/* The home screen has its own "My Events" heading. */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="event-form" options={{ presentation: "modal" }} />
      </Stack>
    </EventsProvider>
  );
}
