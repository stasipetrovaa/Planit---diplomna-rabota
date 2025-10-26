import type { PropsWithChildren, ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";

import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";

type Props = PropsWithChildren<{
  headerImage?: ReactElement;
}>;

export default function ParallaxScrollView({ children }: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const bottom = useBottomTabOverflow();

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        <View style={styles.content}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 4,
    gap: 16,
    overflow: "hidden",
  },
});
