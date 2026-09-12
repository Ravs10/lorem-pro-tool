    export const metadata = { title: "Lorem Pro" };
    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return <html><body style={{margin:0, fontFamily:'sans-serif'}}>{children}</body></html>
    }
