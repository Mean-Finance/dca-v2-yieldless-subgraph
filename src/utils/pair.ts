import { log, ethereum, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Transaction, Pair } from '../../generated/schema';
import { PairCreated } from '../../generated/Factory/Factory';
import { Pair as PairTemplate } from '../../generated/templates';
import * as tokenLibrary from '../utils/token';
import * as positionLibrary from '../utils/position';
import * as pairSwapLibrary from '../utils/pair-swap';
import { Swapped } from '../../generated/Factory/Pair';
import { Pair as PairContract } from '../../generated/Factory/Pair';
import { ZERO_BI } from './constants';

export function create(event: PairCreated, transaction: Transaction): Pair {
  let id = event.params._pair.toHexString();
  log.warning('[Pair] Create {}', [id]);
  let pair = Pair.load(id);
  let token0 = tokenLibrary.getOrCreate(event.params._token0);
  let token1 = tokenLibrary.getOrCreate(event.params._token1);
  if (pair == null) {
    pair = new Pair(id);
    pair.token0 = token0.id;
    pair.token1 = token1.id;
    pair.highestId = ZERO_BI; // TODO: Remove this patch
    pair.transaction = transaction.id;
    pair.createdAtBlock = transaction.blockNumber;
    pair.createdAtTimestamp = transaction.timestamp;
    pair.save();
    PairTemplate.create(event.params._pair);
  }
  return pair!;
}

export function get(id: string): Pair {
  log.warning('[Pair] Get {}', [id]);
  let pair = Pair.load(id);
  return pair!;
}

export function swapped(event: Swapped, transaction: Transaction): void {
  let id = transaction.to.toHexString();
  log.warning('[Pair] Swapped {}', [id]);
  let pair = get(id);
  let pairSwap = pairSwapLibrary.create(pair!, event, transaction);
  // let pairContract = PairContract.bind(event.transaction.to!); // TODO: use other "to" -- learn about type conversion
  for (let i: i32 = 1; i < pair.highestId.toI32(); i++) {
    // Should probably do some checks ?
    positionLibrary.registerPairSwap(i.toString(), pairSwap);
  }
}
