import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { getPool, updatePool, deletePool } from "@/lib/pool-service";
import { Pool } from "@/lib/types";

export default function PoolSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPool(id).then((p) => {
      setPool(p);
      setLoading(false);
    });
  }, [id]);

  const toggleLock = async () => {
    if (!pool) return;
    setSaving(true);
    try {
      await updatePool(pool.id, { predictions_locked: !pool.predictions_locked });
      setPool({ ...pool, predictions_locked: !pool.predictions_locked });
    } catch (e) {
      console.error("Failed to update pool:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Pool",
      `Are you sure you want to delete ${pool?.baby_name}'s pool? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePool(id);
              router.replace("/(auth)/dashboard");
            } catch (e) {
              console.error("Failed to delete pool:", e);
            }
          },
        },
      ]
    );
  };

  if (loading || !pool) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator color="#E8A0B4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      <ScrollView className="flex-1 px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-body text-blush-deep font-semibold">← Back</Text>
        </Pressable>

        <Text className="font-display text-3xl text-ink font-extrabold mb-6">
          Pool Settings
        </Text>

        <View className="bg-white rounded-[20px] border border-border p-5 mb-4">
          <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1">
            Baby name
          </Text>
          <Text className="font-body text-base text-ink font-semibold mb-3">
            {pool.baby_name}
          </Text>
          <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1">
            Pool URL
          </Text>
          <Text className="font-body text-sm text-ink-soft">
            babybets.cc/pool/{pool.slug}
          </Text>
        </View>

        <Pressable
          onPress={toggleLock}
          disabled={saving}
          className="bg-white rounded-[20px] border border-border p-5 mb-4 flex-row items-center justify-between"
        >
          <View className="flex-1">
            <Text className="font-body text-base text-ink font-semibold">
              {pool.predictions_locked ? "🔒 Predictions Locked" : "🔓 Predictions Open"}
            </Text>
            <Text className="font-body text-xs text-ink-muted mt-1">
              {pool.predictions_locked
                ? "No new predictions can be submitted"
                : "Guests can still submit predictions"}
            </Text>
          </View>
          <View
            className={`w-12 h-7 rounded-[14px] justify-center ${
              pool.predictions_locked ? "bg-honey" : "bg-cream-dark"
            }`}
          >
            <View
              className={`w-6 h-6 bg-white rounded-full shadow-sm ${
                pool.predictions_locked ? "ml-5" : "ml-0.5"
              }`}
            />
          </View>
        </Pressable>

        <View className="mt-8">
          <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-3">
            Danger zone
          </Text>
          <Pressable
            onPress={handleDelete}
            className="bg-white border border-blush-deep rounded-[14px] py-4 items-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Text className="font-body text-blush-deep font-semibold text-base">
              Delete Pool
            </Text>
          </Pressable>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
