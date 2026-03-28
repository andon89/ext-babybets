import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { getPoolBySlug, getPoolPredictionCount } from "@/lib/pool-service";
import { CATEGORY_META, formatDate } from "@/lib/constants";
import { Pool, CategoryKey, CATEGORY_MAX_POINTS } from "@/lib/types";

export default function PublicPoolPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [predictionCount, setPredictionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      const p = await getPoolBySlug(slug);
      setPool(p);
      if (p) {
        const count = await getPoolPredictionCount(p.id);
        setPredictionCount(count);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator color="#E8A0B4" />
      </SafeAreaView>
    );
  }

  if (!pool) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-6">
        <Text className="text-5xl mb-4">🤷</Text>
        <Text className="font-display text-2xl text-ink font-bold text-center mb-2">
          Pool not found
        </Text>
        <Text className="font-body text-ink-soft text-center text-sm">
          This pool doesn't exist or the link is incorrect.
        </Text>
      </SafeAreaView>
    );
  }

  const daysUntilDue = Math.ceil(
    (new Date(pool.due_date + "T00:00:00").getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" contentContainerClassName="items-center px-6 py-8">
        <View className="w-20 h-20 rounded-full bg-blush-light items-center justify-center mb-3">
          <Text className="text-4xl">👶</Text>
        </View>
        <Text className="font-display text-3xl text-ink font-extrabold text-center">
          {pool.baby_name}
        </Text>
        <Text className="font-body text-ink-soft text-sm mt-1">
          Due {formatDate(pool.due_date)}
        </Text>
        <Text className="font-body text-ink-muted text-xs mt-1 italic">
          hosted by {pool.host_display_name}
        </Text>

        <View className="flex-row justify-center gap-8 mt-5 mb-6">
          <View className="items-center">
            <Text className="font-display text-2xl text-ink font-bold">{predictionCount}</Text>
            <Text className="font-body text-xs text-ink-muted">Predictions</Text>
          </View>
          <View className="w-px bg-border self-stretch" />
          <View className="items-center">
            <Text className="font-display text-2xl text-ink font-bold">{pool.enabled_categories.length}</Text>
            <Text className="font-body text-xs text-ink-muted">Categories</Text>
          </View>
          <View className="w-px bg-border self-stretch" />
          <View className="items-center">
            <Text className="font-display text-2xl text-ink font-bold">
              {daysUntilDue > 0 ? daysUntilDue : 0}
            </Text>
            <Text className="font-body text-xs text-ink-muted">Days left</Text>
          </View>
        </View>

        <View className="w-full max-w-[400px]">
          <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-2.5">
            Predict these categories
          </Text>
          {pool.enabled_categories.map((cat) => {
            const meta = CATEGORY_META[cat as CategoryKey];
            if (!meta) return null;
            return (
              <View
                key={cat}
                className="bg-white rounded-[16px] border border-border p-4 mb-2 flex-row items-center gap-3"
              >
                <View className="w-10 h-10 rounded-[10px] bg-blush-light items-center justify-center">
                  <Text className="text-lg">{meta.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-body text-sm font-semibold text-ink">{meta.label}</Text>
                  <Text className="font-body text-xs text-ink-muted">{meta.description}</Text>
                </View>
                <Text className="font-display text-base text-blush-deep font-bold">
                  {CATEGORY_MAX_POINTS[cat as CategoryKey]} pts
                </Text>
              </View>
            );
          })}
        </View>

        {pool.predictions_locked ? (
          <View className="bg-honey-light rounded-[14px] py-4 px-8 mt-4 w-full max-w-[400px]">
            <Text className="font-body font-bold text-base text-center" style={{ color: "#E8C87A" }}>
              🔒 Predictions are locked
            </Text>
          </View>
        ) : (
          <Pressable
            className="bg-blush rounded-[14px] py-4 px-8 mt-4 w-full max-w-[400px]"
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Text className="font-body text-white font-bold text-base text-center">
              Make My Prediction ✨
            </Text>
          </Pressable>
        )}

        <Text className="font-body text-ink-muted text-xs mt-8">
          babybets.cc
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
