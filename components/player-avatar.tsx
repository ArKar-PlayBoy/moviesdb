interface PlayerAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-20 h-20",
  xl: "w-28 h-28",
};

const iconSizeMap = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-10 w-10",
  xl: "h-14 w-14",
};

export default function PlayerAvatar({ name, photoUrl, size = "md", className = "" }: PlayerAvatarProps) {
  const photo = photoUrl === undefined ? null : photoUrl;

  if (photo) {
    return (
      <div
        className={`${sizeMap[size]} rounded-full ring-2 ring-border shrink-0 bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url(${photo})` }}
        role="img"
        aria-label={name}
      />
    );
  }

  return (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center ring-2 ring-green-500/20 ${className}`}>
      <FootballIcon className={iconSizeMap[size]} />
    </div>
  );
}

function FootballIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`text-green-600 ${className || "h-6 w-6"}`}>
      <circle cx="12" cy="5" r="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 22c0-4 3.5-7 7-7s7 3 7 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13l-3 2" strokeLinecap="round" />
      <path d="M16 13l3 2" strokeLinecap="round" />
      <circle cx="19" cy="6" r="2.5" fill="currentColor" stroke="none" />
      <path d="M17.5 5l1.5 2M20.5 5l-1.5 2" stroke="white" strokeWidth="0.5" />
    </svg>
  );
}
