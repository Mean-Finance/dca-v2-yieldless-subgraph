import { log, BigInt } from '@graphprotocol/graph-ts';
import { Position, PositionState, Transaction } from '../../generated/schema';
import { ONE_BI } from './constants';

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
    positionState.transaction = transaction.id;
    positionState.createdAtBlock = transaction.blockNumber;
    positionState.createdAtTimestamp = transaction.timestamp;
    positionState.save();
  }
  return positionState!;
}
