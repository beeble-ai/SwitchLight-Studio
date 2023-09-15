import { app, dialog } from "electron";
import { autoUpdater } from "electron-updater";
import * as log from "electron-log";
import serve from "electron-serve";
import { createWindow } from "./helpers";

const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

let updateInterval = null;

autoUpdater.on("checking-for-update", () => {
  log.info("업데이트 확인 중...");
});
autoUpdater.on("update-not-available", (info: any) => {
  log.info("현재 최신버전입니다.");
});
autoUpdater.on("error", (err) => {
  log.info("에러가 발생하였습니다. 에러내용 : " + err);
});

autoUpdater.on("update-available", (info: any) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Ok"],
    title: "Update Available",
    message: "Hello",
    // message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version download started. The app will be restarted to install the update.",
  };
  updateInterval = null;
  dialog.showMessageBox(dialogOpts)
});

autoUpdater.on("update-downloaded", (info: any) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: "Hello",
    // message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    log.info("LOG: " + returnValue.response)
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }

  const server = "https://update.electronjs.org";
  const feed = `${server}/beeble-ai/desktop-temp/${process.platform}-${process.arch}/${app.getVersion()}`; // Windows
  log.info("LOG FEED: " + feed);
  // const feed = `${server}/beeble-ai/desktop-temp/${process.platform}/${app.getVersion()}`; // Mac

  // autoUpdater.setFeedURL(feed as any);
  autoUpdater.checkForUpdatesAndNotify();
  updateInterval = setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
    console.log("checking...");
    console.log(app.getVersion());
    console.log(process.platform, process.arch, app.getVersion());
    // console.log(autoUpdater.getFeedURL());
  }, 60 * 1000);
})();

app.on("window-all-closed", () => {
  app.quit();
});
