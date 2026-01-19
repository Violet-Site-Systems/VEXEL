// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

/**
 * @title AgentHeartbeat
 * @notice Smart contract for monitoring agent activity through heartbeat signals
 * @dev Implements Chainlink Automation for inactivity detection and triggers
 */
contract AgentHeartbeat is Ownable, ReentrancyGuard, AutomationCompatibleInterface {
    // Struct to store agent information
    struct Agent {
        address agentAddress;
        uint256 lastHeartbeat;
        bool isActive;
        uint256 inactivityThreshold; // in seconds
        bool inactivityTriggered;
    }

    // Mapping from agent DID to agent info
    mapping(bytes32 => Agent) public agents;
    
    // Array to track all registered agent DIDs
    bytes32[] public agentDIDs;
    
    // Mapping to check if a DID is registered
    mapping(bytes32 => bool) public isRegistered;
    
    // Default inactivity threshold (30 days in seconds)
    uint256 public constant DEFAULT_INACTIVITY_THRESHOLD = 30 days;
    
    // Minimum inactivity threshold (1 day)
    uint256 public constant MIN_INACTIVITY_THRESHOLD = 1 days;
    
    // Events
    event AgentRegistered(bytes32 indexed did, address indexed agentAddress, uint256 inactivityThreshold);
    event HeartbeatRecorded(bytes32 indexed did, uint256 timestamp);
    event InactivityDetected(bytes32 indexed did, uint256 lastHeartbeat, uint256 timestamp);
    event AgentDeactivated(bytes32 indexed did, address indexed agentAddress);
    event InactivityThresholdUpdated(bytes32 indexed did, uint256 newThreshold);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Register a new agent with the heartbeat monitoring system
     * @param did The decentralized identifier of the agent
     * @param agentAddress The Ethereum address associated with the agent
     * @param inactivityThreshold Custom inactivity threshold in seconds (0 for default)
     */
    function registerAgent(
        bytes32 did,
        address agentAddress,
        uint256 inactivityThreshold
    ) external nonReentrant {
        require(!isRegistered[did], "Agent already registered");
        require(agentAddress != address(0), "Invalid agent address");
        
        uint256 threshold = inactivityThreshold > 0 ? inactivityThreshold : DEFAULT_INACTIVITY_THRESHOLD;
        require(threshold >= MIN_INACTIVITY_THRESHOLD, "Threshold too low");

        agents[did] = Agent({
            agentAddress: agentAddress,
            lastHeartbeat: block.timestamp,
            isActive: true,
            inactivityThreshold: threshold,
            inactivityTriggered: false
        });

        agentDIDs.push(did);
        isRegistered[did] = true;

        emit AgentRegistered(did, agentAddress, threshold);
        emit HeartbeatRecorded(did, block.timestamp);
    }

    /**
     * @notice Record a heartbeat for an agent
     * @param did The decentralized identifier of the agent
     */
    function recordHeartbeat(bytes32 did) external nonReentrant {
        require(isRegistered[did], "Agent not registered");
        Agent storage agent = agents[did];
        require(agent.isActive, "Agent is not active");
        require(msg.sender == agent.agentAddress || msg.sender == owner(), "Unauthorized");

        agent.lastHeartbeat = block.timestamp;
        agent.inactivityTriggered = false;

        emit HeartbeatRecorded(did, block.timestamp);
    }

    /**
     * @notice Update the inactivity threshold for an agent
     * @param did The decentralized identifier of the agent
     * @param newThreshold New inactivity threshold in seconds
     */
    function updateInactivityThreshold(bytes32 did, uint256 newThreshold) external nonReentrant {
        require(isRegistered[did], "Agent not registered");
        require(newThreshold >= MIN_INACTIVITY_THRESHOLD, "Threshold too low");
        
        Agent storage agent = agents[did];
        require(msg.sender == agent.agentAddress || msg.sender == owner(), "Unauthorized");

        agent.inactivityThreshold = newThreshold;

        emit InactivityThresholdUpdated(did, newThreshold);
    }

    /**
     * @notice Deactivate an agent
     * @param did The decentralized identifier of the agent
     */
    function deactivateAgent(bytes32 did) external nonReentrant {
        require(isRegistered[did], "Agent not registered");
        
        Agent storage agent = agents[did];
        require(msg.sender == agent.agentAddress || msg.sender == owner(), "Unauthorized");
        require(agent.isActive, "Agent already deactivated");

        agent.isActive = false;

        emit AgentDeactivated(did, agent.agentAddress);
    }

    /**
     * @notice Check if an agent is inactive
     * @param did The decentralized identifier of the agent
     * @return isInactive True if the agent is inactive
     */
    function isAgentInactive(bytes32 did) public view returns (bool) {
        if (!isRegistered[did]) {
            return false;
        }

        Agent memory agent = agents[did];
        if (!agent.isActive) {
            return false;
        }

        return (block.timestamp - agent.lastHeartbeat) >= agent.inactivityThreshold;
    }

    /**
     * @notice Get agent information
     * @param did The decentralized identifier of the agent
     * @return Agent information
     */
    function getAgent(bytes32 did) external view returns (Agent memory) {
        require(isRegistered[did], "Agent not registered");
        return agents[did];
    }

    /**
     * @notice Get the number of registered agents
     * @return Number of registered agents
     */
    function getAgentCount() external view returns (uint256) {
        return agentDIDs.length;
    }

    /**
     * @notice Chainlink Automation: Check if upkeep is needed
     * @dev This function checks if any agents are inactive and need triggering
     * @return upkeepNeeded True if upkeep is needed
     * @return performData Encoded data of inactive agents
     */
    function checkUpkeep(bytes calldata /* checkData */)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        bytes32[] memory inactiveAgents = new bytes32[](agentDIDs.length);
        uint256 inactiveCount = 0;

        for (uint256 i = 0; i < agentDIDs.length; i++) {
            bytes32 did = agentDIDs[i];
            Agent memory agent = agents[did];

            if (agent.isActive && !agent.inactivityTriggered && isAgentInactive(did)) {
                inactiveAgents[inactiveCount] = did;
                inactiveCount++;
            }
        }

        if (inactiveCount > 0) {
            // Create a properly sized array
            bytes32[] memory result = new bytes32[](inactiveCount);
            for (uint256 i = 0; i < inactiveCount; i++) {
                result[i] = inactiveAgents[i];
            }
            upkeepNeeded = true;
            performData = abi.encode(result);
        } else {
            upkeepNeeded = false;
            performData = "";
        }
    }

    /**
     * @notice Chainlink Automation: Perform upkeep
     * @dev This function triggers inactivity events for inactive agents
     * @param performData Encoded data of inactive agents from checkUpkeep
     */
    function performUpkeep(bytes calldata performData) external override {
        bytes32[] memory inactiveAgents = abi.decode(performData, (bytes32[]));

        for (uint256 i = 0; i < inactiveAgents.length; i++) {
            bytes32 did = inactiveAgents[i];
            
            // Verify the agent is still inactive (double-check)
            if (isAgentInactive(did) && !agents[did].inactivityTriggered) {
                agents[did].inactivityTriggered = true;
                emit InactivityDetected(did, agents[did].lastHeartbeat, block.timestamp);
            }
        }
    }

    /**
     * @notice Get all inactive agents
     * @return Array of DIDs for inactive agents
     */
    function getInactiveAgents() external view returns (bytes32[] memory) {
        uint256 inactiveCount = 0;
        
        // First, count inactive agents
        for (uint256 i = 0; i < agentDIDs.length; i++) {
            if (isAgentInactive(agentDIDs[i])) {
                inactiveCount++;
            }
        }

        // Create result array with exact size
        bytes32[] memory inactiveAgents = new bytes32[](inactiveCount);
        uint256 currentIndex = 0;

        // Fill the array
        for (uint256 i = 0; i < agentDIDs.length; i++) {
            if (isAgentInactive(agentDIDs[i])) {
                inactiveAgents[currentIndex] = agentDIDs[i];
                currentIndex++;
            }
        }

        return inactiveAgents;
    }
}
