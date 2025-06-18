interface Point {
  x: number;
  y: number;
}

interface PredictedPathParams {
  x: number;
  y: number;
  angleInDegrees: number;
  force: number;
  tableWidth: number;
  tableHeight: number;
  maxBounces?: number;
}

interface PhysicsConfig {
  ballRadius: number;
  friction: number;
  minVelocity: number;
  timeStep: number;
  maxPoints: number;
  velocityScale: number;
}

// Default physics configuration
const DEFAULT_CONFIG: PhysicsConfig = {
  ballRadius: 8,
  friction: 0.985, // Energy loss per frame (0.985 = 1.5% loss)
  minVelocity: 0.3, // Minimum velocity before ball stops
  timeStep: 0.08, // Time step for simulation
  maxPoints: 300, // Maximum trajectory points
  velocityScale: 0.15, // Scale force to velocity
};

/**
 * Main function to get predicted ball path with bounces
 */
export function getPredictedPath({
  x,
  y,
  angleInDegrees,
  force,
  tableWidth,
  tableHeight,
  maxBounces = 10,
}: PredictedPathParams): Point[] {
  // Validate inputs
  if (force <= 0 || !isFinite(angleInDegrees)) {
    return [];
  }

  const config = DEFAULT_CONFIG;
  const path: Point[] = [];

  // Convert angle to radians and calculate initial velocity
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  let vx = Math.cos(angleInRadians) * force * config.velocityScale;
  let vy = Math.sin(angleInRadians) * force * config.velocityScale;

  // Current position
  let currentX = x;
  let currentY = y;
  let bounces = 0;

  // Add starting position
  path.push({ x: currentX, y: currentY });

  // Simulate ball movement
  while (bounces < maxBounces && path.length < config.maxPoints) {
    // Calculate next position
    const nextX = currentX + vx * config.timeStep;
    const nextY = currentY + vy * config.timeStep;

    // Check for wall collisions and handle bounces
    const collision = checkWallCollisions(
      { x: currentX, y: currentY },
      { x: nextX, y: nextY },
      { vx, vy },
      tableWidth,
      tableHeight,
      config.ballRadius
    );

    if (collision.hasCollision) {
      // Update position to collision point
      currentX = collision.collisionPoint.x;
      currentY = collision.collisionPoint.y;

      // Update velocity with reflection
      vx = collision.newVelocity.vx;
      vy = collision.newVelocity.vy;

      // Apply energy loss from bounce
      const bounceEnergyLoss = 0.92; // Lose 8% energy on bounce
      vx *= bounceEnergyLoss;
      vy *= bounceEnergyLoss;

      bounces++;
    } else {
      // No collision, update position normally
      currentX = nextX;
      currentY = nextY;
    }

    // Apply friction
    vx *= config.friction;
    vy *= config.friction;

    // Check if ball has stopped
    const velocity = Math.sqrt(vx * vx + vy * vy);
    if (velocity < config.minVelocity) {
      break;
    }

    // Add point to path
    path.push({ x: currentX, y: currentY });
  }

  return path;
}

/**
 * Check for collisions with table walls and calculate reflections
 */
function checkWallCollisions(
  currentPos: Point,
  nextPos: Point,
  velocity: { vx: number; vy: number },
  tableWidth: number,
  tableHeight: number,
  ballRadius: number
) {
  let hasCollision = false;
  const collisionPoint = { ...nextPos };
  const newVelocity = { ...velocity };

  // Left wall collision
  if (nextPos.x - ballRadius <= 0) {
    collisionPoint.x = ballRadius;
    newVelocity.vx = Math.abs(velocity.vx); // Reflect horizontally
    hasCollision = true;
  }
  // Right wall collision
  else if (nextPos.x + ballRadius >= tableWidth) {
    collisionPoint.x = tableWidth - ballRadius;
    newVelocity.vx = -Math.abs(velocity.vx); // Reflect horizontally
    hasCollision = true;
  }

  // Top wall collision
  if (nextPos.y - ballRadius <= 0) {
    collisionPoint.y = ballRadius;
    newVelocity.vy = Math.abs(velocity.vy); // Reflect vertically
    hasCollision = true;
  }
  // Bottom wall collision
  else if (nextPos.y + ballRadius >= tableHeight) {
    collisionPoint.y = tableHeight - ballRadius;
    newVelocity.vy = -Math.abs(velocity.vy); // Reflect vertically
    hasCollision = true;
  }

  return {
    hasCollision,
    collisionPoint,
    newVelocity,
  };
}

/**
 * Calculate angle between two points in degrees
 */
export function calculateAngleBetweenPoints(
  point1: Point,
  point2: Point
): number {
  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;
  const angleRad = Math.atan2(deltaY, deltaX);
  return (angleRad * 180) / Math.PI;
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(point1: Point, point2: Point): number {
  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

/**
 * Normalize angle to 0-360 degrees
 */
export function normalizeAngle(angleInDegrees: number): number {
  let normalized = angleInDegrees % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate reflection angle when hitting a wall
 */
export function calculateReflectionAngle(
  incidentAngle: number,
  wallType: "horizontal" | "vertical"
): number {
  if (wallType === "horizontal") {
    // Reflect across horizontal wall (top/bottom)
    return -incidentAngle;
  } else {
    // Reflect across vertical wall (left/right)
    return 180 - incidentAngle;
  }
}

/**
 * Get trajectory points with specific spacing for smoother visualization
 */
export function getSmoothedTrajectory(
  path: Point[],
  pointSpacing = 10
): Point[] {
  if (path.length <= 2) return path;

  const smoothedPath: Point[] = [path[0]]; // Always include start point
  let lastAddedIndex = 0;

  for (let i = 1; i < path.length; i++) {
    const distance = calculateDistance(path[lastAddedIndex], path[i]);

    if (distance >= pointSpacing || i === path.length - 1) {
      smoothedPath.push(path[i]);
      lastAddedIndex = i;
    }
  }

  return smoothedPath;
}

/**
 * Detect bounce points in trajectory (where direction changes significantly)
 */
export function getBouncePoints(path: Point[], angleThreshold = 30): Point[] {
  if (path.length < 3) return [];

  const bouncePoints: Point[] = [];

  for (let i = 1; i < path.length - 1; i++) {
    const prevPoint = path[i - 1];
    const currentPoint = path[i];
    const nextPoint = path[i + 1];

    const angle1 = calculateAngleBetweenPoints(prevPoint, currentPoint);
    const angle2 = calculateAngleBetweenPoints(currentPoint, nextPoint);

    let angleDiff = Math.abs(angle1 - angle2);
    if (angleDiff > 180) {
      angleDiff = 360 - angleDiff;
    }

    if (angleDiff > angleThreshold) {
      bouncePoints.push(currentPoint);
    }
  }

  return bouncePoints;
}

// Legacy function for backward compatibility
export const calculateTrajectory = (
  startPosition: Point,
  angle: number,
  force: number,
  tableWidth: number,
  tableHeight: number
): Point[] => {
  return getPredictedPath({
    x: startPosition.x,
    y: startPosition.y,
    angleInDegrees: (angle * 180) / Math.PI,
    force,
    tableWidth,
    tableHeight,
  });
};
// Helper function to calculate angle between two points
export const calculateAngle = (
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number => {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x);
};

// Helper function to calculate distance between two points
export const calculateDistanceOld = (
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Helper function to normalize angle to 0-2π range
export const normalizeAngleOld = (angle: number): number => {
  while (angle < 0) angle += 2 * Math.PI;
  while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
  return angle;
};
