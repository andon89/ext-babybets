import { useState, useEffect } from "react";
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
import { useLocalSearchParams, router } from "expo-router";
import { getPoolBySlug } from "@/lib/pool-service";
import { submitPrediction } from "@/lib/prediction-service";
import { ChipSelector } from "@/components/ChipSelector";
import {
  GENDERS,
  HAIR_AMOUNTS,
  HAIR_COLORS,
  EYE_COLORS,
  CATEGORY_META,
  formatDate,
  formatTime,
} from "@/lib/constants";
import { Pool, CategoryKey, CATEGORY_MAX_POINTS } from "@/lib/types";

type WizardStep = "welcome" | CategoryKey | "review";

export default function PredictScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Guest info
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // Predictions
  const [genderGuess, setGenderGuess] = useState<string | null>(null);
  const [birthday, setBirthday] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [weightOz, setWeightOz] = useState("");
  const [lengthInches, setLengthInches] = useState("");
  const [hairAmount, setHairAmount] = useState<string | null>(null);
  const [hairColor, setHairColor] = useState<string | null>(null);
  const [eyeColor, setEyeColor] = useState<string | null>(null);
  const [nameGuess, setNameGuess] = useState("");

  // Navigation
  const [steps, setSteps] = useState<WizardStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Result
  const [shortCode, setShortCode] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      const p = await getPoolBySlug(slug);
      setPool(p);
      if (p) {
        const wizardSteps: WizardStep[] = [
          "welcome",
          ...(p.enabled_categories as CategoryKey[]),
          "review",
        ];
        setSteps(wizardSteps);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading || !pool) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator color="#E8A0B4" />
      </SafeAreaView>
    );
  }

  if (pool.predictions_locked) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-6">
        <Text className="text-5xl mb-4">🔒</Text>
        <Text className="font-display text-2xl text-ink font-bold text-center mb-2">
          Predictions are locked
        </Text>
        <Text className="font-body text-ink-soft text-center text-sm">
          The pool host has closed submissions.
        </Text>
      </SafeAreaView>
    );
  }

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStep === "review";

  const goNext = () => {
    if (currentStep === "welcome" && !guestName.trim()) {
      setError("Please enter your name");
      return;
    }
    setError("");
    setCurrentStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  };

  const goBack = () => {
    setError("");
    if (isFirst) {
      router.back();
    } else {
      setCurrentStepIndex((i) => Math.max(i - 1, 0));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const result = await submitPrediction(pool.id, {
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim() || null,
        guest_phone: null,
        gender_guess: genderGuess as any,
        birthday: birthday || null,
        birth_time: birthTime || null,
        weight_lbs: weightLbs ? parseInt(weightLbs) : null,
        weight_oz: weightOz ? parseInt(weightOz) : null,
        length_inches: lengthInches ? parseFloat(lengthInches) : null,
        hair_amount: hairAmount as any,
        hair_color: hairColor as any,
        eye_color: eyeColor as any,
        name_guess: nameGuess.trim() || null,
      });
      setShortCode(result.shortCode);
    } catch (e: any) {
      setError(e.message || "Failed to submit prediction");
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (shortCode) {
    return (
      <SafeAreaView className="flex-1 bg-cream">
        <ScrollView className="flex-1" contentContainerClassName="items-center justify-center px-6 py-12">
          <Text className="text-6xl mb-4">🎉</Text>
          <Text className="font-display text-3xl text-ink font-extrabold text-center mb-2">
            Prediction locked in!
          </Text>
          <Text className="font-body text-ink-soft text-center text-base mb-2">
            Your code: <Text className="font-bold text-ink">{shortCode}</Text>
          </Text>
          <Text className="font-body text-ink-muted text-center text-sm mb-8">
            Save this code to check your results later.
          </Text>

          <View className="bg-white rounded-[20px] border border-border p-5 w-full max-w-[360px] mb-6">
            <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-3">
              Your predictions
            </Text>
            {genderGuess && <SummaryRow label="Gender" value={genderGuess} />}
            {birthday && <SummaryRow label="Birthday" value={formatDate(birthday)} />}
            {birthTime && <SummaryRow label="Birth Time" value={formatTime(birthTime)} />}
            {weightLbs && <SummaryRow label="Weight" value={`${weightLbs} lbs ${weightOz || 0} oz`} />}
            {lengthInches && <SummaryRow label="Length" value={`${lengthInches}"`} />}
            {hairAmount && <SummaryRow label="Hair Amount" value={hairAmount} />}
            {hairColor && <SummaryRow label="Hair Color" value={hairColor} />}
            {eyeColor && <SummaryRow label="Eye Color" value={eyeColor} />}
            {nameGuess && <SummaryRow label="Name" value={nameGuess} />}
          </View>

          <Pressable
            onPress={() => router.replace(`/(public)/pool/${slug}`)}
            className="bg-white border border-border rounded-[14px] py-4 px-8 w-full max-w-[360px] mb-4"
          >
            <Text className="font-body text-ink font-semibold text-base text-center">
              Back to Pool
            </Text>
          </Pressable>

          <View className="bg-blush-light rounded-[20px] p-5 w-full max-w-[360px]">
            <Text className="font-body text-blush-deep text-sm text-center">
              Expecting? Create your own Baby Bets pool at babybets.cc
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              {pool.baby_name}
            </Text>
            <Text className="font-body text-ink-soft text-base mb-6">
              Make your predictions for {pool.host_display_name}'s baby!
            </Text>
            <View className="mb-4">
              <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">
                Your name *
              </Text>
              <TextInput
                className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
                placeholder="Your name"
                placeholderTextColor="#A49E96"
                value={guestName}
                onChangeText={setGuestName}
                autoCapitalize="words"
              />
            </View>
            <View className="mb-4">
              <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">
                Email (optional)
              </Text>
              <TextInput
                className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
                placeholder="Get notified when results are revealed"
                placeholderTextColor="#A49E96"
                value={guestEmail}
                onChangeText={setGuestEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        );
      case "gender":
        return (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              Boy or Girl?
            </Text>
            <Text className="font-body text-ink-soft text-sm mb-6">
              What's your guess?
            </Text>
            <View className="flex-row gap-4">
              {GENDERS.map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setGenderGuess(g)}
                  className={`flex-1 py-6 rounded-[20px] items-center border-2 ${
                    genderGuess === g
                      ? g === "Girl" ? "border-blush bg-blush-light" : "border-sky bg-sky-light"
                      : "border-border bg-white"
                  }`}
                >
                  <Text className="text-4xl mb-2">{g === "Girl" ? "👧" : "👦"}</Text>
                  <Text className={`font-display text-xl font-bold ${
                    genderGuess === g
                      ? g === "Girl" ? "text-blush-deep" : "text-sky-deep"
                      : "text-ink"
                  }`}>{g}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      case "birthday":
        return (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              When will the baby arrive?
            </Text>
            <Text className="font-body text-ink-soft text-sm mb-6">
              Pick a date (YYYY-MM-DD)
            </Text>
            <TextInput
              className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
              placeholder="2026-06-03"
              placeholderTextColor="#A49E96"
              value={birthday}
              onChangeText={setBirthday}
            />
          </View>
        );
      case "birth_time":
        return (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              What time will the baby be born?
            </Text>
            <Text className="font-body text-ink-soft text-sm mb-6">
              24-hour format (HH:MM)
            </Text>
            <TextInput
              className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
              placeholder="14:30"
              placeholderTextColor="#A49E96"
              value={birthTime}
              onChangeText={setBirthTime}
            />
          </View>
        );
      case "weight":
        return (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              How much will the baby weigh?
            </Text>
            <View className="flex-row gap-4 mt-4">
              <View className="flex-1">
                <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">
                  Pounds
                </Text>
                <TextInput
                  className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
                  placeholder="7"
                  placeholderTextColor="#A49E96"
                  value={weightLbs}
                  onChangeText={setWeightLbs}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">
                  Ounces
                </Text>
                <TextInput
                  className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
                  placeholder="4"
                  placeholderTextColor="#A49E96"
                  value={weightOz}
                  onChangeText={setWeightOz}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        );
      case "length":
        return (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              How long will the baby be?
            </Text>
            <Text className="font-body text-ink-soft text-sm mb-6">
              Length in inches
            </Text>
            <TextInput
              className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
              placeholder="20.5"
              placeholderTextColor="#A49E96"
              value={lengthInches}
              onChangeText={setLengthInches}
              keyboardType="decimal-pad"
            />
          </View>
        );
      case "hair_amount":
        return (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              How much hair?
            </Text>
            <View className="mt-4">
              <ChipSelector options={HAIR_AMOUNTS} selected={hairAmount} onSelect={setHairAmount} />
            </View>
          </View>
        );
      case "hair_color":
        return (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              What hair color?
            </Text>
            <View className="mt-4">
              <ChipSelector options={HAIR_COLORS} selected={hairColor} onSelect={setHairColor} />
            </View>
          </View>
        );
      case "eye_color":
        return (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              What eye color?
            </Text>
            <View className="mt-4">
              <ChipSelector options={EYE_COLORS} selected={eyeColor} onSelect={setEyeColor} />
            </View>
          </View>
        );
      case "name":
        return (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              What will the baby's name be?
            </Text>
            <Text className="font-body text-ink-soft text-sm mb-6">
              Worth 40 points if you get it right!
            </Text>
            <TextInput
              className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
              placeholder="First name"
              placeholderTextColor="#A49E96"
              value={nameGuess}
              onChangeText={setNameGuess}
              autoCapitalize="words"
            />
          </View>
        );
      case "review":
        return (
          <View>
            <Text className="font-display text-3xl text-ink font-extrabold mb-2">
              Review your predictions
            </Text>
            <Text className="font-body text-ink-soft text-sm mb-4">
              By {guestName}
            </Text>
            <View className="bg-white rounded-[20px] border border-border p-5 mb-4">
              {genderGuess && <SummaryRow label="Gender" value={genderGuess} />}
              {birthday && <SummaryRow label="Birthday" value={formatDate(birthday)} />}
              {birthTime && <SummaryRow label="Birth Time" value={formatTime(birthTime)} />}
              {weightLbs && <SummaryRow label="Weight" value={`${weightLbs} lbs ${weightOz || 0} oz`} />}
              {lengthInches && <SummaryRow label="Length" value={`${lengthInches}"`} />}
              {hairAmount && <SummaryRow label="Hair" value={hairAmount} />}
              {hairColor && <SummaryRow label="Hair Color" value={hairColor} />}
              {eyeColor && <SummaryRow label="Eye Color" value={eyeColor} />}
              {nameGuess && <SummaryRow label="Name" value={nameGuess} />}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      <ScrollView className="flex-1 px-6 pt-4">
        {/* Back button */}
        <Pressable onPress={goBack} className="mb-4">
          <Text className="font-body text-blush-deep font-semibold">
            {isFirst ? "Cancel" : "← Back"}
          </Text>
        </Pressable>

        {/* Progress bar */}
        <View className="flex-row gap-1 mb-6">
          {steps.map((_, i) => (
            <View
              key={i}
              className={`flex-1 h-1 rounded-full ${
                i <= currentStepIndex ? (i % 2 === 0 ? "bg-blush" : "bg-sky") : "bg-cream-dark"
              }`}
            />
          ))}
        </View>

        {/* Step counter */}
        <Text className="font-body text-xs text-ink-muted uppercase tracking-wide mb-4">
          Step {currentStepIndex + 1} of {totalSteps}
        </Text>

        {/* Error */}
        {error ? (
          <View className="bg-blush-light rounded-[14px] p-3 mb-4">
            <Text className="font-body text-blush-deep text-center text-sm">{error}</Text>
          </View>
        ) : null}

        {/* Step content */}
        {renderStepContent()}

        {/* Next/Submit button */}
        <Pressable
          onPress={isLast ? handleSubmit : goNext}
          disabled={submitting}
          className="bg-blush rounded-[14px] py-4 items-center mt-6 mb-8"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-body text-white font-bold text-base">
              {isLast ? "Lock It In 🔒" : "Next →"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-border last:border-b-0">
      <Text className="font-body text-sm text-ink-muted">{label}</Text>
      <Text className="font-body text-sm text-ink font-semibold">{value}</Text>
    </View>
  );
}
