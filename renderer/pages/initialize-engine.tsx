import React, { useEffect } from "react";
import Head from "next/head";
import electron from "electron";

import { useRouter } from "next/router";

const ipcRenderer = electron.ipcRenderer || false;

function InitializeEngine() {
  const router = useRouter();
  const [description, setDescription] = React.useState("");
  const [progress, setProgress] = React.useState<string | undefined>(undefined);

  function getProgress(str: string): string | null {
    if (/\b(?:100|[1-9]?[0-9])\b/.test(str)) {
      const firstNumberRegex = /\b(?:100|[1-9]?[0-9])\b/;
      const match = str.match(firstNumberRegex);
      if (match) {
        const firstNumber = match[0];
        return firstNumber;
      }
    }
    return null;
  }

  useEffect(() => {
    if (!ipcRenderer) return;

    const handleInitializeEngine = (event, data) => {
      const description = data["description"];

      if (data["isProgress"]) {
        setProgress(getProgress(description));
      } else {
        setProgress(undefined);
        setDescription(description);
      }

      if (description.includes("complete")) {
        ipcRenderer.removeAllListeners("initialize-engine");
        router.push("/run-engine");
      }
    };

    ipcRenderer.send("initialize-engine");
    ipcRenderer.on("initialize-engine", handleInitializeEngine);

    return () => {
      ipcRenderer.removeListener("initialize-engine", handleInitializeEngine);
    };
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>SwitchLight Desktop Beta</title>
      </Head>

      <div className="flex items-center w-full gap-2">{description}</div>
      {progress && <div> Initializing Engine ... {progress}% </div>}
    </React.Fragment>
  );
}

export default InitializeEngine;
