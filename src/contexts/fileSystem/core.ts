import { ONE_TIME_PASSIVE_EVENT } from "@/lib/constants";
import index from "public/.index/fs.9p.json";
import { openDB } from "idb";

type BFSFS = { [key: string]: BFSFS | null };
// version 4
type FS9PV4 = [string, number, number, FS9PV4[] | string | undefined];

type FileSystemHandles = Record<string, FileSystemDirectoryHandle>;

export const FS_HANDLES = "FileSystemAccessHandles";
export const KEYVAL_STORE_NAME = "keyval";
const KEYVAL_DB = `${KEYVAL_STORE_NAME}-store`;

const IDX_SIZE = 1;
const IDX_MTIME = 2;
const IDX_TARGET = 3;
const FILE_ENTRY = null;
const fsroot = index.fsroot as FS9PV4[];
export const UNKNOWN_SIZE = -1;
export const UNKNOWN_STATE_CODES = new Set(["EIO", "ENOENT"]);

const mapReduce9pArray = (
  array: FS9PV4[],
  mapper: (entry: FS9PV4) => BFSFS,
): BFSFS => array.map(mapper).reduce((a, b) => Object.assign(a, b), {});

const parse9pEntry = ([name, , , pathOrArray]: FS9PV4): BFSFS => ({
  [name]: Array.isArray(pathOrArray)
    ? mapReduce9pArray(pathOrArray, parse9pEntry)
    : FILE_ENTRY,
});

export const fs9pToBfs = (): BFSFS => mapReduce9pArray(fsroot, parse9pEntry);

const get9pData = (
  path: string,
  pathIndex: typeof IDX_SIZE | typeof IDX_MTIME,
): number => {
  let fsPath = fsroot;
  let data = UNKNOWN_SIZE;

  path
    .split("/")
    .filter(Boolean)
    .forEach((pathPart) => {
      const pathBranch = fsPath.find(([name]) => name === pathPart);

      if (pathBranch) {
        const isBranch = Array.isArray(pathBranch[IDX_TARGET]);

        if (!isBranch) data = pathBranch[pathIndex];
        fsPath = isBranch ? (pathBranch[IDX_TARGET] as FS9PV4[]) : [];
      }
    });

  return data;
};

export const get9pSize = (path: string): number => get9pData(path, IDX_SIZE);

export const supportsIndexedDB = (): Promise<boolean> =>
  new Promise((resolve) => {
    try {
      const db = window.indexedDB.open("browserfs");

      db.addEventListener(
        "error",
        () => resolve(false),
        ONE_TIME_PASSIVE_EVENT,
      );
      db.addEventListener(
        "success",
        ({ target }) => {
          resolve(true);

          try {
            db.result.close();
          } catch {
            // Ignore errors to close database
          }

          const { objectStoreNames } =
            (target as IDBOpenDBRequest)?.result || {};

          if (objectStoreNames?.length === 0) {
            try {
              window.indexedDB.deleteDatabase("browserfs");
            } catch {
              // Ignore errors to delete database
            }
          }
        },
        ONE_TIME_PASSIVE_EVENT,
      );
    } catch {
      resolve(false);
    }
  });

export const getKeyValStore = (): ReturnType<typeof openDB> =>
  openDB(KEYVAL_DB, 1, {
    upgrade: (db) => db.createObjectStore(KEYVAL_STORE_NAME),
  });

export const getFileSystemHandles = async (): Promise<FileSystemHandles> => {
  if (!(await supportsIndexedDB())) {
    return Object.create(null) as FileSystemHandles;
  }

  const db = await getKeyValStore();

  return (
    (await (db.get(
      KEYVAL_STORE_NAME,
      FS_HANDLES,
    ) as Promise<FileSystemHandles>)) ||
    (Object.create(null) as FileSystemHandles)
  );
};

export const get9pModifiedTime = (path: string): number =>
  get9pData(path, IDX_MTIME);
