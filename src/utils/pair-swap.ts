import { log } from '@graphprotocol/graph-ts';
import { Transaction, Pair, PairSwap, PairSwapInterval } from '../../generated/schema';
import { Swapped } from '../../generated/Factory/Pair';
import * as positionLibrary from './position';

export function create(pair: Pair, event: Swapped, transaction: Transaction): PairSwap {
  let pairSwapId = pair.id.concat('-').concat(transaction.id);
  log.warning('[PairSwap] Create {}', [pairSwapId]);
  let pairSwap = PairSwap.load(pairSwapId);
  if (pairSwap == null) {
    pairSwap = new PairSwap(pairSwapId);
    pairSwap.pair = pair.id;
    pairSwap.swapper = transaction.from;
    // pairSwap.swapCalle = event.params._to; // TODO: if _to != transaction.from? not zero address
    pairSwap.borrowedTokenA = event.params._amountBorrowedTokenA;
    pairSwap.borrowedTokenB = event.params._amountBorrowedTokenB;
    pairSwap.availableToBorrowTokenA = event.params._nextSwapInformation.availableToBorrowTokenA;
    pairSwap.availableToBorrowTokenB = event.params._nextSwapInformation.availableToBorrowTokenB;
    pairSwap.ratePerUnitBToA = event.params._nextSwapInformation.ratePerUnitBToA;
    pairSwap.ratePerUnitAToB = event.params._nextSwapInformation.ratePerUnitAToB;
    pairSwap.platformFeeTokenA = event.params._nextSwapInformation.platformFeeTokenA;
    pairSwap.platformFeeTokenB = event.params._nextSwapInformation.platformFeeTokenB;
    pairSwap.amountToBeProvidedBySwapper = event.params._nextSwapInformation.amountToBeProvidedBySwapper;
    pairSwap.amountToRewardSwapperWith = event.params._nextSwapInformation.amountToRewardSwapperWith;
    pairSwap.tokenToBeProvidedBySwapper = event.params._nextSwapInformation.tokenToBeProvidedBySwapper.toHexString();
    pairSwap.tokenToRewardSwapperWith = event.params._nextSwapInformation.tokenToRewardSwapperWith.toHexString();
    pairSwap.transaction = transaction.id;
    pairSwap.executedAtBlock = transaction.blockNumber;
    pairSwap.executedAtTimestamp = transaction.timestamp;
    pairSwap.save();

    let swapsToPerform = event.params._nextSwapInformation.swapsToPerform;
    for (let i: i32 = 0; i < event.params._nextSwapInformation.amountOfSwaps; i++) {
      let pairSwapIntervalId = pairSwapId.concat('-').concat(swapsToPerform[i].interval.toString());
      let pairSwapInterval = new PairSwapInterval(pairSwapIntervalId);
      pairSwapInterval.pair = pair.id;
      pairSwapInterval.pairSwap = pairSwapId;
      pairSwapInterval.swapInterval = swapsToPerform[i].interval.toString();
      pairSwapInterval.swapPerformed = swapsToPerform[i].swapToPerform;
      pairSwapInterval.amountToSwapTokenA = swapsToPerform[i].amountToSwapTokenA;
      pairSwapInterval.amountToSwapTokenB = swapsToPerform[i].amountToSwapTokenB;
      pairSwapInterval.save();
    }
  }
  return pairSwap!;
}
