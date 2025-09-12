import { cn } from "@/lib/utils";

export function GgkLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <defs>
        <g id="person-figure">
          <path d="M -5.5,0 a 5.5,5.5 0 1 1 11,0 a 5.5,5.5 0 1 1 -11,0" />
          <path d="M -9,-14 a 9,9 0 0 1 18,0 z" />
        </g>
      </defs>

      <circle cx="50" cy="50" r="50" fill="white" />
      <circle cx="50" cy="50" r="21" fill="hsl(var(--accent))" />
      <circle cx="50" cy="50" r="10.5" fill="white" />

      <g fill="hsl(var(--accent))" transform="translate(50 50)">
        <use href="#person-figure" transform="rotate(0) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(22.5) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(45) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(67.5) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(90) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(112.5) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(135) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(202.5) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(225) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(247.5) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(270) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(292.5) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(315) translate(0 -35)" />
        <use href="#person-figure" transform="rotate(337.5) translate(0 -35)" />
      </g>
      <g fill="hsl(var(--primary))" transform="translate(50 50)">
        <use href="#person-figure" transform="rotate(180) translate(0 -35)" />
      </g>
    </svg>
  );
}
