import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function LandingPage() {
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" contentContainerClassName="items-center px-6 py-12">
        <Text className="text-6xl mb-4">👶</Text>
        <Text className="font-display text-5xl text-ink font-extrabold text-center mb-2">
          Baby Bets
        </Text>
        <Text className="font-body text-ink-soft text-lg text-center mb-8 max-w-[320px]">
          Create a prediction pool for your baby. Friends guess the stats. Reveal the results as a birth announcement.
        </Text>

        <Link href="/signup" asChild>
          <Pressable
            className="bg-blush rounded-[14px] py-4 px-10 mb-3 w-full max-w-[320px]"
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Text className="font-body text-white font-bold text-base text-center">
              Create Your Pool ✨
            </Text>
          </Pressable>
        </Link>

        <Link href="/login" asChild>
          <Pressable
            className="bg-white border border-border rounded-[14px] py-4 px-10 w-full max-w-[320px]"
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Text className="font-body text-ink font-semibold text-base text-center">
              Sign In
            </Text>
          </Pressable>
        </Link>

        <View className="mt-12 w-full max-w-[360px]">
          <Text className="font-display text-2xl text-ink font-bold text-center mb-6">
            How it works
          </Text>

          <View className="bg-white rounded-[20px] border border-border p-5 mb-3">
            <Text className="text-2xl mb-2">🎯</Text>
            <Text className="font-body text-ink font-semibold text-base mb-1">
              1. Create a pool
            </Text>
            <Text className="font-body text-ink-soft text-sm">
              Name your baby, pick a due date, choose which stats to predict.
            </Text>
          </View>

          <View className="bg-white rounded-[20px] border border-border p-5 mb-3">
            <Text className="text-2xl mb-2">🔗</Text>
            <Text className="font-body text-ink font-semibold text-base mb-1">
              2. Share with everyone
            </Text>
            <Text className="font-body text-ink-soft text-sm">
              Send a link, QR code, or email. Guests predict without needing an account.
            </Text>
          </View>

          <View className="bg-white rounded-[20px] border border-border p-5 mb-3">
            <Text className="text-2xl mb-2">🏆</Text>
            <Text className="font-body text-ink font-semibold text-base mb-1">
              3. Reveal the results
            </Text>
            <Text className="font-body text-ink-soft text-sm">
              When the baby arrives, enter the real stats. Everyone sees the leaderboard and a beautiful birth announcement.
            </Text>
          </View>
        </View>

        <Text className="font-body text-ink-muted text-xs mt-12">
          babybets.cc
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
