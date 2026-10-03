import { ICONS, svgAttrs, type IconName } from "../../lib/admin/icons";

/**
 * React wrappers around the shared icon definitions.
 *
 * The path data lives in src/lib/admin/icons.ts so that the Astro shell, which
 * renders icons as markup strings, and these islands stay in sync. Every icon
 * here is a one-liner on purpose; adding one means adding an entry to ICONS and
 * an exported component, not another hand-copied <svg>.
 */

function render(name: IconName, className?: string) {
  return (
    <svg
      className={className || "w-5 h-5"}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...svgAttrs(name)}
      dangerouslySetInnerHTML={{ __html: ICONS[name].markup }}
    />
  );
}

export function IconExclamation({ className }: { className?: string }) {
  return render("exclamation", className);
}

export function IconClose({ className }: { className?: string }) {
  return render("close", className);
}

export function IconSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={`${className || "w-5 h-5"} animate-spin`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS.spinner.markup }}
    />
  );
}

export function IconLogout({ className }: { className?: string }) {
  return render("logout", className);
}

export function IconUsers({ className }: { className?: string }) {
  return render("users", className);
}

export function IconPets({ className }: { className?: string }) {
  return render("pets", className);
}

export function IconAlert({ className }: { className?: string }) {
  return render("alert", className);
}

export function IconHeart({ className }: { className?: string }) {
  return render("heart", className);
}

export function IconUsers2({ className }: { className?: string }) {
  return render("users2", className);
}

export function IconFile({ className }: { className?: string }) {
  return render("file", className);
}

export function IconComment({ className }: { className?: string }) {
  return render("comment", className);
}

export function IconBell({ className }: { className?: string }) {
  return render("bell", className);
}

export function IconFlag({ className }: { className?: string }) {
  return render("flag", className);
}

export function IconBlock({ className }: { className?: string }) {
  return render("block", className);
}

export function IconGrid({ className }: { className?: string }) {
  return render("grid", className);
}

export function IconChart({ className }: { className?: string }) {
  return render("chart", className);
}

export function IconSun({ className }: { className?: string }) {
  return render("sun", className);
}

export function IconMoon({ className }: { className?: string }) {
  return render("moon", className);
}

export function IconMenu({ className }: { className?: string }) {
  return render("menu", className);
}

export function IconChevronDown({ className }: { className?: string }) {
  return render("chevronDown", className);
}

export function IconChevronLeft({ className }: { className?: string }) {
  return render("chevronLeft", className);
}

export function IconChevronRight({ className }: { className?: string }) {
  return render("chevronRight", className);
}

export function IconSearch({ className }: { className?: string }) {
  return render("search", className);
}

export function IconRefresh({ className }: { className?: string }) {
  return render("refresh", className);
}

export function IconTrendUp({ className }: { className?: string }) {
  return render("trendUp", className);
}

export function IconTrendDown({ className }: { className?: string }) {
  return render("trendDown", className);
}

export function IconCheck({ className }: { className?: string }) {
  return render("check", className);
}

export function IconInbox({ className }: { className?: string }) {
  return render("inbox", className);
}

export function IconExternal({ className }: { className?: string }) {
  return render("external", className);
}