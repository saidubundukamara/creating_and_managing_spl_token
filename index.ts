import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';

import {
    ExtensionType,
    createInitializeMintInstruction,
    mintTo,
    createAccount,
    getMintLen,
    TOKEN_2022_PROGRAM_ID,
    TYPE_SIZE,
    LENGTH_SIZE,
    createInitializeMetadataPointerInstruction,
} from '@solana/spl-token';

import {
    createInitializeTransferFeeConfigInstruction,
    transferCheckedWithFee,
} from '@solana/spl-token';

import { createInitializeInstruction, pack, TokenMetadata } from '@solana/spl-token-metadata';




// Define the extensions to be used by the mint
const extensions = [
    ExtensionType.TransferFeeConfig,
    ExtensionType.MetadataPointer,
];

// Calculate the length of the mint
const mintLen = getMintLen(extensions); 

async function main(){

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const payer = Keypair.generate();

    //airdrop the payer
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });
   
    

    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    console.log("Mint public key: ", mint.toBase58());

    //const transferFeeConfigAuthority = Keypair.generate();
    const transferFeeConfigAuthority = Keypair.generate();

    //const withdrawWithheldAuthority = Keypair.generate();
    const withdrawWithheldAuthority = Keypair.generate();

    const decimals = 9;
    const feeBasisPoints = 50;
    const maxFee = BigInt(5_000);


    const metadata: TokenMetadata = {
        mint: mint,
        name: "Adventure-Coin",
        symbol: "ADC",
        uri: "https://github.com/saidubundukamara/solana_meta_data/blob/main/metadata.json",
        additionalMetadata: [["description", "Only Possible On Solana"]],
    };

    const mintLen = getMintLen(extensions);

    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

    const mintTransaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports: mintLamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),

        createInitializeTransferFeeConfigInstruction(
            mint,
            transferFeeConfigAuthority.publicKey,
            withdrawWithheldAuthority.publicKey,
            feeBasisPoints,
            maxFee,
            TOKEN_2022_PROGRAM_ID
        ),

        createInitializeMetadataPointerInstruction(mint, payer.publicKey, mint, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(mint, decimals, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),

        createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            mint: mint,
            metadata: metadata.mint,
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
            mintAuthority: payer.publicKey,
            updateAuthority: payer.publicKey,
        }),


    );

    await sendAndConfirmTransaction(connection, mintTransaction, [payer, mintKeypair], undefined);

    console.log("Mint created: ", mint.toBase58());

    //Transfer the token 

    const mintAmount = BigInt(1_000_000_000);

    const sourceAccount = await createAccount(
        connection,
        payer,
        mint,
        payer.publicKey,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
    );

    console.log("Source account: ", sourceAccount.toBase58());

    //Mint the token to the payers account
    await mintTo(
        connection,
        payer,
        mint,
        sourceAccount,
        payer.publicKey,
        mintAmount,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID
    );

    //Reciever of the token
    const account = Keypair.generate();

    const destinationAccount = await createAccount(
        connection,
        payer,
        mint,
        payer.publicKey,
        account,
        undefined,
        TOKEN_2022_PROGRAM_ID
    )

    console.log('Destination account: ', destinationAccount.toBase58());

    const transferAmount = BigInt(1_000_000);
    const fee = (transferAmount * BigInt(feeBasisPoints)) / BigInt(10_000);

    console.log('Fee: ', fee);

    //Transfer the token with the fee
    await transferCheckedWithFee(
        connection,
        payer,
        sourceAccount,
        mint,
        destinationAccount,
        payer,
        transferAmount,
        decimals,
        fee,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID
    )

    console.log("Token transferred");


}

main();