"use client";

import { useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CueStick from "../../components/CueStick";
import PoolTable from "../../components/PoolTable";
import PredictionLine from "../../components/PredictionLine";
import { getBouncePoints, getPredictedPath } from "../../utils/BallPhysics";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Calculate table dimensions with proper margins and aspect ratio
const MARGIN = 40; // Margin from screen edges
const RAIL_WIDTH = 20; // Rail width that will be added to table dimensions

// Standard pool table ratio is 2:1 (length:width)
const availableWidth = screenWidth - MARGIN * 2 - RAIL_WIDTH * 2;
const availableHeight = screenHeight - MARGIN * 4 - RAIL_WIDTH * 2 - 100; // Extra space for status bar and tabs

// Calculate table size maintaining 2:1 ratio
let TABLE_WIDTH = availableWidth;
let TABLE_HEIGHT = availableWidth / 2;

// If height is too big, scale down based on height
if (TABLE_HEIGHT > availableHeight) {
  TABLE_HEIGHT = availableHeight;
  TABLE_WIDTH = TABLE_HEIGHT * 2;
}

// Ensure minimum playable size
TABLE_WIDTH = Math.max(TABLE_WIDTH, 300);
TABLE_HEIGHT = Math.max(TABLE_HEIGHT, 150);

const CUE_BALL_POSITION = { x: TABLE_WIDTH * 0.25, y: TABLE_HEIGHT * 0.5 };

export default function HomeScreen() {
  const [shotData, setShotData] = useState({ force: 0, angle: 0 });
  const [predictionPath, setPredictionPath] = useState<
    { x: number; y: number }[]
  >([]);
  const [bounceCount, setBounceCount] = useState(0);
  const handleShotChange = ({
    force,
    angle,
  }: {
    force: number;
    angle: number;
  }) => {
    setShotData({ force, angle });

    if (force > 5) {
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

      // Calculate bounce points
      const bounces = getBouncePoints(trajectory);
      setBounceCount(bounces.length);
    } else {
      setPredictionPath([]);
      setBounceCount(0);
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

      {/* Enhanced debug info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Force: {shotData.force.toFixed(0)}% | Angle:{" "}
          {shotData.angle.toFixed(0)}°
        </Text>
        <Text style={styles.debugText}>
          Path Points: {predictionPath.length} | Bounces: {bounceCount}
        </Text>
        {predictionPath.length > 0 && (
          <Text style={styles.debugTextSmall}>
            Ball will travel through {predictionPath.length} calculated
            positions
          </Text>
        )}
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
    paddingTop: 50, // Account for status bar
    paddingBottom: 100, // Account for tab bar
  },
  gameArea: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    width: TABLE_WIDTH + 40, // Add some padding
    height: TABLE_HEIGHT + 40,
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
  debugTextSmall: {
    color: "#FFA500",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
});
