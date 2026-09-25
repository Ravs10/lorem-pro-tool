import "./globals.css";
import Navbar from "./components/Navbar";
//import Footer from "./components/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f8f9ff" }}>
        <Navbar />
        {children}
        {/*<Footer />*/} 
      </body>
    </html>
  );
}
