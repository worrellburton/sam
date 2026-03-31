"use client";
import { createContext, useContext } from "react";

interface BookingContextType {
  openBooking: () => void;
  closeBooking: () => void;
  isBookingOpen: boolean;
}

export const BookingContext = createContext<BookingContextType>({
  openBooking: () => {},
  closeBooking: () => {},
  isBookingOpen: false,
});

export function useBooking() {
  return useContext(BookingContext);
}
