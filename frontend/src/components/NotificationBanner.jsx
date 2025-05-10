import React, { useState, useEffect } from 'react';

const NotificationBanner = () => {
  const [visible, setVisible] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample notifications - in a real app, these would come from an API
  useEffect(() => {
    const sampleNotifications = [
      {
        id: 1,
        type: 'info',
        message: 'System is actively monitoring your network for threats.'
      },
      {
        id: 2,
        type: 'warning',
        message: '3 high-severity alerts detected in the last 24 hours.'
      },
      {
        id: 3,
        type: 'danger',
        message: 'Recent malware activity detected. Check threat feed for details.'
      }
    ];
    
    setNotifications(sampleNotifications);
    
    // Rotate notifications every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex < sampleNotifications.length - 1 ? prevIndex + 1 : 0
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
  };
  
  // If no notifications or banner is dismissed, don't render
  if (!visible || notifications.length === 0) return null;
  
  const currentNotification = notifications[currentIndex];
  
  // Define styling based on notification type
  const getBannerStyle = (type) => {
    switch(type) {
      case 'danger':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'success':
        return 'bg-green-600 text-white';
      case 'info':
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${getBannerStyle(currentNotification.type)} shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2">
              {currentNotification.type === 'danger' && (
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {currentNotification.type === 'warning' && (
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {currentNotification.type === 'info' && (
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </span>
            <p className="ml-3 font-medium truncate">
              <span>{currentNotification.message}</span>
            </p>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              className="-mr-1 flex p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
              onClick={handleDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner; 