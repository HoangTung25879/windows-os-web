import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        itemMenuHover: "hsla(0, 0%, 35%, 70%)",
        background: "#000",
        fileEntry: {
          background: "hsla(207, 30%, 72%, 25%)",
          backgroundFocused: "hsla(207, 60%, 72%, 35%)",
          backgroundFocusedHover: "hsla(207, 90%, 72%, 30%)",
          border: "hsla(207, 30%, 72%, 30%)",
          borderFocused: "hsla(207, 60%, 72%, 35%)",
          borderFocusedHover: "hsla(207, 90%, 72%, 40%)",
          text: "#FFF",
          textShadow: `
            0 0 1px rgba(0, 0, 0, 75%),
            0 0 2px rgba(0, 0, 0, 50%),
            0 1px 1px rgba(0, 0, 0, 75%),
            0 1px 2px rgba(0, 0, 0, 50%),
            0 2px 1px rgba(0, 0, 0, 75%),
            0 2px 2px rgba(0, 0, 0, 50%)`,
        },
        highlight: "hsla(207, 100%, 72%, 90%)",
        progress: "hsla(113, 78%, 56%, 90%)",
        progressBackground: "hsla(104, 22%, 45%, 70%)",
        progressBarRgb: "rgb(6, 176, 37)",
        selectionHighlight: "hsla(207, 100%, 45%, 90%)",
        selectionHighlightBackground: "hsla(207, 100%, 45%, 30%)",
        taskbar: {
          active: "hsla(0, 0%, 20%, 70%)",
          activeForeground: "hsla(0, 0%, 40%, 70%)",
          background: "hsla(0, 0%, 10%, 70%)",
          button: {
            color: "#FFF",
          },
          foreground: "hsla(0, 0%, 35%, 70%)",
          foregroundHover: "hsla(0, 0%, 45%, 70%)",
          foregroundProgress: "hsla(104, 22%, 45%, 30%)",
          hover: "hsla(0, 0%, 25%, 70%)",
          peekBorder: "hsla(0, 0%, 50%, 50%)",
        },
        text: "rgba(255, 255, 255, 90%)",
        titleBar: {
          background: "rgb(25, 25, 25)",
          button: "rgb(255, 255, 255)",
          buttonInactive: "rgb(128, 128, 128)",
          buttonHover: "rgb(39, 39, 39)",
          closeHover: "rgb(232, 17, 35)",
          text: "rgb(255, 255, 255)",
          textInactive: "rgb(170, 170, 170)",
          border: "rgb(43, 43, 43)",
        },
        statusBar: {
          background: "rgb(51, 51, 51)",
          text: "rgb(247, 247, 247)",
        },
        navigationBar: {
          background: "rgb(25, 25, 25)",
          button: "rgb(255, 255, 255)",
          buttonHover: "rgb(27, 41, 49)",
          buttonDisabled: "rgb(140, 140, 140)",
          text: "rgb(255, 255, 255)",
          border: "rgb(83, 83, 83)",
        },
        window: {
          background: "rgb(39, 39, 39)",
          outline: "hsla(0, 0%, 25%, 75%)",
          outlineInactive: "hsla(0, 0%, 30%, 100%)",
          shadow: "0 0 14px 0 rgba(0, 0, 0, 50%)",
          shadowInactive: "0 0 10px 0 rgba(0, 0, 0, 45%)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
