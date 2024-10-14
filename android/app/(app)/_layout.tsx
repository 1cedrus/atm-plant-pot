import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { useSession } from "@/providers/AuthenticationProvider";
import { Redirect } from "expo-router";
import { StyleSheet, Text, View, StatusBar } from "react-native";
import {
  DrawerContentComponentProps,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Backdrop, BackdropProvider } from "@/components/Backdrop";

export default function AppLayout() {
  const { isLoading, session } = useSession();

  if (isLoading) {
    // TODO! Add progress here!
    return null;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <BackdropProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerTitleStyle: { fontSize: 24, fontWeight: "bold" },
            drawerActiveTintColor: "white", // Active tab text color
            drawerInactiveTintColor: "gray", // Inactive tab text color
            drawerActiveBackgroundColor: "#333", // Active tab background color
            drawerLabelStyle: {
              fontSize: 16, // Customize text size if needed
            },
          }}
        >
          <Drawer.Screen
            name="index" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: "Dashboard 💻",
              title: "Dashboard 💻",
            }}
          />
          <Drawer.Screen
            name="watering-mode" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: "Watering mode 💦",
              title: "Watering mode 💦",
            }}
          />
          <Drawer.Screen
            name="led-controller" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: "LED Controller 🌈",
              title: "LED Controller 🌈",
            }}
          />
          <Drawer.Screen
            name="settings" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: "Settings ⚙️",
              title: "Settings ⚙️",
            }}
          />
        </Drawer>
        <StatusBar barStyle="dark-content" />
      </GestureHandlerRootView>
    </BackdropProvider>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <View style={{ flex: 1 }}>
      {/* Render default drawer items */}
      <Text style={styles.title}>🌺 Plant Watering</Text>
      <DrawerItemList {...props} />
      {/* Optionally, you can add other custom buttons here */}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: StatusBar.currentHeight,
    padding: 20,
    fontSize: 24,
    fontWeight: "bold",
  },
});
