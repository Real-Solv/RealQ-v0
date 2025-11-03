"use client"

import * as React from "react"
import {
  Accordion as RadixAccordion,
  AccordionItem as RadixAccordionItem,
  AccordionTrigger as RadixAccordionTrigger,
  AccordionContent as RadixAccordionContent,
} from "@radix-ui/react-accordion"
import { cn } from "@/lib/utils"

export const Accordion = RadixAccordion

export const AccordionItem = RadixAccordionItem

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof RadixAccordionTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixAccordionTrigger>
>(({ className, children, ...props }, ref) => (
  <RadixAccordionTrigger
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between py-2 px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
      className
    )}
    {...props}
  >
    {children}
  </RadixAccordionTrigger>
))
AccordionTrigger.displayName = "AccordionTrigger"

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof RadixAccordionContent>,
  React.ComponentPropsWithoutRef<typeof RadixAccordionContent>
>(({ className, children, ...props }, ref) => (
  <RadixAccordionContent
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
      className
    )}
    {...props}
  >
    {children}
  </RadixAccordionContent>
))
AccordionContent.displayName = "AccordionContent"
