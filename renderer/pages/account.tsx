import React, { useEffect, useState } from "react";
import Head from "next/head";
import electron from "electron";

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

        {isEditing ? (
          <input
            type="text"
            id="api_key"
            className="bg-gray-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required></input>
        ) : (
          <input
            type="text"
            className="bg-gray-400 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
            value={apiKey}
            disabled></input>
        )}

        <div className="flex justify-center items-center mt-10">
          <button
            type="submit"
            className="btn-blue"
            onClick={() => setIsEditing(!isEditing)}
          >
            <p>{isEditing ? "Save" : "Edit"}</p>
          </button>
        </div>
      </div>
    </React.Fragment >
  );
}

export default Account;
