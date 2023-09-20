import React, { useEffect, useState, useRef, ReactElement } from "react";
import Head from "next/head";
import {
    Environment,
    OrbitControls,
    PerspectiveCamera,
  } from "@react-three/drei"
import { useLoader, useFrame, Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";
import { calculateCamPosition } from "../utils/threejs-functions";

const fs = require('fs');

// Function to convert image to Base64
function imageToBase64(path) {
    const image = fs.readFileSync(path);
    return `data:image/png;base64,${image.toString('base64')}`;
}

// Texture URLs
const TEXTURE_URLS = [
    "https://space-images.beeble.ai/asset/api_docs/normal_woman_v2_small.avif",
    "https://space-images.beeble.ai/asset/api_docs/albedo_woman_v2_small.avif",
    "https://space-images.beeble.ai/asset/api_docs/roughness_woman_v2_small.avif",
  ]

interface MeshProps {
    setCamPosition: (position: THREE.Vector3) => void;
}

export const Mesh: React.FC<MeshProps> = ({ setCamPosition }): ReactElement => {
    const ref = useRef<THREE.Mesh>(null)

    // Load textures
    const [normalMap, albedoMap, roughnessMap] = useLoader(
      THREE.TextureLoader,
      TEXTURE_URLS
    )

    useFrame((state) => {
      if (ref.current) {
        ref.current.lookAt(state.camera.position)
        setCamPosition(state.camera.position)
      }
    })

    const renderMaterial = () => {
        return (
            <meshPhysicalMaterial
              roughnessMap={roughnessMap}
              normalMap={normalMap}
              map={albedoMap}
              transparent
            />
          )
    }

    return (
        <mesh ref={ref} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[36, 64]} />
          {renderMaterial()}
        </mesh>
    )
}