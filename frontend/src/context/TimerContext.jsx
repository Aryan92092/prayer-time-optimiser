import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { updateEntry } from '../services/programService';

const TimerContext = createContext();

export const useTimer = () => useContext(TimerContext);

export const TimerProvider = ({ children }) => {
    const [activeEntry, setActiveEntry] = useState(null);
    const [phase, setPhase] = useState('none'); // 'none' | 'pick' | 'running' | 'done'
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [running, setRunning] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const intervalRef = useRef(null);

    // Provide a callback when completed so calling components can refresh
    const [onCompleteCallback, setOnCompleteCallback] = useState(null);

    const openTimer = (entry, onComplete = null) => {
        setActiveEntry(entry);
        setPhase('pick');
        setTotalSeconds(0);
        setRemaining(0);
        setRunning(false);
        setIsMinimized(false);
        if (onComplete) setOnCompleteCallback(() => onComplete);
    };

    const startTimer = (minutes) => {
        const secs = minutes * 60;
        setTotalSeconds(secs);
        setRemaining(secs);
        setRunning(true);
        setPhase('running');
    };

    const togglePause = () => setRunning(r => !r);

    const closeTimer = () => {
        clearInterval(intervalRef.current);
        setActiveEntry(null);
        setPhase('none');
        setRunning(false);
        setIsMinimized(false);
    };

    const completeTimer = async () => {
        clearInterval(intervalRef.current);
        if (activeEntry) {
            try {
                // Optimistically attempt to update the backend just in case
                await updateEntry(activeEntry.id, true);
            } catch (err) {
                console.error("Timer failed to auto-update backend", err);
            }
            if (onCompleteCallback) {
                onCompleteCallback(activeEntry.id);
            }
        }
        closeTimer();
    };

    const minimizeTimer = () => setIsMinimized(true);
    const restoreTimer = () => setIsMinimized(false);

    useEffect(() => {
        if (!running) return;
        intervalRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    setRunning(false);
                    setPhase('done');
                    // Automatically pop up if minimized when done
                    setIsMinimized(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [running]);

    return (
        <TimerContext.Provider value={{
            activeEntry, phase, totalSeconds, remaining, running, isMinimized,
            openTimer, startTimer, togglePause, closeTimer, completeTimer, minimizeTimer, restoreTimer
        }}>
            {children}
        </TimerContext.Provider>
    );
};
