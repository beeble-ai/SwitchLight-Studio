import React, { useState, useMemo } from "react";
import Head from "next/head";
import FolderPicker from "../components/folder-picker";

import electron from "electron";

import { Checkbox, Label } from "flowbite-react";

function RunEngine() {
  const ipcRenderer = electron.ipcRenderer || false;

  const [openDropdown, setOpenDropdown] = useState(false);
  const toggleDropdown = () => setOpenDropdown((prevState) => !prevState);

  const [mode, setMode] = useState("Video"); // Video or Image Sequence

  const [bgRemovalChecked, setbgRemovalChecked] = useState(true);
  const handleBgRemovalCheckboxChange = (event) => {
    setbgRemovalChecked(event.target.checked);
  };

  const [inputLabel, setInputLabel] = useState("");
  const [outputLabel, setOutputLabel] = useState("");

  const [inputFolderPath, setInputFolderPath] = useState("");
  const [outputFolderPath, setOutputFolderPath] = useState("");

  const [terminalOutput, setTerminalOutput] = useState("");

  const [bgRemovalStatus, setBgRemovalStatus] = useState("Not Started");
  const [derenderStatus, setDerenderStatus] = useState("Not Started");

  const [isEngineRunning, setIsEngineRunning] = useState(false);

  function handleInputFolderChange() {
    if (!ipcRenderer) return;

    const handleSelectDirectory = (event, data) => {
      setInputFolderPath(data["directoryPath"]);
      ipcRenderer.removeAllListeners("select-path");
    };

    ipcRenderer.send("select-path", mode === "Video" ? "file" : "directory");
    ipcRenderer.on("select-path", handleSelectDirectory);
  }

  function handleOutputFolderChange() {
    if (!ipcRenderer) return;

    const handleSelectDirectory = (event, data) => {
      setOutputFolderPath(data["directoryPath"]);
      ipcRenderer.removeAllListeners("select-path");
    };

    ipcRenderer.send("select-path", "directory");
    ipcRenderer.on("select-path", handleSelectDirectory);
  }

  function getProgress(str: string): string | null {
    if (!str.includes("frames")) return null;

    let division = str.split("frames")[0];
    let currentFrame = division.split("/")[0].split("|")[1].trim();
    let totalFrame = division.split("/")[1].trim();

    if (totalFrame && currentFrame) {
      return ((Number(currentFrame) / Number(totalFrame)) * 100).toFixed(2);
    } else {
      return null;
    }
  }

  useMemo(() => {
    if (mode === "Video") {
      setInputLabel("Input Video Path: ");
      setOutputLabel("Output Dir: ");
    } else {
      setInputLabel("Input Image Dir: ");
      setOutputLabel("Output Dir: ");
    }
    // reset status
    setBgRemovalStatus("Not Started");
    setDerenderStatus("Not Started");
    setTerminalOutput("");
    setInputFolderPath("");
    setOutputFolderPath("");

  }, [mode]);

  function runBgRemoval() {
    if (!ipcRenderer) return;

    const handleRemoveBackground = (event, data) => {
      const progress = getProgress(data["description"]);
      if (progress) {
        setBgRemovalStatus(progress + "%");
      } else {
        setBgRemovalStatus("Loading...");
      }

      setTerminalOutput((prev) => (prev ? prev : "") + data["description"]);

      if (data["isComplete"]) {
        ipcRenderer.removeAllListeners("run-remove-bg");
        runDerender();
      }
    };

    ipcRenderer.send("run-remove-bg", {
      mode: mode,
      inputDir: inputFolderPath,
      outputDir: outputFolderPath,
    });
    ipcRenderer.on("run-remove-bg", handleRemoveBackground);
  }

  function runDerender() {

    if (!ipcRenderer) return;

    const handleDerender = (event, data) => {
      const progress = getProgress(data["description"]);
      if (progress) {
        setDerenderStatus(progress + "%");
      } else {
        setDerenderStatus("Loading...");
      }

      setTerminalOutput((prev) => (prev ? prev : "") + data["description"]);

      if (data["isComplete"]) {
        ipcRenderer.removeAllListeners("run-derender");
        setIsEngineRunning(false);

        ipcRenderer.send("show-dialog", {
          title: "Finished!",
          message: "De-Rendering is finished! \nView the results in the output directories.",
        });

        ipcRenderer.on("show-dialog", (event) => {
          ipcRenderer.removeAllListeners("show-dialog");
        });
      }
    };

    if (bgRemovalChecked) {
      ipcRenderer.send("run-derender", {
        mode: mode,
        inputDir: outputFolderPath,
        bgRemovalChecked: true,
        outputDir: outputFolderPath,
      });
    } else {
      ipcRenderer.send("run-derender", {
        mode: mode,
        inputDir: inputFolderPath,
        bgRemovalChecked: false,
        outputDir: outputFolderPath,
      });
    }
    ipcRenderer.on("run-derender", handleDerender);
  }

  return (
    <React.Fragment>
      <Head>
        <title>SwitchLight Desktop Beta</title>
      </Head>

      <div className="flex items-center gap-4 mt-10 mx-2">
        {/* Dropdown Button */}
        <div className="relative">
          <button
            className={`w-[150px] text-white ${isEngineRunning ?
              "bg-gray-500 hover:bg-gray-500" : "bg-blue-700 hover:bg-blue-800"} font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center`}
            type="button"
            disabled={isEngineRunning}
            style={
              isEngineRunning
                ? { cursor: "not-allowed" }
                : { cursor: "pointer" }
            }
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
          <div
            className={`absolute z-1 mt-2 w-[150px] ${openDropdown ? "" : "hidden"
              } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600`}
          >
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
        </div>

        {/* Background Removal Checkbox */}
        {mode !== "Video" && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="Remove Background"
              className={`${isEngineRunning ? "cursor-not-allowed text-gray-400" : ""}`}
              disabled={isEngineRunning}
              checked={bgRemovalChecked}
              onChange={handleBgRemovalCheckboxChange}
            />
            <Label className={`${isEngineRunning ? "text-gray-400" : "text-white"}`} htmlFor="Remove Background">
              Remove Background
            </Label>
          </div>
        )}
      </div>

      <div className="flex flex-col mt-10">
        <FolderPicker
          label={inputLabel}
          path={inputFolderPath}
          buttonLabel="Select"
          disabled={isEngineRunning}
          onClick={handleInputFolderChange}
        />
        <FolderPicker
          label={outputLabel}
          path={outputFolderPath}
          buttonLabel="Select"
          disabled={isEngineRunning}
          onClick={handleOutputFolderChange}
        />
        <br />
        <FolderPicker
          label={"Background Removed\nOutput Dir:"}
          path={
            !bgRemovalChecked
              ? ""
              : outputFolderPath
                ? outputFolderPath + "\\bgremoval"
                : ""
          }
          buttonLabel={bgRemovalStatus}
          onClick={null}
        />
        <FolderPicker
          label={"Derendered \nOutput Dir: "}
          path={
            outputFolderPath
              ? outputFolderPath + "\\{ normal,albedo,roughness,specular}"
              : ""
          }
          buttonLabel={derenderStatus}
          onClick={null}
        />
      </div>

      {/* Run Engine button */}
      <div className="flex justify-end px-4 mt-3 gap-2">
        <button
          className={`${isEngineRunning || !isEngineRunning && derenderStatus === "100%" ? "bg-gray-500" : "bg-yellow-400"
            } p-2 rounded-lg text-black w-[95px]`}
          disabled={isEngineRunning || !isEngineRunning && derenderStatus === "100%"}
          onClick={() => {
            setIsEngineRunning(true);
            if (bgRemovalChecked) {
              runBgRemoval();
            } else {
              runDerender();
            }
          }}
        >
          {" "}
          <p className="font-bold text-[12px]">Run</p>
        </button>
        <button
          className={`${isEngineRunning ? "bg-gray-500" : "bg-yellow-400"
            } p-2 rounded-lg text-black w-[95px]`}
          disabled={isEngineRunning}
          onClick={() => { }}
        >
          {" "}
          <p className="font-bold text-[12px]">Launch SwitchLight </p>
        </button>
      </div>

      <div className="mx-6 mb-2 text-[12px] text-gray-400">
        {" "}
        Terminal Output{" "}
      </div>
      <div className="bg-black mx-5 mb-5 p-5 rounded-xl text-[12px] text-white h-[300px] whitespace-pre-line overflow-auto">
        {terminalOutput}
      </div>

    </React.Fragment>
  );
}

export default RunEngine;
