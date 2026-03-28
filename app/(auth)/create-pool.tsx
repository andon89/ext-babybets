import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSession } from "@/lib/auth-context";
import { createPool } from "@/lib/pool-service";
import { CategoryToggle } from "@/components/CategoryToggle";
import { ALL_CATEGORIES, CATEGORY_META, generateSlug } from "@/lib/constants";
import { CategoryKey, CATEGORY_MAX_POINTS } from "@/lib/types";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";

type Step = 1 | 2 | 3;

export default function CreatePoolScreen() {
  const { user } = useSession();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [babyName, setBabyName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [hostName, setHostName] = useState(
    user?.user_metadata?.full_name ?? ""
  );

  const [enabledCategories, setEnabledCategories] = useState<Set<CategoryKey>>(
    new Set(ALL_CATEGORIES)
  );

  const [createdPool, setCreatedPool] = useState<{
    slug: string;
    id: string;
  } | null>(null);

  const toggleCategory = (cat: CategoryKey) => {
    setEnabledCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const enabledCount = enabledCategories.size;
  const maxPoints = ALL_CATEGORIES
    .filter((c) => enabledCategories.has(c))
    .reduce((sum, c) => sum + CATEGORY_MAX_POINTS[c], 0);

  const handleNext = async () => {
    setError("");

    if (step === 1) {
      if (!babyName.trim()) {
        setError("Please enter a baby name");
        return;
      }
      if (!dueDate.trim()) {
        setError("Please enter a due date");
        return;
      }
      if (!hostName.trim()) {
        setError("Please enter your name");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (enabledCount === 0) {
        setError("Please enable at least one category");
        return;
      }
      setLoading(true);
      try {
        const pool = await createPool({
          babyName: babyName.trim(),
          dueDate,
          hostDisplayName: hostName.trim(),
          enabledCategories: Array.from(enabledCategories),
          userId: user!.id,
        });
        setCreatedPool({ slug: pool.slug, id: pool.id });
        setStep(3);
      } catch (e: any) {
        setError(e.message || "Failed to create pool");
      } finally {
        setLoading(false);
      }
    }
  };

  const poolUrl = createdPool ? `babybets.cc/pool/${createdPool.slug}` : "";

  const copyLink = async () => {
    await Clipboard.setStringAsync(`https://${poolUrl}`);
  };

  const shareLink = async () => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(`https://${poolUrl}`, {
        dialogTitle: `Join ${babyName}'s Baby Bets pool!`,
      });
    }
  };

  const progressSegments = [1, 2, 3] as const;

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      <ScrollView className="flex-1 px-6 pt-4">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => (step === 1 ? router.back() : setStep((s) => (s - 1) as Step))}>
            <Text className="font-body text-blush-deep font-semibold text-base">
              {step === 1 ? "Cancel" : "← Back"}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row gap-1 mb-6">
          {progressSegments.map((s) => (
            <View
              key={s}
              className={`flex-1 h-1 rounded-full ${
                s <= step ? (s % 2 === 0 ? "bg-sky" : "bg-blush") : "bg-cream-dark"
              }`}
            />
          ))}
        </View>

        {error ? (
          <View className="bg-blush-light rounded-[14px] p-3 mb-4">
            <Text className="font-body text-blush-deep text-center text-sm">
              {error}
            </Text>
          </View>
        ) : null}

        {step === 1 && (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              Create your pool
            </Text>
            <Text className="font-body text-ink-soft text-base mb-6">
              Tell us about your baby
            </Text>

            <View className="mb-4">
              <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">
                Baby's nickname
              </Text>
              <TextInput
                className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
                placeholder="Baby Morse"
                placeholderTextColor="#A49E96"
                value={babyName}
                onChangeText={setBabyName}
              />
              <Text className="font-body text-xs text-ink-muted mt-1">
                This is what guests will see. Use a real name or a fun placeholder.
              </Text>
            </View>

            <View className="mb-4">
              <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">
                Due date
              </Text>
              <TextInput
                className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
                placeholder="2026-06-03"
                placeholderTextColor="#A49E96"
                value={dueDate}
                onChangeText={setDueDate}
              />
            </View>

            <View className="mb-6">
              <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">
                Your name
              </Text>
              <TextInput
                className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
                placeholder="Sarah & Andrew"
                placeholderTextColor="#A49E96"
                value={hostName}
                onChangeText={setHostName}
              />
              <Text className="font-body text-xs text-ink-muted mt-1">
                Shown as the pool host to your guests.
              </Text>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              What should guests predict?
            </Text>
            <Text className="font-body text-ink-soft text-sm mb-6">
              Toggle off anything that's already known or you don't want included.
            </Text>

            {ALL_CATEGORIES.map((cat) => (
              <CategoryToggle
                key={cat}
                category={cat}
                enabled={enabledCategories.has(cat)}
                onToggle={toggleCategory}
              />
            ))}

            <View className="bg-blush-light rounded-[14px] p-3 mt-2 mb-4">
              <Text className="font-body text-xs text-blush-deep text-center">
                💡 {enabledCount} of 9 categories enabled · {maxPoints} max points
              </Text>
            </View>
          </View>
        )}

        {step === 3 && createdPool && (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2 text-center">
              Your pool is live! 🎉
            </Text>
            <Text className="font-body text-ink-soft text-base mb-2 text-center">
              Share it with your people
            </Text>
            <Text className="font-body text-ink font-bold text-base mb-6 text-center">
              {poolUrl}
            </Text>

            <Pressable
              onPress={copyLink}
              className="bg-white border border-border rounded-[16px] p-4 flex-row items-center gap-3 mb-2.5"
            >
              <View className="w-11 h-11 bg-sky-light rounded-[10px] items-center justify-center">
                <Text className="text-xl">🔗</Text>
              </View>
              <View className="flex-1">
                <Text className="font-body text-sm font-semibold text-ink">Copy Link</Text>
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
                <Text className="font-body text-xs text-ink-muted">iMessage, WhatsApp, more</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.replace("/(auth)/dashboard")}
              className="items-center mt-6 mb-8"
            >
              <Text className="font-body text-sky-deep font-semibold text-sm">
                Skip for now — go to dashboard →
              </Text>
            </Pressable>
          </View>
        )}

        {step < 3 && (
          <Pressable
            onPress={handleNext}
            disabled={loading}
            className="bg-blush rounded-[14px] py-4 items-center mt-2 mb-8"
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-body text-white font-bold text-base">
                {step === 2 ? "Create Pool ✨" : "Next →"}
              </Text>
            )}
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
