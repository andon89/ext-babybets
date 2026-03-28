import { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useSession } from "@/lib/auth-context";
import { getMyPools, getPoolPredictionCount } from "@/lib/pool-service";
import { PoolCard } from "@/components/PoolCard";
import { Pool } from "@/lib/types";

export default function DashboardScreen() {
  const { user } = useSession();
  const [pools, setPools] = useState<Pool[]>([]);
  const [predictionCounts, setPredictionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;

      async function load() {
        setLoading(true);
        try {
          const myPools = await getMyPools(user!.id);
          if (cancelled) return;
          setPools(myPools);

          const counts: Record<string, number> = {};
          await Promise.all(
            myPools.map(async (pool) => {
              counts[pool.id] = await getPoolPredictionCount(pool.id);
            })
          );
          if (!cancelled) setPredictionCounts(counts);
        } catch (e) {
          console.error("Failed to load pools:", e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();
      return () => { cancelled = true; };
    }, [user])
  );

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      <ScrollView className="flex-1 px-6 pt-6">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold">
              Your Pools
            </Text>
            <Text className="font-body text-ink-soft text-base">
              Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] ?? "there"}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(auth)/create-pool")}
            className="bg-blush rounded-full w-10 h-10 items-center justify-center"
          >
            <Text className="text-white text-xl font-bold">+</Text>
          </Pressable>
        </View>

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator color="#E8A0B4" />
          </View>
        ) : pools.length === 0 ? (
          <View className="bg-white rounded-[20px] border border-border p-8 items-center">
            <Text className="text-5xl mb-4">🎉</Text>
            <Text className="font-display text-xl text-ink font-bold text-center mb-2">
              Create your first pool
            </Text>
            <Text className="font-body text-ink-soft text-center text-sm mb-6">
              Set up a baby prediction pool and share it with friends and family
            </Text>
            <Pressable
              onPress={() => router.push("/(auth)/create-pool")}
              className="rounded-[14px] py-3.5 px-8 bg-blush"
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <Text className="font-body text-white font-bold text-base">
                Create Pool +
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            {pools.map((pool) => (
              <PoolCard
                key={pool.id}
                pool={pool}
                predictionCount={predictionCounts[pool.id] ?? 0}
              />
            ))}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
