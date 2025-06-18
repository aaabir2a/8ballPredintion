import type React from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

interface PoolTableProps {
  width: number;
  height: number;
  cueBallPosition: { x: number; y: number };
}

const PoolTable: React.FC<PoolTableProps> = ({
  width,
  height,
  cueBallPosition,
}) => {
  const RAIL_WIDTH = 15; // Reduced from 20
  const BALL_RADIUS = 6; // Slightly smaller ball

  // Total SVG dimensions including rails
  const totalWidth = width + RAIL_WIDTH * 2;
  const totalHeight = height + RAIL_WIDTH * 2;

  return (
    <View
      style={{
        position: "absolute",
        // Center the table
        left: -RAIL_WIDTH,
        top: -RAIL_WIDTH,
      }}
    >
      <Svg width={totalWidth} height={totalHeight}>
        <Defs>
          <LinearGradient
            id="tableGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor="#0f5132" />
            <Stop offset="100%" stopColor="#198754" />
          </LinearGradient>
          <LinearGradient id="railGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B4513" />
            <Stop offset="100%" stopColor="#A0522D" />
          </LinearGradient>
        </Defs>

        {/* Table Rails */}
        <Rect
          x={0}
          y={0}
          width={totalWidth}
          height={totalHeight}
          fill="url(#railGradient)"
          rx={10}
        />

        {/* Playing Surface */}
        <Rect
          x={RAIL_WIDTH}
          y={RAIL_WIDTH}
          width={width}
          height={height}
          fill="url(#tableGradient)"
          stroke="#0a3d20"
          strokeWidth={2}
        />

        {/* Corner Pockets - smaller */}
        <Circle cx={RAIL_WIDTH} cy={RAIL_WIDTH} r={8} fill="#000" />
        <Circle cx={width + RAIL_WIDTH} cy={RAIL_WIDTH} r={8} fill="#000" />
        <Circle cx={RAIL_WIDTH} cy={height + RAIL_WIDTH} r={8} fill="#000" />
        <Circle
          cx={width + RAIL_WIDTH}
          cy={height + RAIL_WIDTH}
          r={8}
          fill="#000"
        />

        {/* Side Pockets - smaller */}
        <Circle cx={width / 2 + RAIL_WIDTH} cy={RAIL_WIDTH} r={6} fill="#000" />
        <Circle
          cx={width / 2 + RAIL_WIDTH}
          cy={height + RAIL_WIDTH}
          r={6}
          fill="#000"
        />

        {/* Cue Ball */}
        <Circle
          cx={cueBallPosition.x + RAIL_WIDTH}
          cy={cueBallPosition.y + RAIL_WIDTH}
          r={BALL_RADIUS}
          fill="#ffffff"
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
};

export default PoolTable;
