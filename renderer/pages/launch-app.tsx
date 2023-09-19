import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import electron from "electron";

import { useRouter } from 'next/router';

const ipcRenderer = electron.ipcRenderer || false;

function LaunchApp() {
  const router = useRouter(); // <-- Call the useRouter hook

  const [progress, setProgress] = React.useState("0");

  useEffect(() => {
    if (!ipcRenderer) return;

    // Send an IPC event immediately.
    ipcRenderer.send("compare-and-download-engine");

    // Listen for a response from the renderer process.
    const handleCompareAndDownload = (event, data) => {
      setProgress(data);
      if (data === "complete") {
        ipcRenderer.removeAllListeners("compare-and-download-engine");
        router.push("/check-api-key");
      }
    };

    ipcRenderer.on("compare-and-download-engine", handleCompareAndDownload);

    // Cleanup on component unmount or when detaching the event listener explicitly.
    return () => {
      ipcRenderer.removeListener("compare-and-download-engine", handleCompareAndDownload);
    };
  }, []);


  return (
    <React.Fragment>
      <Head>
        <title>SwitchLight Desktop Beta</title>
      </Head>
      <div className="grid grid-col-1 text-2xl w-full text-center mt-10">
        <span>⚡ SwitchLight Desktop Beta ⚡</span>
        <span className="text-[10px]">Ver. XX</span>
      </div>

      {/* Mode */}

      {/* <div className="flex flex-col items-start gap-4"> */}
      <div className="flex items-center w-full gap-2">
        Initializing Engine ... {progress} % Please Wait
      </div>
    </React.Fragment>
  );
}

export default LaunchApp;
