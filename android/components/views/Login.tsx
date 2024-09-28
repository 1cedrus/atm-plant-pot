import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ToastAndroid,
} from "react-native";
import { useSession } from "@/providers/AuthenticationProvider";
import { router } from "expo-router";

export default function Login() {
  const [pin, setPin] = useState("");
  const { signIn } = useSession();

  const handleLogin = () => {
    if (!pin) return;

    // Simulate login action
    if (pin === "2911") {
      signIn();
      router.replace("/");
      ToastAndroid.showWithGravity(
        "Login successful",
        ToastAndroid.SHORT,
        ToastAndroid.TOP,
      );
    } else {
      ToastAndroid.showWithGravity(
        "Wrong PIN!",
        ToastAndroid.SHORT,
        ToastAndroid.TOP,
      );

      setPin("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌺 Plant Watering</Text>
      <Text style={styles.description}>Enter you pin to continue</Text>

      <TextInput
        style={styles.input}
        secureTextEntry={true}
        placeholder="PIN"
        maxLength={4}
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        autoCapitalize="none"
      />

      <Button color="#000" title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  description: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    textAlign: "center",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
