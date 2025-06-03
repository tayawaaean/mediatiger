import { useState } from "react";
import { format, subDays, isSameDay, addMonths } from "date-fns";

const presets = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 28 days", days: 28 },
  { label: "Last 90 days", days: 90 },
  { label: "Custom", days: 0 },
];

const generateMonthDays = (year: number, month: number) => {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  for (let i = 0; i < startWeekday; i++) {
    days.push(null);
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

export default function DateRangeSelector({
  onRangeChange,
}: {
  onRangeChange: (start: Date, end: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState({
    label: "Last 28 days",
    start: subDays(new Date(), 27),
    end: new Date(),
  });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const monthDays = generateMonthDays(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth()
  );

  const handleSelect = async (preset: { label: string; days: number }) => {
    if (preset.label === "Custom") {
      setShowCustomPicker(true);
      return;
    }
    setIsLoading(true);
    const end = new Date();
    const start = subDays(end, preset.days - 1);
    setRange({ label: preset.label, start, end });
    onRangeChange(start, end);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate loading
    setIsLoading(false);
    setIsOpen(false);
  };

  const handleDayClick = (day: Date | null) => {
    if (!day) return;
    if (!customStart || (customStart && customEnd)) {
      setCustomStart(day);
      setCustomEnd(null);
    } else {
      if (day < customStart) {
        setCustomStart(day);
      } else {
        setCustomEnd(day);
      }
    }
  };

  const applyCustomRange = async () => {
    if (customStart && customEnd) {
      setIsLoading(true);
      setRange({ label: "Custom", start: customStart, end: customEnd });
      onRangeChange(customStart, customEnd);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate loading
      setIsLoading(false);
      setShowCustomPicker(false);
      setIsOpen(false);
    }
  };

  const formattedRange = `${format(range.start, "MMM d")} – ${format(
    range.end,
    "MMM d, yyyy"
  )}`;

  return (
    <div className="relative inline-block text-left text-slate-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-slate-800 px-4 py-2 rounded-lg border border-slate-700/50 hover:border-indigo-500 flex flex-col items-start shadow-md transition-all duration-200 ${
          isLoading ? "opacity-50 cursor-wait" : ""
        }`}
        disabled={isLoading}>
        <span className="text-sm font-medium">{formattedRange}</span>
        <span className="text-xs text-slate-400">{range.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-[320px] rounded-xl shadow-lg bg-slate-900 ring-1 ring-black ring-opacity-30 dropdown-animate">
          <div className="py-1 dropdown-container">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleSelect(preset)}
                className="w-full px-4 py-2 text-sm text-left text-slate-200 hover:bg-slate-700 transition-all duration-200"
                disabled={isLoading}>
                {preset.label}
              </button>
            ))}
          </div>

          {showCustomPicker && (
            <div className="p-4 border-t border-slate-700/50">
              <div className="mb-2 text-xs text-slate-400 flex justify-between items-center">
                <button
                  onClick={() => setCalendarMonth(subDays(calendarMonth, 30))}
                  disabled={isLoading}>
                  &lt;
                </button>
                <span>{format(calendarMonth, "MMMM yyyy")}</span>
                <button
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                  disabled={isLoading}>
                  &gt;
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm mb-1 text-slate-400">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {monthDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    disabled={isLoading}
                    className={`px-2 py-1 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-200
                      ${
                        day && customStart && isSameDay(day, customStart)
                          ? "bg-indigo-500 text-white shadow-md"
                          : ""
                      }
                      ${
                        day && customEnd && isSameDay(day, customEnd)
                          ? "bg-purple-500 text-white shadow-md"
                          : ""
                      }
                      ${!day ? "invisible" : ""}
                      ${isLoading ? "opacity-50 cursor-wait" : ""}`}>
                    {day ? day.getDate() : ""}
                  </button>
                ))}
              </div>
              <button
                onClick={applyCustomRange}
                disabled={!customStart || !customEnd || isLoading}
                className={`mt-3 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm shadow-lg transition-all duration-200 ${
                  !customStart || !customEnd || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}>
                {isLoading ? "Applying..." : "Apply"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
