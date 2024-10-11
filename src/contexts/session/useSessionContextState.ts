import {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFileSystem } from "../fileSystem";
import {
  IconPositions,
  RecentFiles,
  SessionContextState,
  SessionData,
  SortOrders,
  WallpaperFit,
  WallpaperImage,
  WindowStates,
} from "./types";
import {
  DEFAULT_ASCENDING,
  DESKTOP_GRID_ID,
  DESKTOP_PATH,
  SESSION_FILE,
  SYSTEM_FILES,
  TRANSITIONS_IN_MS,
} from "@/lib/constants";
import defaultSession from "public/session.json";
import { dirname, extname } from "path";
import { updateIconPositionsIfEmpty } from "@/lib/utils";
import { SortBy } from "@/app/components/Files/FileEntry/useSortBy";
import { ApiError } from "browserfs/dist/node/core/api_error";

const DEFAULT_SESSION = (defaultSession || {}) as unknown as SessionData;
const KEEP_RECENT_FILES_LIST_COUNT = 10;
export const DEFAULT_WALLPAPER: WallpaperImage = "SYNTHWAVE";

const useSessionContextState = (): SessionContextState => {
  const { deletePath, readdir, readFile, rootFs, writeFile, lstat } =
    useFileSystem();
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [foregroundId, setForegroundId] = useState("");
  const [stackOrder, setStackOrder] = useState<string[]>([]);
  const [cursor, setCursor] = useState("");
  const [windowStates, setWindowStates] = useState(
    Object.create(null) as WindowStates,
  );
  const [sortOrders, setSortOrders] = useState(
    Object.create(null) as SortOrders,
  );
  const [iconPositions, setIconPositions] = useState(
    Object.create(null) as IconPositions,
  );
  const [wallpaperFit, setWallpaperFit] = useState<WallpaperFit>("fit");
  const [wallpaperImage, setWallpaperImage] =
    useState<WallpaperImage>(DEFAULT_WALLPAPER);
  const [wallpaperColor, setWallpaperColor] = useState("rgba(255, 140, 0)");
  const [runHistory, setRunHistory] = useState<string[]>([]);
  const [recentFiles, setRecentFiles] = useState<RecentFiles>([]);
  const [haltSession, setHaltSession] = useState(false);
  const [hideDesktopIcon, setHideDesktopIcon] = useState(false);
  const initializedSession = useRef(false);
  const loadingDebounceRef = useRef(0);

  useEffect(() => {
    // console.log("useSessionContextState", {
    //   sessionLoaded,
    //   foregroundId,
    //   stackOrder,
    //   cursor,
    //   windowStates,
    //   sortOrders,
    //   iconPositions,
    //   runHistory,
    //   recentFiles,
    //   wallpaperFit,
    //   wallpaperImage,
    // });
  }, [
    sessionLoaded,
    foregroundId,
    stackOrder,
    cursor,
    windowStates,
    sortOrders,
    iconPositions,
    runHistory,
    recentFiles,
    wallpaperFit,
    wallpaperImage,
  ]);

  const updateRecentFiles = useCallback(
    (url: string, pid: string, title?: string) =>
      (title || extname(url)) &&
      pid !== "FileExplorer" &&
      setRecentFiles((currentRecentFiles) => {
        const entryIndex = currentRecentFiles.findIndex(
          ([recentUrl, recentPid]) => recentUrl === url && recentPid === pid,
        );

        if (entryIndex !== -1) {
          return [
            currentRecentFiles[entryIndex],
            ...currentRecentFiles.slice(0, entryIndex),
            ...currentRecentFiles.slice(entryIndex + 1),
          ] as RecentFiles;
        }

        return [[url, pid, title], ...currentRecentFiles].slice(
          0,
          KEEP_RECENT_FILES_LIST_COUNT,
        ) as RecentFiles;
      }),
    [],
  );

  const prependToStack = useCallback(
    (id: string) =>
      setStackOrder((currentStackOrder) =>
        currentStackOrder[0] === id
          ? currentStackOrder
          : [id, ...currentStackOrder.filter((stackId) => stackId !== id)],
      ),
    [],
  );

  const removeFromStack = useCallback(
    (id: string) =>
      setStackOrder((currentStackOrder) =>
        currentStackOrder.filter((stackId) => stackId !== id),
      ),
    [],
  );

  const setWallpaper = useCallback(
    (image: string, fit?: WallpaperFit): void => {
      if (fit) setWallpaperFit(fit);
      setWallpaperImage(image);
    },
    [],
  );

  const setSortOrder = useCallback(
    (
      directory: string,
      order: string[] | ((currentSortOrder: string[]) => string[]),
      sortBy?: SortBy,
      ascending?: boolean,
    ): void =>
      setSortOrders((currentSortOrder = {}) => {
        const [currentOrder, currentSortBy, currentAscending] =
          currentSortOrder[directory] || [];
        const newOrder =
          typeof order === "function" ? order(currentOrder) : order;

        return {
          ...currentSortOrder,
          [directory]: [
            newOrder,
            sortBy ?? currentSortBy,
            ascending ?? currentAscending ?? DEFAULT_ASCENDING,
          ],
        };
      }),
    [],
  );

  const setAndUpdateIconPositions = useCallback(
    async (positions: SetStateAction<IconPositions>): Promise<void> => {
      if (typeof positions === "function") {
        return setIconPositions(positions);
      }
      const [firstIcon] = Object.keys(positions) || [];
      const isDesktop = firstIcon && DESKTOP_PATH === dirname(firstIcon);
      if (isDesktop) {
        const desktopGrid = document.getElementById(DESKTOP_GRID_ID);
        if (desktopGrid instanceof HTMLOListElement) {
          try {
            const { [DESKTOP_PATH]: [desktopFileOrder = []] = [] } =
              sortOrders || {};
            const newDesktopSortOrder = {
              [DESKTOP_PATH]: [
                [
                  ...new Set([
                    ...desktopFileOrder,
                    ...(await readdir(DESKTOP_PATH)).filter(
                      (entry) => !SYSTEM_FILES.has(entry),
                    ),
                  ]),
                ],
              ],
            } as SortOrders;

            return setIconPositions(
              updateIconPositionsIfEmpty(
                DESKTOP_PATH,
                desktopGrid,
                positions,
                newDesktopSortOrder,
              ),
            );
          } catch {
            // Ignore failure to update icon positions with directory
          }
        }
      }
      return setIconPositions(positions);
    },
    [readdir, sortOrders],
  );

  useEffect(() => {
    if (!loadingDebounceRef.current && sessionLoaded && !haltSession) {
      const updateSessionFile = (): void => {
        writeFile(
          SESSION_FILE,
          JSON.stringify({
            cursor,
            iconPositions,
            recentFiles,
            runHistory,
            sortOrders,
            windowStates,
            wallpaperFit,
            wallpaperImage,
            wallpaperColor,
          }),
          true,
        );
      };
      if (
        "requestIdleCallback" in window &&
        typeof window.requestIdleCallback === "function"
      ) {
        requestIdleCallback(updateSessionFile);
      } else {
        updateSessionFile();
      }
    }
  }, [
    cursor,
    haltSession,
    iconPositions,
    recentFiles,
    runHistory,
    sessionLoaded,
    sortOrders,
    windowStates,
    writeFile,
    wallpaperFit,
    wallpaperImage,
    wallpaperColor,
  ]);

  useEffect(() => {
    if (!initializedSession.current && rootFs) {
      const initSession = async (): Promise<void> => {
        initializedSession.current = true;
        try {
          let session: SessionData;
          try {
            session =
              (await lstat(SESSION_FILE)).blocks <= 0
                ? DEFAULT_SESSION
                : (JSON.parse(
                    (await readFile(SESSION_FILE)).toString(),
                  ) as SessionData);
          } catch {
            session = DEFAULT_SESSION;
          }

          if (session.cursor) setCursor(session.cursor);
          if (session.wallpaperImage) {
            setWallpaper(session.wallpaperImage, session.wallpaperFit);
          }
          if (session.wallpaperColor) {
            setWallpaperColor(session.wallpaperColor);
          }
          if (
            session.sortOrders &&
            Object.keys(session.sortOrders).length > 0
          ) {
            setSortOrders(session.sortOrders);
          }
          if (
            session.iconPositions &&
            Object.keys(session.iconPositions).length > 0
          ) {
            if (session !== DEFAULT_SESSION && DEFAULT_SESSION.iconPositions) {
              const defaultIconPositions = Object.entries(
                DEFAULT_SESSION.iconPositions,
              );
              Object.keys({
                ...DEFAULT_SESSION.iconPositions,
                ...session.iconPositions,
              }).forEach((iconPath) => {
                const sessionIconPosition = session.iconPositions?.[iconPath];
                if (sessionIconPosition) {
                  const [conflictingDefaultIconPath] =
                    defaultIconPositions.find(
                      ([defaultIconPath, { gridColumnStart, gridRowStart }]) =>
                        defaultIconPath !== iconPath &&
                        sessionIconPosition.gridColumnStart ===
                          gridColumnStart &&
                        sessionIconPosition.gridRowStart === gridRowStart,
                    ) || [];
                  if (
                    conflictingDefaultIconPath &&
                    session.iconPositions?.[conflictingDefaultIconPath]
                      .gridColumnStart ===
                      sessionIconPosition.gridColumnStart &&
                    session.iconPositions?.[conflictingDefaultIconPath]
                      .gridRowStart === sessionIconPosition.gridRowStart
                  ) {
                    delete session.iconPositions[iconPath];
                  }
                } else {
                  session.iconPositions[iconPath] =
                    DEFAULT_SESSION.iconPositions[iconPath];
                }
              });
            }
            setIconPositions(session.iconPositions);
          } else if (typeof session.iconPositions !== "object") {
            setIconPositions(
              DEFAULT_SESSION.iconPositions ||
                (Object.create(null) as IconPositions),
            );
          }
          if (
            session.windowStates &&
            Object.keys(session.windowStates).length > 0
          ) {
            setWindowStates(session.windowStates);
          }
          if (session.runHistory && session.runHistory.length > 0) {
            setRunHistory(session.runHistory);
          }
          if (session.recentFiles && session.recentFiles.length > 0) {
            setRecentFiles(session.recentFiles);
          } else if (!Array.isArray(session.recentFiles)) {
            setRecentFiles(DEFAULT_SESSION?.recentFiles || []);
          }
        } catch (error) {
          if ((error as ApiError)?.code === "ENOENT") {
            deletePath(SESSION_FILE);
          }
        }
        loadingDebounceRef.current = window.setTimeout(() => {
          loadingDebounceRef.current = 0;
          window.sessionIsWriteable = true;
        }, TRANSITIONS_IN_MS.WINDOW * 2);
        setSessionLoaded(true);
      };
      initSession();
    }
  }, [deletePath, lstat, readFile, rootFs, setWallpaper]);

  return {
    cursor,
    foregroundId,
    iconPositions,
    prependToStack,
    recentFiles,
    removeFromStack,
    runHistory,
    sessionLoaded,
    setCursor,
    setForegroundId,
    setHaltSession,
    setIconPositions: setAndUpdateIconPositions,
    setRunHistory,
    setSortOrder,
    // setThemeName,
    setWallpaper,
    setWindowStates,
    sortOrders,
    stackOrder,
    // themeName,
    updateRecentFiles,
    wallpaperFit,
    wallpaperImage,
    windowStates,
    setWallpaperColor,
    wallpaperColor,
    hideDesktopIcon,
    setHideDesktopIcon,
  };
};

export default useSessionContextState;
