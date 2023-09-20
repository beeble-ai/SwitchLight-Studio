import * as THREE from "three"

// Calculate the camera's target position
export const calculateCamPosition = (
  targetRadius: number,
  targetPolarAngle: number = Math.PI / 2,
  targetAzimuthalAngle: number = Math.PI / 2
): THREE.Vector3 =>
  new THREE.Vector3(
    targetRadius * Math.sin(targetPolarAngle) * Math.sin(targetAzimuthalAngle),
    targetRadius * Math.cos(targetPolarAngle),
    targetRadius * Math.sin(targetPolarAngle) * Math.cos(targetAzimuthalAngle)
  )

export const calculateOrbitRadius = (cameraPosition: THREE.Vector3): number => {
  return cameraPosition.length()
}

export const calculateCamAngles = (
  cameraPosition: THREE.Vector3
): {
  // targetRadius: number
  targetPolarAngle: number
  targetAzimuthalAngle: number
} => {
  const x = cameraPosition.x
  const y = cameraPosition.y
  const z = cameraPosition.z

  const targetRadius = Math.sqrt(x * x + y * y + z * z)
  const targetPolarAngle = Math.acos(y / targetRadius)

  // The division by targetRadius * Math.sin(targetPolarAngle) is safe as long as targetRadius and sin(targetPolarAngle) are not zero.
  // If they are zero, then the position was the origin, where this function is undefined.
  const targetAzimuthalAngle = Math.atan2(
    x / (targetRadius * Math.sin(targetPolarAngle)),
    z / (targetRadius * Math.sin(targetPolarAngle))
  )

  return { targetPolarAngle, targetAzimuthalAngle }
}
