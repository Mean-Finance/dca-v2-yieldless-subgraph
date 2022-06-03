import { log, BigInt, Address } from '@graphprotocol/graph-ts';
import { Transaction, Pair, Position } from '../../generated/schema';
import * as tokenLibrary from '../utils/token';
import * as positionLibrary from '../utils/position';
import * as pairSwapLibrary from '../utils/pair-swap';
import { Swapped } from '../../generated/Hub/Hub';
import { MAX_BI, ONE_BI, ZERO_BI } from './constants';
import { getIndexOfInterval, getIntervals, intervalsFromBytes } from './intervals';

export function create(id: string, token0Address: Address, token1Address: Address, swapInterval: BigInt, transaction: Transaction): Pair {
  log.info('[Pair] Create {}', [id]);
  let pair = Pair.load(id);
  let token0 = tokenLibrary.getByAddress(token0Address);
  let token1 = tokenLibrary.getByAddress(token1Address);
  let token0ComesFirst = token1.id > token0.id;
  if (pair == null) {
    pair = new Pair(id);
    pair.tokenA = token0ComesFirst ? token0.id : token1.id;
    pair.tokenB = token0ComesFirst ? token1.id : token0.id;
    pair.activePositionIds = new Array<string>();
    pair.activePositionsPerInterval = [ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI];
    pair.amountToSwapTokenA = [ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI];
    pair.amountToSwapTokenB = [ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI];
    pair.nextSwapAvailableAt = MAX_BI;
    pair.lastSwappedAt = ZERO_BI;
    pair.transaction = transaction.id;
    pair.createdAtBlock = transaction.blockNumber;
    pair.createdAtTimestamp = transaction.timestamp;
    pair.save();
  }
  return pair;
}

export function buildId(token0Address: string, token1Address: string): string {
  log.debug('[Pair] Build id {} {}', [token0Address, token1Address]);
  return token1Address > token0Address ? token0Address.concat('-').concat(token1Address) : token1Address.concat('-').concat(token0Address);
}

export function get(id: string): Pair | null {
  log.info('[Pair] Get {}', [id]);
  let pair = Pair.load(id);
  return pair;
}

export function swapped(event: Swapped, transaction: Transaction): void {
  let id = event.address.toHexString();
  log.info('[Pair] Swapped {}', [id]);
  let pairs = event.params.swapInformation.pairs;
  let fee = event.params.fee;
  for (let i: i32 = 0; i < pairs.length; i++) {
    // O(n)
    let id = pairs[i].tokenA.toHexString().concat('-').concat(pairs[i].tokenB.toHexString());
    let pair = get(id)!;
    let intervals = intervalsFromBytes(pairs[i].intervalsInSwap);
    let hasExecutedSwaps = intervals.length !== 0;
    if (!hasExecutedSwaps) {
      continue;
    }

    let pairSwap = pairSwapLibrary.create(pair, pairs[i], transaction, fee);
    let activePositionIds = pair.activePositionIds;
    let newActivePositionsPerInterval = pair.activePositionsPerInterval;
    let newActivePositionIds = pair.activePositionIds;
    let amountToSwapTokenA = pair.amountToSwapTokenA;
    let amountToSwapTokenB = pair.amountToSwapTokenB;
    for (let x: i32 = 0; x < activePositionIds.length; x++) {
      // O(m)
      if (positionLibrary.shouldRegisterPairSwap(activePositionIds[x], intervals)) {
        let positionAndState = positionLibrary.registerPairSwap(activePositionIds[x], pair, pairSwap, transaction); // O(1)
        if (positionAndState.positionState.remainingSwaps.equals(ZERO_BI)) {
          newActivePositionIds.splice(newActivePositionIds.indexOf(positionAndState.position.id), 1); // O(x + x), where worst x scenario x = m
          let indexOfInterval = getIndexOfInterval(BigInt.fromString(positionAndState.position.swapInterval));
          newActivePositionsPerInterval[indexOfInterval] = newActivePositionsPerInterval[indexOfInterval].minus(ONE_BI);
          if (positionAndState.position.from == pair.tokenA) {
            amountToSwapTokenA[indexOfInterval] = amountToSwapTokenA[indexOfInterval].minus(positionAndState.positionState.rate);
          } else {
            amountToSwapTokenB[indexOfInterval] = amountToSwapTokenB[indexOfInterval].minus(positionAndState.positionState.rate);
          }
        }
      }
    }
    pair.activePositionIds = newActivePositionIds;
    pair.activePositionsPerInterval = newActivePositionsPerInterval;
    pair.lastSwappedAt = transaction.timestamp;
    pair.nextSwapAvailableAt = getNextSwapAvailableAt(newActivePositionsPerInterval, pair.lastSwappedAt);
    pair.amountToSwapTokenA = amountToSwapTokenA;
    pair.amountToSwapTokenB = amountToSwapTokenB;
    pair.save();
  }
} // O (n*2m) ?

