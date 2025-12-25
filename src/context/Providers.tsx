"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PBPContextProvider } from "./PBPContext";
import { DBPContextProvider } from "./DBPContext";
import { GamelogContextProvider } from "./GamelogContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <GamelogContextProvider>
        <PBPContextProvider>
          <DBPContextProvider>{children}</DBPContextProvider>
        </PBPContextProvider>
      </GamelogContextProvider>
    </ThemeProvider>
  );
}
