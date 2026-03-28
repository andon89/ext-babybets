import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState("");

  const signUp = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        data: { full_name: name.trim() },
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
  };

  if (magicLinkSent) {
    return (
      <View className="flex-1 bg-cream justify-center items-center px-6">
        <Text className="font-display text-3xl text-ink text-center mb-3">
          Check your email
        </Text>
        <Text className="font-body text-ink-soft text-center text-base mb-8">
          We sent a sign-in link to {email}
        </Text>
        <Pressable onPress={() => setMagicLinkSent(false)}>
          <Text className="font-body text-blush-deep font-semibold">
            Use a different email
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-cream"
    >
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-10">
          <Text className="text-5xl mb-2">👶</Text>
          <Text className="font-display text-4xl text-ink font-extrabold">
            Baby Bets
          </Text>
          <Text className="font-body text-ink-soft text-base mt-1">
            Create an account to start your pool
          </Text>
        </View>

        {error ? (
          <View className="bg-blush-light rounded-[14px] p-3 mb-4">
            <Text className="font-body text-blush-deep text-center text-sm">
              {error}
            </Text>
          </View>
        ) : null}

        <View className="mb-4">
          <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">
            Your name
          </Text>
          <TextInput
            className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
            placeholder="Sarah & Andrew"
            placeholderTextColor="#A49E96"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
          />
        </View>

        <View className="mb-4">
          <Text className="font-body text-xs font-bold uppercase tracking-wide text-ink-muted mb-1.5">
            Email
          </Text>
          <TextInput
            className="bg-white border border-border rounded-[14px] px-4 py-3.5 font-body text-base text-ink"
            placeholder="you@example.com"
            placeholderTextColor="#A49E96"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <Pressable
          onPress={signUp}
          disabled={loading}
          className="bg-blush rounded-[14px] py-4 items-center mb-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-body text-white font-bold text-base">
              Create Account ✨
            </Text>
          )}
        </Pressable>

        <View className="items-center mt-8">
          <Link href="/login">
            <Text className="font-body text-ink-soft text-sm">
              Already have an account?{" "}
              <Text className="text-blush-deep font-semibold">Sign in</Text>
            </Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
