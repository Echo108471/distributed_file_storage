// src/App.js
import React, { useState } from 'react';
import { create } from 'ipfs-http-client';
import axios from 'axios';
import { ResilientDB, AxiosClient } from 'resilientdb-javascript-sdk';
import { createHelia } from 'helia'

// Configure IPFS client
const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

function App() {
  const [file, setFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');
  const [data, setData] = useState('');
  const resilientDBClient = new ResilientDB("https://cloud.resilientdb.com", new AxiosClient());
  const { publicKey, privateKey } = ResilientDB.generateKeys();
  console.log(`Public Key: ${publicKey}`);
  console.log(`Private Key: ${privateKey}`);

  // Function to handle file change
  const onFileChange = (event: any) => {
    setFile(event.target.files[0]);
  };

  // Function to upload file to IPFS
  const onFileUpload = async () => {
    if (!file) return;

    try {
      const added = await ipfs.add(file);
      setIpfsHash(added.path); // Store IPFS hash
      console.log('File added to IPFS with hash:', added.path);
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
    }
  };

  // Function to send data to ResilientDB
  const getAllTransactions = async () => {
    const transactions = await resilientDBClient.getAllTransactions();
    console.log('All Transactions:', transactions);
  };

  const createTransaction = async () => {
    const transactionData = {
      operation: "CREATE",
      amount: 100,
      signerPublicKey: publicKey,
      signerPrivateKey: privateKey,
      recipientPublicKey: publicKey, // For the sake of example, sending to self
      asset: { message: "Initial transaction" }
    };
    
    const transaction = await resilientDBClient.postTransaction(transactionData);
    console.log('Transaction posted:', transaction);
    
    return transaction.id; // We'll need the transaction ID to update it next
  }

  // const updateTransaction = async (transactionId: string) => {
  //   const updateData = {
  //     id: transactionId,
  //     amount: 150, // Updated amount
  //     signerPublicKey: publicKey,
  //     signerPrivateKey: privateKey,
  //     recipientPublicKey: publicKey, // Still sending to self
  //     asset: { message: "Updated transaction data" }
  //   };
    
  //   const updatedTransaction = await resilientDBClient.updateTransaction(updateData);
  //   console.log('Transaction updated:', updatedTransaction);
  // }

  const runDemo = async () => {
    const transactionId = await createTransaction();
    // await updateTransaction(transactionId);
  }

  return (
    <div>
      <h1>IPFS and ResilientDB Integration</h1>

      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>Upload to IPFS</button>
      {ipfsHash && <p>Uploaded to IPFS with hash: {ipfsHash}</p>}

      <button onClick={runDemo}>Save to ResilientDB</button>
    </div>
  );
}

export default App;
