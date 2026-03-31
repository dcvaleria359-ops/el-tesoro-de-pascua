import { ReactNode, useMemo, useState } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { ResizeMode, Video } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionButton } from "@/src/components/ActionButton";
import { MediaSource } from "@/src/huntConfig";

type MediaStageProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  mediaSource: MediaSource;
  fallbackImage: MediaSource;
  children: ReactNode;
  autoPlay?: boolean;
  isLooping?: boolean;
  muted?: boolean;
  showPlayButton?: boolean;
};

const toSource = (source: MediaSource) => {
  if (!source) {
    return undefined;
  }

  return typeof source === "string" ? { uri: source } : source;
};

export function MediaStage({
  eyebrow,
  title,
  subtitle,
  mediaSource,
  fallbackImage,
  children,
  autoPlay = true,
  isLooping = false,
  muted = true,
  showPlayButton = false,
}: MediaStageProps) {
  const [useVideo, setUseVideo] = useState(Boolean(mediaSource));
  const [shouldPlay, setShouldPlay] = useState(autoPlay);

  const videoSource = useMemo(() => toSource(mediaSource), [mediaSource]);
  const backgroundSource = useMemo(() => toSource(fallbackImage), [fallbackImage]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <ImageBackground
          resizeMode="cover"
          source={backgroundSource}
          style={styles.media}
        />

        {useVideo && videoSource ? (
          <Video
            isLooping={isLooping}
            isMuted={muted}
            onError={() => setUseVideo(false)}
            resizeMode={ResizeMode.COVER}
            shouldPlay={shouldPlay}
            source={videoSource}
            style={styles.media}
            useNativeControls={false}
          />
        ) : null}

        <View style={styles.scrim} />

        {!videoSource ? (
          <View style={styles.placeholderPill}>
            <Text style={styles.placeholderText}>Vídeo pendiente</Text>
          </View>
        ) : null}

        <View style={styles.content}>
          <View style={styles.headingBlock}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {showPlayButton && videoSource ? (
            <ActionButton
              label="Reproducir"
              onPress={() => setShouldPlay(true)}
              size="regular"
              variant="ghost"
              testID="play-video-button"
            />
          ) : null}

          <View style={styles.children}>{children}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0A1024",
    flex: 1,
  },
  container: {
    backgroundColor: "#0A1024",
    flex: 1,
  },
  media: {
    height: "100%",
    position: "absolute",
    width: "100%",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,16,36,0.42)",
  },
  placeholderPill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: "absolute",
    right: 20,
    top: 20,
  },
  placeholderText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headingBlock: {
    gap: 8,
    marginTop: 10,
  },
  eyebrow: {
    color: "#FFD166",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  subtitle: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 16,
    lineHeight: 24,
  },
  children: {
    gap: 14,
    width: "100%",
  },
});