import type {Metadata} from "next";
import {Geist, Geist_Mono, Inter} from "next/font/google";
import "@/styles/globals.css";
import {cn} from "@/utils/tailwind.utils";
import {ThemeProvider} from "@/components/providers/theme.provider";
import {ReactQueryClientProvider} from "@/components/providers/react-query-client-provider";
import {ThemeToggle} from "@/components/common/theme-toggle";

const inter = Inter({subsets: ["latin"], variable: "--font-sans"});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Clio",
  description: "Tool for managing products"
};

const RootLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ReactQueryClientProvider>
            <ThemeToggle />
            {children}
          </ReactQueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
