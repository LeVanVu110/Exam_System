import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

export default function Select({ className, ...props }) {
  return (
    <div className="relative inline-flex items-center w-full">
      <select
        className={cn(
          "flex-1 appearance-none rounded-md border border-gray-300 bg-white px-3 pr-10 py-[9px] text-sm text-gray-800 leading-none focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      <div className="absolute right-3 flex items-center pointer-events-none">
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>
    </div>
  );
}
