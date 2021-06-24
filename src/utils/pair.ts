import { log, ethereum, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Transaction, Pair } from '../../generated/schema';
import { PairCreated } from '../../generated/Factory/Factory';
import { Pair as PairTemplate } from '../../generated/templates';
import * as tokenLibrary from '../utils/token';

export function getOrCreate(event: PairCreated, transaction: Transaction): Pair {
  let id = event.params._pair.toHexString();
  log.warning('[Pair] Get or create {}', [id]);
  let pair = Pair.load(id);
  let token0 = tokenLibrary.getOrCreate(event.params._token0);
  let token1 = tokenLibrary.getOrCreate(event.params._token1);
  if (pair == null) {
    pair = new Pair(id);
    pair.token0 = token0.id;
    pair.token1 = token1.id;
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
