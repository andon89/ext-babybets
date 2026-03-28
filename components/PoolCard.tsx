import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Pool } from "@/lib/types";
import { formatDate } from "@/lib/constants";

type Props = {
  pool: Pool;
  predictionCount: number;
};

export function PoolCard({ pool, predictionCount }: Props) {
  const daysUntilDue = Math.ceil(
    (new Date(pool.due_date + "T00:00:00").getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const dueLabel = daysUntilDue > 0 ? `${daysUntilDue} days left` : "Due date passed";

  return (
    <Pressable
      onPress={() => router.push(`/(auth)/pool/${pool.id}`)}
      className="bg-white rounded-[20px] border border-border p-5 mb-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.97 : 1 })}
    >
      <View className="flex-row items-center gap-3 mb-3">
        <View className="w-12 h-12 rounded-full bg-blush-light items-center justify-center">
          <Text className="text-2xl">👶</Text>
        </View>
        <View className="flex-1">
          <Text className="font-display text-lg text-ink font-bold">
            {pool.baby_name}
          </Text>
          <Text className="font-body text-xs text-ink-muted">
            Due {formatDate(pool.due_date)}
          </Text>
        </View>
        {pool.revealed ? (
          <View className="bg-sage-light px-3 py-1 rounded-full">
            <Text className="font-body text-xs font-semibold" style={{ color: "#B8CEB8" }}>Revealed</Text>
          </View>
        ) : pool.predictions_locked ? (
          <View className="bg-honey-light px-3 py-1 rounded-full">
            <Text className="font-body text-xs font-semibold" style={{ color: "#E8C87A" }}>Locked</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row gap-6">
        <View>
          <Text className="font-display text-xl text-ink font-bold">{predictionCount}</Text>
          <Text className="font-body text-xs text-ink-muted">Predictions</Text>
        </View>
        <View>
          <Text className="font-display text-xl text-ink font-bold">
            {pool.enabled_categories.length}
          </Text>
          <Text className="font-body text-xs text-ink-muted">Categories</Text>
        </View>
        <View>
          <Text className="font-display text-xl text-ink font-bold">{dueLabel.split(" ")[0]}</Text>
          <Text className="font-body text-xs text-ink-muted">
            {daysUntilDue > 0 ? "days left" : "overdue"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
