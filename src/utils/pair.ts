import { log, ethereum, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Transaction, DCAPair } from '../../generated/schema';
import { PairCreated } from '../../generated/Factory/Factory';

export function getOrCreate(event: PairCreated, transaction: Transaction): DCAPair {
  let id = event.params._pair.toHexString();
  log.debug('[Pair] Get or create {}', [id]);
  let pair = DCAPair.load(id);
  if (pair == null) {
    pair = new DCAPair(id);
    pair.token0 = event.params._token0;
    pair.token1 = event.params._token1;
  }
  return pair!;
}
