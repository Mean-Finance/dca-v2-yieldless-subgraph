import { log, BigInt } from '@graphprotocol/graph-ts';
import { PositionState, Transaction } from '../../generated/schema';
import { ONE_BI, ZERO_BI } from './constants';

export function create(positionId: string, rate: BigInt, startingSwap: BigInt, lastSwap: BigInt, transaction: Transaction): PositionState {
  let id = positionId.concat('-').concat(transaction.id);
  log.warning('[PositionState] Create {}', [id]);
  let positionState = PositionState.load(id);
  if (positionState == null) {
    positionState = new PositionState(id);
    positionState.position = positionId;
    positionState.rate = rate;
    positionState.startingSwap = startingSwap;
    positionState.lastSwap = lastSwap;

    positionState.remainingSwaps = lastSwap.minus(startingSwap).plus(ONE_BI);
    // positionState.swapped = ZERO_BI;
    // positionState.withdrawn = ZERO_BI;
    positionState.remainingLiquidity = rate.times(positionState.remainingSwaps);

    positionState.transaction = transaction.id;
    positionState.createdAtBlock = transaction.blockNumber;
    positionState.createdAtTimestamp = transaction.timestamp;
    positionState.save();
  }
  return positionState!;
}

export function get(id: string): PositionState {
  log.warning('[PositionState] Get {}', [id]);
  let positionState = PositionState.load(id);
  return positionState!;
}

export function registerPairSwap(id: string): PositionState {
  log.warning('[PositionState] Register pair swap {}', [id]);
  let positionState = get(id);
  positionState.remainingSwaps = positionState.remainingSwaps.minus(ONE_BI);
  positionState.remainingLiquidity = positionState.remainingLiquidity.minus(positionState.rate);
  // TODO: lastUpdatedAt
  positionState.save();
  return positionState!;
}
