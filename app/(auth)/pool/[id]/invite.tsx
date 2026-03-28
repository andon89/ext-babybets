import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { getPool } from "@/lib/pool-service";
import { Pool } from "@/lib/types";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import QRCode from "react-native-qrcode-svg";

export default function InviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPool(id).then((p) => {
      setPool(p);
      setLoading(false);
    });
  }, [id]);

  if (loading || !pool) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator color="#E8A0B4" />
      </SafeAreaView>
    );
  }

  const poolUrl = `https://babybets.cc/pool/${pool.slug}`;

  const copyLink = async () => {
    await Clipboard.setStringAsync(poolUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(poolUrl, {
        dialogTitle: `Join ${pool.baby_name}'s Baby Bets pool!`,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      <ScrollView className="flex-1 px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-body text-blush-deep font-semibold">← Back</Text>
        </Pressable>

        <Text className="font-display text-3xl text-ink font-extrabold text-center mb-2">
          Share {pool.baby_name}'s Pool
        </Text>
        <Text className="font-body text-ink-soft text-center text-sm mb-6">
          {poolUrl}
        </Text>

        <View className="bg-white rounded-[20px] border border-border p-6 items-center mb-6">
          <QRCode
            value={poolUrl}
            size={200}
            color="#2D2A26"
            backgroundColor="#FFFFFF"
          />
          <Text className="font-body text-xs text-ink-muted mt-3">
            Scan to open the pool
          </Text>
        </View>

        <Pressable
          onPress={copyLink}
          className="bg-white border border-border rounded-[16px] p-4 flex-row items-center gap-3 mb-2.5"
        >
          <View className="w-11 h-11 bg-sky-light rounded-[10px] items-center justify-center">
            <Text className="text-xl">{copied ? "✅" : "🔗"}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-body text-sm font-semibold text-ink">
              {copied ? "Copied!" : "Copy Link"}
            </Text>
            <Text className="font-body text-xs text-ink-muted">Paste anywhere</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={shareLink}
          className="bg-white border border-border rounded-[16px] p-4 flex-row items-center gap-3 mb-2.5"
        >
          <View className="w-11 h-11 bg-blush-light rounded-[10px] items-center justify-center">
            <Text className="text-xl">📤</Text>
          </View>
          <View className="flex-1">
            <Text className="font-body text-sm font-semibold text-ink">Share</Text>
            <Text className="font-body text-xs text-ink-muted">iMessage, WhatsApp, Instagram, more</Text>
          </View>
        </Pressable>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
