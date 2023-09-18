import React, { useRef, useState, useEffect } from "react";
import Head from "next/head";
import FolderPicker from "../components/folder-picker";

import electron from "electron";

function AssignPath() {

  const ipcRenderer = electron.ipcRenderer || false;

  const [openDropdown, setOpenDropdown] = useState(false);

  const [mode, setMode] = useState("Video"); // Video or Image Sequence

  const [inputLabel, setInputLabel] = useState("");
  const [outputLabel, setOutputLabel] = useState("");

  const inputFolder = useRef<HTMLInputElement | null>(null);
  const outputFolder = useRef<HTMLInputElement | null>(null);

  const [inputFolderPath, setInputFolderPath] = useState("");
  const [outputFolderPath, setOutputFolderPath] = useState("");

  const toggleDropdown = () => setOpenDropdown(prevState => !prevState);


  function handleInputFolderChange() {
    if (!ipcRenderer) return;

    const handleSelectDirectory = (event, data) => {

      setInputFolderPath(data['directoryPath'])
      ipcRenderer.removeAllListeners("select-directory");
    };

    ipcRenderer.send("select-directory");
    ipcRenderer.on("select-directory", handleSelectDirectory);
  }

  function handleOutputFolderChange() {
    if (!ipcRenderer) return;

    const handleSelectDirectory = (event, data) => {

      setOutputFolderPath(data['directoryPath'])
      ipcRenderer.removeAllListeners("select-directory");
    };

    ipcRenderer.send("select-directory");
    ipcRenderer.on("select-directory", handleSelectDirectory);
  }


  useEffect(() => {
    if (mode === "Video") {
      setInputLabel("Input Video: ")
      setOutputLabel("Output Video: ")
    } else {
      setInputLabel("Input Images: ")
      setOutputLabel("Output Images: ")
    }
  }, [mode])

  return (
    <React.Fragment>
      <Head>
        <title>SwitchLight Desktop Beta</title>
      </Head>
      <div className="grid grid-col-1 text-2xl w-full text-center mt-10">
        <span>⚡ SwitchLight Desktop Beta ⚡</span>
        <span className="text-[10px]">Ver. XX</span>
      </div>

      <div className="relative mt-10 mx-2">
        <button
          className="w-[150px] text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          type="button"
          onClick={toggleDropdown}
        >
          <div className="flex-1 text-center">
            {mode === "" ? "Select mode" : mode}
          </div>
          <svg
            className="w-2.5 h-2.5 ml-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>

        <div className={`absolute z-10 mt-2 w-[150px] ${openDropdown ? "" : "hidden"} bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600`}>
          <button
            className="flex items-center justify-center w-[150px] py-3 text-sm text-gray-900 dark:text-white"
            onClick={() => {
              setMode("Video");
              toggleDropdown();
            }}
          >
            Video
          </button>

          <button
            className="flex items-center justify-center w-[150px] py-3 text-sm text-gray-900 dark:text-white"
            onClick={() => {
              setMode("Image Sequence");
              toggleDropdown();
            }}
          >
            Image Sequence
          </button>
        </div>


        <div className="flex flex-col mt-10">
          <FolderPicker
            label={inputLabel}
            path={inputFolderPath}
            onClick={handleInputFolderChange}
            ref={inputFolder}
          />

          <FolderPicker
            label={outputLabel}
            path={outputFolderPath}
            onClick={handleOutputFolderChange}
            ref={outputFolder}
          />
        </div>

      </div>

    </React.Fragment >
  );
}

export default AssignPath;
