import { View, Text, Pressable } from "react-native";

type Props = {
  options: readonly string[];
  selected: string | null;
  onSelect: (value: string) => void;
};

export function ChipSelector({ options, selected, onSelect }: Props) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => onSelect(option)}
          className={`px-5 py-2.5 rounded-full border ${
            selected === option
              ? "bg-blush-light border-blush"
              : "bg-white border-border"
          }`}
        >
          <Text
            className={`font-body text-sm font-semibold ${
              selected === option ? "text-blush-deep" : "text-ink-soft"
            }`}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
