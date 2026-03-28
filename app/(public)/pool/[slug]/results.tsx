import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, Link } from "expo-router";
import { getPoolBySlug, getPoolPredictions, getPoolSettings } from "@/lib/pool-service";
import { scoreAll } from "@/lib/scoring";
import { formatDate, formatTime, CATEGORY_META } from "@/lib/constants";
import { Pool, Prediction, PoolSettings, ScoreBreakdown, CategoryKey } from "@/lib/types";

type RankedPrediction = {
  prediction: Prediction;
  scores: ScoreBreakdown;
};

export default function ResultsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [settings, setSettings] = useState<PoolSettings | null>(null);
  const [ranked, setRanked] = useState<RankedPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      const p = await getPoolBySlug(slug);
      if (!p || !p.revealed) {
        setPool(p);
        setLoading(false);
        return;
      }
      setPool(p);

      const [preds, sett] = await Promise.all([
        getPoolPredictions(p.id),
        getPoolSettings(p.id),
      ]);
      setSettings(sett);

      if (sett && preds.length > 0) {
        const scored = preds.map((pred) => ({
          prediction: pred,
          scores: scoreAll(pred, sett, p.enabled_categories as CategoryKey[]),
        }));
        scored.sort((a, b) => b.scores.total - a.scores.total);
        setRanked(scored);
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
        <Text className="font-display text-2xl text-ink font-bold text-center">Pool not found</Text>
      </SafeAreaView>
    );
  }

  if (!pool.revealed) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-6">
        <Text className="text-5xl mb-4">⏳</Text>
        <Text className="font-display text-2xl text-ink font-bold text-center mb-2">
          Results not yet revealed
        </Text>
        <Text className="font-body text-ink-soft text-center text-sm">
          The host hasn't revealed the results yet. Check back soon!
        </Text>
      </SafeAreaView>
    );
  }

  const medalEmoji = (rank: number) => {
    if (rank === 0) return "🏆";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return "";
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Header with actual stats */}
        {settings && (
          <View className="items-center mb-6">
            <Text className="text-5xl mb-2">🎉</Text>
            <Text className="font-display text-3xl text-ink font-extrabold text-center">
              {settings.actual_name || pool.baby_name}
            </Text>
            {settings.actual_birthday && (
              <Text className="font-body text-ink-soft text-sm mt-1">
                Born {formatDate(settings.actual_birthday)}
                {settings.actual_birth_time ? ` at ${formatTime(settings.actual_birth_time)}` : ""}
              </Text>
            )}
            <View className="flex-row gap-6 mt-3">
              {settings.actual_weight_lbs != null && (
                <View className="items-center">
                  <Text className="font-display text-lg text-ink font-bold">
                    {settings.actual_weight_lbs} lbs {settings.actual_weight_oz ?? 0} oz
                  </Text>
                  <Text className="font-body text-xs text-ink-muted">Weight</Text>
                </View>
              )}
              {settings.actual_length_inches != null && (
                <View className="items-center">
                  <Text className="font-display text-lg text-ink font-bold">
                    {settings.actual_length_inches}"
                  </Text>
                  <Text className="font-body text-xs text-ink-muted">Length</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Announcement link */}
        <Link href={`/(public)/pool/${slug}/announcement`} asChild>
          <View className="bg-sky-light rounded-[14px] py-3 px-4 mb-6 items-center">
            <Text className="font-body text-sky-deep font-semibold text-sm">
              View Birth Announcement →
            </Text>
          </View>
        </Link>

        {/* Leaderboard */}
        <Text className="font-display text-2xl text-ink font-bold mb-3">
          Leaderboard
        </Text>

        {ranked.map((entry, index) => {
          const isTop3 = index < 3;
          const isGold = index === 0;
          const pct = entry.scores.max_possible > 0
            ? Math.round((entry.scores.total / entry.scores.max_possible) * 100)
            : 0;

          return (
            <View
              key={entry.prediction.id}
              className={`flex-row items-center gap-3 p-4 rounded-[14px] mb-2 border ${
                isGold ? "bg-honey-light border-honey" : "bg-white border-border"
              }`}
            >
              <Text className={`font-display text-xl font-bold w-7 text-center ${
                isGold ? "text-honey" : "text-ink-muted"
              }`}>
                {index + 1}
              </Text>
              {isTop3 && <Text className="text-lg">{medalEmoji(index)}</Text>}
              <View className="flex-1">
                <Text className="font-body text-sm font-semibold text-ink">
                  {entry.prediction.guest_name}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-display text-lg text-ink font-bold">
                  {entry.scores.total}
                </Text>
                <Text className="font-body text-xs text-ink-muted">
                  / {entry.scores.max_possible} ({pct}%)
                </Text>
              </View>
            </View>
          );
        })}

        {/* Viral CTA */}
        <View className="bg-blush-light rounded-[20px] p-5 mt-6 mb-8 items-center">
          <Text className="font-body text-blush-deep text-sm text-center">
            Expecting? Create your own Baby Bets pool at babybets.cc
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
