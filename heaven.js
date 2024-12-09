const provider = new ethers.BrowserProvider(window.ethereum);
let signer, contract;

const contractAddress = "0x9F53Db178e5714b63Fbf8656722725072fAB6F28";
// Add the contract ABI here
const container = document.getElementById("container");

const animals = [
    "Lucy",
    "Rosie",
    "Zorro",
    "Cutie",
    "Petal",
    "Barry",
    "Butters",
    "Nipple"
];

// Initialize ethers.js and load the page
(async function init() {
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    await loadPage();
    await checkTrainEvent();
})();

async function loadPage() {
    await updateBackground(); // Update the background based on respects paid
    const respectsPaidData = await fetchRespectsData(); // Fetch respects data

    respectsPaidData.animals.forEach((animal) => {
        if (animal.respects > 0) {
            renderAnimal(animal.name); // Render only animals with respects paid
        }
    });
}

// Update the background image based on the number of respects paid
async function updateBackground() {
    try {
        // Fetch the total respects paid by the user from the contract
        const totalRespectsPaid = await contract.getTotalRespectsPaid();

        // Determine the background class based on respects paid
        let backgroundClass = "bg-heaven"; // Default background
        if (totalRespectsPaid >= 2) backgroundClass = "bg-homestead";
        if (totalRespectsPaid >= 4) backgroundClass = "bg-littletown";
        if (totalRespectsPaid >= animals.length) backgroundClass = "bg-dantesinferno";

        // Update the container's class
        container.className = ""; // Clear previous classes
        container.classList.add(backgroundClass);
    } catch (error) {
        console.error("Error fetching total respects paid:", error);
    }
}


// Fetch respects data from the smart contract
async function fetchRespectsData() {
    const respectsData = [];

    // Loop through all animals and fetch respects for each
    for (const animal of animals) {
        try {
            const respects = await contract.getRespectsForAnimal(animal);
            respectsData.push({
                name: animal,
                respects: parseInt(respects.toString()) // Convert BigNumber to integer
            });
        } catch (error) {
            console.error(`Error fetching respects for ${animal}:`, error);
            respectsData.push({
                name: animal,
                respects: 0 // Default to 0 if there's an error
            });
        }
    }

    return { animals: respectsData };
}


// Render Animal
function renderAnimal(name) {
    // Create a container for the animal and its options
    const animalContainer = document.createElement("div");
    animalContainer.classList.add("animal-container");
    //animalContainer.style.position = "absolute";
    //animalContainer.style.display = "inline-block";
    animalContainer.style.margin = "10px";

    // Create the animal image
    const animal = document.createElement("img");
    animal.src = `${name}.png`;
    animal.classList.add("animal");
    animal.classList.add(`${name}`)
    animal.classList.add("animate__animated")

    // Options container
    const options = document.createElement("div");
    options.classList.add("options");
    options.style.position = "absolute";
    options.style.top = "-180px";
    options.style.left = "50%";
    options.style.transform = "translateX(-50%)";
    options.style.display = "none"; // Initially hidden
    options.style.background = "#fff";
    options.style.border = "1px solid #ccc";
    options.style.padding = "1px";
    options.style.borderRadius = "5px";
    options.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";

    // Add action buttons to the options menu
    ["pet", "play", "feel the love"].forEach((action) => {
        const btn = document.createElement("div");
        btn.classList.add("option");
        btn.textContent = action;
        btn.style.cursor = "pointer";
        btn.style.marginBottom = "5px";
        btn.addEventListener("click", () => animateAnimal(animal, action));
        options.appendChild(btn);
    });

    // Show the options menu on hover over the container
    animalContainer.addEventListener("mouseover", () => {
        options.style.display = "block";
    });

    // Keep the options menu visible when hovering over it
    options.addEventListener("mouseover", () => {
        options.style.display = "block";
    });

    // Hide the options menu when the mouse leaves both the container and the menu
    animalContainer.addEventListener("mouseleave", () => {
        options.style.display = "none";
    });
    options.addEventListener("mouseleave", () => {
        options.style.display = "none";
    });

    // Append the image and options to the container
    animalContainer.appendChild(animal);
    animalContainer.appendChild(options);

    // Append the animal container to the main container
    container.appendChild(animalContainer);
}



