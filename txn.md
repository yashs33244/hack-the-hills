Let me break this down into steps for a secure cold wallet transaction flow:

1. ONLINE DEVICE - Data to Fetch/Prepare:
```json
{
  "partialTransaction": {
    "instructions": [{
      // System Program ID (no need to fetch - it's constant)
      "programId": "11111111111111111111111111111111",
      
      "accounts": [
        {
          // Sender's wallet public key (you have this)
          "pubkey": "YOUR_WALLET_PUBLIC_KEY",
          "isSigner": true,
          "isWritable": true
        },
        {
          // Recipient's public key (need to get this)
          "pubkey": "RECIPIENT_PUBLIC_KEY",
          "isSigner": false,
          "isWritable": true
        }
      ],
      
      // Need to create this based on amount
      "data": "BASE58_ENCODED_INSTRUCTION_DATA" 
    }],
    "signerPublicKey": "YOUR_WALLET_PUBLIC_KEY"
  }
}
```

2. COLD WALLET RESPONSE Format:
```json
{
  "signature": "BASE58_ENCODED_SIGNATURE",
  "publicKey": "SIGNER_PUBLIC_KEY"
}
```

Complete Steps:

1. Online Device (Preparation):
```typescript
// 1. Create instruction data (encoding transfer amount)
const amount = 1000000; // lamports
const data = Buffer.alloc(12);
data.writeUInt32LE(2, 0); // 2 = transfer instruction
data.writeBigUInt64LE(BigInt(amount), 4);
const encodedData = bs58.encode(data);

// 2. Create QR data
const qrData = {
  "partialTransaction": {
    "instructions": [{
      "programId": "11111111111111111111111111111111",
      "accounts": [
        {
          "pubkey": senderPublicKey,
          "isSigner": true,
          "isWritable": true
        },
        {
          "pubkey": recipientPublicKey,
          "isSigner": false,
          "isWritable": true
        }
      ],
      "data": encodedData
    }],
    "signerPublicKey": senderPublicKey
  }
};
```

2. Cold Wallet:
- Scan QR code
- Sign transaction
- Return signature in QR code

3. Online Device (Completion):
```typescript
// 1. Get recent blockhash
const connection = new Connection("https://api.mainnet-beta.solana.com");
const { blockhash } = await connection.getRecentBlockhash();

// 2. Construct final transaction
const transaction = new Transaction({
  feePayer: new PublicKey(coldWalletResponse.publicKey),
  recentBlockhash: blockhash
}).add(
  new TransactionInstruction({
    programId: new PublicKey("11111111111111111111111111111111"),
    keys: qrData.partialTransaction.instructions[0].accounts,
    data: Buffer.from(bs58.decode(qrData.partialTransaction.instructions[0].data))
  })
);

// 3. Add signature from cold wallet
transaction.addSignature(
  new PublicKey(coldWalletResponse.publicKey),
  bs58.decode(coldWalletResponse.signature)
);

// 4. Send transaction
const txid = await connection.sendRawTransaction(transaction.serialize());
console.log("Transaction sent:", txid);

// 5. Confirm transaction
const confirmation = await connection.confirmTransaction(txid);
console.log("Transaction confirmed:", confirmation);
```

Key Points:
1. The only things you need internet for are:
   - Getting recipient's public key
   - Getting recent blockhash (done after signing)
   - Sending final transaction

2. Cold wallet only needs:
   - Program ID (constant for SOL transfers)
   - Recipient public key
   - Amount to transfer
   - Your public/private keys (stored in cold wallet)

Would you like me to explain any part of this process in more detail?