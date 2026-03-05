import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "CinemaVerse", template: "%s · CinemaVerse" },
  description: "Discover movies with Web3 MetaMask authentication",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer
            className="mt-24 py-12"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-silver/35 text-sm">
                © {new Date().getFullYear()} CinemaVerse &nbsp;·&nbsp; Powered by TMDB
                &nbsp;·&nbsp; MetaMask Auth
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
