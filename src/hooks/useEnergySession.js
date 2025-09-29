import { useState, useEffect } from "react";
import { getStatusConfig } from "../utils/energyUtils";

export const useEnergySession = () => {
  const [sessionData, setSessionData] = useState({
    stationName: "Trạm sạc Vincom Center",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    socketType: "CCS2",
    power: "50kW",
    batteryLevel: 65,
    timeElapsed: "00:45:30",
    estimatedTimeLeft: "01:20:15",
    energyCharged: "32.5",
    estimatedCost: "125,000",
    status: "charging",
    pricePerKwh: "3,500",
    pricePerMin: "500",
    chargingPower: "45.2",
    voltage: "380V",
    current: "118A"
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const statusConfig = getStatusConfig(sessionData.status);

  return {
    sessionData,
    setSessionData,
    currentTime,
    statusConfig
  };
};