export function addActivePosition(position: Position): Pair {
  log.info('[Pair] Add active position {}', [position.pair]);
  let pair = get(position.pair)!;
  let found = false;
  // Add to active positions
  let newActivePositionIds = pair.activePositionIds;
  // This can be greatly optimizied by saving index of active position on position.
  for (let i: i32 = 0; i < newActivePositionIds.length && !found; i++) {
    if (newActivePositionIds[i] == position.id) {
      found = true;
    }
  }
  if (!found) {
    newActivePositionIds.push(position.id);
    pair.activePositionIds = newActivePositionIds;
    // Add to active positions per interval
    let indexOfPositionInterval = getIndexOfInterval(BigInt.fromString(position.swapInterval));
    let activePositionsPerInterval = pair.activePositionsPerInterval;
    activePositionsPerInterval[indexOfPositionInterval] = activePositionsPerInterval[indexOfPositionInterval].plus(ONE_BI);
    pair.activePositionsPerInterval = activePositionsPerInterval;
    // Get new next swap available at
    pair.nextSwapAvailableAt = getNextSwapAvailableAt(activePositionsPerInterval, pair.lastSwappedAt);

    pair.save();
  }

  return pair;
}

export function removeActivePosition(position: Position): Pair {
  log.info('[Pair] Remove active position {}', [position.pair]);
  let pair = get(position.pair)!;
  // Remove from active positions
  if (pair.activePositionIds.includes(position.id)) {
    let newActivePositionIds = pair.activePositionIds;
    newActivePositionIds.splice(newActivePositionIds.indexOf(position.id), 1);
    pair.activePositionIds = newActivePositionIds;

    // Remove from active positions per interval
    let indexOfPositionInterval = getIndexOfInterval(BigInt.fromString(position.swapInterval));
    let activePositionsPerInterval = pair.activePositionsPerInterval;
    activePositionsPerInterval[indexOfPositionInterval] = activePositionsPerInterval[indexOfPositionInterval].minus(ONE_BI);
    pair.activePositionsPerInterval = activePositionsPerInterval;

    // Get new next swap available at
    pair.nextSwapAvailableAt = getNextSwapAvailableAt(activePositionsPerInterval, pair.lastSwappedAt);

    pair.save();
  }
  return pair;
}

export function addAmountToSwap(position: Position, rateToAdd: BigInt): Pair {
  log.info('[Pair] Add amount to swap {}', [position.pair]);
  let pair = get(position.pair)!;

  let indexOfPositionInterval = getIndexOfInterval(BigInt.fromString(position.swapInterval));

  let amountToSwapTokenA = pair.amountToSwapTokenA;
  let amountToSwapTokenB = pair.amountToSwapTokenB;
  if (position.from == pair.tokenA) {
    amountToSwapTokenA[indexOfPositionInterval] = amountToSwapTokenA[indexOfPositionInterval].plus(rateToAdd);
  } else {
    amountToSwapTokenB[indexOfPositionInterval] = amountToSwapTokenB[indexOfPositionInterval].plus(rateToAdd);
  }
  pair.amountToSwapTokenA = amountToSwapTokenA;
  pair.amountToSwapTokenB = amountToSwapTokenB;

  pair.save();

  return pair;
}

export function substractAmountToSwap(position: Position, rateToSubstract: BigInt): Pair {
  log.info('[Pair] Remove amount to swap {}', [position.pair]);
  let pair = get(position.pair)!;

  let indexOfPositionInterval = getIndexOfInterval(BigInt.fromString(position.swapInterval));

  let amountToSwapTokenA = pair.amountToSwapTokenA;
  let amountToSwapTokenB = pair.amountToSwapTokenB;
  if (position.from == pair.tokenA) {
    amountToSwapTokenA[indexOfPositionInterval] = amountToSwapTokenA[indexOfPositionInterval].minus(rateToSubstract);
  } else {
    amountToSwapTokenB[indexOfPositionInterval] = amountToSwapTokenB[indexOfPositionInterval].minus(rateToSubstract);
  }
  pair.amountToSwapTokenA = amountToSwapTokenA;
  pair.amountToSwapTokenB = amountToSwapTokenB;

  pair.save();

  return pair;
}

export function getNextSwapAvailableAt(activePositionsPerInterval: BigInt[], lastSwappedAt: BigInt): BigInt {
  let intervals = getIntervals();
  let indexOfCloserInterval = activePositionsPerInterval.length + 1;
  let i: i32 = 0;
  while (i < activePositionsPerInterval.length && indexOfCloserInterval == activePositionsPerInterval.length + 1) {
    if (activePositionsPerInterval[i].gt(ZERO_BI)) indexOfCloserInterval = i;
    i++;
  }
  if (indexOfCloserInterval == activePositionsPerInterval.length + 1) return MAX_BI;
  return lastSwappedAt.div(intervals[indexOfCloserInterval]).plus(ONE_BI).times(intervals[indexOfCloserInterval]);
}
