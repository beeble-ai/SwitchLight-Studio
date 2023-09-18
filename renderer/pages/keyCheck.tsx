import React, { useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import electron from "electron";

import { Button, Label, TextInput } from "flowbite-react";

const ipcRenderer = electron.ipcRenderer || false;

function Home() {
  const [apiKey, setApiKey] = useState("");

  function handleKeySubmit() {
    if (ipcRenderer && apiKey) {
      ipcRenderer.send("api-key-submitted", apiKey);
    }
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
          <Link href="/assignPath">
            <a className="btn-blue" onClick={handleKeySubmit}>
              Submit
            </a>
          </Link>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Home;
