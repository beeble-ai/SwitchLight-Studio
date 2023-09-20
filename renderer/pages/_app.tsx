import React from "react";
import type { AppProps } from "next/app";

import "../styles/globals.css";
import { SLNavbar } from "../components/navbar";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <SLNavbar />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
