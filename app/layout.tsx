import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GlobalBannerWrapper from "./components/GlobalBannerWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <GlobalBannerWrapper />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
