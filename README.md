# Attendance System with WEB3.0 Project

## Project Overview

This project aims to implement an Attendance System using WEB3.0 technologies, specifically leveraging Blockchain and NFTs. The system involves smart contracts, NFT minting, and dynamic QR code generation for attendance tracking.

## Design

### Key Features

1. **Blockchain-based Attendance Records:**
   - Smart contracts are utilized to maintain attendance records, ensuring transparency and reliability through Blockchain technology.

2. **NFT Minting for Students:**
   - Students mint NFTs containing personal information, serving as digital ID cards for attendance transactions.

3. **Admin Panel with Dynamic QR Codes:**
   - Admin can create dynamic QR codes for student access and query attendance records via smart contracts. This involves bilateral smart contract design.

![Figure 1 - Basic requirements](images/figure1.jpg)

## Code Work

### React Interface

- Node.js and React are used to set up the frontend interface, making use of up-to-date JavaScript libraries for wallet and smart contract connections.
- Basic HTML/CSS and JS knowledge is applied in designing the main page.

![Figure 2 - Main Page of the Project](images/figure2.jpg)

### Register Component

#### User Registration

- Users' digital wallets are automatically connected.
- Implemented error handling for wallet connection.
- Registration form captures name, surname, and student/participant numbers.
- NFT creation process initiated upon clicking "Create NFT" button.

![Figure 3 - Register Page of the Project](images/figure3.jpg)

#### Smart Contract and NFT Creation

- Digital wallet connections established using the "ethers" library.
- Solidity smart contract written for NFT creation on REMIX-IDE.
- Smart contract deployed to Sepolia test network.
- Backend connections for smart contract interaction set up.
- IPSF system integrated for NFT metadata standards.

![Figure 4 - After the Mint Process Interface](images/figure4.jpg)
![Figure 5 - Student NFT Transaction Result](images/figure5.jpg)

### Admin Panel Component

#### Admin Login

- Admin login page designed with server-side operations.
- Login control, authToken creation, and Dynamic QR code generation on the Express server.

#### Dynamic QR Code Component

- 10-character hash code generated changing every 60 seconds.
- "qrcode.react" library used for converting hash code to URL format.
- QR code displayed on frontend with countdown to code change.

![Figure 6 - Dynamic QR Code Component](images/figure6.jpg)

### Attendance Process

#### Attendance Component

- Hash code validity checked from URL on backend.
- Students' digital wallets connected automatically.
- Checks in a second smart contract for wallet-address verification and attendance history.
- Attendance smart contract deployed to the test network.

![Figure 7 - Attendance Page](images/figure7.jpg)

#### Attendance List Component

- Date-based control of attendance processes for admin.
- Retrieval of personal information and attendance time from smart contract.
- Visualization of attendance data in a table format.

![Figure 8 - Attendance List Component](images/figure8.jpg)

## Conclusion

Successfully implemented all outlined project features, ensuring effective communication between components.

