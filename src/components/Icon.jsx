const icons = {
  ai: (
    <>
      <path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
      <path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
    </>
  ),
  arrow: <path d="M5 12h13m-5-5 5 5-5 5" />,
  book: (
    <>
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" />
      <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 22h4M8.4 14.6A6 6 0 1 1 15.6 14.6c-.9.7-1.3 1.6-1.4 2.4h-4.4c-.1-.8-.5-1.7-1.4-2.4Z" />
      <path d="M12 2V0M4.9 4.9 3.5 3.5M19.1 4.9l1.4-1.4M4 11H2M22 11h-2" />
    </>
  ),
  check: <path d="m5 12 4.5 4.5L19 7" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  fire: (
    <path d="M12 22c4 0 7-2.6 7-6.5 0-2.7-1.6-5.3-4-7.5.2 2-1 3.5-2.1 4.2.1-3.6-1.8-6.8-4.6-9.2.2 3.5-3.3 6-3.3 10.5C5 18.3 8 22 12 22Z" />
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  lotus: (
    <>
      <path d="M12 20c-4.4-2.4-5.5-6-4.2-10 2.6 1 4.2 3.2 4.2 6.6C12 13.2 13.6 11 16.2 10c1.3 4-.1 7.6-4.2 10Z" />
      <path d="M12 13c-2.1-2.9-2.1-6 0-9 2.1 3 2.1 6.1 0 9ZM8 17c-3.2-.4-5.2-2.2-6-5 2.6-.3 4.6.5 6 2.5M16 17c3.2-.4 5.2-2.2 6-5-2.6-.3-4.6.5-6 2.5M5 20h14" />
    </>
  ),
  levels: (
    <>
      <path d="M6 20v-6M12 20V9M18 20V4" />
      <path d="M4 20h4M10 20h4M16 20h4" />
    </>
  ),
  message: (
    <>
      <path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.7L3 21l1.8-5.1A8.5 8.5 0 1 1 21 11.5Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8 6 4-6 4V8Z" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-.9.8-1.8 1.3-1.8 2.8M12 17h.01" />
    </>
  ),
  spark: (
    <>
      <path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
      <path d="m4 16 .8 2.2L7 19l-2.2.8L4 22l-.8-2.2L1 19l2.2-.8L4 16ZM20 3v3M18.5 4.5h3" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 2h6M12 2v3M18 6l1.5-1.5" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
};

export default function Icon({ name, size = 24, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
    >
      {icons[name]}
    </svg>
  );
}
