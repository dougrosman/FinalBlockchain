// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Memorial {
    struct UserState {
        uint256 totalRespectsPaid; // Total respects paid across all animals
        mapping(string => uint256) respectsPerAnimal; // Tracks respects paid to each animal
        bool trainDeparted; // Tracks if the train event has occurred
    }

    mapping(address => UserState) private users;

    string[] public animals = [
        "Rosie", "Zorro", "Lucy", "Cutie", "Petal", "Nipple", "Butters", "Barry"
    ];

    event RespectPaid(address indexed user, string animal, uint256 totalRespectsForAnimal);
    event HeavenUnlocked(address indexed user);
    event TrainDeparted(address indexed user);

    /// @notice Allows a user to pay respect to an animal
    /// @param animal The name of the animal
    function payRespect(string memory animal) public {
        require(isValidAnimal(animal), "Invalid animal.");

        UserState storage user = users[msg.sender];

        // Update respects data
        user.respectsPerAnimal[animal]++;
        user.totalRespectsPaid++;

        emit RespectPaid(msg.sender, animal, user.respectsPerAnimal[animal]);

        // Unlock Heaven on the first respect
        if (user.totalRespectsPaid == 1) {
            emit HeavenUnlocked(msg.sender);
        }
    }

    /// @notice Gets the total respects paid by the user
    /// @return Total respects paid
    function getTotalRespectsPaid() public view returns (uint256) {
        return users[msg.sender].totalRespectsPaid;
    }

    /// @notice Gets the number of respects paid to a specific animal by the user
    /// @param animal The name of the animal
    /// @return The number of respects paid to the animal
    function getRespectsForAnimal(string memory animal) public view returns (uint256) {
        require(isValidAnimal(animal), "Invalid animal.");
        return users[msg.sender].respectsPerAnimal[animal];
    }

    /// @notice Checks if the train event has been triggered
    /// @return True if the train has departed, false otherwise
    function hasTrainDeparted() public view returns (bool) {
        return users[msg.sender].trainDeparted;
    }

    /// @notice Triggers the train event for the user
    function triggerTrainEvent() public {
        UserState storage user = users[msg.sender];
        require(user.totalRespectsPaid >= animals.length, "You must pay respects to all animals first.");
        require(!user.trainDeparted, "The train has already departed.");

        user.trainDeparted = true;
        emit TrainDeparted(msg.sender);
    }

    /// @notice Checks if a given animal is valid
    /// @param animal The name of the animal
    /// @return True if the animal is valid, false otherwise
    function isValidAnimal(string memory animal) internal view returns (bool) {
        for (uint8 i = 0; i < animals.length; i++) {
            if (keccak256(abi.encodePacked(animals[i])) == keccak256(abi.encodePacked(animal))) {
                return true;
            }
        }
        return false;
    }
}
