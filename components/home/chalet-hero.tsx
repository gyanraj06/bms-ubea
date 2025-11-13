'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, X, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns'
import { toast } from 'sonner'

export function ChaletHero() {
  const router = useRouter()
  const [isAnimated, setIsAnimated] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null)
  const [dateRange, setDateRange] = useState<string>('Reservation date')

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 150)
    return () => clearTimeout(timer)
  }, [])

  const handleBookNow = () => {
    if (!selectedStartDate || !selectedEndDate) {
      toast.error('Please select check-in and check-out dates')
      setShowCalendar(true)
      return
    }

    // Navigate to booking page with dates as URL params
    const checkIn = format(selectedStartDate, 'yyyy-MM-dd')
    const checkOut = format(selectedEndDate, 'yyyy-MM-dd')
    router.push(`/booking?checkIn=${checkIn}&checkOut=${checkOut}`)
  }

  const handleDateClick = (date: Date) => {
    const today = startOfDay(new Date())
    if (isBefore(date, today)) return

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date)
      setSelectedEndDate(null)
    } else if (isAfter(date, selectedStartDate)) {
      setSelectedEndDate(date)
    } else {
      setSelectedStartDate(date)
      setSelectedEndDate(null)
    }
  }

  const handleConfirm = () => {
    if (selectedStartDate && selectedEndDate) {
      const formatted = `${format(selectedStartDate, 'dd.MM.yyyy')} - ${format(selectedEndDate, 'dd.MM.yyyy')}`
      setDateRange(formatted)
      setShowCalendar(false)
    }
  }

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false
    return isAfter(date, selectedStartDate) && isBefore(date, selectedEndDate)
  }

  const isDateSelected = (date: Date) => {
    return (selectedStartDate && isSameDay(date, selectedStartDate)) ||
           (selectedEndDate && isSameDay(date, selectedEndDate))
  }

  const renderCalendarMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const today = startOfDay(new Date())

    const firstDayOfWeek = monthStart.getDay()
    const emptyCells = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill(null)

    return (
      <div className="flex-1 min-w-[320px]">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
          {format(monthDate, 'MMMM yyyy')}
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
          {emptyCells.map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}
          {days.map(day => {
            const isPast = isBefore(day, today)
            const inRange = isDateInRange(day)
            const selected = isDateSelected(day)

            return (
              <button
                key={day.toString()}
                onClick={() => !isPast && handleDateClick(day)}
                disabled={isPast}
                className={`
                  aspect-square p-2 text-sm rounded-lg transition-colors
                  ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                  ${selected ? 'bg-pink-300 text-gray-900 font-semibold' : ''}
                  ${inRange ? 'bg-pink-200' : ''}
                  ${!selected && !inRange && !isPast ? 'text-gray-900' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/60" />
      </div>

      {/* Content - Left Aligned */}
      <div className="relative z-10 container mx-auto px-4 pt-32 md:pt-40 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isAnimated ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl"
        >
          {/* Subtitle */}
          <p className="text-tan text-base md:text-lg font-medium tracking-wider uppercase mb-6">
            Relaxation. Experiences. Privacy.
          </p>

          {/* Main Heading */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal text-white mb-12 leading-tight">
            Your Perfect Luxury Escape
          </h1>

          {/* Reservation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <button
              onClick={() => setShowCalendar(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 text-base md:text-lg"
            >
              <Calendar size={24} weight="regular" />
              <span className="font-medium">{dateRange}</span>
            </button>
            <button
              onClick={handleBookNow}
              className="inline-flex items-center px-10 py-4 bg-white text-brown-dark rounded-xl font-semibold hover:bg-tan transition-all duration-300 shadow-lg text-base md:text-lg"
            >
              Book
            </button>
          </div>
        </motion.div>
      </div>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCalendar(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 md:p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowCalendar(false)}
                className="absolute top-6 right-6 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-700" />
              </button>

              {/* Calendar Grid */}
              <div className="flex flex-col md:flex-row gap-8 mb-6">
                {renderCalendarMonth(currentMonth)}
                {renderCalendarMonth(addMonths(currentMonth, 1))}
              </div>

              {/* Navigation & Confirm Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <CaretLeft size={24} className="text-gray-700" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[150px] text-center">
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <CaretRight size={24} className="text-gray-700" />
                  </button>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedStartDate || !selectedEndDate}
                  className="px-8 py-3 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Dots Pattern */}
      <svg className="absolute bottom-10 left-10 opacity-30" width="100" height="100">
        <circle cx="10" cy="10" r="3" fill="#DDC9B5" />
        <circle cx="30" cy="10" r="3" fill="#DDC9B5" />
        <circle cx="50" cy="10" r="3" fill="#DDC9B5" />
        <circle cx="10" cy="30" r="3" fill="#DDC9B5" />
        <circle cx="30" cy="30" r="3" fill="#DDC9B5" />
        <circle cx="50" cy="30" r="3" fill="#DDC9B5" />
      </svg>
    </section>
  )
}
