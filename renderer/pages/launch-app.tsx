import React, { useEffect } from "react";
import Head from "next/head";
import electron from "electron";

import { useRouter } from "next/router";

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
      ipcRenderer.removeListener(
        "compare-and-download-engine",
        handleCompareAndDownload
      );
    };
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>SwitchLight Desktop Beta</title>
      </Head>

      <div className="flex flex-col gap-2 m-10">
        <div> Downloading Dependencies... </div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-blue-400 dark:text-white">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default LaunchApp;
