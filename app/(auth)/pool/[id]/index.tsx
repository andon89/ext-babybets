import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { getPool, getPoolPredictionCount, getPoolPredictions } from "@/lib/pool-service";
import { formatDate } from "@/lib/constants";
import { Pool, Prediction } from "@/lib/types";

export default function PoolManagementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [predictionCount, setPredictionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let cancelled = false;

      async function load() {
        setLoading(true);
        try {
          const [p, count, preds] = await Promise.all([
            getPool(id),
            getPoolPredictionCount(id),
            getPoolPredictions(id),
          ]);
          if (cancelled) return;
          setPool(p);
          setPredictionCount(count);
          setPredictions(preds);
        } catch (e) {
          console.error("Failed to load pool:", e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();
      return () => { cancelled = true; };
    }, [id])
  );

  if (loading || !pool) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator color="#E8A0B4" />
      </SafeAreaView>
    );
  }

  const daysUntilDue = Math.ceil(
    (new Date(pool.due_date + "T00:00:00").getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      <ScrollView className="flex-1 px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-body text-blush-deep font-semibold">← Back</Text>
        </Pressable>

        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-blush-light items-center justify-center mb-3">
            <Text className="text-3xl">👶</Text>
          </View>
          <Text className="font-display text-2xl text-ink font-extrabold">{pool.baby_name}</Text>
          <Text className="font-body text-ink-soft text-sm">
            Due {formatDate(pool.due_date)} · {daysUntilDue > 0 ? `${daysUntilDue} days left` : "Due date passed"}
          </Text>
        </View>

        <View className="flex-row justify-center gap-8 mb-6">
          <View className="items-center">
            <Text className="font-display text-2xl text-ink font-bold">{predictionCount}</Text>
            <Text className="font-body text-xs text-ink-muted">Predictions</Text>
          </View>
          <View className="items-center">
            <Text className="font-display text-2xl text-ink font-bold">{pool.enabled_categories.length}</Text>
            <Text className="font-body text-xs text-ink-muted">Categories</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push(`/(auth)/pool/${id}/invite`)}
          className="bg-blush rounded-[14px] py-4 items-center mb-3"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <Text className="font-body text-white font-bold text-base">
            Invite People 🔗
          </Text>
        </Pressable>

        {!pool.revealed && (
          <Pressable
            onPress={() => router.push(`/(auth)/pool/${id}/reveal`)}
            className="bg-sky rounded-[14px] py-4 items-center mb-3"
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Text className="font-body text-white font-bold text-base">
              Reveal Results 🎉
            </Text>
          </Pressable>
        )}

        {pool.revealed && (
          <Pressable
            onPress={() => router.push(`/(public)/pool/${pool.slug}/results`)}
            className="bg-sage-light rounded-[14px] py-4 items-center mb-3"
          >
            <Text className="font-body text-sage font-bold text-base" style={{ color: "#6B9E6B" }}>
              View Results →
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => router.push(`/(auth)/pool/${id}/settings`)}
          className="bg-white border border-border rounded-[14px] py-4 items-center mb-6"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <Text className="font-body text-ink font-semibold text-base">
            Pool Settings ⚙️
          </Text>
        </Pressable>

        <Text className="font-display text-xl text-ink font-bold mb-3">
          Recent Predictions
        </Text>
        {predictions.length === 0 ? (
          <View className="bg-white rounded-[16px] border border-border p-6 items-center mb-6">
            <Text className="font-body text-ink-muted text-sm text-center">
              No predictions yet. Share your pool to get started!
            </Text>
          </View>
        ) : (
          predictions.slice(0, 10).map((pred) => (
            <View
              key={pred.id}
              className="bg-white rounded-[14px] border border-border p-4 mb-2 flex-row items-center justify-between"
            >
              <View>
                <Text className="font-body text-sm font-semibold text-ink">{pred.guest_name}</Text>
                <Text className="font-body text-xs text-ink-muted">
                  {new Date(pred.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text className="font-body text-xs text-ink-muted">
                {pred.short_code}
              </Text>
            </View>
          ))
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
