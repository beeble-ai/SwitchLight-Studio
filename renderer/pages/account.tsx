import React, { useEffect, useState } from "react";
import Head from "next/head";
import electron from "electron";

import { Label, TextInput } from "flowbite-react";

const ipcRenderer = electron.ipcRenderer || false;

function Account() {
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // check whether key file exists
    if (!ipcRenderer) return;

    ipcRenderer.send("api-key-read");

    ipcRenderer.on("api-key-read", (event, data) => {
      if (data["keyexists"]) {
        setApiKey(data["key"]);
        ipcRenderer.removeAllListeners("api-key-read");
      }
    });
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>SwitchLight Desktop Beta</title>
      </Head>
      <div className="flex flex-col gap-2 m-10">
        <div className="text-[20px] mb-5"> Setting </div>

        <div className="text-gray-200 text-[12px]"> API Key </div>
        <TextInput
          id="large"
          type="text"
          className=" text-white w-full"
          sizing="lg"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          readOnly={!isEditing}
        />
        <div className="flex justify-center items-center mt-10">
          {isEditing ? (
            <button
              type="submit"
              className="btn-blue"
              onClick={() => setIsEditing(false)}
            >
              Edit
            </button>
          ) : (
            <button
              type="submit"
              className="btn-blue"
              onClick={() => setIsEditing(true)}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

export default Account;
