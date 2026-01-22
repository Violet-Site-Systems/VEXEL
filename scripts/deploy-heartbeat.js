// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
const hre = require("hardhat");

async function main() {
  console.log("Deploying AgentHeartbeat contract...");

  const AgentHeartbeat = await hre.ethers.getContractFactory("AgentHeartbeat");
  const agentHeartbeat = await AgentHeartbeat.deploy();

  await agentHeartbeat.waitForDeployment();

  const address = await agentHeartbeat.getAddress();
  console.log(`AgentHeartbeat deployed to: ${address}`);

  // Wait for a few block confirmations before verifying
  console.log("Waiting for block confirmations...");
  await agentHeartbeat.deploymentTransaction().wait(5);

  // Verify the contract on Etherscan/Polygonscan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.error("Verification error:", error.message);
    }
  }

  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${hre.network.name}`);
  console.log(`Contract Address: ${address}`);
  console.log(`Deployer: ${(await hre.ethers.getSigners())[0].address}`);
  console.log("==========================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
