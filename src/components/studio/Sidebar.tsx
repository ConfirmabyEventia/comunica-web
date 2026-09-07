"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

/* =========================================================
   ICONOS
   ========================================================= */

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        color: active
          ? "var(--color-accent)"
          : "var(--color-text-secondary)",
      }}
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CommunicationIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        color: active
          ? "var(--color-accent)"
          : "var(--color-text-secondary)",
      }}
    >
      <rect
        x="5"
        y="4"
        width="14"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 8H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 12H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 16H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TemplateIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        color: active
          ? "var(--color-accent)"
          : "var(--color-text-secondary)",
      }}
    >
      <rect
        x="5"
        y="4"
        width="14"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 8H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 12H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 16H12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TablesIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        color: active
          ? "var(--color-accent)"
          : "var(--color-text-secondary)",
      }}
    >
      <circle
        cx="12"
        cy="5"
        r="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="6"
        cy="12"
        r="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="18"
        cy="12"
        r="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="19"
        r="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M10.5 6.5L7.5 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M13.5 6.5L16.5 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M7.5 13.5L10.5 17"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M16.5 13.5L13.5 17"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CodesIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        color: active
          ? "var(--color-accent)"
          : "var(--color-text-secondary)",
      }}
    >
      <path
        d="M9 7L5 12L9 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 7L19 12L15 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 5L11 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 5H6C5.45 5 5 5.45 5 6V18C5 18.55 5.45 19 6 19H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M14 8L18 12L14 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M18 12H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        color: "var(--color-text-muted)",
        transform: open
          ? "rotate(180deg)"
          : "rotate(0deg)",
        transition: "transform .2s ease",
      }}
    >
      <path
        d="M7 10L12 15L17 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   NAVEGACIÓN
   ========================================================= */

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
    label: "Plantillas",
    href: "/dashboard/templates",
    icon: TemplateIcon,
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

/* =========================================================
   SIDEBAR
   ========================================================= */

export default function Sidebar() {
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /* =======================================================
     CERRAR DROPDOWN AL HACER CLICK AFUERA
     ======================================================= */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [profileOpen]);

  /* =======================================================
     LOGOUT
     ======================================================= */

  async function handleLogout() {
    setProfileOpen(false);

    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    if (error) {
      console.error(
        "Error al cerrar sesión:",
        error
      );
      return;
    }

    window.location.replace("/");
  }

  return (
    <aside
      style={{
        width: "270px",
        minHeight: "100vh",
        background: "#FFFFFF",
        borderRight:
          "1px solid var(--color-border)",
        padding: "36px 24px",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* ===================================================
          BRAND
      =================================================== */}

      <Link
        href="/dashboard"
        style={{
          display: "block",
          textDecoration: "none",
          marginBottom: "52px",
        }}
      >
        <h1
          style={{
            fontFamily:
              "var(--font-display)",
            fontSize: "30px",
            lineHeight: 1,
            fontWeight: 400,
            color: "var(--color-text)",
            margin: 0,
          }}
        >
          Comunica
        </h1>

        <span
          style={{
            display: "block",
            marginTop: "6px",
            color: "var(--color-accent)",
            letterSpacing: "0.18em",
            fontSize: "0.72rem",
            lineHeight: 1,
            fontWeight: 500,
          }}
        >
          BY EVENSSE
        </span>
      </Link>

      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flex: 1,
        }}
      >
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
                borderRadius: "16px",
                textDecoration: "none",

                color: active
                  ? "var(--color-accent)"
                  : "var(--color-text-secondary)",

                background: active
                  ? "rgba(198, 169, 122, 0.16)"
                  : "transparent",

                fontWeight: active
                  ? 600
                  : 400,

                transition:
                  "background .2s ease, color .2s ease",
              }}
              onMouseEnter={(event) => {
                if (!active) {
                  event.currentTarget.style.background =
                    "rgba(198, 169, 122, 0.10)";

                  event.currentTarget.style.color =
                    "var(--color-accent)";
                }
              }}
              onMouseLeave={(event) => {
                if (!active) {
                  event.currentTarget.style.background =
                    "transparent";

                  event.currentTarget.style.color =
                    "var(--color-text-secondary)";
                }
              }}
            >
              <Icon active={active} />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ===================================================
          PROFILE
      =================================================== */}

      <div
        ref={profileRef}
        style={{
          position: "relative",
          borderTop:
            "1px solid var(--color-border)",
          paddingTop: "24px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            setProfileOpen(
              (current) => !current
            )
          }
          aria-expanded={profileOpen}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {/* INITIALS */}

          <div
            style={{
              width: "48px",
              height: "48px",
              minWidth: "48px",
              borderRadius: "50%",
              background:
                "rgba(198, 169, 122, 0.14)",
              color: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            LO
          </div>

          {/* USER */}

          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--color-text)",
              }}
            >
              Laura Ospina
            </p>

            <span
              style={{
                display: "block",
                marginTop: "3px",
                color:
                  "var(--color-text-muted)",
                fontSize: "12px",
              }}
            >
              Wedding Planner
            </span>
          </div>

          <ChevronIcon
            open={profileOpen}
          />
        </button>

        {/* =================================================
            PROFILE MENU
            SOLO CERRAR SESIÓN
        ================================================= */}

        {profileOpen && (
          <div
            style={{
              position: "absolute",
              left: "0",
              right: "0",
              bottom: "78px",
              background:
                "var(--color-white)",
              border:
                "1px solid var(--color-border)",
              borderRadius: "14px",
              padding: "8px",
              boxShadow:
                "0 12px 30px rgba(70, 60, 80, 0.10)",
              zIndex: 50,
            }}
          >
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: "none",
                background:
                  "transparent",
                borderRadius: "10px",
                padding:
                  "11px 12px",
                cursor: "pointer",
                color:
                  "var(--color-text-secondary)",
                fontSize: "13px",
                textAlign: "left",
                transition:
                  "all .2s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  "rgba(198, 169, 122, 0.10)";

                event.currentTarget.style.color =
                  "var(--color-accent)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  "transparent";

                event.currentTarget.style.color =
                  "var(--color-text-secondary)";
              }}
            >
              <LogoutIcon />

              <span>
                Cerrar sesión
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}