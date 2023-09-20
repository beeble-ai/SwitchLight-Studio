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
import { Mesh } from "../components/threejs-mesh";

const ENV_FILE = "https://space-images.beeble.ai/asset/blaubeuren_night_1k.exr"

const ThreeJSRenderer = (): ReactElement => {
    const [camPosition, setCamPosition] = useState<any>(null)
    useEffect(() => {
      setCamPosition(calculateCamPosition(40))
    }, [])

  return (
    <React.Fragment>
      <Head>
        <title>SwitchLight Desktop Beta</title>
      </Head>
      <div className="relative w-full aspect-square">

        <Canvas gl={{ outputColorSpace: THREE.SRGBColorSpace }} flat linear>
          <PerspectiveCamera
            makeDefault
            fov={75}
            near={0.1}
            far={100}
            position={camPosition}
          />
          <Environment files={ENV_FILE} background />
          <Mesh setCamPosition={setCamPosition} />
          <OrbitControls
            minDistance={40}
            maxDistance={40}
            rotateSpeed={-0.5}
            enablePan={false}
          />
        </Canvas>
        </div>
    </React.Fragment >
  );
}

export default ThreeJSRenderer;
