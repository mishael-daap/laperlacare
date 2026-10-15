/**
 * The official Google mark, in its own four colours.
 *
 * The one place in the app that uses colours from outside the theme, and
 * deliberately so: Google's brand guidelines require the mark in these exact
 * colours, and a recoloured logo is a licence problem rather than a design
 * choice. Not routed through a theme token, because it is not ours to theme.
 *
 * Marked aria-hidden because the button already says "Continue with Google" —
 * announcing the logo as well would just repeat it.
 */
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.64h6.2a5.3 5.3 0 0 1-2.3 3.48v2.9h3.72c2.18-2.01 3.44-4.97 3.44-8.57Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.11 0 5.72-1.03 7.62-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.54-2.03-6.45-4.75H1.71v2.98A11.5 11.5 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.55 14.67a6.9 6.9 0 0 1 0-4.42V7.27H1.71a11.5 11.5 0 0 0 0 10.38l3.84-2.98Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.72 1.19 15.11 0 12 0 7.5 0 3.6 2.58 1.71 6.35l3.84 2.98C6.46 6.61 9 4.75 12 4.75Z"
      />
    </svg>
  );
}
