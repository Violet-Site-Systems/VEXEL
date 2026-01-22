// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import { BigInt, Bytes, log } from "@graphprotocol/graph-ts"
import {
  AgentRegistered,
  AgentUpdated,
  AgentStatusChanged,
  CapabilityAdded
} from "../generated/AgentRegistry/AgentRegistry"
import { Agent, Capability, StatusChange } from "../generated/schema"

export function handleAgentRegistered(event: AgentRegistered): void {
  let agent = new Agent(event.params.did)
  
  agent.did = event.params.did
  agent.name = event.params.name
  agent.description = event.params.description
  agent.ownerAddress = event.params.owner
  agent.ipfsMetadataHash = event.params.ipfsHash
  agent.runtimeStatus = "ACTIVE"
  agent.createdAt = event.block.timestamp
  agent.updatedAt = event.block.timestamp
  agent.lastActiveAt = event.block.timestamp
  
  agent.save()

  // Create initial status change record
  let statusChange = new StatusChange(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  statusChange.agent = agent.id
  statusChange.previousStatus = null
  statusChange.newStatus = "ACTIVE"
  statusChange.timestamp = event.block.timestamp
  statusChange.reason = "Agent registered"
  statusChange.blockNumber = event.block.number
  statusChange.transactionHash = event.transaction.hash
  statusChange.save()
}

export function handleAgentUpdated(event: AgentUpdated): void {
  let agent = Agent.load(event.params.did)
  
  if (agent == null) {
    return
  }

  agent.name = event.params.name
  agent.ipfsMetadataHash = event.params.ipfsHash
  agent.updatedAt = event.block.timestamp
  
  agent.save()
}

export function handleAgentStatusChanged(event: AgentStatusChanged): void {
  let agent = Agent.load(event.params.did)
  
  if (agent == null) {
    return
  }

  let previousStatus = agent.runtimeStatus
  let newStatus = getStatusString(event.params.newStatus)
  
  agent.runtimeStatus = newStatus
  agent.updatedAt = event.block.timestamp
  
  if (newStatus == "ACTIVE") {
    agent.lastActiveAt = event.block.timestamp
  }
  
  agent.save()

  // Record status change
  let statusChange = new StatusChange(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  statusChange.agent = agent.id
  statusChange.previousStatus = previousStatus
  statusChange.newStatus = newStatus
  statusChange.timestamp = event.block.timestamp
  statusChange.reason = "Status changed"
  statusChange.blockNumber = event.block.number
  statusChange.transactionHash = event.transaction.hash
  statusChange.save()
}

export function handleCapabilityAdded(event: CapabilityAdded): void {
  let agent = Agent.load(event.params.did)
  
  if (agent == null) {
    return
  }

  let capabilityId = event.params.did + "-" + event.params.capabilityName
  let capability = Capability.load(capabilityId)
  
  if (capability == null) {
    capability = new Capability(capabilityId)
    capability.agent = agent.id
    capability.name = event.params.capabilityName
    capability.version = 1
    capability.createdAt = event.block.timestamp
  } else {
    capability.version = capability.version + 1
  }
  
  capability.value = event.params.capabilityValue
  capability.updatedAt = event.block.timestamp
  
  capability.save()
}

function getStatusString(status: i32): string {
  if (status == 0) {
    return "ACTIVE"
  } else if (status == 1) {
    return "SLEEP"
  } else if (status == 2) {
    return "TERMINATED"
  }
  // Log warning for unexpected status
  log.warning("Unexpected status value: {}", [status.toString()])
  return "ACTIVE"
}
