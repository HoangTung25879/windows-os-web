import { ComponentProcessProps } from "@/app/components/Apps/RenderComponent";
import { Size } from "../session/types";
import {
  FileReaders,
  ObjectReaders,
} from "@/app/components/Dialogs/Transfer/useTransferDiaglog";
import { Prettify } from "@/lib/types";

export type ProcessElements = {
  componentWindow?: HTMLElement;
  peekElement?: HTMLElement;
  taskbarEntry?: HTMLElement;
};

export type RelativePosition = {
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
};

type BaseProcessArguments = {
  allowResizing?: boolean;
  autoSizing?: boolean;
  backgroundColor?: string;
  dependantLibs?: string[];
  hideMaximizeButton?: boolean;
  hideMinimizeButton?: boolean;
  hideTaskbarEntry?: boolean;
  hideTitlebar?: boolean;
  hideTitlebarIcon?: boolean;
  initialRelativePosition?: RelativePosition;
  libs?: string[];
  lockAspectRatio?: boolean;
  url?: string;
};

type DialogProcessArguments = {
  fileReaders?: FileReaders | ObjectReaders;
  progress?: number;
  shortcutPath?: string;
};

export type ProcessArguments = Prettify<
  BaseProcessArguments & DialogProcessArguments
>;

export type Process = Prettify<
  ProcessArguments &
    ProcessElements & {
      Component: React.ComponentType<ComponentProcessProps>;
      closing?: boolean;
      defaultSize?: Size;
      dialogProcess?: boolean;
      hasWindow?: boolean;
      icon: string;
      maximized?: boolean;
      minimized?: boolean;
      preferProcessIcon?: boolean;
      singleton?: boolean;
      title: string;
    }
>;

export type Processes = Record<string, Process>;
