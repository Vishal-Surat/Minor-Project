// src/context/LogContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchLogs,
  fetchAlerts,
  fetchSessions,
  fetchAuditLogs,
  fetchNotifications,
} from '../services/api';

const LogContext = createContext();

export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [logsData, alertsData, sessionsData, auditData, notificationsData] = await Promise.all([
          fetchLogs(),
          fetchAlerts(),
          fetchSessions(),
          fetchAuditLogs(),
          fetchNotifications(),
        ]);
        setLogs(logsData);
        setAlerts(alertsData);
        setSessions(sessionsData);
        setAuditLogs(auditData);
        setNotifications(notificationsData);
      } catch (err) {
        console.error('Error loading log data:', err);
      }
    };

    fetchAll();
  }, []);

  return (
    <LogContext.Provider value={{ logs, alerts, sessions, auditLogs, notifications }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLogs = () => useContext(LogContext);
