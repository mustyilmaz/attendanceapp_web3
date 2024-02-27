import React, { useState } from 'react';
import { ethers } from 'ethers';
import contracts from './contracts/contracts.json';
import { useNavigate } from 'react-router-dom';

import './style.css';

const contractAddress = contracts.attendanceContract.address;
const contractABI = contracts.attendanceContract.abi;

const ogrenciNFTAddress = contracts.OgrenciNFT.address;
const ogrenciNFTABI = contracts.OgrenciNFT.abi;

const AttendanceList = () => {
    const navigate = useNavigate();

    const [date, setDate] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    provider.send("eth_requestAccounts", []).catch(console.error);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const ogrenciNFTContract = new ethers.Contract(ogrenciNFTAddress, ogrenciNFTABI, signer);

    const fetchAttendanceRecords = async () => {
        if (!date) {
            setErrorMessage('Lütfen bir tarih seçin.');
            return;
        }
        setLoading(true);
        setErrorMessage('');
        const dateParts = date.split('-');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const selectedDate = new Date(year, month, day);
        const timeStamp = Math.floor(selectedDate.getTime() / 1000);

        try {
            const fetchedRecords = await contract.getAttendanceRecordsByDate(timeStamp);
            if (fetchedRecords.length > 0) {
                fetchMetadata(fetchedRecords);
            } else {
                setRecords([]);
                setErrorMessage('Seçilen tarihte yoklama kaydı bulunamadı.');
            }
        } catch (error) {
            console.error("Error fetching attendance records:", error);
            setErrorMessage('Yoklama kayıtları çekilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async (attendanceRecords) => {
        const updatedRecords = await Promise.all(attendanceRecords.map(async (record) => {
            try {
                const tokenURI = await ogrenciNFTContract.tokenURI(record.tokenID.toString());
                const response = await fetch(tokenURI);
                const metadata = await response.json();
                const attributes = metadata.attributes;

                const isim = attributes.find(trait => trait.trait_type === "Ad")?.value ?? '';
                const soyisim = attributes.find(trait => trait.trait_type === "Soyad")?.value ?? '';
                const numara = attributes.find(trait => trait.trait_type === "Öğrenci Numarası")?.value ?? '';

                const unixTime = record.time;
                console.log("Time: ",unixTime);
                const saat = Math.floor(unixTime / 3600) % 24;
                const dakika = Math.floor(unixTime / 60) % 60;

                return {
                    ...record,
                    isim,
                    soyisim,
                    numara,
                    date: new Date(record.date * 1000).toLocaleDateString(),
                    saat: saat,
                    dakika: dakika,
                };
            } catch (error) {
                console.error("Error fetching metadata for tokenID:", record.tokenID, error);
                return { ...record, isim: '', soyisim: '', numara: '', date: new Date(record.date * 1000).toLocaleDateString() };
            }
        }));
        setRecords(updatedRecords);
    };

    return (
        <div>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <button onClick={() => navigate('/admin-panel')} style={{ marginRight: '10px', left:0 }}>
                ← Yönetici paneline geri dön
            </button>
            <div className="container" style={{ alignItems: 'center', marginBottom: '20px' }}>
                <h1>Attendance List</h1>
                <label>Select Date: </label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <button onClick={fetchAttendanceRecords} disabled={loading}>
                    {loading ? 'Loading...' : 'Get Attendance Records'}
                </button>
            </div>
            <div className="container" style={{ alignItems: 'center', marginBottom: '20px' }}>
                <table>
                    <thead>
                        <tr>
                            <th>İsim</th>
                            <th>Soyisim</th>
                            <th>Öğrenci Numarası</th>
                            <th>Tarih</th>
                            <th>Saat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record, index) => (
                            <tr key={index}>
                                <td>{record.isim}</td>
                                <td>{record.soyisim}</td>
                                <td>{record.numara}</td>
                                <td>{record.date}</td>
                                <td>{record.saat < 10 ? `0${record.saat}` : record.saat}:{record.dakika < 10 ? `0${record.dakika}` : record.dakika}</td> {/* Saat ve dakika bilgisi ekleniyor */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceList;
