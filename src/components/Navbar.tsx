"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { BrainCircuit, LayoutDashboard, History, FileSearch, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = session
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/analyze", label: "Analyze", icon: FileSearch },
        { href: "/history", label: "History", icon: History },
      ]
    : [];

  return (
    <nav
      className="glass-strong no-pad"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "0.625rem",
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BrainCircuit size={18} color="white" />
          </div>
          <span style={{ fontFamily: "Sora, Inter, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            Resume<span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} className="desktop-nav">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.625rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: active ? "#f1f5f9" : "#64748b",
                  background: active ? "rgba(6, 182, 212, 0.12)" : "transparent",
                  transition: "all 0.2s",
                }}
              >
                <Icon size={15} />
                {link.label}
              </Link>
            );
          })}

          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link href="/auth/login" className="btn-secondary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem", textDecoration: "none" }}>
                Login
              </Link>
              <Link href="/auth/register" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem", textDecoration: "none" }}>
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", color: "#f1f5f9", cursor: "pointer", display: "none" }}
          className="mobile-menu-btn"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="glass-strong"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "1.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="glass-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem 1.25rem",
                  borderRadius: "0.75rem",
                  textDecoration: "none",
                  color: "#f1f5f9",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.2s ease",
                }}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
          {session ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary" style={{ fontSize: "0.875rem" }}>
              Sign Out
            </button>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="btn-secondary" style={{ textDecoration: "none", textAlign: "center" }}>Login</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ textDecoration: "none", textAlign: "center" }}>Get Started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }

        @media (max-width: 480px) {
          nav > div { padding: 0 1rem; height: 64px; }
          .glass-strong { backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important; }
        }
      `}</style>
    </nav>
  );
}
