import "./globals.css";
import { Providers } from "./providers";
import NavBar from "../components/ui/NavBar";

export default function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="en" className='dark'>
      <body>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}