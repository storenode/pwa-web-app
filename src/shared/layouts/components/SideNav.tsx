import { useState } from "react";
import { Link, matchPath } from "react-router-dom";
import { useNavStore } from "../../store/navStore";
import { useNodesStore } from "../../store/nodesStore";
import { idCodec } from "../../store/idCodecStore";
import { CAPABILITIES } from "../../capabilities";
import { LogoLight } from "../../components/LogoLight";
import { LogoDark } from "../../components/LogoDark";

interface NavChild {
  label: string;
  path: string;
  /** Only rendered if the user holds this capability (see capabilities.ts). */
  capability?: string;
}

interface NavItem extends NavChild {
  icon: React.ReactNode;
  children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    capability: CAPABILITIES["dashboard:view"],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="2"
        fill="none"
        stroke="currentColor"
        className="my-1.5 inline-block size-4"
      >
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      </svg>
    ),
  },
  {
    label: "Inventory",
    path: "/inventory/",
    capability: CAPABILITIES["suppliers:view"],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
        />
      </svg>
    ),
    children: [
      {
        label: "Suppliers",
        path: "/inventory/suppliers",
        capability: CAPABILITIES["suppliers:manage"],
      },
      {
        label: "Purchase Invoices",
        path: "/inventory/invoices",
        capability: CAPABILITIES["supplier_invoices:manage"],
      },
      // GRN / Stock Transfers land here later, same pattern
    ],
  },
  {
    label: "Account",
    path: "/node/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
        />
      </svg>
    ),
    children: [
      {
        label: "Browse All",
        path: "/node/",
        capability: CAPABILITIES["nodes:browse_all"],
      },
      {
        label: "Add-Edit Nodes",
        path: "/node/:nodeId",
        capability: CAPABILITIES["nodes:manage"],
      },
      {
        label: "Rewards",
        path: "/node/:nodeId/rewards",
        capability: CAPABILITIES["rewards:view"],
      },
      {
        label: "Voice Reviews",
        path: "/node/:nodeId/voice-reviews",
        capability: CAPABILITIES["voice_reviews:view"],
      },
    ],
  },
];

function normalizePath(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function isPathActive(pattern: string, current: string) {
  return !!matchPath(
    { path: normalizePath(pattern), end: !pattern.includes(":") },
    current,
  );
}

export default function SideNav() {
  const activeLink = useNavStore((state) => state.activeLink);
  const memberships = useNodesStore((state) => state.memberships);
  const activeNodeId = useNodesStore((state) => state.activeNodeId);
  const hasCapability = useNodesStore((state) => state.hasCapability);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const canView = (capability?: string) =>
    !capability || hasCapability(capability);

  // Some nav entries (e.g. "Rewards") are node-specific route patterns —
  // resolve ":nodeId" to the user's own brand (or their first membership,
  // for non-brand-admin roles) rather than linking to the literal ":nodeId"
  // segment, which react-router would otherwise treat as the actual param.
  const primaryNodeId =
    activeNodeId ??
    memberships.find((m) => m.role?.roleKey === "brand_admin")?.nodeId ??
    memberships[0]?.nodeId;

  const resolveHref = (path: string) =>
    primaryNodeId
      ? path.replace(":nodeId", idCodec.encodeId(primaryNodeId))
      : path;

  const canResolve = (path: string) =>
    !path.includes(":nodeId") || !!primaryNodeId;

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => canView(item.capability) && canResolve(item.path),
  ).map((item) => ({
    ...item,
    children: item.children?.filter(
      (child) => canView(child.capability) && canResolve(child.path),
    ),
  }));

  return (
    <div className="flex min-h-full flex-col items-start bg-base-50 border-r border-base-300 is-drawer-close:w-14 is-drawer-open:w-64">
      <div className="flex flex-col items-center w-full items-center justify-center py-4 px-2 is-drawer-close:hidden">
        <div className="flex justify-end w-full">
          <label
            htmlFor="dashboard-drawer"
            aria-label="close sidebar"
            className="btn btn-link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </label>
        </div>
        <a
          rel="noopener noreferrer"
          href="#"
          aria-label="Back to homepage"
          className="flex items-center p-2"
        >
          <LogoLight className="h-20 sm:h-18 w-auto shrink-0 dark:hidden" />
          <LogoDark className="h-20 sm:h-18 w-auto shrink-0 hidden dark:block" />
        </a>
      </div>
      <ul className="menu w-full grow">
        {visibleNavItems.map((item) => {
          if (!item.children) {
            return (
              <li key={item.path} className="py-2">
                <Link
                  to={resolveHref(item.path)}
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right ${
                    isPathActive(item.path, activeLink) ? "menu-active" : ""
                  }`}
                  data-tip={item.label}
                >
                  {item.icon}
                  <span className="is-drawer-close:hidden">{item.label}</span>
                </Link>
              </li>
            );
          }

          const groupActive = item.children.some((child) =>
            isPathActive(child.path, activeLink),
          );
          const isOpen = openGroups[item.path] ?? groupActive;

          return (
            <li key={item.path} className="py-2">
              <details
                open={isOpen}
                onToggle={(e) => {
                  const open = e.currentTarget.open;
                  setOpenGroups((prev) => ({ ...prev, [item.path]: open }));
                }}
              >
                <summary
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right ${
                    groupActive ? "menu-active" : ""
                  }`}
                  data-tip={item.label}
                >
                  {item.icon}
                  <span className="is-drawer-close:hidden">{item.label}</span>
                </summary>
                <ul className="is-drawer-close:hidden">
                  {item.children.map((child) => (
                    <li key={child.path} className="py-2">
                      <Link
                        to={resolveHref(child.path)}
                        className={
                          isPathActive(child.path, activeLink)
                            ? "menu-active"
                            : ""
                        }
                      >
                        <span className="is-drawer-close:hidden">
                          {child.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
