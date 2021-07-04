import { log, BigInt, Address } from '@graphprotocol/graph-ts';
import { Transaction, Position, PairSwap, Pair, PositionState } from '../../generated/schema';
import { Deposited, Modified, Terminated } from '../../generated/Factory/Pair';
import * as pairLibrary from './pair';
import * as positionStateLibrary from './position-state';
import * as tokenLibrary from './token';
import { ONE_BI, ZERO_BI } from './constants';

export function create(event: Deposited, transaction: Transaction): Position {
  let id = getIdByPairAddressAndPositionId(event.transaction.to!, event.params._dcaId.toString());
  log.warning('[Position] Create {}', [id]);
  let position = Position.load(id);
  let pair = pairLibrary.get(event.transaction.to.toHexString());
  let from = tokenLibrary.getOrCreate(event.params._fromToken);
  if (position == null) {
    position = new Position(id);
    position.dcaId = event.params._dcaId.toString();
    position.user = transaction.from!;
    position.from = from.id;
    position.to = position.from == pair.token0 ? pair.token1 : pair.token0;
    position.pair = pair.id;
    position.swapInterval = event.params._swapInterval.toString();
    position.totalDeposits = event.params._rate.times(event.params._startingSwap);
    position.status = 'ACTIVE';
    position.transaction = transaction.id;
    position.createdAtBlock = transaction.blockNumber;
    position.createdAtTimestamp = transaction.timestamp;

    // Create position state
    let positionState = positionStateLibrary.create(id, event.params._rate, event.params._startingSwap, event.params._lastSwap, transaction);
    position.current = positionState.id;
    position.save();

    // TODO: remove this patch
    pair.highestId = pair.highestId.plus(ONE_BI);
    pair.save();
  }
  return position!;
}

export function getIdByPairAddressAndPositionId(pairAddress: Address, positionId: string): string {
  return pairAddress.toHexString().concat('-').concat(positionId);
}

export function getIdByPairIdAndPositionId(pairId: string, positionId: string): string {
  return pairId.concat('-').concat(positionId);
}

export function getIdByPairAndPositionId(pair: Pair, positionId: string): string {
  return getIdByPairIdAndPositionId(pair.id, positionId);
}

export function getByPairAddressAndPositionId(pairAddress: Address, positionId: string): Position {
  let id = getIdByPairAddressAndPositionId(pairAddress, positionId);
  log.warning('[Position] Get by pair address and id {}', [positionId]);
  return getById(id);
}

export function getByPairAndPositionId(pair: Pair, positionId: string): Position {
  let id = getIdByPairAndPositionId(pair, positionId);
  log.warning('[Position] Get by pair and id {}', [id]);
  return getById(id);
}

export function getById(id: string): Position {
  log.warning('[Position] Get {}', [id]);
  let position = Position.load(id);
  return position!;
}

export function modified(event: Modified, transaction: Transaction): Position {
  let id = getIdByPairAddressAndPositionId(event.transaction.to!, event.params._dcaId.toString());
  log.warning('[Position] Modified {}', [id]);
  let position = getById(id);
  let previousPositionState = positionStateLibrary.get(position.current);
  let newPositionState = positionStateLibrary.create(id, event.params._rate, event.params._startingSwap, event.params._lastSwap, transaction);
  position.totalDeposits = position.totalDeposits.minus(previousPositionState.remainingLiquidity).plus(newPositionState.remainingLiquidity);
  position.current = newPositionState.id;
  position.save();
  return position;
}

export function terminated(event: Terminated, transaction: Transaction): Position {
  let id = getIdByPairAddressAndPositionId(event.transaction.to!, event.params._dcaId.toString());
  log.warning('[Position] Terminated {}', [id]);
  let position = getById(id);
  position.status = 'TERMINATED';
  position.terminatedAtBlock = transaction.blockNumber;
  position.terminatedAtTimestamp = transaction.timestamp;
  position.save();
  return position;
}

export function registerPairSwap(positionId: string, pair: Pair, pairSwap: PairSwap): Position {
  log.warning('[Position] Register pair swap for position {}', [positionId]);
  let position = getByPairAndPositionId(pair, positionId);
  // We will assume token0 = tokenA
  if (position.from == pair.token0) {
    positionStateLibrary.registerPairSwap(position.current, position, pairSwap.ratePerUnitAToB);
  } else {
    positionStateLibrary.registerPairSwap(position.current, position, pairSwap.ratePerUnitBToA);
  }
  return position;
}