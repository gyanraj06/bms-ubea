"use client"

import * as React from "react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-base font-semibold text-gray-900",
        nav: "space-x-1 flex items-center",
        button_previous: "absolute left-1 h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-md inline-flex items-center justify-center transition-all",
        button_next: "absolute right-1 h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-md inline-flex items-center justify-center transition-all",
        month_grid: "w-full border-collapse mt-2",
        weekdays: "flex",
        weekday: "text-gray-600 w-10 font-semibold text-xs uppercase text-center py-2",
        week: "flex w-full mt-0.5",
        day: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: "h-10 w-10 p-0 font-normal rounded-md hover:bg-gray-100 transition-colors inline-flex items-center justify-center aria-selected:opacity-100",
        range_end: "day-range-end",
        selected: "bg-brown-dark text-white hover:bg-brown-dark hover:text-white focus:bg-brown-dark focus:text-white font-semibold",
        today: "bg-tan-light text-gray-900 font-semibold border border-tan",
        outside: "text-gray-300 opacity-50 aria-selected:bg-accent/50 aria-selected:text-gray-500",
        disabled: "text-gray-300 opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          const Icon = orientation === "left" ? CaretLeft : CaretRight
          return <Icon className="h-5 w-5" weight="bold" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
