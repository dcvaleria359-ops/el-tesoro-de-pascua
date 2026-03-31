import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { Hotspot, ZoneConfig } from "@/src/huntConfig";

type HotspotMapProps = {
  zone: ZoneConfig;
  hotspots: Hotspot[];
  foundHotspots: string[];
  isEditMode: boolean;
  deleteMode: boolean;
  burstingHotspotId: string | null;
  onHotspotPress: (hotspotId: string) => void;
  onMapTap: (x: number, y: number) => void;
  onMapBoundsChange: (bounds: {
    left: number;
    top: number;
    width: number;
    height: number;
  }) => void;
  onHotspotMoveEnd: (hotspotId: string, x: number, y: number) => void;
  onHotspotDeleteRequest: (hotspotId: string) => void;
  onHotspotSelect: (hotspotId: string) => void;
};

const toSource = (source: string | number | null) =>
  !source ? undefined : typeof source === "string" ? { uri: source } : source;

const HOTSPOT_TOUCH_SIZE = 68;
const HOTSPOT_VISUAL_SIZE = 46;
const SPARK_OFFSETS = [
  { x: -12, y: -12 },
  { x: 12, y: -12 },
  { x: -12, y: 12 },
  { x: 12, y: 12 },
];

const clampPercent = (value: number) =>
  Number(Math.min(100, Math.max(0, value)).toFixed(1));

type MapHotspotProps = {
  hotspot: Hotspot;
  isFound: boolean;
  isEditMode: boolean;
  deleteMode: boolean;
  accentColor: string;
  layout: { width: number; height: number };
  isBursting: boolean;
  onTouchStart: () => void;
  onSelect: (hotspotId: string) => void;
  onPress: (hotspotId: string) => void;
  onMoveEnd: (hotspotId: string, x: number, y: number) => void;
  onDeleteRequest: (hotspotId: string) => void;
};

