import { cn } from "@/lib/utils";

export function GgkLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("fill-current", className)}
    >
      <circle cx="50" cy="50" r="25" fill="white" />
      <path
        d="M 50,5 A 45,45 0 1,1 50,95 A 45,45 0 1,1 50,5 M 50,20 A 30,30 0 1,0 50,80 A 30,30 0 1,0 50,20"
        fillRule="evenodd"
        fill="currentColor"
      />
      <circle cx="20.5" cy="69.5" r="7" fill="currentColor" />
      <rect x="23" y="66" width="10" height="7" fill="currentColor" transform="rotate(-45 23 66)" />
    </svg>
  );
}
