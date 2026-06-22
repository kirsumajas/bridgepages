import { Contract } from 'ethers'

// Minimal ERC-20 ABI — just what the bridge UI needs.
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function transfer(address to, uint256 value) returns (bool)',
]

export const getErc20 = (address, runner) =>
  new Contract(address, ERC20_ABI, runner)
