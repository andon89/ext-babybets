import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function AuthLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFF9F2",
          borderTopColor: "#E8E2DA",
        },
        tabBarActiveTintColor: "#D4708A",
        tabBarInactiveTintColor: "#A49E96",
        tabBarLabelStyle: {
          fontFamily: "PlusJakartaSans",
          fontWeight: "600",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Pools",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👶</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
