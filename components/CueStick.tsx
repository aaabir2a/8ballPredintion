import type React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Circle, G, Line } from "react-native-svg";

interface CueStickProps {
  cueBallPosition: { x: number; y: number };
  onShotChange: (params: { force: number; angle: number }) => void;
  tableWidth: number;
  tableHeight: number;
}

const CueStick: React.FC<CueStickProps> = ({
  cueBallPosition,
  onShotChange,
  tableWidth,
  tableHeight,
}) => {
  // Gesture tracking
  const gestureX = useSharedValue(0);
  const gestureY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Cue stick properties
  const cueAngle = useSharedValue(0);
  const cuePullDistance = useSharedValue(0);
  const cueForce = useSharedValue(0);

  // Configuration
  const RAIL_WIDTH = 20;
  const CUE_LENGTH = 180;
  const CUE_WIDTH = 8;
  const MAX_PULL_DISTANCE = 120;
  const MIN_PULL_DISTANCE = 20;
  const BALL_RADIUS = 8;
  const CUE_OFFSET = BALL_RADIUS + 5; // Distance from ball to cue tip

  const calculateCueMetrics = (touchX: number, touchY: number) => {
    const ballCenterX = cueBallPosition.x + RAIL_WIDTH;
    const ballCenterY = cueBallPosition.y + RAIL_WIDTH;

    // Calculate angle from ball to touch point
    const deltaX = touchX - ballCenterX;
    const deltaY = touchY - ballCenterY;
    const angleRad = Math.atan2(deltaY, deltaX);
    const angleDeg = (angleRad * 180) / Math.PI;

    // Calculate distance from ball to touch point
    const touchDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Calculate pull distance (how far back the cue is pulled)
    const pullDistance = Math.max(
      0,
      Math.min(touchDistance - MIN_PULL_DISTANCE, MAX_PULL_DISTANCE)
    );

    // Calculate force as percentage (0-100)
    const forcePercentage = (pullDistance / MAX_PULL_DISTANCE) * 100;

    return {
      angle: angleDeg,
      angleRad,
      pullDistance,
      force: forcePercentage,
      touchDistance,
    };
  };

  const updateCueStick = (x: number, y: number) => {
    const metrics = calculateCueMetrics(x, y);

    // Update shared values for animations
    cueAngle.value = metrics.angleRad;
    cuePullDistance.value = metrics.pullDistance;
    cueForce.value = metrics.force;

    // Call callback with current values
    onShotChange({
      force: metrics.force,
      angle: metrics.angle,
    });
  };

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      isDragging.value = true;
      gestureX.value = event.x;
      gestureY.value = event.y;
      runOnJS(updateCueStick)(event.x, event.y);
    })
    .onUpdate((event) => {
      gestureX.value = event.x;
      gestureY.value = event.y;
      runOnJS(updateCueStick)(event.x, event.y);
    })
    .onEnd(() => {
      isDragging.value = false;

      // Animate cue stick back to resting position
      cuePullDistance.value = withSpring(0);
      cueForce.value = withSpring(0);

      // Reset callback
      runOnJS(onShotChange)({ force: 0, angle: 0 });
    });

  // Animated style for the entire cue stick container
  const cueContainerStyle = useAnimatedStyle(() => {
    const ballCenterX = cueBallPosition.x + RAIL_WIDTH;
    const ballCenterY = cueBallPosition.y + RAIL_WIDTH;

    return {
      opacity: isDragging.value ? 1 : 0,
      transform: [
        { translateX: ballCenterX },
        { translateY: ballCenterY },
        { rotate: `${cueAngle.value}rad` },
        { translateX: -ballCenterX },
        { translateY: -ballCenterY },
      ],
    };
  });

  // Animated style for cue stick position (pull back effect)
  const cueStickStyle = useAnimatedStyle(() => {
    const pullOffset = interpolate(
      cuePullDistance.value,
      [0, MAX_PULL_DISTANCE],
      [0, MAX_PULL_DISTANCE]
    );

    return {
      transform: [
        { translateX: -pullOffset }, // Pull back along X axis (will be rotated)
      ],
    };
  });

  // Force indicator style
  const forceIndicatorStyle = useAnimatedStyle(() => {
    const scale = interpolate(cueForce.value, [0, 100], [0.5, 1.5]);

    const opacity = interpolate(cueForce.value, [0, 100], [0.3, 1]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const CueStickVisual = () => {
    const ballCenterX = cueBallPosition.x + RAIL_WIDTH;
    const ballCenterY = cueBallPosition.y + RAIL_WIDTH;

    // Cue stick start position (offset from ball)
    const cueStartX = ballCenterX + CUE_OFFSET;
    const cueEndX = ballCenterX + CUE_OFFSET + CUE_LENGTH;

    return (
      <Animated.View style={[{ position: "absolute" }, cueContainerStyle]}>
        <Svg
          width={tableWidth + RAIL_WIDTH * 2}
          height={tableHeight + RAIL_WIDTH * 2}
          style={{ position: "absolute" }}
        >
          <G>
            {/* Cue stick shaft */}
            <Animated.View style={cueStickStyle}>
              <Line
                x1={cueStartX}
                y1={ballCenterY}
                x2={cueEndX}
                y2={ballCenterY}
                stroke="#D2691E"
                strokeWidth={CUE_WIDTH}
                strokeLinecap="round"
              />

              {/* Cue tip */}
              <Circle
                cx={cueStartX}
                cy={ballCenterY}
                r={CUE_WIDTH / 2 + 1}
                fill="#8B4513"
              />

              {/* Cue handle */}
              <Circle
                cx={cueEndX}
                cy={ballCenterY}
                r={CUE_WIDTH / 2 + 2}
                fill="#654321"
              />
            </Animated.View>
          </G>
        </Svg>

        {/* Force indicator ring around cue ball */}
        <Animated.View style={[{ position: "absolute" }, forceIndicatorStyle]}>
          <Svg
            width={tableWidth + RAIL_WIDTH * 2}
            height={tableHeight + RAIL_WIDTH * 2}
            style={{ position: "absolute" }}
          >
            <Circle
              cx={ballCenterX}
              cy={ballCenterY}
              r={BALL_RADIUS + 8}
              fill="none"
              stroke="#FFD700"
              strokeWidth={2}
              strokeDasharray="4,4"
              opacity={0.7}
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View style={{ position: "absolute" }}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={{
            width: tableWidth + RAIL_WIDTH * 2,
            height: tableHeight + RAIL_WIDTH * 2,
            backgroundColor: "transparent",
          }}
        >
          <CueStickVisual />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default CueStick;
