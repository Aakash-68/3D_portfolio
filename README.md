# Spherical Plane Adventure - Technical Documentation

This document outlines the architecture, component connections, and key logic used in the Spherical Plane Adventure game. Use this as a reference for future AI-assisted modifications.

## 1. Project Structure Overview

All game-related logic is contained within `/src/game/`:

- `Test.tsx`: The entry point component. Manages the global game state (config) and keyboard listeners for camera switching.
- `PlaneGame.tsx`: The R3F Canvas container. Sets up lighting, environment (Sky/Stars), and mounts the core game components.
- `Plane.tsx`: The "Brain" of the plane. Handles WASD input, spherical physics, orientation (quaternions), and the visual mesh.
- `World.tsx`: Handles the globe (sphere), its rotation, and the decorative cubes. Defines the `GLOBE_RADIUS` constant.
- `CameraHandler.tsx`: Manages the two camera modes (Follow and Dev). Handles the math for keeping the camera behind the plane on a sphere.
- `ControlsUI.tsx`: A Tailwind-based overlay for live-tweaking game parameters.

## 2. Component Connections & Data Flow

### State Management (`Test.tsx`)

- **Config State**: A central `config` object in `Test.tsx` is passed down to `PlaneGame`, `Plane`, and `World`.
- **Setters**: The `setConfig` function is passed to `ControlsUI` to allow real-time updates.

### Refs & Communication

- **Plane Ref**: `PlaneGame.tsx` creates a `planeRef` using `useRef<THREE.Group>`.
- **Imperative Handle**: `Plane.tsx` uses `useImperativeHandle` to expose its internal `groupRef` to the parent.
- **Camera Tracking**: `CameraHandler.tsx` receives this `planeRef` to calculate the camera's target position and look-at vector every frame.

## 3. Core Logic Deep Dive

### Spherical Movement (`Plane.tsx`)

To avoid gimbal lock and ensure the plane stays tangent to the sphere:

1. **Orientation (Quaternion)**: We store the plane's orientation as a single `THREE.Quaternion`.
2. **Turning**: We multiply the orientation by a rotation around the local **UP** axis.
3. **Forward Movement**: We multiply the orientation by a rotation around the local **RIGHT** axis. The angle of rotation is `speed / GLOBE_RADIUS`.
4. **Positioning**: The final world position is derived by taking the orientation's **UP** vector and scaling it by `GLOBE_RADIUS + HEIGHT`.

### Camera Follow Logic (`CameraHandler.tsx`)

- **Positioning**: The camera calculates an "ideal offset" in local space (e.g., `[0, 1.5, -4]`) and transforms it into world space using the plane's current quaternion.
- **Up Vector**: On a sphere, "Up" is always the vector from the center of the globe to the plane. The camera's `up` vector is lerped toward this gravity-up vector to keep the horizon level relative to the sphere's surface.

## 4. Changeable Parameters (Tweakables)

### In `Test.tsx` (Initial State)

- `globeRotationSpeed`: How fast the earth spins.
- `forwardSpeed`: Base speed when holding 'W'.s
- `slowSpeed`: Speed when holding 'S'.
- `turnAmount`: How fast the plane rotates left/right.
- `rollAmount`: The visual tilt intensity during turns.

### In `World.tsx`

- `GLOBE_RADIUS`: Default is `50`. Changing this affects gravity math and movement scale.
- `count` (in `cubes` useMemo): Number of decorative objects on the globe.

### In `Plane.tsx`

- `PLANE_HEIGHT`: How high the plane flies above the surface (default `2`).
- Mesh dimensions: Adjust the `boxGeometry` args to change the plane's shape.

### In `CameraHandler.tsx`

- `offset`: The `Vector3(x, y, z)` relative to the plane where the camera sits.
- `lookAtOffset`: Where the camera points relative to the plane.

## 5. Integration

The game is mounted in `App.tsx` via:

```tsx
<Route path="/t" element={<Test />} />
```

It requires `react-router-dom` for navigation and `@react-three/fiber` / `@react-three/drei` for the 3D engine.
