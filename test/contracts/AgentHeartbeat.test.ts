// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import { expect } from "chai";
import { ethers } from "hardhat";
import { AgentHeartbeat } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("AgentHeartbeat", function () {
  let agentHeartbeat: AgentHeartbeat;
  let owner: HardhatEthersSigner;
  let agent1: HardhatEthersSigner;
  let agent2: HardhatEthersSigner;
  let unauthorized: HardhatEthersSigner;

  const DID_1 = ethers.id("did:vexel:agent1");
  const DID_2 = ethers.id("did:vexel:agent2");

  beforeEach(async function () {
    [owner, agent1, agent2, unauthorized] = await ethers.getSigners();

    const AgentHeartbeatFactory = await ethers.getContractFactory("AgentHeartbeat");
    agentHeartbeat = await AgentHeartbeatFactory.deploy();
    await agentHeartbeat.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await agentHeartbeat.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero agents", async function () {
      expect(await agentHeartbeat.getAgentCount()).to.equal(0);
    });
  });

  describe("Agent Registration", function () {
    it("Should register a new agent with default threshold", async function () {
      await expect(
        agentHeartbeat.registerAgent(DID_1, agent1.address, 0)
      )
        .to.emit(agentHeartbeat, "AgentRegistered")
        .withArgs(DID_1, agent1.address, 30 * 24 * 60 * 60); // 30 days in seconds

      expect(await agentHeartbeat.isRegistered(DID_1)).to.be.true;
      expect(await agentHeartbeat.getAgentCount()).to.equal(1);

      const agent = await agentHeartbeat.getAgent(DID_1);
      expect(agent.agentAddress).to.equal(agent1.address);
      expect(agent.isActive).to.be.true;
      expect(agent.inactivityTriggered).to.be.false;
    });

    it("Should register a new agent with custom threshold", async function () {
      const customThreshold = 7 * 24 * 60 * 60; // 7 days
      await expect(
        agentHeartbeat.registerAgent(DID_1, agent1.address, customThreshold)
      )
        .to.emit(agentHeartbeat, "AgentRegistered")
        .withArgs(DID_1, agent1.address, customThreshold);

      const agent = await agentHeartbeat.getAgent(DID_1);
      expect(agent.inactivityThreshold).to.equal(customThreshold);
    });

    it("Should reject registration with zero address", async function () {
      await expect(
        agentHeartbeat.registerAgent(DID_1, ethers.ZeroAddress, 0)
      ).to.be.revertedWith("Invalid agent address");
    });

    it("Should reject duplicate registration", async function () {
      await agentHeartbeat.registerAgent(DID_1, agent1.address, 0);
      
      await expect(
        agentHeartbeat.registerAgent(DID_1, agent1.address, 0)
      ).to.be.revertedWith("Agent already registered");
    });

    it("Should reject threshold below minimum", async function () {
      const tooLowThreshold = 12 * 60 * 60; // 12 hours (below 1 day minimum)
      
      await expect(
        agentHeartbeat.registerAgent(DID_1, agent1.address, tooLowThreshold)
      ).to.be.revertedWith("Threshold too low");
    });

    it("Should record initial heartbeat on registration", async function () {
      const tx = await agentHeartbeat.registerAgent(DID_1, agent1.address, 0);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      const agent = await agentHeartbeat.getAgent(DID_1);
      expect(agent.lastHeartbeat).to.equal(block!.timestamp);
    });
  });

  describe("Heartbeat Recording", function () {
    beforeEach(async function () {
      await agentHeartbeat.registerAgent(DID_1, agent1.address, 0);
    });

    it("Should allow agent to record heartbeat", async function () {
      await time.increase(3600); // 1 hour

      await expect(
        agentHeartbeat.connect(agent1).recordHeartbeat(DID_1)
      ).to.emit(agentHeartbeat, "HeartbeatRecorded");

      const agent = await agentHeartbeat.getAgent(DID_1);
      const currentTime = await time.latest();
      expect(agent.lastHeartbeat).to.equal(currentTime);
    });

    it("Should allow owner to record heartbeat", async function () {
      await time.increase(3600);

      await expect(
        agentHeartbeat.connect(owner).recordHeartbeat(DID_1)
      ).to.emit(agentHeartbeat, "HeartbeatRecorded");
    });

    it("Should reject heartbeat from unauthorized address", async function () {
      await expect(
        agentHeartbeat.connect(unauthorized).recordHeartbeat(DID_1)
      ).to.be.revertedWith("Unauthorized");
    });

    it("Should reject heartbeat for unregistered agent", async function () {
      await expect(
        agentHeartbeat.connect(agent1).recordHeartbeat(DID_2)
      ).to.be.revertedWith("Agent not registered");
    });

    it("Should reset inactivity trigger on heartbeat", async function () {
      // Fast forward past inactivity threshold
      await time.increase(31 * 24 * 60 * 60); // 31 days

      // Trigger inactivity detection manually
      const [upkeepNeeded, performData] = await agentHeartbeat.checkUpkeep("0x");
      if (upkeepNeeded) {
        await agentHeartbeat.performUpkeep(performData);
      }

      let agent = await agentHeartbeat.getAgent(DID_1);
      expect(agent.inactivityTriggered).to.be.true;

      // Record heartbeat should reset the trigger
      await agentHeartbeat.connect(agent1).recordHeartbeat(DID_1);

      agent = await agentHeartbeat.getAgent(DID_1);
      expect(agent.inactivityTriggered).to.be.false;
    });
  });

  describe("Inactivity Detection", function () {
    beforeEach(async function () {
      const customThreshold = 7 * 24 * 60 * 60; // 7 days
      await agentHeartbeat.registerAgent(DID_1, agent1.address, customThreshold);
    });

    it("Should detect inactive agent", async function () {
      expect(await agentHeartbeat.isAgentInactive(DID_1)).to.be.false;

      // Fast forward past threshold
      await time.increase(8 * 24 * 60 * 60); // 8 days

      expect(await agentHeartbeat.isAgentInactive(DID_1)).to.be.true;
    });

    it("Should not detect active agent as inactive", async function () {
      await time.increase(6 * 24 * 60 * 60); // 6 days (below threshold)
      expect(await agentHeartbeat.isAgentInactive(DID_1)).to.be.false;
    });

    it("Should return false for unregistered agent", async function () {
      expect(await agentHeartbeat.isAgentInactive(DID_2)).to.be.false;
    });

    it("Should get inactive agents", async function () {
      await agentHeartbeat.registerAgent(DID_2, agent2.address, 7 * 24 * 60 * 60);

      // Fast forward past threshold
      await time.increase(8 * 24 * 60 * 60); // 8 days

      const inactiveAgents = await agentHeartbeat.getInactiveAgents();
      expect(inactiveAgents.length).to.equal(2);
      expect(inactiveAgents).to.include(DID_1);
      expect(inactiveAgents).to.include(DID_2);
    });
  });

  describe("Inactivity Threshold Update", function () {
    beforeEach(async function () {
      await agentHeartbeat.registerAgent(DID_1, agent1.address, 0);
    });

    it("Should allow agent to update threshold", async function () {
      const newThreshold = 14 * 24 * 60 * 60; // 14 days

      await expect(
        agentHeartbeat.connect(agent1).updateInactivityThreshold(DID_1, newThreshold)
      )
        .to.emit(agentHeartbeat, "InactivityThresholdUpdated")
        .withArgs(DID_1, newThreshold);

      const agent = await agentHeartbeat.getAgent(DID_1);
      expect(agent.inactivityThreshold).to.equal(newThreshold);
    });

    it("Should allow owner to update threshold", async function () {
      const newThreshold = 14 * 24 * 60 * 60;

      await expect(
        agentHeartbeat.connect(owner).updateInactivityThreshold(DID_1, newThreshold)
      ).to.emit(agentHeartbeat, "InactivityThresholdUpdated");
    });

    it("Should reject threshold update from unauthorized address", async function () {
      await expect(
        agentHeartbeat.connect(unauthorized).updateInactivityThreshold(DID_1, 14 * 24 * 60 * 60)
      ).to.be.revertedWith("Unauthorized");
    });

    it("Should reject threshold below minimum", async function () {
      await expect(
        agentHeartbeat.connect(agent1).updateInactivityThreshold(DID_1, 12 * 60 * 60)
      ).to.be.revertedWith("Threshold too low");
    });
  });

  describe("Agent Deactivation", function () {
    beforeEach(async function () {
      await agentHeartbeat.registerAgent(DID_1, agent1.address, 0);
    });

    it("Should allow agent to deactivate itself", async function () {
      await expect(
        agentHeartbeat.connect(agent1).deactivateAgent(DID_1)
      )
        .to.emit(agentHeartbeat, "AgentDeactivated")
        .withArgs(DID_1, agent1.address);

      const agent = await agentHeartbeat.getAgent(DID_1);
      expect(agent.isActive).to.be.false;
    });

    it("Should allow owner to deactivate agent", async function () {
      await expect(
        agentHeartbeat.connect(owner).deactivateAgent(DID_1)
      ).to.emit(agentHeartbeat, "AgentDeactivated");
    });

    it("Should reject deactivation from unauthorized address", async function () {
      await expect(
        agentHeartbeat.connect(unauthorized).deactivateAgent(DID_1)
      ).to.be.revertedWith("Unauthorized");
    });

    it("Should reject heartbeat for deactivated agent", async function () {
      await agentHeartbeat.connect(agent1).deactivateAgent(DID_1);

      await expect(
        agentHeartbeat.connect(agent1).recordHeartbeat(DID_1)
      ).to.be.revertedWith("Agent is not active");
    });

    it("Should reject duplicate deactivation", async function () {
      await agentHeartbeat.connect(agent1).deactivateAgent(DID_1);

      await expect(
        agentHeartbeat.connect(agent1).deactivateAgent(DID_1)
      ).to.be.revertedWith("Agent already deactivated");
    });
  });

  describe("Chainlink Automation", function () {
    beforeEach(async function () {
      const customThreshold = 7 * 24 * 60 * 60; // 7 days
      await agentHeartbeat.registerAgent(DID_1, agent1.address, customThreshold);
      await agentHeartbeat.registerAgent(DID_2, agent2.address, customThreshold);
    });

    it("Should return false when no upkeep is needed", async function () {
      const [upkeepNeeded] = await agentHeartbeat.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.false;
    });

    it("Should return true when upkeep is needed", async function () {
      // Fast forward past threshold
      await time.increase(8 * 24 * 60 * 60); // 8 days

      const [upkeepNeeded, performData] = await agentHeartbeat.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;
      expect(performData).to.not.equal("0x");

      const inactiveAgents = ethers.AbiCoder.defaultAbiCoder().decode(
        ["bytes32[]"],
        performData
      )[0];
      expect(inactiveAgents.length).to.equal(2);
    });

    it("Should perform upkeep and emit events", async function () {
      // Fast forward past threshold
      await time.increase(8 * 24 * 60 * 60); // 8 days

      const [upkeepNeeded, performData] = await agentHeartbeat.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;

      await expect(agentHeartbeat.performUpkeep(performData))
        .to.emit(agentHeartbeat, "InactivityDetected");

      const agent1Data = await agentHeartbeat.getAgent(DID_1);
      const agent2Data = await agentHeartbeat.getAgent(DID_2);
      expect(agent1Data.inactivityTriggered).to.be.true;
      expect(agent2Data.inactivityTriggered).to.be.true;
    });

    it("Should not trigger same agent twice", async function () {
      // Fast forward past threshold
      await time.increase(8 * 24 * 60 * 60); // 8 days

      // First upkeep
      let [upkeepNeeded, performData] = await agentHeartbeat.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;
      await agentHeartbeat.performUpkeep(performData);

      // Second check should return false
      [upkeepNeeded] = await agentHeartbeat.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.false;
    });

    it("Should not include deactivated agents in upkeep", async function () {
      await agentHeartbeat.connect(agent1).deactivateAgent(DID_1);

      // Fast forward past threshold
      await time.increase(8 * 24 * 60 * 60); // 8 days

      const [upkeepNeeded, performData] = await agentHeartbeat.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;

      const inactiveAgents = ethers.AbiCoder.defaultAbiCoder().decode(
        ["bytes32[]"],
        performData
      )[0];
      expect(inactiveAgents.length).to.equal(1);
      expect(inactiveAgents[0]).to.equal(DID_2);
    });
  });

  describe("Gas Optimization", function () {
    it("Should handle multiple agents efficiently", async function () {
      const agentCount = 10;
      const dids: string[] = [];

      // Register multiple agents
      for (let i = 0; i < agentCount; i++) {
        const did = ethers.id(`did:vexel:agent${i}`);
        dids.push(did);
        await agentHeartbeat.registerAgent(did, agent1.address, 7 * 24 * 60 * 60);
      }

      expect(await agentHeartbeat.getAgentCount()).to.equal(agentCount);

      // Fast forward and check upkeep
      await time.increase(8 * 24 * 60 * 60);

      const [upkeepNeeded, performData] = await agentHeartbeat.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;

      const inactiveAgents = ethers.AbiCoder.defaultAbiCoder().decode(
        ["bytes32[]"],
        performData
      )[0];
      expect(inactiveAgents.length).to.equal(agentCount);

      // Perform upkeep
      await agentHeartbeat.performUpkeep(performData);

      // Verify all agents triggered
      for (const did of dids) {
        const agent = await agentHeartbeat.getAgent(did);
        expect(agent.inactivityTriggered).to.be.true;
      }
    });
  });
});
