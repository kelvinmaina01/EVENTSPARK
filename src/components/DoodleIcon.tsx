import { LucideIcon } from "lucide-react";

interface DoodleIconProps {
  icon: LucideIcon;
  colorClass: string;
  size?: number;
  className?: string;
  blobClassName?: string;
}

export function DoodleIcon({ 
  icon: Icon, 
  colorClass, 
  size = 20,
  className = "",
  blobClassName = ""
}: DoodleIconProps) {
  return (
    <div className={`relative inline-flex items-center justify-center group ${className}`} style={{ width: size + 12, height: size + 12 }}>
      {/* The organic, slightly rotated watercolor blob */}
      <div 
        className={`absolute inset-0 opacity-[0.85] rotate-6 scale-90 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-95 ${colorClass} ${blobClassName}`} 
        style={{
          // Custom organic border radius to mimic watercolor strokes/blobs
          borderRadius: '50% 50% 50% 50% / 60% 40% 60% 40%',
        }}
      />
      {/* The crisp black outline icon */}
      <Icon 
        className="relative z-10 text-[#19192E] dark:text-white" 
        size={size} 
        strokeWidth={2.5} 
      />
    </div>
  );
}
