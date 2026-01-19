const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.HEARTBEAT_CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("Please set HEARTBEAT_CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }

  console.log("Interacting with AgentHeartbeat contract at:", contractAddress);

  const AgentHeartbeat = await hre.ethers.getContractFactory("AgentHeartbeat");
  const agentHeartbeat = AgentHeartbeat.attach(contractAddress);

  // Example: Register an agent
  const agentDID = hre.ethers.id("did:vexel:example-agent");
  const agentAddress = (await hre.ethers.getSigners())[0].address;
  const inactivityThreshold = 30 * 24 * 60 * 60; // 30 days

  console.log("\n=== Registering Agent ===");
  console.log(`DID: ${agentDID}`);
  console.log(`Address: ${agentAddress}`);
  console.log(`Threshold: ${inactivityThreshold} seconds (30 days)`);

  const tx = await agentHeartbeat.registerAgent(
    agentDID,
    agentAddress,
    inactivityThreshold
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();
  console.log("Agent registered successfully!");

  // Get agent info
  const agent = await agentHeartbeat.getAgent(agentDID);
  console.log("\n=== Agent Information ===");
  console.log(`Agent Address: ${agent.agentAddress}`);
  console.log(`Last Heartbeat: ${new Date(Number(agent.lastHeartbeat) * 1000).toISOString()}`);
  console.log(`Is Active: ${agent.isActive}`);
  console.log(`Inactivity Threshold: ${agent.inactivityThreshold} seconds`);
  console.log(`Inactivity Triggered: ${agent.inactivityTriggered}`);

  // Get agent count
  const agentCount = await agentHeartbeat.getAgentCount();
  console.log(`\nTotal Agents: ${agentCount}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
