import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { useSession } from "@/providers/AuthenticationProvider";
import { Redirect } from "expo-router";
import { StyleSheet, Text, View, StatusBar, Platform } from "react-native";
import {
  DrawerContentComponentProps,
  DrawerItemList,
} from "@react-navigation/drawer";
import { BackdropProvider } from "@/components/Backdrop";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateExpoPushToken } from "@/apis";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

export default function AppLayout() {
  const { isLoading, session } = useSession();
  const [expoPushToken, setExpoPushToken] = useState("");
  const [_notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const updateExpoPushTokenMutation = useMutation({
    mutationFn: (token: string) => updateExpoPushToken(token),
    onSuccess: () => console.log("Successfully set expo push token"),
    onError: (error) => console.error("Failed to set expo push token", error),
  });

  useEffect(() => {
    if (!expoPushToken) return;

    updateExpoPushTokenMutation.mutate(expoPushToken);
  }, [expoPushToken]);

  useEffect(() => {
    if (!isLoading) return;

    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [isLoading]);

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
