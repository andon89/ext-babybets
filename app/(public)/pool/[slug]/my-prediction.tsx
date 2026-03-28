import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { getPredictionByCode } from "@/lib/prediction-service";
import { formatDate, formatTime } from "@/lib/constants";
import { Prediction } from "@/lib/types";

export default function MyPredictionScreen() {
  const { slug, code } = useLocalSearchParams<{ slug: string; code: string }>();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      return;
    }
    getPredictionByCode(code).then((p) => {
      setPrediction(p);
      setLoading(false);
    });
  }, [code]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator color="#E8A0B4" />
      </SafeAreaView>
    );
  }

  if (!prediction) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-6">
        <Text className="text-5xl mb-4">🤷</Text>
        <Text className="font-display text-2xl text-ink font-bold text-center mb-2">
          Prediction not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" contentContainerClassName="items-center px-6 py-8">
        <Text className="text-5xl mb-3">🔮</Text>
        <Text className="font-display text-3xl text-ink font-extrabold text-center mb-1">
          {prediction.guest_name}'s Prediction
        </Text>
        <Text className="font-body text-ink-muted text-xs mb-6">
          Code: {prediction.short_code}
        </Text>

        <View className="bg-white rounded-[20px] border border-border p-5 w-full max-w-[360px]">
          {prediction.gender_guess && <Row label="Gender" value={prediction.gender_guess} />}
          {prediction.birthday && <Row label="Birthday" value={formatDate(prediction.birthday)} />}
          {prediction.birth_time && <Row label="Birth Time" value={formatTime(prediction.birth_time)} />}
          {prediction.weight_lbs != null && (
            <Row label="Weight" value={`${prediction.weight_lbs} lbs ${prediction.weight_oz ?? 0} oz`} />
          )}
          {prediction.length_inches != null && <Row label="Length" value={`${prediction.length_inches}"`} />}
          {prediction.hair_amount && <Row label="Hair Amount" value={prediction.hair_amount} />}
          {prediction.hair_color && <Row label="Hair Color" value={prediction.hair_color} />}
          {prediction.eye_color && <Row label="Eye Color" value={prediction.eye_color} />}
          {prediction.name_guess && <Row label="Name" value={prediction.name_guess} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2.5 border-b border-border">
      <Text className="font-body text-sm text-ink-muted">{label}</Text>
      <Text className="font-body text-sm text-ink font-semibold">{value}</Text>
    </View>
  );
}
