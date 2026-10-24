import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  Vibration,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppContext } from "../../providers/SermonProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FloatingButtonProps {
  onPress?: () => void;
}

const POSITION_KEY = "@floatbtn_position";
const { width, height } = Dimensions.get("window");
const IDLE_TIMEOUT = 4000;
const SIZE = 50;
const RADIUS = SIZE / 2;
const INNER = SIZE - 8;
const INNER_RADIUS = INNER / 2;

const DraggableFloatingButton = React.memo(({ onPress }: FloatingButtonProps) => {
  const { theme } = useAppContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dark = theme?.dark;

  const safeAreaBounds = useMemo(
    () => ({
      top: insets.top + 20,
      bottom: height - insets.bottom - SIZE - 20,
      left: 8,
      right: width - SIZE - 8,
    }),
    [insets],
  );

  const pan = useState(() => new Animated.ValueXY({ x: 8, y: height - 140 }))[0];
  const positionRef = useRef({ x: 8, y: height - 140 });
  const scaleAnim = useState(() => new Animated.Value(1))[0];
  const opacityAnim = useState(() => new Animated.Value(1))[0];

  const [isDragging, setIsDragging] = useState(false);
  const hasMoved = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPressAt = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem(POSITION_KEY).then((json) => {
      if (!json) return;
      try {
        const { x, y } = JSON.parse(json);
        pan.setValue({
          x: Math.max(safeAreaBounds.left, Math.min(x, safeAreaBounds.right)),
          y: Math.max(safeAreaBounds.top, Math.min(y, safeAreaBounds.bottom)),
        });
        positionRef.current = {
          x: Math.max(safeAreaBounds.left, Math.min(x, safeAreaBounds.right)),
          y: Math.max(safeAreaBounds.top, Math.min(y, safeAreaBounds.bottom)),
        };
      } catch (_) {}
    });
  }, []);

  const savePosition = useCallback((x: number, y: number) => {
    AsyncStorage.setItem(POSITION_KEY, JSON.stringify({ x, y })).catch(
      () => {},
    );
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: false,
    }).start();
    idleTimer.current = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0.55,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }, IDLE_TIMEOUT);
  }, [opacityAnim]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const triggerPressFeedback = useCallback(() => {
    Vibration.vibrate(Platform.OS === "android" ? 35 : 20);
  }, []);

  const handlePressAction = useCallback(() => {
    const now = Date.now();
    if (now - lastPressAt.current < 250) return;
    lastPressAt.current = now;

    triggerPressFeedback();

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.82,
        duration: 80,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 14,
        stiffness: 380,
        useNativeDriver: false,
      }),
    ]).start();

    if (onPress) {
      onPress();
    } else if (router) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.navigate("/sermons");
      }
    }
  }, [onPress, router, scaleAnim, triggerPressFeedback]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        hasMoved.current = false;
        pan.setOffset(positionRef.current);
        resetIdleTimer();
      },
      onPanResponderMove: (_, gs) => {
        if (Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5) {
          hasMoved.current = true;
          setIsDragging(true);
        }
        pan.x.setValue(gs.dx);
        pan.y.setValue(gs.dy);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();

        if (!hasMoved.current) {
          setIsDragging(false);
          handlePressAction();
        } else {
          setIsDragging(false);
        }

        const newY = Math.max(
          Math.min(positionRef.current.y, safeAreaBounds.bottom),
          safeAreaBounds.top,
        );
        const snapX =
          positionRef.current.x < width / 2 ? safeAreaBounds.left : safeAreaBounds.right;

        Animated.spring(pan, {
          toValue: { x: snapX, y: newY },
          damping: 22,
          stiffness: 280,
          mass: 0.8,
          useNativeDriver: false,
        }).start(() => {
          positionRef.current = { x: snapX, y: newY };
          savePosition(snapX, newY);
        });

        resetIdleTimer();
      },
    }),
  ).current;

  const handlePressIn = useCallback(() => {
    resetIdleTimer();
    Animated.timing(scaleAnim, {
      toValue: 0.88,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [scaleAnim, resetIdleTimer]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 380,
      useNativeDriver: false,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (!isDragging) handlePressAction();
  }, [isDragging, handlePressAction]);

  // Theme-derived colors for sleek floating back button
  const outerBg = dark
    ? "rgba(38, 28, 22, 0.94)"
    : "rgba(252, 246, 237, 0.96)";
  const innerBg = dark
    ? "rgba(55, 41, 32, 0.90)"
    : "rgba(245, 233, 218, 0.92)";
  const innerBorder = dark
    ? "rgba(242, 205, 180, 0.24)"
    : "rgba(93, 50, 17, 0.16)";
  const iconColor = dark ? "#f2cdb4" : "#5d3211";
  const shadowColor = dark ? "#000000" : "#5d3211";

  return (
    <Animated.View
      style={{
        position: "absolute",
        zIndex: 9999,
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
        opacity: opacityAnim,
        shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: dark ? 0.35 : 0.16,
        shadowRadius: 12,
        elevation: 7,
      }}
      {...panResponder.panHandlers}
    >
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        delayPressIn={0}
        delayPressOut={0}
      >
        <Animated.View
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: RADIUS,
            transform: [{ scale: scaleAnim }],
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: outerBg,
            borderWidth: 1.2,
            borderColor: innerBorder,
          }}
        >
          {/* Inner circle — soft concentric ring with glass sheen */}
          <View
            style={{
              width: INNER,
              height: INNER,
              borderRadius: INNER_RADIUS,
              backgroundColor: innerBg,
              borderWidth: 1,
              borderColor: innerBorder,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Undo Arrow Back Icon */}
            <Ionicons
              name="arrow-undo-outline"
              size={20}
              color={iconColor}
              style={{ marginRight: 1 }}
            />
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
});
DraggableFloatingButton.displayName = "DraggableFloatingButton";

export default DraggableFloatingButton;
