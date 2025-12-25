import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NBAtool - NBA Matchup Analysis",
  description:
    "Quick access to play-by-play positional statistics and team defensive data to predict any NBA matchup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <Providers>
          <main className="container mx-auto px-4 py-6">
            <Header />
            {children}
            <footer className="mt-8 text-xs text-muted-foreground">
              <div>
                Position Data Provided By{" "}
                <a
                  href="https://www.basketball-reference.com/"
                  className="underline hover:text-[var(--nba-logo-orange)]"
                >
                  Basketball-Reference.com
                </a>
              </div>
              <div>
                Defensive Data Provided By{" "}
                <a
                  href="https://www.fantasypros.com/daily-fantasy/nba/fanduel-defense-vs-position.php"
                  className="underline hover:text-[var(--nba-logo-orange)]"
                >
                  FantasyPros.com
                </a>
              </div>
            </footer>
          </main>
        </Providers>
      </body>
    </html>
  );
}
