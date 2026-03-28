import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/lib/auth-context";

export default function DashboardScreen() {
  const { user } = useSession();

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      <ScrollView className="flex-1 px-6 pt-6">
        <Text className="font-display text-3xl text-ink font-extrabold mb-1">
          Your Pools
        </Text>
        <Text className="font-body text-ink-soft text-base mb-6">
          Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] ?? "there"}
        </Text>

        <View className="bg-white rounded-[20px] border border-border p-8 items-center">
          <Text className="text-5xl mb-4">🎉</Text>
          <Text className="font-display text-xl text-ink font-bold text-center mb-2">
            Create your first pool
          </Text>
          <Text className="font-body text-ink-soft text-center text-sm mb-6">
            Set up a baby prediction pool and share it with friends and family
          </Text>
          <Pressable
            className="rounded-[14px] py-3.5 px-8 bg-blush"
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Text className="font-body text-white font-bold text-base">
              Create Pool +
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
