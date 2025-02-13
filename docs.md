For a cold wallet setup without internet access, you have a few options to handle the recent blockhash requirement:

1. Two-Device Solution:
```
Online Device:
1. Fetch the recent blockhash using RPC
2. Share this blockhash securely with cold wallet (e.g., QR code)

Cold Wallet:
1. Receive blockhash
2. Create and sign transaction
3. Return signed transaction
```

2. Service-Based Solution:
```
1. Your cold wallet creates a "partial transaction" without blockhash
2. Send this structure to the service:
{
  "partialTransaction": {
    "instructions": [{
      "programId": "11111111111111111111111111111111",
      "accounts": [
        {
          "pubkey": "YOUR_WALLET_PUBLIC_KEY",
          "isSigner": true,
          "isWritable": true
        },
        {
          "pubkey": "RECIPIENT_PUBLIC_KEY",
          "isSigner": false,
          "isWritable": true
        }
      ],
      "data": "BASE58_ENCODED_INSTRUCTION_DATA"
    }],
    "signerPublicKey": "YOUR_WALLET_PUBLIC_KEY"
  }
}
```

3. The service can then:
- Fetch a recent blockhash
- Complete the transaction construction
- Return the complete transaction for you to sign in your cold wallet
- After signing, send back just the signature

This way, the service handles the time-sensitive blockhash while you maintain custody of your private key in the cold wallet.

---


A program ID in Solana is the public key of the account where the program is deployed. Here are the common ways to get program IDs:

1. Well-Known Program IDs:
```typescript
// System Program (for SOL transfers)
const systemProgramId = "11111111111111111111111111111111"

// Token Program (for SPL tokens)
const tokenProgramId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"

// Associated Token Program
const associatedTokenProgramId = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"

// Metadata Program
const metadataProgramId = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
```

2. For Custom Programs:
- After deploying your program, the deployment transaction will return the program ID
- You can use Solana CLI:
```bash
solana program show <PROGRAM_ADDRESS>
```

3. Finding Program IDs:
- Check project documentation/GitHub
- Use Solana Explorer (explorer.solana.com)
- Check popular program ID registries
- For verified programs on mainnet, use Solscan or Solana FM

Example for finding transactions by program:
```typescript
// Using web3.js
const connection = new Connection("https://api.mainnet-beta.solana.com");

const programId = new PublicKey("YOUR_PROGRAM_ID");
const transactions = await connection.getParsedProgramAccounts(programId);
```

Would you like me to show how to interact with a specific program or find a particular program ID?