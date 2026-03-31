import { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

type CelebrationOverlayProps = {
  visible: boolean;
};

const COLORS = ["#FFD166", "#EF476F", "#43B0F1", "#06D6A0", "#FFFFFF"];

export function CelebrationOverlay({ visible }: CelebrationOverlayProps) {
  const windowHeight = Dimensions.get("window").height;

  const pieces = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => ({
        color: COLORS[index % COLORS.length],
        delay: index * 130,
        left: `${8 + index * 6.2}%` as `${number}%`,
        size: index % 3 === 0 ? 16 : 12,
      })),
    [],
  );

  const animations = useRef(
    pieces.map(() => ({
      fall: new Animated.Value(-40),
      spin: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    const loops = animations.map((animation, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(pieces[index].delay),
          Animated.parallel([
            Animated.timing(animation.fall, {
              duration: 2600,
              toValue: windowHeight + 80,
              useNativeDriver: true,
            }),
            Animated.timing(animation.spin, {
              duration: 2600,
              toValue: 1,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ),
    );

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
      animations.forEach((animation) => {
        animation.fall.setValue(-40);
        animation.spin.setValue(0);
      });
    };
  }, [animations, pieces, visible, windowHeight]);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece, index) => {
        const rotate = animations[index].spin.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "280deg"],
        });

        return (
          <Animated.View
            key={`${piece.left}-${piece.delay}`}
            style={[
              styles.piece,
              {
                backgroundColor: piece.color,
                height: piece.size,
                left: piece.left,
                width: piece.size,
                transform: [
                  { translateY: animations[index].fall },
                  { rotate },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    borderRadius: 4,
    position: "absolute",
    top: 0,
  },
});