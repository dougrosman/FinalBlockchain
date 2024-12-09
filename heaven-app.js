const provider = new ethers.BrowserProvider(window.ethereum);
let signer, contract;

const contractAddress = "0x9F53Db178e5714b63Fbf8656722725072fAB6F28";
const abi = []; // Add the contract ABI here
const container = document.getElementById("container");

(async function init() {
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    await loadPage();
})();

async function loadPage() {
    const respectsPaidData = await fetchRespectsData(); // Fetch respects data
    respectsPaidData.animals.forEach((animal) => {
        if (animal.respects > 0) {
            renderAnimal(animal.name);
        }
    });
}

// Fetch respects data
async function fetchRespectsData() {
    return {
        animals: [
            { name: "lucy", respects: 1 },
            { name: "rosie", respects: 2 },
            { name: "zorro", respects: 1 },
        ],
    };
}

// Render Animal
function renderAnimal(name) {
    const animal = document.createElement("img");
    animal.src = `${name}.png`;
    animal.classList.add("animal");

    // Options container
    const options = document.createElement("div");
    options.classList.add("options");
    ["pet", "play", "feel the love"].forEach((action) => {
        const btn = document.createElement("div");
        btn.classList.add("option");
        btn.textContent = action;
        btn.addEventListener("click", () => animateAnimal(animal, action));
        options.appendChild(btn);
    });

    animal.addEventListener("mouseover", () => {
        options.style.display = "block";
    });
    animal.addEventListener("mouseleave", () => {
        options.style.display = "none";
    });

    // Append options and animal to container
    animal.appendChild(options);
    container.appendChild(animal);
}

// Animate Animal
function animateAnimal(animal, action) {
    if (action === "pet") animal.classList.add("animate__shakeY");
    else if (action === "play") animal.classList.add("animate__wobble");
    else if (action === "feel the love") animal.classList.add("animate__tada");

    setTimeout(() => {
        animal.classList.remove("animate__shakeY", "animate__wobble", "animate__tada");
    }, 1000);
}
