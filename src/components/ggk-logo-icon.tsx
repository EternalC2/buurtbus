import { cn } from "@/lib/utils";
import Image from "next/image";

export function GgkLogoIcon({ className }: { className?: string }) {
  return (
    <Image
      src="https://media.discordapp.net/attachments/1414576010036379739/1416006402849116160/11zon_cropped.png?ex=68c5463a&is=68c3f4ba&hm=fd70436af7805d1ea09c720575c92a6ec5c4ea774c3e10e99fd6088ae7d73cf3&=&format=webp&quality=lossless&width=554&height=554"
      alt="GGK Logo"
      className={cn(className)}
      width={554}
      height={554}
    />
  );
}
