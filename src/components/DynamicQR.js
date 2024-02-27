import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

const DynamicQRCode = () => {
  const [qrValue, setQrValue] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const fetchAndUpdateQR = async () => {
      try {
        const response = await fetch('http://192.168.1.32:3001/api/generate-hash');
        const data = await response.json();
        const nextUpdateTimestamp = data.nextUpdate; 
        const now = Date.now();
        const timeLeft = nextUpdateTimestamp - now;
        setRemainingTime(Math.max(timeLeft, 0)); 

        setQrValue(`http://192.168.1.32:3000/attendance?hash=${data.hash}`);
      } catch (error) {
        console.error('Error fetching hash:', error);
      }
    };

    fetchAndUpdateQR();
    const intervalId = setInterval(fetchAndUpdateQR, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const openAttendanceLink = () => {
    window.open(qrValue, '_blank');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={openAttendanceLink}>AttendanceLink</button>
      <div>Remaining time: {Math.floor(remainingTime / 1000)} seconds</div>
      <QRCode value={qrValue} size={256} style={{ margin: 'auto' }} />
    </div>
  );
};

export default DynamicQRCode;
