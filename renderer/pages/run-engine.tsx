import React, { useState, useMemo, useRef, useEffect } from "react";
import { Checkbox, Label } from "flowbite-react";
import Head from "next/head";
import FolderPicker from "../components/folder-picker";
import { ipcRenderer} from "electron";


function RunEngine() {

  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const toggleDropdown = () => setOpenDropdown((prevState) => !prevState);

  // mode selection: "Video" and "Image Sequence" allowed
  const [mode, setMode] = useState("Video"); // Video or Image Sequence

  // run background removal or not when mode is Image Sequence
  const [bgRemovalChecked, setbgRemovalChecked] = useState(true);
  const handleBgRemovalCheckboxChange = (event) => {
    setbgRemovalChecked(event.target.checked);
  };

  // input and output label, different between mode
  const [inputLabel, setInputLabel] = useState("");
  const [outputLabel, setOutputLabel] = useState("");

  // input and output folder path, received from user
  const [inputFolderPath, setInputFolderPath] = useState("");
  const [outputFolderPath, setOutputFolderPath] = useState("");

  // terminal output from engine
  const [terminalOutput, setTerminalOutput] = useState("");

  // status of background removal and derendering: "Not Started", "Loading...", "##%"
  const [bgRemovalStatus, setBgRemovalStatus] = useState("Not Started");
  const [derenderStatus, setDerenderStatus] = useState("Not Started");

  // engine is running or not, used to disable run button and folder picker
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [isLaunchPrepared, setIsLaunchPrepared] = useState(false);

  const [bgremovalDir, setBgremovalDir] = useState("")
  const [derenderDir, setDerenderDir] = useState("")

  useEffect(() => {
    function handleDocumentClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Close the dropdown if openDropdown is true
        if (openDropdown) toggleDropdown();
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [openDropdown]);

  // open folder picker dialog and get input path from user
  // path can be a file or a folder depending on mode
  function handleInputFolderChange() {

    // definer handler: handle response from main process
    const handleSelectDirectory = (event, data) => {
      if (mode !== "Video" && data["numFiles"] === 0) {
        ipcRenderer.send("show-dialog", {
          type: "error",
          title: "Error!",
          message: "Your selected directory does not contain any image files!",
        });
        ipcRenderer.on("show-dialog", (event) => {
          ipcRenderer.removeAllListeners("show-dialog");
        });
      } else {
        setInputFolderPath(data["directoryPath"]);
        ipcRenderer.removeAllListeners("select-path");
      }
    };

    // send message to main process to open dialog
    ipcRenderer.send("select-path", mode === "Video" ? "file" : "directory");
    ipcRenderer.on("select-path", handleSelectDirectory);
  }

  // open folder picker dialog and get output folder path from user
  function handleOutputFolderChange() {

    // definer handler: handle response from main process
    const handleSelectDirectory = (event, data) => {
      setOutputFolderPath(data["directoryPath"]);
      ipcRenderer.removeAllListeners("select-path");
    };

    // send message to main process to open dialog
    ipcRenderer.send("select-path", "directory");
    ipcRenderer.on("select-path", handleSelectDirectory);
  }

  // get progress from terminal output: parsing frames "1/100" as "1%"
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

  // Reset label and status when mode and bgRemovalChecked are changed
  useMemo(() => {
    // reset label
    if (mode === "Video") {
      setbgRemovalChecked(true)
      setInputLabel("Input Video Path: ");
      setOutputLabel("Output Dir: ");
    } else {
      setInputLabel("Input Image Dir: ");
      setOutputLabel("Output Dir: ");
    }
    // reset status
    if (bgRemovalChecked) {
      setBgRemovalStatus("Not Started");
    } else {
      setBgRemovalStatus("-")
    }
    setDerenderStatus("Not Started");
    setTerminalOutput("");
    setInputFolderPath("");
    setOutputFolderPath("");
    setIsLaunchPrepared(false);

  }, [mode, bgRemovalChecked]);

  useMemo(() => {
    if (outputFolderPath) {
      setDerenderDir(outputFolderPath + "\\{normal,albedo,roughness,specular}");
    } else {
      setDerenderDir("");
    }

    if (!bgRemovalChecked) {
      setBgremovalDir("Not Available");
    } else if (outputFolderPath && bgRemovalChecked) {
      setBgremovalDir(outputFolderPath + "\\bgremoval");
    } else {
      setBgremovalDir("");
    }

  }, [outputFolderPath, bgRemovalChecked])

  // Run background removal when clicked
  function runBgRemoval() {

    // define handler: handle response from main process: update status and terminal output
    const handleRemoveBackground = (event, data) => {
      // initialize progress
      const progress = getProgress(data["description"]);
      if (progress) {
        setBgRemovalStatus(progress + "%");
      } else {
        setBgRemovalStatus("Loading...");
      }

      // set terminal output
      setTerminalOutput((prev) => (prev ? prev : "") + data["description"]);

      // remove listener when finished and run derender
      if (data["isComplete"]) {
        ipcRenderer.removeAllListeners("run-remove-bg");
        runDerender();
      }
    };

    // send message to main process to run background removal
    ipcRenderer.send("run-remove-bg", {
      mode: mode,
      inputDir: inputFolderPath,
      outputDir: outputFolderPath,
    });

    // handle response from main process
    ipcRenderer.on("run-remove-bg", handleRemoveBackground);
  }

  function runDerender() {

    // define handler: handle response from main process: update status and terminal output
    const handleDerender = (event, data) => {
      // initialize progress
      const progress = getProgress(data["description"]);
      if (progress) {
        setDerenderStatus(progress + "%");
      } else {
        setDerenderStatus("Loading...");
      }

      // set terminal output
      setTerminalOutput((prev) => (prev ? prev : "") + data["description"]);

      // remove listener when finished and notify user with modal
      if (data["isComplete"]) {
        setIsEngineRunning(false);

        ipcRenderer.send("show-dialog", {
          title: "Finished!",
          message: "De-Rendering is finished! \nView the results in the output directories.",
        });

        ipcRenderer.on("show-dialog", (event) => {
          ipcRenderer.removeAllListeners("show-dialog");
        });
        setIsLaunchPrepared(true);
        ipcRenderer.removeAllListeners("run-derender");

      }
    };

    // send message to main process to run derender depending on bgRemovalChecked
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
        <div id="dropdown" className="relative" ref={dropdownRef}>
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
          path={bgremovalDir}
          buttonLabel={bgRemovalStatus}
          onClick={null}
        />
        <FolderPicker
          label={"Derendered \nOutput Dir: "}
          path={derenderDir}
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
          <p className="font-bold text-[12px]">Run</p>
        </button>
        <button
          className={`${!isLaunchPrepared ? "bg-gray-500" : "bg-yellow-400"
            } p-2 rounded-lg text-black w-[95px]`}
          disabled={!isLaunchPrepared}
          onClick={() => {
            ipcRenderer.send("open-threejs-renderer");
          }}
        >
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
