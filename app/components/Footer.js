import Link from "next/link";
export default function Footer() {
  return (
    <footer className="bg-black text-white py-6 mt-10">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm">
        <div className="flex flex-wrap justify-center gap-5 mb-3">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/disclaimer">Disclaimer</Link>
          <Link href="/terms">Terms</Link>
        </div>
        <p className="opacity-60 text-xs">© 2026 Lorem Pro Tool - All Rights Reserved</p>
      </div>
    </footer>
  );
}
