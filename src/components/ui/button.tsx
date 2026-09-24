import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  [
    "group/button",
    "relative inline-flex shrink-0 items-center justify-center",
    "rounded-lg border border-transparent",
    "bg-clip-padding",
    "text-sm font-medium whitespace-nowrap",
    "select-none",
    "outline-none",
    "transition-all duration-200 ease-out",
    "will-change-transform",
    "cursor-pointer",

    // Focus
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ring/50",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background",

    // Press
    "active:scale-[0.97]",
    "active:transition-transform",
    "active:duration-100",

    // Disabled
    "disabled:pointer-events-none",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",

    // Invalid
    "aria-invalid:border-destructive",
    "aria-invalid:ring-2",
    "aria-invalid:ring-destructive/20",

    // Icons
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
    "[&_svg]:transition-transform",
    "[&_svg]:duration-200",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-sm shadow-primary/20",

          // Hover
          "hover:bg-primary/90",
          "hover:-translate-y-px",
          "hover:shadow-md hover:shadow-primary/20",

          // Active
          "active:translate-y-0",
          "active:shadow-sm",

          // Icon interaction
          "[&_svg]:group-hover/button:translate-x-0.5",
        ].join(" "),

        outline: [
          "border-border",
          "bg-background",
          "text-foreground",
          "shadow-sm",

          "hover:bg-muted",
          "hover:border-border/80",
          "hover:-translate-y-px",
          "hover:shadow-md",

          "active:translate-y-0",
          "active:shadow-sm",
        ].join(" "),

        secondary: [
          "bg-secondary",
          "text-secondary-foreground",
          "shadow-sm",

          "hover:bg-secondary/80",
          "hover:-translate-y-px",
          "hover:shadow-md",

          "active:translate-y-0",
        ].join(" "),

        ghost: [
          "text-foreground",

          "hover:bg-muted",
          "hover:text-foreground",

          "active:scale-[0.98]",
        ].join(" "),

        destructive: [
          "bg-destructive",
          "text-destructive-foreground",
          "shadow-sm shadow-destructive/20",

          "hover:bg-destructive/90",
          "hover:-translate-y-px",
          "hover:shadow-md hover:shadow-destructive/20",

          "active:translate-y-0",
        ].join(" "),

        link: [
          "text-primary",
          "underline-offset-4",

          "hover:underline",
          "hover:text-primary/80",

          "active:opacity-70",
        ].join(" "),
      },

      size: {
        default:
          "h-9 gap-1.5 px-3 rounded-lg",

        xs:
          "h-6 gap-1 rounded-md px-2 text-xs",

        sm:
          "h-8 gap-1 rounded-lg px-2.5 text-[0.8rem]",

        lg:
          "h-10 gap-2 rounded-lg px-4",

        icon:
          "size-9",

        "icon-xs":
          "size-6 rounded-md",

        "icon-sm":
          "size-8 rounded-lg",

        "icon-lg":
          "size-10 rounded-lg",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        })
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }