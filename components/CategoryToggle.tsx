import { View, Text, Pressable } from "react-native";
import { CategoryKey } from "@/lib/types";
import { CATEGORY_META } from "@/lib/constants";

type Props = {
  category: CategoryKey;
  enabled: boolean;
  onToggle: (category: CategoryKey) => void;
};

export function CategoryToggle({ category, enabled, onToggle }: Props) {
  const meta = CATEGORY_META[category];

  return (
    <Pressable
      onPress={() => onToggle(category)}
      className={`flex-row items-center justify-between p-4 bg-white border border-border rounded-[16px] mb-2.5 ${
        !enabled ? "opacity-50" : ""
      }`}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <Text className="text-xl w-9 text-center">{meta.emoji}</Text>
        <View className="flex-1">
          <Text className="font-body text-sm font-semibold text-ink">
            {meta.label}
          </Text>
          <Text className="font-body text-xs text-ink-muted">
            {meta.description}
          </Text>
        </View>
      </View>
      <View
        className={`w-12 h-7 rounded-[14px] justify-center ${
          enabled ? "bg-blush" : "bg-cream-dark"
        }`}
      >
        <View
          className={`w-6 h-6 bg-white rounded-full shadow-sm ${
            enabled ? "ml-5" : "ml-0.5"
          }`}
        />
      </View>
    </Pressable>
  );
}
