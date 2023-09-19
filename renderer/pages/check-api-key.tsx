import React, { useEffect, useState } from "react";
import Head from "next/head";
import electron from "electron";

import { useRouter } from "next/router";

import { Label, TextInput } from "flowbite-react";

const ipcRenderer = electron.ipcRenderer || false;

function CheckAPIKey() {
  const [apiKey, setApiKey] = useState("");
  const router = useRouter(); // <-- Call the useRouter hook

  useEffect(() => {
    // check whether key file exists
    if (!ipcRenderer) return;

    ipcRenderer.send("api-key-read");

    ipcRenderer.on("api-key-read", (event, data) => {
      if (data["keyexists"]) {
        setApiKey(data["key"]);
        ipcRenderer.removeAllListeners("api-key-read");
        router.push("/initialize-engine");
      }
    });
  }, []);

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
      <div className="flex flex-col gap-2 m-10">
        <div> Enter your API Key </div>
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleKeySubmit();
          }}
        >
          <TextInput
            id="large"
            type="text"
            className="text-white w-full"
            sizing="lg"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <div className="flex justify-center w-[100px] rounded-lg">
            <button type="submit" className="btn-blue">
              Submit
            </button>
          </div>
        </form>
      </div>
    </React.Fragment>
  );
}

export default CheckAPIKey;
