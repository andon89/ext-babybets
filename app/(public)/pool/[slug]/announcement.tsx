import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { getPoolBySlug, getPoolSettings } from "@/lib/pool-service";
import { formatDate, formatTime } from "@/lib/constants";
import { Pool, PoolSettings } from "@/lib/types";

export default function AnnouncementScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [settings, setSettings] = useState<PoolSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      const p = await getPoolBySlug(slug);
      setPool(p);
      if (p) {
        const s = await getPoolSettings(p.id);
        setSettings(s);
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

  if (!pool || !pool.revealed || !settings) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-6">
        <Text className="text-5xl mb-4">⏳</Text>
        <Text className="font-display text-2xl text-ink font-bold text-center">
          Not yet revealed
        </Text>
      </SafeAreaView>
    );
  }

  const genderEmoji = settings.actual_gender === "Girl" ? "🎀" : "💙";
  const genderColor = settings.actual_gender === "Girl" ? "bg-blush-light" : "bg-sky-light";
  const genderTextColor = settings.actual_gender === "Girl" ? "text-blush-deep" : "text-sky-deep";

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" contentContainerClassName="items-center px-6 py-8">
        {/* Announcement card */}
        <View className="bg-white rounded-[24px] overflow-hidden w-full max-w-[380px] shadow-lg">
          {/* Photo area placeholder */}
          <View className="h-56 bg-gradient-to-br from-blush-light to-sky-light items-center justify-center"
            style={{ backgroundColor: settings.actual_gender === "Girl" ? "#FCEEF2" : "#EAF4FA" }}
          >
            <Text className="text-7xl">👶</Text>
          </View>

          {/* Content */}
          <View className="p-6 items-center">
            {/* Gender badge */}
            {settings.actual_gender && (
              <View className={`${genderColor} px-4 py-1.5 rounded-full mb-3`}>
                <Text className={`font-body text-xs font-bold ${genderTextColor}`}>
                  {genderEmoji} It's a {settings.actual_gender}!
                </Text>
              </View>
            )}

            {/* Name */}
            <Text className="font-display text-4xl text-ink font-extrabold text-center leading-tight">
              {settings.actual_name || pool.baby_name}
            </Text>

            {/* Date */}
            {settings.actual_birthday && (
              <Text className="font-body text-ink-soft text-sm mt-2">
                Born {formatDate(settings.actual_birthday)}
                {settings.actual_birth_time ? ` at ${formatTime(settings.actual_birth_time)}` : ""}
              </Text>
            )}

            {/* Stats grid */}
            <View className="flex-row gap-3 mt-5 w-full">
              {settings.actual_weight_lbs != null && (
                <View className="flex-1 bg-cream rounded-[12px] p-3 items-center">
                  <Text className="font-display text-lg text-ink font-bold">
                    {settings.actual_weight_lbs} lbs {settings.actual_weight_oz ?? 0} oz
                  </Text>
                  <Text className="font-body text-xs text-ink-muted uppercase tracking-wide font-semibold">
                    Weight
                  </Text>
                </View>
              )}
              {settings.actual_length_inches != null && (
                <View className="flex-1 bg-cream rounded-[12px] p-3 items-center">
                  <Text className="font-display text-lg text-ink font-bold">
                    {settings.actual_length_inches}"
                  </Text>
                  <Text className="font-body text-xs text-ink-muted uppercase tracking-wide font-semibold">
                    Length
                  </Text>
                </View>
              )}
            </View>

            {/* Message */}
            {settings.announcement_message && (
              <Text className="font-display text-base text-ink-soft italic text-center mt-5 leading-relaxed">
                "{settings.announcement_message}"
              </Text>
            )}

            {/* CTA to results */}
            <Pressable
              onPress={() => router.push(`/(public)/pool/${slug}/results`)}
              className="bg-sky rounded-[14px] py-3.5 px-8 mt-5 w-full"
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <Text className="font-body text-white font-bold text-base text-center">
                See Who Guessed Closest →
              </Text>
            </Pressable>

            {/* Watermark */}
            <Text className="font-body text-ink-muted text-xs mt-4 opacity-50">
              babybets.cc
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
