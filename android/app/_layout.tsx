import {Slot} from "expo-router";
import {SessionProvider} from "@/providers/AuthenticationProvider";

export default function Root() {

  return (
      <SessionProvider>
        <Slot/>
      </SessionProvider>
  );
}
