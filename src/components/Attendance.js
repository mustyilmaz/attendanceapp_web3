import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contracts from "./contracts/contracts.json"
import { ClipLoader } from 'react-spinners';

const AttendanceVerification = () => {
    const [hash, setHash] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [tokenID, setTokenID] = useState('');
    const [studentAddress, setStudentAddress] = useState('');
    const [attendanceRecorded, setAttendanceRecorded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hashFromAPI, setHashFromAPI] = useState(''); 
    const [errorMessage, setErrorMessage] = useState('');
    const [alertShown, setAlertShown] = useState(false);
    const [remainingTime, setRemainingTime] = useState(null);


    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const qrHash = urlParams.get('hash');
        setHash(qrHash);
        let timeoutId;

        const getNextUpdateTime = async () => {
            const response = await fetch('http://192.168.1.32:3001/api/next-update-time');
            const data = await response.json();
            const now = Date.now();
            const delay = data.nextUpdate - now;
            setRemainingTime(Math.max(delay, 0));
            timeoutId = setTimeout(checkHashFromAPI, delay);
        };

        const checkHashFromAPI = async () => {
            try {
                const response = await fetch('http://192.168.1.32:3001/api/verify-hash', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ hash: qrHash }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsValid(data.isValid);
                    if (data.isValid) {
                        console.log("Dogrulama basarili!");
                        setAlertShown(false);
                        setHashFromAPI(data.hash);
                        getNextUpdateTime();
                    } else if (!data.isValid && !alertShown){
                        setAlertShown(true);
                    }
                }
            } catch (error) {
                console.error('API hash kontrol hatası:', error);
                setErrorMessage('Hash kodu kontrol edilirken bir hata oluştu.');
            }
        };

        checkHashFromAPI();
        getNextUpdateTime();
    
        return () => {
            clearTimeout(timeoutId);
        };
    }, [hash]);

    useEffect(() => {
        if (alertShown) {
            const timer = setTimeout(() => {
                window.alert('Hash kodunun geçerliliği sona erdi. Lütfen tekrar QR Kod okutunuz!');
                window.location.href = '/';
            }, 100); 
            return () => clearTimeout(timer);
        }
    }, [alertShown]);

    useEffect(() => {
        if (!studentAddress) {
            connectWallet(); 
        }
    }, [studentAddress]);

    const connectWallet = async () => {
        if (window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setStudentAddress(accounts[0]);
          } catch (error) {
            console.error("Cüzdan bağlantı hatası:", error);
            setErrorMessage('Cüzdan bağlantısı sırasında bir hata oluştu.');
          }
        } else {
          console.log("Ethereum cüzdanı bulunamadı.");
          window.alert('Ethereum cüzdanı bulunamadı.');
          setErrorMessage('Ethereum cüzdanı bulunamadı.');
        }
    };

    const checkAttendanceForToday = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contracts.attendanceContract.address, contracts.attendanceContract.abi, provider);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const timestamp = Math.floor(currentDate.getTime() / 1000); // Unix timestamp'e çevir
    
        try {
            const hasAttendedToday = await contract.hasAttended(timestamp, studentAddress);
            if (hasAttendedToday) {
                setErrorMessage('Bu gün içinde zaten bir yoklama işlemi gerçekleştirdiniz.');
                setLoading(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Yoklama kontrol hatası:', error);
            setErrorMessage('Yoklama kontrol edilirken bir hata oluştu.');
            setLoading(false);
            return true;
        }
    };

    const recordAttendance2 = async () => {
        if (!studentAddress) {
            console.error("There is no assigned address!");
            setErrorMessage('Adres atanmadı. Cüzdanı bağlayın.');
            return;
        }
    
        if (!tokenID) {
            setErrorMessage('Token ID giriniz.');
            return;
        }
    
        setLoading(true);
        setErrorMessage('');
    
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const ogrenciNFTContract = new ethers.Contract(contracts.OgrenciNFT.address, contracts.OgrenciNFT.abi, signer);
    
        try {
            const tokenOwner = await ogrenciNFTContract.ownerOf(tokenID);
            if (tokenOwner.toLowerCase() !== studentAddress.toLowerCase()) {
                setErrorMessage('Bu token ID, bağlanılan cüzdan adresiyle ilişkilendirilmemiştir.');
                setLoading(false);
                return;
            }
            const hasAttendedToday = await checkAttendanceForToday();
        if (hasAttendedToday) {
            window.alert("Bu cuzdan adresiyle daha onceden yoklama islemi tamamlanmis. Ana sayfaya yonlendiriliyorsunuz!");
            window.location.href = '/';
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contracts.attendanceContract.address,contracts.attendanceContract.abi,provider.getSigner());
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        console.log("Selected_Date: ",currentDate);
        const justDate = Math.floor(currentDate.getTime() / 1000); 
        console.log("TimeStamp: ",justDate);

        const currentDateForTime = new Date();
        const hours = currentDateForTime.getHours(); 
        const minutes = currentDateForTime.getMinutes(); 
        const justTime = (hours * 3600) + (minutes * 60); 
        console.log("Hours and minutes",hours,minutes);
        console.log("justTime: ",justTime);

        try {
            const tx = await contract.recordAttendance(studentAddress, tokenID, justDate,justTime);
            await tx.wait();
            window.alert("Yoklama başarıyla kaydedildi! Ana sayfa yönlendiriliyorsunuz!");
            setAttendanceRecorded(true);
            window.location.href = '/'; 
        } catch (error) {
            console.error("yoklama kaydi basarisiz oldu: ",error);
            setErrorMessage('Yoklama kaydı sırasında bir hata oluştu.');
        }
        setLoading(false);
            
        } catch (error) {
            if (error.code === 'CALL_EXCEPTION') {
                setErrorMessage('Bu token ID mevcut değil.');
            } else {
                console.error("Bir hata oluştu: ", error);
                setErrorMessage('Yoklama kaydı sırasında bir hata oluştu.');
            }
        } finally {
            setLoading(false);
        }
    };
    

    const recordAttendance = async () => {
        if (!studentAddress){
            console.error("There is no assigned address!");
            setErrorMessage('Adres atanmadı. Cüzdanı bağlayın.');
            return;
        }
        if (!tokenID) {
            setErrorMessage('Token ID giriniz.');
            return;
        }
        setLoading(true);
        setErrorMessage('');

        const hasAttendedToday = await checkAttendanceForToday();
        if (hasAttendedToday) {
            window.alert("Bu cuzdan adresiyle daha onceden yoklama islemi tamamlanmis. Ana sayfaya yonlendiriliyorsunuz!");
            window.location.href = '/';
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contracts.attendanceContract.address,contracts.attendanceContract.abi,provider.getSigner());
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        console.log("Selected_Date: ",currentDate);
        const justDate = Math.floor(currentDate.getTime() / 1000); // Unix timestamp'e çevir
        console.log("TimeStamp: ",justDate);

        const currentDateForTime = new Date();
        const hours = currentDateForTime.getHours(); // Saati alır.
        const minutes = currentDateForTime.getMinutes(); // Dakikayı alır.
        const justTime = (hours * 3600) + (minutes * 60); // Unix zaman damgasına çevirir.
        console.log("Hours and minutes",hours,minutes);
        console.log("justTime: ",justTime);

        try {
            const tx = await contract.recordAttendance(studentAddress, tokenID, justDate,justTime);
            await tx.wait();
            window.alert("Yoklama başarıyla kaydedildi! Ana sayfa yönlendiriliyorsunuz!");
            setAttendanceRecorded(true);
            window.location.href = '/'; // Ana sayfaya yönlendir
        } catch (error) {
            console.error("yoklama kaydi basarisiz oldu: ",error);
            setErrorMessage('Yoklama kaydı sırasında bir hata oluştu.');
        }
        setLoading(false);
    }

    return (
        <div className='container'>
            {isValid ? (
                studentAddress ? (
                    <div>
                        <div>Remaining time: {Math.floor(remainingTime / 1000)} seconds</div>
                        <input
                            type="text"
                            value={tokenID}
                            onChange={(e) => setTokenID(e.target.value)}
                            placeholder="Token ID Girin"
                        />
                        <button onClick={recordAttendance2} disabled={loading}>
                            {loading ? "Yükleniyor..." : "Yoklama Kaydet"}
                        </button>
                        <div>{loading && <ClipLoader size={50}/>}</div>
                        {attendanceRecorded && <p>Yoklama başarılı!</p>}
                    </div>
                ) : (
                    <p>Cüzdan adresiniz bulunamadı. Cüzdanı bağlayın.</p>
                )
            ) : (
                <p>Doğrulama başarısız! Lütfen QR kodu tekrar okutunuz.</p>
            )}
        </div>
    );
};

export default AttendanceVerification;
