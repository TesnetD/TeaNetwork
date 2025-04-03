import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import readline from "readline";
import chalk from "chalk";
import figlet from "figlet";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

let transactionCount = null;
let option = null;

// Function to display ASCII banner
function showBanner() {
    console.clear();
    console.log(chalk.blueBright(figlet.textSync("NT - Exhaust", { horizontalLayout: "fitted" })));
    console.log(chalk.greenBright("🔥 Created by NT - Exhaust 🔥"));
    console.log(chalk.greenBright("🔥 Telegram: https://t.me/@NTExhaust 🔥\n"));
}

// Function to fetch and display wallet info
async function showWalletInfo() {
    const balance = await provider.getBalance(wallet.address);
    console.log(chalk.yellow("💳 Wallet Information"));
    console.log(chalk.cyan(`🔹 Address: ${wallet.address}`));
    console.log(chalk.green(`🔹 Balance: ${ethers.formatEther(balance)} ETH\n`));
}

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function getUserInput() {
    if (option === null || transactionCount === null) {
        option = await askQuestion(chalk.magenta("\nPilih opsi transaksi (1: Burn Address, 2: KYC Wallets): "));
        transactionCount = await askQuestion(chalk.magenta("Masukkan jumlah transaksi: "));
        transactionCount = Number(transactionCount);

        rl.close();
    }
}

async function autoTransaction() {
    const file = option === "1" ? "burnAddress.txt" : "KycAddress.txt";

    if (!fs.existsSync(file)) {
        console.log(chalk.red(`❌ File ${file} tidak ditemukan.`));
        return;
    }

    const addresses = fs.readFileSync(file, "utf-8").split("\n").map(addr => addr.trim()).filter(addr => addr);
    console.log(chalk.yellow("\n🚀 Starting Transactions...\n"));

    for (let i = 0; i < transactionCount; i++) {
        const recipient = addresses[Math.floor(Math.random() * addresses.length)];
        const amount = (Math.random() * (0.09 - 0.01) + 0.01).toFixed(4);

        console.log(chalk.blueBright(`🔹 Transaction ${i + 1}/${transactionCount}`));
        console.log(chalk.cyan(`➡ Sending ${chalk.green(amount + " ETH")} to ${chalk.yellow(recipient)}`));

        try {
            const tx = await wallet.sendTransaction({
                to: recipient,
                value: ethers.parseEther(amount)
            });

            console.log(chalk.green(`✅ Success! TX Hash: ${chalk.blue(tx.hash)}`));
            await tx.wait();
        } catch (error) {
            console.log(chalk.red(`❌ Transaction failed: ${error.message}`));
        }

        console.log(chalk.gray("⌛ Waiting 5 seconds before next transaction...\n"));
        await new Promise(res => setTimeout(res, 5000));
    }

    console.log(chalk.greenBright("\n🎉 All transactions completed! Next run in 24 hours.\n"));

    // Restart the script after 24 hours (86400000 ms)
    setTimeout(startProcess, 86400000);
}

async function startProcess() {
    showBanner();
    await showWalletInfo();
    await getUserInput();
    await autoTransaction();
}

// Start the first process
startProcess();
