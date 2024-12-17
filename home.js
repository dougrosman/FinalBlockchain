// const contractAddress = "0x9F53Db178e5714b63Fbf8656722725072fAB6F28";

const contractAddress = "0x4f71f040852a5856D6d593FE2716C2530588a03f"
let provider;
let signer;
let contract;
let respectsPaid = new Set();

// Initialize ethers.js
async function initializeEthers() {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
        console.log("Ethers initialized.");
        handleOliverAnimation();
        checkHeavenSign();
    } else {
        alert("Please install a Web3 wallet like MetaMask to use this feature.");
    }
}

// Show sparkle animation
function showSparkles(target) {
    const sparkle = target === "mailbox" ? document.getElementById("sparkle-mailbox") : document.getElementById("sparkle-heaven");
    const targetElement = document.getElementById(target === "mailbox" ? "mailbox" : "heaven-sign");

    sparkle.style.left = `${targetElement.offsetLeft + 20}px`;
    sparkle.style.top = `${targetElement.offsetTop - 20}px`;
    sparkle.style.display = "block";
    sparkle.classList.add("animate__fadeInUp");

    setTimeout(() => {
        sparkle.classList.replace("animate__fadeInUp", "animate__fadeOutDown");
        setTimeout(() => sparkle.style.display = 2000, 2000);
    }, 2000);
}

// Show Heaven sign
function showHeavenSign() {
    const heavenSign = document.getElementById("heaven-sign");
    heavenSign.style.display = "block";
}

// Check if Heaven sign should be displayed on load
async function checkHeavenSign() {
    const numRespects = await contract.getTotalRespectsPaid()
    console.log(numRespects)
    if (numRespects > 0) {
        showHeavenSign();
    }
}

// Pay respects
async function payRespects() {
    if (!provider || !signer) {
        await initializeEthers();
    }

    const names = ["Rosie", "Lucy", "Zorro", "Cutie", "Petal", "Barry", "Butters", "Nipple"];
    const name = prompt("Choose someone to pay respects to: " + names.join(", "));
    if (!names.includes(name)) {
        alert("Invalid choice. Please try again.");
        return;
    }

    if (respectsPaid.has(name)) {
        alert(`You have already paid respects to ${name}.`);
        return;
    }

    try {
        console.log(`Paying respects to ${name} on contract ${contractAddress}.`);

        // Call the smart contract function to pay respects
        const tx = await contract.payRespect(name);
        await tx.wait(); // Wait for the transaction to be mined

        respectsPaid.add(name);
        localStorage.setItem("hasPaidRespects", "true");
        showSparkles("mailbox");

        if (respectsPaid.size === 1) {
            showHeavenSign();
            setTimeout(() => showSparkles("heaven"), 1000);
        }

        alert(`You have paid respects to ${name}.`);
    } catch (error) {
        console.error("Error interacting with the contract:", error);
        alert("Failed to pay respects. Please try again.");
    }
}


// Go to Heaven page
function goToHeaven() {

    window.location.href = "heaven.html"; // Redirect to the Heaven page
}

// Handle Oliver animation on return
async function handleOliverAnimation() {
    try {
        // Check if the train has departed for the current user
        const trainDeparted = await contract.hasTrainDeparted();
        console.log(trainDeparted)

        if (trainDeparted) {

            const oliver = document.getElementById("oliver");
            oliver.classList.add("oliverWalkIn")
            oliver.style.display = "block";
            //oliver.classList.add("animate__slideInRight");

            setTimeout(() => {
                // Move Oliver to the center and change to sitting position
                // oliver.style.right = "50%";
                // oliver.style.transform = "translateX(50%)";
                oliver.src = "oliversit.png"; // Change to sitting Oliver
                // oliver.classList.remove("animate__slideInRight");
            }, 5000);
        }
    } catch (error) {
        console.error("Error checking train departure status:", error);
    }
}


// Event listeners
document.getElementById("mailbox").addEventListener("click", payRespects);
document.getElementById("heaven-sign").addEventListener("click", goToHeaven);

// Initialize ethers.js on load


// Check Heaven sign and handle Oliver animation on load
window.onload = () => {

    initializeEthers();

};