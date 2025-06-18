"use client";

import { useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CueStick from "../../components/CueStick";
import PoolTable from "../../components/PoolTable";
import PredictionLine from "../../components/PredictionLine";
import { getPredictedPath } from "../../utils/BallPhysics";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Much more conservative calculations for table sizing
const MARGIN = 20; // Reduced margin
const RAIL_WIDTH = 15; // Reduced rail width
const SAFE_AREA_TOP = 100; // Space for status bar and navigation
const SAFE_AREA_BOTTOM = 100; // Space for tab bar
const DEBUG_HEIGHT = 80; // Space for debug info

// Calculate truly available space
const availableWidth = screenWidth - MARGIN * 2;
const availableHeight =
  screenHeight - SAFE_AREA_TOP - SAFE_AREA_BOTTOM - DEBUG_HEIGHT;

// Start with smaller base dimensions
const maxTableWidth = Math.min(availableWidth - RAIL_WIDTH * 2, 350);
const maxTableHeight = Math.min(availableHeight - RAIL_WIDTH * 2, 200);

// Use 2:1 ratio but ensure it fits
let TABLE_WIDTH = maxTableWidth;
let TABLE_HEIGHT = maxTableWidth / 2;

// If height is too big, scale down
if (TABLE_HEIGHT > maxTableHeight) {
  TABLE_HEIGHT = maxTableHeight;
  TABLE_WIDTH = TABLE_HEIGHT * 2;
}

// Final safety check - ensure minimum but reasonable size
TABLE_WIDTH = Math.max(Math.min(TABLE_WIDTH, 320), 280);
TABLE_HEIGHT = Math.max(Math.min(TABLE_HEIGHT, 160), 140);

console.log(`Screen: ${screenWidth}x${screenHeight}`);
console.log(`Table: ${TABLE_WIDTH}x${TABLE_HEIGHT}`);
console.log(
  `Total with rails: ${TABLE_WIDTH + RAIL_WIDTH * 2}x${
    TABLE_HEIGHT + RAIL_WIDTH * 2
  }`
);

const CUE_BALL_POSITION = { x: TABLE_WIDTH * 0.25, y: TABLE_HEIGHT * 0.5 };

export default function HomeScreen() {
  const [shotData, setShotData] = useState({ force: 0, angle: 0 });
  const [predictionPath, setPredictionPath] = useState<
    { x: number; y: number }[]
  >([]);

  const handleShotChange = ({
    force,
    angle,
  }: {
    force: number;
    angle: number;
  }) => {
    setShotData({ force, angle });

    if (force > 5) {
      // Use the new BallPhysics utility
      const trajectory = getPredictedPath({
        x: CUE_BALL_POSITION.x,
        y: CUE_BALL_POSITION.y,
        angleInDegrees: angle,
        force,
        tableWidth: TABLE_WIDTH,
        tableHeight: TABLE_HEIGHT,
        maxBounces: 8,
      });
      setPredictionPath(trajectory);
    } else {
      setPredictionPath([]);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.gameArea}>
        <PoolTable
          width={TABLE_WIDTH}
          height={TABLE_HEIGHT}
          cueBallPosition={CUE_BALL_POSITION}
        />
        <PredictionLine
          path={predictionPath}
          tableWidth={TABLE_WIDTH}
          tableHeight={TABLE_HEIGHT}
        />
        <CueStick
          cueBallPosition={CUE_BALL_POSITION}
          onShotChange={handleShotChange}
          tableWidth={TABLE_WIDTH}
          tableHeight={TABLE_HEIGHT}
        />
      </View>

      {/* Debug info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Force: {shotData.force.toFixed(1)}% | Angle:{" "}
          {shotData.angle.toFixed(1)}°
        </Text>
        <Text style={styles.debugText}>
          Path Points: {predictionPath.length}
        </Text>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  gameArea: {
    position: "relative",
  },
  debugInfo: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});
