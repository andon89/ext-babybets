import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { getPool, getPoolSettings, updatePool } from "@/lib/pool-service";
import { supabase } from "@/lib/supabase";
import { sendRevealEmails } from "@/lib/notifications";
import { GENDERS, HAIR_AMOUNTS, HAIR_COLORS, EYE_COLORS } from "@/lib/constants";
import { ChipSelector } from "@/components/ChipSelector";
import { Pool, PoolSettings } from "@/lib/types";

export default function RevealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [gender, setGender] = useState<string | null>(null);
  const [birthday, setBirthday] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [weightOz, setWeightOz] = useState("");
  const [lengthInches, setLengthInches] = useState("");
  const [hairAmount, setHairAmount] = useState<string | null>(null);
  const [hairColor, setHairColor] = useState<string | null>(null);
  const [eyeColor, setEyeColor] = useState<string | null>(null);
  const [babyName, setBabyName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    async function load() {
      const p = await getPool(id);
      setPool(p);
      if (p) {
        const s = await getPoolSettings(p.id);
        if (s) {
          // Pre-fill if already partially entered
          if (s.actual_gender) setGender(s.actual_gender);
          if (s.actual_birthday) setBirthday(s.actual_birthday);
          if (s.actual_birth_time) setBirthTime(s.actual_birth_time);
          if (s.actual_weight_lbs != null) setWeightLbs(String(s.actual_weight_lbs));
          if (s.actual_weight_oz != null) setWeightOz(String(s.actual_weight_oz));
          if (s.actual_length_inches != null) setLengthInches(String(s.actual_length_inches));
          if (s.actual_hair_amount) setHairAmount(s.actual_hair_amount);
          if (s.actual_hair_color) setHairColor(s.actual_hair_color);
          if (s.actual_eye_color) setEyeColor(s.actual_eye_color);
          if (s.actual_name) setBabyName(s.actual_name);
          if (s.announcement_message) setMessage(s.announcement_message);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleReveal = () => {
    Alert.alert(
      "Reveal Results?",
      "This will make the results visible to everyone. You can undo this later.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reveal! 🎉", onPress: doReveal },
      ]
    );
  };

  const doReveal = async () => {
    if (!pool) return;
    setSaving(true);
    try {
      // Save settings
      const { error: settingsError } = await supabase
        .from("bb_pool_settings")
        .update({
          actual_gender: gender,
          actual_birthday: birthday || null,
          actual_birth_time: birthTime || null,
          actual_weight_lbs: weightLbs ? parseInt(weightLbs) : null,
          actual_weight_oz: weightOz ? parseInt(weightOz) : null,
          actual_length_inches: lengthInches ? parseFloat(lengthInches) : null,
          actual_hair_amount: hairAmount,
          actual_hair_color: hairColor,
          actual_eye_color: eyeColor,
          actual_name: babyName.trim() || null,
          announcement_message: message.trim() || null,
        })
        .eq("pool_id", pool.id);

      if (settingsError) throw settingsError;

      // Lock predictions and reveal
      await updatePool(pool.id, {
        predictions_locked: true,
        revealed: true,
      });

      // Send reveal notification emails (best-effort, don't block)
      sendRevealEmails({
        poolId: pool.id,
        poolName: pool.baby_name,
        babyName: babyName.trim() || pool.baby_name,
        announcementUrl: `https://babybets.cc/pool/${pool.slug}/announcement`,
      }).catch(() => {}); // Fire and forget

      router.replace(`/(auth)/pool/${id}`);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to reveal results");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !pool) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator color="#E8A0B4" />
      </SafeAreaView>
    );
  }

  const enabled = new Set(pool.enabled_categories);

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      <ScrollView className="flex-1 px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-body text-blush-deep font-semibold">← Back</Text>
        </Pressable>

        <Text className="font-display text-3xl text-ink font-extrabold mb-2">
          Reveal Results 🎉
        </Text>
        <Text className="font-body text-ink-soft text-sm mb-6">
          Enter the actual birth stats for {pool.baby_name}
        </Text>

        {enabled.has("gender") && (
          <View className="mb-5">
            <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-2">Gender</Text>
            <View className="flex-row gap-3">
              {GENDERS.map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setGender(g)}
                  className={`flex-1 py-4 rounded-[14px] items-center border-2 ${
                    gender === g
                      ? g === "Girl" ? "border-blush bg-blush-light" : "border-sky bg-sky-light"
                      : "border-border bg-white"
                  }`}
                >
                  <Text className="text-2xl mb-1">{g === "Girl" ? "👧" : "👦"}</Text>
                  <Text className="font-body text-sm font-bold">{g}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {enabled.has("birthday") && (
          <View className="mb-5">
            <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">Birthday</Text>
            <TextInput className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink" placeholder="2026-06-03" placeholderTextColor="#A49E96" value={birthday} onChangeText={setBirthday} />
          </View>
        )}

        {enabled.has("birth_time") && (
          <View className="mb-5">
            <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">Birth Time (24h)</Text>
            <TextInput className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink" placeholder="14:30" placeholderTextColor="#A49E96" value={birthTime} onChangeText={setBirthTime} />
          </View>
        )}

        {enabled.has("weight") && (
          <View className="mb-5">
            <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">Weight</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink" placeholder="lbs" placeholderTextColor="#A49E96" value={weightLbs} onChangeText={setWeightLbs} keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <TextInput className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink" placeholder="oz" placeholderTextColor="#A49E96" value={weightOz} onChangeText={setWeightOz} keyboardType="numeric" />
              </View>
            </View>
          </View>
        )}

        {enabled.has("length") && (
          <View className="mb-5">
            <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">Length (inches)</Text>
            <TextInput className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink" placeholder="20.5" placeholderTextColor="#A49E96" value={lengthInches} onChangeText={setLengthInches} keyboardType="decimal-pad" />
          </View>
        )}

        {enabled.has("hair_amount") && (
          <View className="mb-5">
            <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-2">Hair Amount</Text>
            <ChipSelector options={HAIR_AMOUNTS} selected={hairAmount} onSelect={setHairAmount} />
          </View>
        )}

        {enabled.has("hair_color") && (
          <View className="mb-5">
            <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-2">Hair Color</Text>
            <ChipSelector options={HAIR_COLORS} selected={hairColor} onSelect={setHairColor} />
          </View>
        )}

        {enabled.has("eye_color") && (
          <View className="mb-5">
            <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-2">Eye Color</Text>
            <ChipSelector options={EYE_COLORS} selected={eyeColor} onSelect={setEyeColor} />
          </View>
        )}

        {enabled.has("name") && (
          <View className="mb-5">
            <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">Baby's Name</Text>
            <TextInput className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink" placeholder="First name" placeholderTextColor="#A49E96" value={babyName} onChangeText={setBabyName} />
          </View>
        )}

        <View className="mb-5">
          <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">Announcement Message (optional)</Text>
          <TextInput
            className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
            placeholder="We're so in love!"
            placeholderTextColor="#A49E96"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
        </View>

        <Pressable
          onPress={handleReveal}
          disabled={saving}
          className="bg-blush rounded-[14px] py-4 items-center mb-8"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-body text-white font-bold text-base">
              Reveal Results 🎉
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
