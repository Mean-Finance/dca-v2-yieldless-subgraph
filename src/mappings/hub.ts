import * as transactionLibrary from '../utils/transaction';
import * as pairLibrary from '../utils/pair';
import * as positionLibrary from '../utils/position';
import * as tokenLibrary from '../utils/token';
import * as swapIntervalsLibrary from '../utils/swap-intervals';
import {
  TokensAllowedUpdated,
  Deposited,
  Modified,
  RoleAdminChanged,
  SwapIntervalsAllowed,
  SwapIntervalsForbidden,
  Swapped,
  Terminated,
  Withdrew,
  WithdrewMany,
} from '../../generated/Hub/Hub';
import { BigInt, dataSource } from '@graphprotocol/graph-ts';
import { Token } from '../../generated/schema';

export function handleSetAllowedTokens(event: TokensAllowedUpdated): void {
  transactionLibrary.getOrCreateFromEvent(event, 'Hub-TokensAllowedUpdated');
  const tokens = event.params._tokens;
  const allowed = event.params._allowed;
  for (let i: i32 = 0; i < tokens.length; i++) {
    tokenLibrary.getOrCreate(tokens[i], allowed[i]);
  }
}

export function handleDeposited(event: Deposited): void {
  const transaction = transactionLibrary.getOrCreateFromEvent(event, 'Hub-Deposited');
  positionLibrary.create(event, transaction);
}

export function handleModified(event: Modified): void {
  const transaction = transactionLibrary.getOrCreateFromEvent(event, 'Hub-Modified');
  positionLibrary.modified(event, transaction);
}

export function handleTerminated(event: Terminated): void {
  const transaction = transactionLibrary.getOrCreateFromEvent(event, 'Hub-Terminated');
  positionLibrary.terminated(event, transaction);
}

export function handleWithdrew(event: Withdrew): void {
  const transaction = transactionLibrary.getOrCreateFromEvent(event, 'Hub-Withdrew');
  positionLibrary.withdrew(event.params.positionId.toString(), transaction);
}

export function handleWithdrewMany(event: WithdrewMany): void {
  const transaction = transactionLibrary.getOrCreateFromEvent(event, 'Hub-WithdrewMany');
  const positions = event.params.positions;
  for (let i: i32 = 0; i < positions.length; i++) {
    const positionIds = positions[i].positionIds;
    for (let j: i32 = 0; j < positionIds.length; j++) {
      positionLibrary.withdrew(event.params.positions[i].positionIds[j].toString(), transaction);
    }
  }
}

export function handleSwapped(event: Swapped): void {
  const transaction = transactionLibrary.getOrCreateFromEvent(event, 'Hub-Swapped');
  pairLibrary.swapped(event, transaction);
}

export function handleSwapIntervalsAllowed(event: SwapIntervalsAllowed): void {
  const transaction = transactionLibrary.getOrCreateFromEvent(event, 'Hub-SwapIntervalsAllowed');
  swapIntervalsLibrary.addSwapIntervals(event, transaction);
}

export function handleSwapIntervalsDisabled(event: SwapIntervalsForbidden): void {
  const transaction = transactionLibrary.getOrCreateFromEvent(event, 'Hub-SwapIntervalsAllowed');
  swapIntervalsLibrary.disableSwapIntervals(event, transaction);
}

export function dirtyInitialization(event: RoleAdminChanged): void {
  swapIntervalsLibrary.getOrCreate(BigInt.fromString('3600'), true);
  swapIntervalsLibrary.getOrCreate(BigInt.fromString('14400'), true);
  swapIntervalsLibrary.getOrCreate(BigInt.fromString('86400'), true);
  swapIntervalsLibrary.getOrCreate(BigInt.fromString('604800'), true);
  if (dataSource.network() == 'matic') {
    const bridgedUSDC = new Token('0x2791bca1f2de4661ed88a30c99a7a9449aa84174');
    bridgedUSDC.name = 'Bridged USDC';
    bridgedUSDC.symbol = 'USDC.e';
    bridgedUSDC.decimals = 6;
    bridgedUSDC.type = 'BASE';
    bridgedUSDC.allowed = true;
    bridgedUSDC.magnitude = BigInt.fromI32(10).pow(6);
    bridgedUSDC.save();
    const nativeUSDC = new Token('0x3c499c542cef5e3811e1192ce70d8cc03d5c3359');
    nativeUSDC.name = 'USD Coin';
    nativeUSDC.symbol = 'USDC';
    nativeUSDC.decimals = 6;
    nativeUSDC.type = 'BASE';
    nativeUSDC.allowed = true;
    nativeUSDC.magnitude = BigInt.fromI32(10).pow(6);
    nativeUSDC.save();
  } else if (dataSource.network() == 'optimism') {
    const bridgedUSDC = new Token('0x7f5c764cbc14f9669b88837ca1490cca17c31607');
    bridgedUSDC.name = 'Bridged USDC';
    bridgedUSDC.symbol = 'USDC.e';
    bridgedUSDC.decimals = 6;
    bridgedUSDC.type = 'BASE';
    bridgedUSDC.allowed = true;
    bridgedUSDC.magnitude = BigInt.fromI32(10).pow(6);
    bridgedUSDC.save();
    const nativeUSDC = new Token('0x0b2c639c533813f4aa9d7837caf62653d097ff85');
    nativeUSDC.name = 'USD Coin';
    nativeUSDC.symbol = 'USDC';
    nativeUSDC.decimals = 6;
    nativeUSDC.type = 'BASE';
    nativeUSDC.allowed = true;
    nativeUSDC.magnitude = BigInt.fromI32(10).pow(6);
    nativeUSDC.save();
  }
}
