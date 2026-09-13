import { FiBarChart2, FiGrid, FiLink2, FiSettings } from "react-icons/fi";

/**
 * Sidebar navigation model.
 *
 * One entry per implemented route. Kept in its own module so the Sidebar
 * component file only exports a component (which keeps Fast Refresh working)
 * and so other surfaces can reuse the same list.
 */
export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/links", label: "My Links", icon: FiLink2, end: false },
  { to: "/analytics", label: "Analytics", icon: FiBarChart2, end: false },
  { to: "/settings", label: "Settings", icon: FiSettings, end: false },
];

export default NAV_ITEMS;
