"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={
        active
          ? "var(--color-accent)"
          : "var(--color-text-secondary)"
      }
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function CommunicationIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={
        active
          ? "var(--color-accent)"
          : "var(--color-text-secondary)"
      }
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4.5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
      <path d="M7.5 10h9" />
      <path d="M7.5 13h6" />
    </svg>
  );
}

function TablesIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={
        active
          ? "var(--color-accent)"
          : "var(--color-text-secondary)"
      }
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3" />
      <path d="M5 20c.7-3.6 3-5.5 7-5.5s6.3 1.9 7 5.5" />
      <path d="M4 12h16" />
    </svg>
  );
}

function CodesIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={
        active
          ? "var(--color-accent)"
          : "var(--color-text-secondary)"
      }
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="6" height="6" />
      <rect x="14" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <path d="M15 14h2" />
      <path d="M19 14h1" />
      <path d="M14 18h2" />
      <path d="M18 18h2" />
      <path d="M14 21h6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-text-secondary)"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.5V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8.1 15a1.7 1.7 0 0 0-1.6-1H6.3v-2.5h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2H15v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14h-.2a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
  },
  {
    label: "Comunicaciones",
    href: "/dashboard/communications",
    icon: CommunicationIcon,
  },
  {
    label: "Mesas",
    href: "/dashboard/tables",
    icon: TablesIcon,
  },
  {
    label: "Códigos",
    href: "/dashboard/codes",
    icon: CodesIcon,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "304px",
        minHeight: "100vh",
        background: "#FFFFFF",
        borderRight: "1px solid var(--color-border)",
        padding: "44px 26px 30px",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* BRAND */}

      <Link
        href="/dashboard"
        style={{
          display: "block",
          paddingLeft: "2px",
          marginBottom: "62px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.25rem",
            lineHeight: 0.95,
            fontWeight: 500,
            color: "var(--color-text)",
            letterSpacing: "-0.025em",
          }}
        >
          Comunica
        </div>

        <div
          style={{
            marginTop: "9px",
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            lineHeight: 1,
            letterSpacing: "0.24em",
            color: "var(--color-accent)",
          }}
        >
          STUDIO
        </div>
      </Link>

      {/* NAVIGATION */}

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "7px",
        }}
      >
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                minHeight: "52px",
                padding: "0 18px",
                borderRadius: "18px",
                background: isActive
                  ? "rgba(210, 194, 163, 0.20)"
                  : "transparent",
                color: isActive
                  ? "var(--color-accent)"
                  : "var(--color-text)",
                fontSize: "1rem",
                fontWeight: isActive ? 500 : 400,
                transition: "background 0.2s ease",
              }}
            >
              <Icon active={isActive} />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          height: "1px",
          background: "var(--color-border)",
          margin: "30px 10px",
        }}
      />

      <div style={{ flex: 1 }} />

      {/* SETTINGS */}

      <Link
        href="/dashboard/settings"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          minHeight: "52px",
          padding: "0 18px",
          borderRadius: "18px",
          color: "var(--color-text)",
          fontSize: "1rem",
        }}
      >
        <SettingsIcon />

        <span>Configuración</span>
      </Link>
    </aside>
  );
}