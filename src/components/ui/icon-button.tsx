"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "loadingText"> {
  "aria-label": string;
  icon: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, size = "icon", "aria-label": ariaLabel, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn("shrink-0", className)}
        aria-label={ariaLabel}
        title={ariaLabel}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton };
