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
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();
const redirectTo = makeRedirectUri();

function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;
  if (!access_token) return;
  return supabase.auth.setSession({ access_token, refresh_token });
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState("");

  const url = Linking.useLinkingURL();
  if (url) createSessionFromUrl(url);

  const sendMagicLink = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const res = await WebBrowser.openAuthSessionAsync(
      data?.url ?? "",
      redirectTo
    );
    if (res.type === "success") {
      await createSessionFromUrl(res.url);
    }
    setLoading(false);
  };

  const signInWithApple = async () => {
    if (Platform.OS !== "ios") return;
    setLoading(true);
    setError("");
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const { error, data } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });
        if (error) throw error;
        if (credential.fullName) {
          const parts = [
            credential.fullName.givenName,
            credential.fullName.familyName,
          ].filter(Boolean);
          if (parts.length > 0) {
            await supabase.auth.updateUser({
              data: { full_name: parts.join(" ") },
            });
          }
        }
      }
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        setError(e.message || "Apple sign-in failed");
      }
    }
    setLoading(false);
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
            Sign in to manage your pools
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
          onPress={sendMagicLink}
          disabled={loading}
          className="bg-blush rounded-[14px] py-4 items-center mb-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-body text-white font-bold text-base">
              Send Magic Link ✨
            </Text>
          )}
        </Pressable>

        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-border" />
          <Text className="font-body text-ink-muted text-xs mx-3 uppercase tracking-wide">
            or
          </Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        <Pressable
          onPress={signInWithGoogle}
          disabled={loading}
          className="bg-white border border-border rounded-[14px] py-4 items-center mb-3"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <Text className="font-body text-ink font-semibold text-base">
            Continue with Google
          </Text>
        </Pressable>

        {Platform.OS === "ios" ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={14}
            style={{ width: "100%", height: 52 }}
            onPress={signInWithApple}
          />
        ) : null}

        <View className="items-center mt-8">
          <Link href="/signup">
            <Text className="font-body text-ink-soft text-sm">
              Don't have an account?{" "}
              <Text className="text-blush-deep font-semibold">Sign up</Text>
            </Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
