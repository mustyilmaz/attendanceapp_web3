import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import DynamicQRCode from './DynamicQR.js';
import AttendanceList from './AttendanceList.js';

const AdminPanel = () => {
  const [showComponent, setShowComponent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const authToken = sessionStorage.getItem('authToken');

      if (!authToken) {
        console.error("AuthToken bulunamadi!");
        navigate('/admin');
        return;
      }

      try {
        const response = await fetch('http://192.168.1.32:3001/api/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: authToken }),
        });

        const data = await response.json();
        if (!data.valid) {
          navigate('/admin');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        navigate('/admin');
      }
    };

    verifyToken();
  }, [navigate]);

  return (
    <div>
      <h1>Yönetici Paneli</h1>
      <button onClick={() => setShowComponent('qrCode')}>QR Kodu Göster</button>
      <button onClick={() => navigate('/attendance-list')}>Yoklama Listesi Göster</button>
      {showComponent === 'qrCode' && <DynamicQRCode />}
    </div>
  );
};

export default AdminPanel;
