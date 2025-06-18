import type React from "react";
import { View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";

interface PredictionLineProps {
  path: { x: number; y: number }[];
  tableWidth: number;
  tableHeight: number;
}

const PredictionLine: React.FC<PredictionLineProps> = ({
  path,
  tableWidth,
  tableHeight,
}) => {
  const RAIL_WIDTH = 20;

  if (!path || path.length < 2) {
    return null;
  }

  // Convert path points to SVG coordinates (accounting for rail offset)
  const svgPoints = path
    .map((point) => `${point.x + RAIL_WIDTH},${point.y + RAIL_WIDTH}`)
    .join(" ");

  // Get bounce points (where direction changes significantly)
  const bouncePoints = [];
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    const angleDiff = Math.abs(angle1 - angle2);

    // If angle changes significantly, it's likely a bounce
    if (angleDiff > 0.5) {
      bouncePoints.push(curr);
    }
  }

  return (
    <View style={{ position: "absolute", pointerEvents: "none" }}>
      <Svg
        width={tableWidth + RAIL_WIDTH * 2}
        height={tableHeight + RAIL_WIDTH * 2}
      >
        {/* Prediction line */}
        <Polyline
          points={svgPoints}
          fill="none"
          stroke="#FFD700"
          strokeWidth={2}
          strokeDasharray="5,5"
          opacity={0.8}
        />

        {/* Bounce indicators */}
        {bouncePoints.map((point, index) => (
          <Circle
            key={index}
            cx={point.x + RAIL_WIDTH}
            cy={point.y + RAIL_WIDTH}
            r={3}
            fill="#FF6B6B"
            opacity={0.7}
          />
        ))}

        {/* End point indicator */}
        {path.length > 0 && (
          <Circle
            cx={path[path.length - 1].x + RAIL_WIDTH}
            cy={path[path.length - 1].y + RAIL_WIDTH}
            r={4}
            fill="#4ECDC4"
            opacity={0.8}
          />
        )}
      </Svg>
    </View>
  );
};

export default PredictionLine;
