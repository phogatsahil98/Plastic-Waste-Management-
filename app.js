// app.js

let web3;
let contract;

const contractAddress = "0x75d79cba3ef7d10a179c8a3760d21895ae2509a6"; 
const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "plasticType",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "weight",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "creditsEarned",
                "type": "uint256"
            }
        ],
        "name": "PlasticSubmitted",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "plasticType",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "weight",
                "type": "uint256"
            }
        ],
        "name": "submitPlastic",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "credits",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalCredits",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalPlasticRecycled",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "submissions",
        "outputs": [
            {
                "internalType": "string",
                "name": "plasticType",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "weight",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalPlasticRecycled",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Check if MetaMask is installed
if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
    console.log('Ethereum wallet detected');
} else {
    alert('Please install MetaMask to use this application.');
}

if (web3) {
    contract = new web3.eth.Contract(contractABI, contractAddress);
}

// Handle network and account changes
window.ethereum.on('chainChanged', () => {
    window.location.reload();
});

window.ethereum.on('accountsChanged', async (accounts) => {
    if (accounts.length > 0) {
        const userWallet = accounts[0];
        document.getElementById('walletInfo').innerHTML = `<p>Connected Wallet: ${userWallet}</p>`;
    } else {
        document.getElementById('walletInfo').innerHTML = `<p>Disconnected</p>`;
    }
});

// Connect Wallet account
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const userWallet = accounts[0];

            // Initialize web3
            window.web3 = new Web3(window.ethereum);
            contract = new web3.eth.Contract(contractABI, contractAddress);

            // Update UI with wallet address
            document.getElementById('walletInfo').innerHTML = `<p>Connected Wallet: ${userWallet}</p>`;
            console.log("Connected Account:", userWallet);
        } catch (error) {
            console.error("User denied account access:", error);
            alert("Please allow MetaMask to connect.");
        }
    } else {
        alert("MetaMask is not installed. Please install MetaMask.");
    }
}

// Add event listener to the connect button
document.getElementById('connectWallet').addEventListener('click', connectWallet);


// Event Listener for Submit Plastic Form
const submitForm = document.getElementById('submitForm');
submitForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevents default form submission

    const plasticType = document.getElementById('plasticType').value;
    const weight = document.getElementById('weight').value;

    // Validate input
    if (!plasticType || !weight) {
        alert('Please fill in all the fields.');
        return;
    }

    try {
        // Get connected account
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            alert("Please connect your wallet.");
            return;
        }

        const userWallet = accounts[0];
        console.log("Submitting plastic:", plasticType, weight);

        // Interact with the contract
        await contract.methods.submitPlastic(plasticType, weight).send({ from: userWallet });

        alert('Plastic submission successful! Credits will be updated shortly.');
        loadDashboard();
    } catch (error) {
        console.error('Error submitting plastic:', error);
        alert('Transaction failed. Check console for details.');
    }
});

// Load Dashboard Statistics
async function loadDashboard() {
    try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            alert("Please connect your wallet to continue.");
            return;
        }

        // Get total credits and total plastic recycled
        const totalCredits = await contract.methods.getTotalCredits().call();
        const totalPlastic = await contract.methods.getTotalPlasticRecycled().call();

        // Update the stats
        const statsDiv = document.getElementById('statistics');
        statsDiv.innerHTML = `
            <p>Total Credits Issued: ${totalCredits}</p>
            <p>Total Plastic Recycled: ${totalPlastic} kg</p>
        `;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert("Failed to load dashboard data.");
    }
}

// Initial Page Load
window.addEventListener('DOMContentLoaded', () => {
    if (web3) {
        connectWallet();
        loadDashboard();
    }
});

