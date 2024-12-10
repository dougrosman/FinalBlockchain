const provider = new ethers.BrowserProvider(window.ethereum);
let signer, contract;

// const contractAddress = "0x9F53Db178e5714b63Fbf8656722725072fAB6F28";

const contractAddress = "0x4f71f040852a5856D6d593FE2716C2530588a03f"

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
    
    const respectsPaidData = await fetchRespectsData(); // Fetch respects data
    const trainDeparted = await contract.hasTrainDeparted();

    respectsPaidData.animals.forEach((animal) => {
        if (animal.respects > 0) {
            renderAnimal(animal.name, trainDeparted); // Render only animals with respects paid
        }
    });

    await updateBackground(); // Update the background based on respects paid
}

// Update the background image based on the number of respects paid
async function updateBackground() {
    try {
        // Fetch the total respects paid by the user from the contract
        const totalRespectsPaid = await contract.getTotalRespectsPaid();

        // Determine the background class based on respects paid
        let backgroundClass = "bg-heaven"; // Default background
        if (totalRespectsPaid >= 2) {
            backgroundClass = "bg-homestead";

            Rosie.style.bottom = "100px"
            Rosie.style.right = "200px"

        } 
        if (totalRespectsPaid >= 4) {
            backgroundClass = "bg-littletown";

            Rosie.style.bottom = "100px"
            Rosie.style.right = "200px"
        }
        if (totalRespectsPaid >= animals.length) {
            backgroundClass = "bg-dantesinferno";

            Rosie.style.bottom = "100px"
            Rosie.style.right = "200px"
        }

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
function renderAnimal(name, trainDeparted) {
    // Create a container for the animal and its options
    const animalContainer = document.createElement("div");
    animalContainer.classList.add("animal-container");
    animalContainer.style.margin = "10px";
    animalContainer.id = (`${name}`)

    // Create the animal image
    const animal = document.createElement("img");
    // console.log(name)
    animal.src = `${name.toLowerCase()}.png`;
    animal.classList.add("animal");
   
    animal.classList.add("animate__animated")

    // PUBLISH: set trainDeparted == false
    if(trainDeparted == false) {
        setTimeout(function(){
            animalContainer.style.opacity = "1"

        }, 1500)
    }
    

    // Options container
    const options = document.createElement("div");
    options.classList.add("options");
    options.style.position = "absolute";
    options.style.top = "0";
    options.style.left = "0";
    //options.style.transform = "translateX(-80%)";
    //options.style.display = "none"; // Initially hidden
    //options.style.background = "#fff";
    //options.style.border = "1px solid #ccc";
    options.style.padding = "1px";
    options.style.borderRadius = "5px";
    options.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";

    // Add action buttons to the options menu
    let interactionOptions = ["pet", "play", "feel the love"]
    for (let i = 0; i < interactionOptions.length; i++) {


        let action = interactionOptions[i]
        const btn = document.createElement("div");
        btn.classList.add("option");
        btn.textContent = action;
        btn.style.cursor = "pointer";
        btn.style.marginBottom = "5px";

        if(i == 0) {
            btn.style.transform = "translate(35%, -100%)"
        }
        if(i == 1) {
            btn.style.transform = "translate(-90%, -90%)"
        }
        if(i == 2) {
            btn.style.transform = "translate(180%, -100%)"
        }
        btn.addEventListener("click", () => animateAnimal(animal, action));
        options.appendChild(btn);
    }
    

    // Show the options menu on hover over the container
    animalContainer.addEventListener("mouseover", () => {
        options.style.display = "block";
        console.log("hovered over")
        document.querySelectorAll('.animal-container').forEach(a => {
            a.style.zIndex = 10;
        })
        animalContainer.style.zIndex = 999;
    });

    // Keep the options menu visible when hovering over it
    options.addEventListener("mouseover", () => {
        options.style.display = "block";
        document.querySelectorAll('.animal-container').forEach(a => {
            a.style.zIndex = 10;
        })
        animalContainer.style.zIndex = 999;
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

        // PUBLISH: SWAP THE LINE BELOW BACK IN
        if (allAnimalsRespected && !trainDeparted) {
            if (allAnimalsRespected) {
            //Show the train ticket
            const trainTicket = document.getElementById("train-ticket");
            trainTicket.style.display = "block";
            trainTicket.classList.add("animate__slideInDown");
            }

            // Add click event to train ticket
            trainTicket.addEventListener("click", async () => {
                try {
                    // Trigger the train event in the contract

                    // PUBLISH: uncomment the two lines below
                    const tx = await contract.triggerTrainEvent();
                    await tx.wait(); // Wait for the transaction to be mined

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
                    trolley.classList.add("animate__animated");
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
                                    text.classList.add("animate__fadeOutUp");
                                    trolley.style.right = "50%"
                                    trolley.style.bottom = "10px"
                                    trolley.classList.remove("slideInRight");
                                    whistle.classList.add("animate__fadeOutUp");
                                    trolley.classList.add("slideUpFadeOut");

                                    // Cleanup after animation
                                    setTimeout(() => {
                                        text.style.display = "none";
                                        //trolley.remove();
                                        
                                        whistle.style.display = "none";
                                    }, 1000);
                                }, 100);
                            });
                        }, 300);
                    }, 300); // Pause after trolley arrives
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