function MapHotspot({
  hotspot,
  isFound,
  isEditMode,
  deleteMode,
  accentColor,
  layout,
  isBursting,
  onTouchStart,
  onSelect,
  onPress,
  onMoveEnd,
  onDeleteRequest,
}: MapHotspotProps) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const spark = useRef(new Animated.Value(0)).current;
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isBursting) {
      return;
    }

    scale.setValue(1);
    spark.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, {
          duration: 140,
          toValue: 1.45,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          friction: 5,
          tension: 120,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(spark, {
          duration: 160,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(spark, {
          duration: 220,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [isBursting, scale, spark]);

  const clearDeleteTimer = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          isEditMode &&
          (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2),
        onPanResponderGrant: () => {
          if (!isEditMode) {
            return;
          }

          onTouchStart();
          onSelect(hotspot.id);
          deleteTriggeredRef.current = false;

          if (deleteMode) {
            deleteTimerRef.current = setTimeout(() => {
              deleteTriggeredRef.current = true;
              onDeleteRequest(hotspot.id);
            }, 500);
          }
        },
        onPanResponderMove: (_, gestureState) => {
          if (!isEditMode || deleteTriggeredRef.current) {
            return;
          }

          if (Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4) {
            clearDeleteTimer();
          }

          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        },
        onPanResponderRelease: (_, gestureState) => {
          clearDeleteTimer();

          if (!isEditMode || deleteTriggeredRef.current) {
            pan.setValue({ x: 0, y: 0 });
            return;
          }

          if (Math.abs(gestureState.dx) < 2 && Math.abs(gestureState.dy) < 2) {
            pan.setValue({ x: 0, y: 0 });
            return;
          }

          const nextX = clampPercent(
            hotspot.x + (gestureState.dx / Math.max(layout.width, 1)) * 100,
          );
          const nextY = clampPercent(
            hotspot.y + (gestureState.dy / Math.max(layout.height, 1)) * 100,
          );

          pan.setValue({ x: 0, y: 0 });
          onMoveEnd(hotspot.id, nextX, nextY);
        },
        onPanResponderTerminate: () => {
          clearDeleteTimer();
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderTerminationRequest: () => true,
        onStartShouldSetPanResponder: () => isEditMode,
      }),
    [
      accentColor,
      deleteMode,
      hotspot.id,
      hotspot.x,
      hotspot.y,
      isEditMode,
      layout.height,
      layout.width,
      onDeleteRequest,
      onMoveEnd,
      onTouchStart,
      pan,
    ],
  );

  const sparkOpacity = spark.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const renderIcon = () => {
    if (isFound) {
      return (
        <MaterialCommunityIcons color="#FFF5CC" name="egg-easter" size={38} />
      );
    }

    return <Ionicons color="#FF7A00" name="flame" size={40} />;
  };

  const visualShellStyle = {
    backgroundColor: isFound ? "rgba(255,255,255,0.16)" : "rgba(8,12,28,0.08)",
    borderColor: isFound ? "rgba(255,245,204,0.5)" : "rgba(255,122,0,0.32)",
  };

  if (isEditMode) {
    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.hotspotTouchArea,
          {
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
      >
        {SPARK_OFFSETS.map((offset, index) => (
          <Animated.View
            key={`${hotspot.id}-spark-${index}`}
            style={[
              styles.spark,
              {
                opacity: sparkOpacity,
                transform: [
                  { translateX: offset.x },
                  { translateY: offset.y },
                  { scale: spark },
                ],
              },
            ]}
          />
        ))}

        <Animated.View
          style={[
            styles.hotspotVisual,
            visualShellStyle,
            { transform: [{ scale }] },
          ]}
        >
          {renderIcon()}
        </Animated.View>
        <View style={styles.idLabel}>
          <Text style={styles.idLabelText}>{hotspot.id}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Pressable
      disabled={isFound}
      hitSlop={18}
      onPress={() => onPress(hotspot.id)}
      onPressIn={() => {
        onTouchStart();
        onSelect(hotspot.id);
      }}
      style={[
        styles.hotspotTouchArea,
        {
          left: `${hotspot.x}%`,
          top: `${hotspot.y}%`,
        },
      ]}
      testID={`hotspot-${hotspot.id}`}
    >
      {SPARK_OFFSETS.map((offset, index) => (
        <Animated.View
          key={`${hotspot.id}-spark-${index}`}
          style={[
            styles.spark,
            {
              opacity: sparkOpacity,
              transform: [
                { translateX: offset.x },
                { translateY: offset.y },
                { scale: spark },
              ],
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.hotspotVisual,
          visualShellStyle,
          {
            opacity: isFound ? 1 : 0.78,
            transform: [{ scale }],
          },
        ]}
      >
        {renderIcon()}
      </Animated.View>
    </Pressable>
  );
}

export function HotspotMap({
  zone,
  hotspots,
  foundHotspots,
  isEditMode,
  deleteMode,
  burstingHotspotId,
  onHotspotPress,
  onMapTap,
  onMapBoundsChange,
  onHotspotMoveEnd,
  onHotspotDeleteRequest,
  onHotspotSelect,
}: HotspotMapProps) {
  const [layout, setLayout] = useState({ width: 1, height: 1 });
  const ignoreNextTapRef = useRef(false);

  const mapBounds = useMemo(() => {
    if (
      zone.mapResizeMode !== "contain" ||
      !zone.mapAspectRatio ||
      layout.width <= 0 ||
      layout.height <= 0
    ) {
      return { height: layout.height, left: 0, top: 0, width: layout.width };
    }

    const containerRatio = layout.width / layout.height;

    if (containerRatio > zone.mapAspectRatio) {
      const height = layout.height;
      const width = height * zone.mapAspectRatio;
      return {
        height,
        left: (layout.width - width) / 2,
        top: 0,
        width,
      };
    }

    const width = layout.width;
    const height = width / zone.mapAspectRatio;
    return {
      height,
      left: 0,
      top: (layout.height - height) / 2,
      width,
    };
  }, [layout.height, layout.width, zone.mapAspectRatio, zone.mapResizeMode]);

  useEffect(() => {
    onMapBoundsChange(mapBounds);
  }, [mapBounds, onMapBoundsChange]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  return (
    <View style={styles.outerWrapper}>
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

          const x = clampPercent(
            ((nativeEvent.locationX - mapBounds.left) /
              Math.max(mapBounds.width, 1)) *
              100,
          );