// Animate Animal
function animateAnimal(animal, action) {
    console.log("animal clicked")
    if (action === "pet") animal.classList.add("animate__shakeY");
    else if (action === "play") animal.classList.add("animate__wobble");
    else if (action === "feel the love") animal.classList.add("animate__tada");

    setTimeout(() => {
        animal.classList.remove("animate__shakeY", "animate__wobble", "animate__tada");
    }, 1000);
}


async function checkTrainEvent() {
    try {
        // Check if all animals have at least one respect paid
        const respectsPromises = animals.map(async (animal) => {
            const respects = await contract.getRespectsForAnimal(animal);
            return parseInt(respects.toString()) > 0;
        });
        const respectsResults = await Promise.all(respectsPromises);
        const allAnimalsRespected = respectsResults.every((respected) => respected);

        // Check if the train has already departed
        const trainDeparted = await contract.hasTrainDeparted();

        //if (allAnimalsRespected && !trainDeparted) {
            if (allAnimalsRespected) {
            // Show the train ticket
            const trainTicket = document.getElementById("train-ticket");
            trainTicket.style.display = "block";
            trainTicket.classList.add("animate__slideInDown");

            // Add click event to train ticket
            trainTicket.addEventListener("click", async () => {
                try {
                    // Trigger the train event in the contract
                    // const tx = await contract.triggerTrainEvent();
                    // await tx.wait(); // Wait for the transaction to be mined

                    // Hide the ticket
                    trainTicket.style.display = "none";

                    // Animate the trolly arriving
                    const trolley = document.createElement("div");
                    trolley.id = "trolley";
                    trolley.style.backgroundImage = `url("trolly.png")`;
                    trolley.style.position = "absolute";
                    trolley.style.right = "-300px"; // Start off-screen
                    trolley.style.bottom = "10px";
                    trolley.style.width = "200px";
                    trolley.style.height = "200px";
                    trolley.style.backgroundSize = "contain";
                    trolley.style.backgroundRepeat = "no-repeat";
                    trolley.classList.add("slideInRight");
                    document.getElementById("container").appendChild(trolley);

                    // Wait for the trolly to arrive
                    setTimeout(async () => {
                        // Animate animals to the trolly one by one
                        for (const animal of animals) {
                            const animalDiv = document.querySelector(`.${animal}`);
                            if (animalDiv) {
                                animalDiv.classList.add("animalToTrolley");
                                await new Promise((resolve) => setTimeout(resolve, 250)); // Wait for animation
                                animalDiv.remove();
                            }
                        }

                        // Change trolly image to "end" state
                        trolley.style.backgroundImage = `url("endtrolly.png")`;

                        // Pause before showing text and whistle
                        setTimeout(() => {
                            const endScene = document.getElementById("end-scene");
                            const whistle = document.getElementById("whistle");
                            const text = document.getElementById("text");

                            // Show text and whistle with animations
                            text.style.display = "block";
                            whistle.style.display = "block";
                            text.classList.add("animate__fadeInDown");
                            whistle.classList.add("animate__fadeInDown");

                            // Add click event to whistle
                            whistle.addEventListener("click", () => {
                                whistle.classList.add("animate__rubberBand");

                                // Animate text and trolley leaving the screen
                                setTimeout(() => {
                                    text.classList.add("animate__slideOutUp");
                                    trolley.classList.add("animate__slideOutUp");
                                    whistle.classList.add("animate__slideOutUp");

                                    // Cleanup after animation
                                    setTimeout(() => {
                                        text.style.display = "none";
                                        trolley.remove();
                                        whistle.style.display = "none";
                                    }, 1000);
                                }, 1000);
                            });
                        }, 3000);
                    }, 3000); // Pause after trolley arrives
                } catch (error) {
                    console.error("Error triggering train event:", error);
                    alert("Failed to trigger train event. Please try again.");
                }
            });
        }
    } catch (error) {
        console.error("Error checking train event conditions:", error);
    }
}


// // Call the function when the page loads
// (async function init() {
//     signer = await provider.getSigner();
//     contract = new ethers.Contract(contractAddress, abi, signer);

//     await loadPage();
//     await checkTrainEvent(); // Check if the train ticket should be displayed
// })();
