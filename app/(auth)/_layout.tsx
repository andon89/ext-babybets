import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="create-pool" options={{ presentation: "modal" }} />
      <Stack.Screen name="pool/[id]/index" />
      <Stack.Screen name="pool/[id]/invite" />
      <Stack.Screen name="pool/[id]/settings" />
    </Stack>
  );
}
