"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="bg-black text-white mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-5 justify-center text-sm">
          <Link href="/all-tools">All Tools</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/disclaimer">Disclaimer</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
        </div>
        <p className="text-center text-xs mt-4 opacity-70">© 2026 Lorem Pro Tool - All Rights Reserved</p>
      </div>
    </footer>
  );
}
