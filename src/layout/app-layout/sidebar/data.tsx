import {
  BoxIcon,
  CalendarIcon,
  LayoutGridIcon,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PluginIcon,
  TableIcon,
  UserCircleIcon,
  CameraIcon,
  UserIcon,
  UsersIcon,
  LockIcon,
  BarChartIcon,
  GlobeIcon,
  KeyIcon,
  ChipIcon,
  FileIcon,
  GearIcon,
  ClockIcon,
  LogOutIcon,

} from "@/icons";

import {
  MdDashboard,
  MdFormatListBulleted,
  MdAccountCircle,
  MdCalendarMonth,
  MdTableChart,
  MdInsertDriveFile
} from "react-icons/md";


import type { NavItem } from "./types";


export const operationsItems: NavItem[] = [
  {
    icon: <LayoutGridIcon className="size-6" />,
    key: "dashboard",
    path: "/dashboard",
  },
  {
    icon: <CameraIcon className="size-6" />,
    key: "liveMonitoring",
    path: "/live-monitoring",
  },
  {
    icon: <UserIcon className="size-6" />,
    key: "employeeAccess",
    path: "/employee-access",
  },
  {
    icon: <UsersIcon className="size-6" />,
    key: "visitorManagement",
    path: "/visitor-management",
  },
  {
    icon: <LockIcon className="size-6" />,
    key: "gateControl",
    path: "/gate-control",
  },
  {
    icon: <ListIcon className="size-6" />,
    key: "accessLogs",
    path: "/access-logs",
  },
  {
    icon: <BarChartIcon className="size-6" />,
    key: "reports",
    path: "/reports",
  },
];

export const administrationItems: NavItem[] = [
  {
    icon: <BoxIcon className="size-6" />,
    key: "buildingManagement",
    path: "/building-management",
  },
  {
    icon: <GlobeIcon className="size-6" />,
    key: "organizationManagement",
    path: "/organization-management",
  },
  {
    icon: <UsersIcon className="size-6" />,
    key: "employeeManagement",
    path: "/employee-management",
  },
  {
    icon: <KeyIcon className="size-6" />,
    key: "credentialManagement",
    path: "/credential-management",
  },
  {
    icon: <UserCircleIcon className="size-6" />,
    key: "userManagement",
    path: "/user-management",
  },
  {
    icon: <LockIcon className="size-6" />,
    key: "rolePermissionManagement",
    path: "/role-permission-management",
  },
  {
    icon: <LockIcon className="size-6" />,
    key: "gateManagement",
    path: "/gate-management",
  },
  {
    icon: <ChipIcon className="size-6" />,
    key: "deviceManagement",
    path: "/device-management",
  },
  {
    icon: <FileIcon className="size-6" />,
    key: "auditLogs",
    path: "/audit-logs",
  },
  {
    icon: <GearIcon className="size-6" />,
    key: "systemSettings",
    path: "/system-settings",
  },
];

export const accountItems: NavItem[] = [
  {
    icon: <UserCircleIcon className="size-6" />,
    key: "myProfile",
    path: "/my-profile",
  },
  {
    icon: <KeyIcon className="size-6" />,
    key: "changePassword",
    path: "/change-password",
  },
  {
    icon: <ClockIcon className="size-6" />,
    key: "mySessions",
    path: "/my-sessions",
  },
  {
    icon: <LogOutIcon className="size-6" />,
    key: "logout",
    path: "/logout",
  },
];


  




export const navItems: NavItem[] = [
  {
    icon: <LayoutGridIcon className="size-6" />,
    key: "dashboard",
    subItems: [{ key: "ecommerceHome", path: "/" }],
  },
  {
    icon: <CalendarIcon className="size-6" />,
    key: "calendar",
    path: "/calendar",
  },
  {
    icon: <UserCircleIcon className="size-6" />,
    key: "userProfile",
    path: "/profile",
  },
  {
    key: "forms",
    icon: <ListIcon className="size-6" />,
    subItems: [{ key: "formElements", path: "/form-elements", pro: false }],
  },
  {
    key: "tables",
    icon: <TableIcon className="size-6" />,
    subItems: [{ key: "basicTables", path: "/basic-tables", pro: false }],
  },
  {
    key: "pages",
    icon: <PageIcon className="size-6" />,
    subItems: [
      { key: "blankPage", path: "/blank" },
      { key: "error404", path: "/error-404" },
    ],
  },
];

export const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon className="size-6" />,
    key: "charts",
    subItems: [
      { key: "lineChart", path: "/line-chart", pro: false },
      { key: "barChart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxIcon className="size-6" />,
    key: "uiElements",
    subItems: [
      { key: "alerts", path: "/alerts" },
      { key: "avatar", path: "/avatars" },
      { key: "badge", path: "/badge" },
      { key: "buttons", path: "/buttons" },
      { key: "images", path: "/images" },
      { key: "videos", path: "/videos" },
    ],
  },
  {
    icon: <PluginIcon className="size-6" />,
    key: "authentication",
    subItems: [
      { key: "signIn", path: "/signin", pro: false },
      { key: "signUp", path: "/signup", pro: false },
    ],
  },
];

export const supportItems: NavItem[] = [];
