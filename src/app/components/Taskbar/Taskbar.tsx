"use client";

import React, { useCallback, useState } from "react";
import StartButton from "./StartButton/StartButton";
import Clock from "./Clock/Clock";
import Calendar from "./Calendar/Calendar";
import { AnimatePresence } from "framer-motion";
import { FOCUSABLE_ELEMENT } from "@/lib/constants";
import StartMenu from "./StartMenu/StartMenu";
import Tabs from "./Tabs/Tabs";
import SearchBar from "./Search/SearchBar";
import SearchPanel from "./Search/SearchPanel";

const Taskbar = () => {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [startMenuVisible, setStartMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  const toggleSearch = useCallback(
    (showSearch?: boolean): void =>
      setSearchVisible(
        (currentSearchState) => showSearch ?? !currentSearchState,
      ),
    [],
  );

  const toggleStartMenu = useCallback(
    (showMenu?: boolean): void =>
      setStartMenuVisible((currentMenuState) => showMenu ?? !currentMenuState),
    [],
  );

  const toggleCalendar = useCallback(
    (showCalendar?: boolean): void =>
      setCalendarVisible(
        (currentCalendarState) => showCalendar ?? !currentCalendarState,
      ),
    [],
  );

  return (
    <>
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {startMenuVisible && <StartMenu toggleStartMenu={toggleStartMenu} />}
        {searchVisible && (
          <SearchPanel key="search" toggleSearch={toggleSearch} />
        )}
      </AnimatePresence>
      <footer
        className="fixed bottom-0 left-0 z-[1000] flex h-[var(--taskbar-height)] w-screen
          items-center bg-taskbar-background"
        {...FOCUSABLE_ELEMENT}
      >
        <StartButton
          toggleStartMenu={toggleStartMenu}
          startMenuVisible={startMenuVisible}
        />
        <SearchBar searchVisible={searchVisible} toggleSearch={toggleSearch} />
        <Tabs />
        <Clock toggleCalendar={toggleCalendar} />
      </footer>
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {calendarVisible && <Calendar toggleCalendar={toggleCalendar} />}
      </AnimatePresence>
    </>
  );
};

export default Taskbar;
