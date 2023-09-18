import React, { useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";

function Home() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [mode, setMode] = useState("");

  const inputFolder = useRef<HTMLInputElement | null>(null);
  const outputFolder = useRef<HTMLInputElement | null>(null);

  const [inputFolderPath, setInputFolderPath] = useState("");
  const [outputFolderPath, setOutputFolderPath] = useState("");

  const handleInputFolderChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const path = files[0].webkitRelativePath;
      const parts = path.split("/");
      const parentDir = parts.length > 1 ? parts[parts.length - 2] : parts[0];
      setInputFolderPath(parentDir);
    }
  };

  const handleOutputFolderChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const path = files[0].webkitRelativePath;
      const parts = path.split("/");
      const parentDir = parts.length > 1 ? parts[parts.length - 2] : parts[0];
      setOutputFolderPath(parentDir);
    }
  };

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
      <button
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
        onClick={() => setOpenDropdown(!openDropdown)}
      >
        {mode === "" ? "Select mode" : mode}
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

      <div className="flex flex-col gap-2">
        <div
          className={`z-10 ${
            openDropdown ? "" : "hidden"
          } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600`}
        >
          <button
            className="text-center px-4 py-3 text-sm text-gray-900 dark:text-white"
            onClick={() => {
              setMode("Remove Background");
              setOpenDropdown(!openDropdown);
            }}
          >
            <div>Remove Background</div>
          </button>

          <button
            className="text-center px-4 py-3 text-sm text-gray-900 dark:text-white"
            onClick={() => {
              setMode("De-render");
              setOpenDropdown(!openDropdown);
            }}
          >
            <div>De-render</div>
          </button>
        </div>

        {/* Input folder */}
        <div className="flex justify-between w-[50%]">
          <div>Input Folder: {inputFolderPath}</div>
          <label
            htmlFor="inputFolderPicker"
            className="w-[100px] cursor-pointer bg-gray-500 text-white py-2 px-4 rounded text-center"
          >
            Choose
          </label>
          <input
            id="inputFolderPicker"
            style={{ display: "none" }}
            type="file"
            onChange={handleInputFolderChange}
            ref={(node) => {
              inputFolder.current = node;
              if (node) {
                ["webkitdirectory", "directory", "mozdirectory"].forEach(
                  (attr) => {
                    node.setAttribute(attr, "");
                  }
                );
              }
            }}
          />
        </div>

        {/* Output folder */}
        <div className="flex justify-between w-[50%]">
          <div>Output Folder: {outputFolderPath}</div>
          <label
            htmlFor="outputFolderPicker"
            className="w-[100px] cursor-pointer bg-gray-500 text-white py-2 px-4 rounded text-center"
          >
            Choose
          </label>
          <input
            id="outputFolderPicker"
            style={{ display: "none" }}
            type="file"
            onChange={handleOutputFolderChange}
            ref={(node) => {
              outputFolder.current = node;
              if (node) {
                ["webkitdirectory", "directory", "mozdirectory"].forEach(
                  (attr) => {
                    node.setAttribute(attr, "");
                  }
                );
              }
            }}
          />
        </div>
        {/* Run */}
        {/* <div className="flex justify-center">
        <div className="w-[50%] bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-blue-600 h-2.5 rounded-full w-[45%]"></div>
        </div>
      </div> */}
        <div className="my-1 w-full flex-wrap flex justify-center absolute bottom-20">
          <Link href="/next">
            <a className="btn-blue">Run</a>
          </Link>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Home;
