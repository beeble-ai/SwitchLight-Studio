import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import electron from "electron";

import { useRouter } from 'next/router';

import { Button, Label, TextInput } from "flowbite-react";

const ipcRenderer = electron.ipcRenderer || false;

function CheckAPIKey() {
  // const [apiKey, setApiKey] = useState("fee056a6449c5b63fc91054d7595537d93e716ff3bcd78165241eeae24ed959e");
  const [apiKey, setApiKey] = useState("");
  const router = useRouter(); // <-- Call the useRouter hook

  useEffect(() => {

    // check whether key file exists
    if (!ipcRenderer) return;

    ipcRenderer.send("api-key-read");

    ipcRenderer.on("api-key-read", (event, data) => {
      if (data["keyexists"]) {
        setApiKey(data["key"])
        ipcRenderer.removeAllListeners("api-key-read");
        router.push("/initialize-engine");
      }
    });
  }, [])

  function handleKeySubmit() {
    if (!ipcRenderer || !apiKey) return;

    const handleApiKeySubmitted = (event, data) => {
      if (data === "success") {
        router.push("/initialize-engine");
      }
      ipcRenderer.removeAllListeners("api-key-submitted");
    };

    ipcRenderer.send("api-key-submitted", apiKey);
    ipcRenderer.on("api-key-submitted", handleApiKeySubmitted);
  }


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
        <Label htmlFor="large" className="text-white" value="API Key" />
        <TextInput
          id="large"
          type="text"
          className="text-white"
          sizing="lg"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        {/* </div> */}

        <div className="flex justify-center w-full mt-2">
          <a className="btn-blue" onClick={handleKeySubmit}>
            Submit
          </a>
        </div>
      </div>
    </React.Fragment>
  );
}

export default CheckAPIKey;
