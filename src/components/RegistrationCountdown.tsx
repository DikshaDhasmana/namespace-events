import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface RegistrationCountdownProps {
  targetDate: string;
}

export const RegistrationCountdown = ({ targetDate }: RegistrationCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const registrationEndDate = new Date(targetDate);

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = registrationEndDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
        setHasEnded(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setHasEnded(true);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (hasEnded) {
    return null;
  }

  return (
    <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Registration closes in:</span>
      </div>
      <div className="flex items-center gap-2 justify-center">
        <div className="flex flex-col items-center">
          <span className="bg-primary/10 px-3 py-1.5 rounded text-sm font-mono font-semibold text-primary min-w-[44px] text-center">
            {timeLeft.days}
          </span>
          <span className="text-xs text-muted-foreground mt-1">days</span>
        </div>
        <span className="text-primary font-bold">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-primary/10 px-3 py-1.5 rounded text-sm font-mono font-semibold text-primary min-w-[44px] text-center">
            {timeLeft.hours}
          </span>
          <span className="text-xs text-muted-foreground mt-1">hours</span>
        </div>
        <span className="text-primary font-bold">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-primary/10 px-3 py-1.5 rounded text-sm font-mono font-semibold text-primary min-w-[44px] text-center">
            {timeLeft.minutes}
          </span>
          <span className="text-xs text-muted-foreground mt-1">mins</span>
        </div>
        <span className="text-primary font-bold">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-primary/10 px-3 py-1.5 rounded text-sm font-mono font-semibold text-primary min-w-[44px] text-center">
            {timeLeft.seconds}
          </span>
          <span className="text-xs text-muted-foreground mt-1">secs</span>
        </div>
      </div>
    </div>
  );
};
