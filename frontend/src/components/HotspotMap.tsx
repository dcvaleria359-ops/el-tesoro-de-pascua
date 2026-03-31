import { useRef, useState } from "react";
import {
  ImageBackground,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ZoneConfig } from "@/src/huntConfig";

type DraftHotspot = {
  id: string;
  x: number;
  y: number;
};

type HotspotMapProps = {
  zone: ZoneConfig;
  foundHotspots: string[];
  previewHotspots: DraftHotspot[];
  isEditMode: boolean;
  onHotspotPress: (hotspotId: string) => void;
  onMapTap: (x: number, y: number) => void;
};

const toSource = (source: string | number | null) =>
  !source ? undefined : typeof source === "string" ? { uri: source } : source;

export function HotspotMap({
  zone,
  foundHotspots,
  previewHotspots,
  isEditMode,
  onHotspotPress,
  onMapTap,
}: HotspotMapProps) {
  const [layout, setLayout] = useState({ width: 1, height: 1 });
  const ignoreNextTapRef = useRef(false);

  const handleLayout = (event: LayoutChangeEvent) => {
    setLayout(event.nativeEvent.layout);
  };

  return (
    <Pressable
      onLayout={handleLayout}
      onPress={({ nativeEvent }) => {
        if (!isEditMode) {
          return;
        }

        if (ignoreNextTapRef.current) {
          ignoreNextTapRef.current = false;
          return;
        }

        const x = Number(((nativeEvent.locationX / layout.width) * 100).toFixed(1));
        const y = Number(((nativeEvent.locationY / layout.height) * 100).toFixed(1));
        onMapTap(x, y);
      }}
      style={styles.wrapper}
      testID={`zone-map-${zone.id}`}
    >
      <ImageBackground
        resizeMode={zone.mapResizeMode ?? "cover"}
        source={toSource(zone.mapImage)}
        style={styles.map}
      >
        <View style={styles.overlay} />

        {zone.hotspots.map((hotspot) => {
          const isFound = foundHotspots.includes(hotspot.id);

          return (
            <Pressable
              disabled={isFound}
              key={hotspot.id}
              onPress={() => onHotspotPress(hotspot.id)}
              onPressIn={() => {
                ignoreNextTapRef.current = true;
              }}
              style={[
                styles.hotspot,
                {
                  backgroundColor: isFound ? "#06D6A0" : zone.accentColor,
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                },
              ]}
              testID={`hotspot-${zone.id}-${hotspot.id}`}
            >
              <Ionicons
                color="#FFFFFF"
                name={isFound ? "star" : "star-outline"}
                size={24}
              />
            </Pressable>
          );
        })}

        {previewHotspots.map((hotspot) => (
          <View
            key={hotspot.id}
            style={[
              styles.previewHotspot,
              { left: `${hotspot.x}%`, top: `${hotspot.y}%` },
            ]}
          >
            <Ionicons color="#FFD166" name="sparkles" size={20} />
          </View>
        ))}

        <View style={styles.labelCard}>
          <Text style={styles.labelText}>{zone.subtitle}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 32,
    flex: 1,
    overflow: "hidden",
    width: "100%",
  },
  map: {
    backgroundColor: "#0A1024",
    flex: 1,
    justifyContent: "space-between",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 16, 36, 0.16)",
  },
  hotspot: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 999,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    marginLeft: -26,
    marginTop: -26,
    position: "absolute",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    width: 52,
  },
  previewHotspot: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    marginLeft: -19,
    marginTop: -19,
    position: "absolute",
    width: 38,
  },
  labelCard: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    marginBottom: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  labelText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});