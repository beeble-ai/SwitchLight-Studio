import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import electron from "electron";

const ipcRenderer = electron.ipcRenderer || false;

function Home() {
  const [progress, setProgress] = React.useState("0");

  useEffect(() => {
    if (ipcRenderer) {
      ipcRenderer.send("compare-and-download-engine");
    }
  }, []);

  useEffect(() => {
    if (ipcRenderer) {
      ipcRenderer.on("compare-and-download-engine", (event, data) => {
        setProgress(data);
      });
    }
  }, []);

  useEffect(() => {
    if (progress === "complete") {
      if (ipcRenderer) {
        ipcRenderer.removeAllListeners("compare-and-download-engine");
      }
      window.location.href = "/keyCheck";
    }
  }, [progress]);

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

export default Home;
