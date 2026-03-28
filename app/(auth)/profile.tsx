import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/lib/auth-context";

export default function ProfileScreen() {
  const { user, signOut } = useSession();

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      <View className="flex-1 px-6 pt-6">
        <Text className="font-display text-3xl text-ink font-extrabold mb-6">
          Profile
        </Text>

        <View className="bg-white rounded-[20px] border border-border p-6 mb-6">
          <Text className="font-body text-ink font-semibold text-base">
            {user?.user_metadata?.full_name ?? "Baby Bets User"}
          </Text>
          <Text className="font-body text-ink-muted text-sm mt-1">
            {user?.email}
          </Text>
        </View>

        <Pressable
          onPress={signOut}
          className="bg-white border border-border rounded-[14px] py-4 items-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <Text className="font-body text-blush-deep font-semibold text-base">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
