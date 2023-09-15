import { app, dialog, autoUpdater } from "electron";
// import { autoUpdater, UpdateInfo } from "electron-updater";
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
autoUpdater.on("update-downloaded", (info: any) => {
  log.info("업데이트가 완료되었습니다.");
});

autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Ok"],
    title: "Update Available",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version download started. The app will be restarted to install the update.",
  };
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    log.info("LOG: " + returnValue.response)
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });

  updateInterval = null;
});

autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };
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
  const feed = `${server}/beeble-ai/desktop-temp/${process.platform}/${app.getVersion()}`;

  autoUpdater.setFeedURL(feed as any);
  autoUpdater.checkForUpdates();
  updateInterval = setInterval(() => {
    autoUpdater.checkForUpdates();
    console.log("checking...");
    console.log(app.getVersion());
    console.log(process.platform, process.arch, app.getVersion());
    console.log(autoUpdater.getFeedURL());
  }, 60 * 1000);
})();

app.on("window-all-closed", () => {
  app.quit();
});
