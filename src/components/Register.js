import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { RingLoader } from 'react-spinners';
import axios from 'axios';
import contracts from './contracts/contracts.json'

const contractAddress = contracts.OgrenciNFT.address
const contractABI = contracts.OgrenciNFT.abi

const Register = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); // Popup mesajı için state
  const [showMessage, setShowMessage] = useState(false);
  const [minted, setMinted] = useState(false);
  const [txHash, setTxHash] = useState(null);


  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWalletConnected(true);
          setLoading(false);
        } catch (error) {
          if(error.code === -32002){
            console.log("Cuzdan baglama istegi isleniyor!");
          } else {
            console.error("Cüzdan bağlantı hatası:", error);
            setMessage("Cüzdan bağlantısı sırasında bir hata oluştu.");
          }
          setLoading(false);
        }
      } else {
        console.log("Ethereum cüzdanı bulunamadı. MetaMask'ı yükleyin.");
        setMessage("Ethereum cüzdanı bulunamadı. MetaMask'ı yükleyin.");
        setLoading(false);
      }
    };

    connectWallet();
  }, []);

  useEffect(() => {
    if (message !== '') {
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 3000); // 3 saniye sonra mesajı gizle
    }
  }, [message]);

  const isFormValid = () => {
    return name !== '' && surname !== '' && studentNumber !== '';
  };

  const createMetadata = () => {
    return {
      name: `Öğrenci NFT: ${name} ${surname}`,
      description: "Öğrenci Yoklama Sistemi için NFT",
      image: "", // Buraya IPFS'te saklanan resmin URI'si eklenebilir
      attributes: [
        { trait_type: "Ad", value: name },
        { trait_type: "Soyad", value: surname },
        { trait_type: "Öğrenci Numarası", value: studentNumber }
      ]
    };
  };

  const uploadToIPFS = async (metadata) => {
	  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
	  const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
	  const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;
  
	  try {
	    const response = await axios.post(url, metadata, {
		  headers: {
		    'Content-Type': 'application/json',
		    pinata_api_key: pinataApiKey,
		    pinata_secret_api_key: pinataSecretApiKey,
		  }
	    });
  
	    return response.data.IpfsHash;
	  } catch (error) {
	    console.error('IPFS yükleme hatası:', error);
	    return null;
	  }
  };

  const mintNFT = async () => {
    if (!window.ethereum) {
      console.log("Ethereum cüzdanı bulunamadı. MetaMask'ı yükleyin.");
      return;
    }

    if (!isFormValid()) {
      setMessage('Lütfen tüm alanları doldurun.');
      setShowMessage(true);
      return;
    }
    
    setLoading(true);
    const metadata = createMetadata();
    const ipfsURI = await uploadToIPFS(metadata);
	  const tokenURI = `https://gateway.pinata.cloud/ipfs/${ipfsURI}`;
	    if (!tokenURI) {
		  console.log("IPFS yükleme başarisiz oldu.");
		  setLoading(false);
      return;
	  }
    try {
		  const provider = new ethers.providers.Web3Provider(window.ethereum);
    	const signer = provider.getSigner();
    	const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const transaction = await contract.kaydet(name, surname, studentNumber, tokenURI);
      await transaction.wait();
      setMinted(true);
      setTxHash(transaction.hash);
      console.log("NFT başarıyla mint edildi:", transaction);
      setMessage('NFT başarıyla mint edildi!');
    } catch (error) {
    	console.error("NFT mint etme hatası:", error);
    	if (error.reason && error.reason.includes("Bu numara zaten bir token ile iliskilendirilmis.")) {
        window.alert("Bu öğrenci numarasına ait bir NFT zaten üretilmiş.");
      } else {
        setMessage('NFT mint etme işlemi başarısız. Konsolu kontrol edin.');
      }
    } finally {
    	setLoading(false);
    }
  };

  
  return (
    <div className="container">
      <h2>Kayıt Ol</h2>
      {loading ? (
        <p>Cüzdan bağlantısı bekleniyor...</p>
      ) : walletConnected ? (
        <div>
          {message && <div className={message.includes('başarıyla') ? 'popup-success' : 'popup-error'}>{message}</div>}
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="İsim" required />
            <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Soyisim" required />
            <input type="number" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} placeholder="Öğrenci Numarası" required />
            <button type="button" onClick={mintNFT} disabled={loading}>
              {loading ? "Yükleniyor..." : "NFT Oluştur"}
            </button>
          </form>
          <div className="loading-indicator">
            {loading && <RingLoader color={'#36D7B7'} loading={loading} size={50} />}
          </div>
          {txHash && (
            <button onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, "_blank")}>
              Etherscan'da İşlemi Görüntüle
            </button>
          )}
        </div>
      ) : (
        <p>Ethereum cüzdanı bulunamadı. Lütfen MetaMask'ı yükleyin ve yeniden deneyin.</p>
      )}
    </div>
  );
};

export default Register;
