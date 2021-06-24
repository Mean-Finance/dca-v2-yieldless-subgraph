import { log } from '@graphprotocol/graph-ts';
import { Transaction, Position } from '../../generated/schema';
import { Deposited } from '../../generated/Factory/Pair';
import * as pairLibrary from './pair';
import * as tokenLibrary from './token';

export function getOrCreate(event: Deposited, transaction: Transaction): Position {
  let id = event.params._dcaId.toString();
  log.warning('[Position] Get or create {}', [id]);
  let position = Position.load(id);
  let pair = pairLibrary.get(event.transaction.to.toHexString());
  let from = tokenLibrary.getOrCreate(event.params._fromToken);
  if (position == null) {
    position = new Position(id);
    position.from = from.id;
    position.to = position.from == pair.token0 ? pair.token1 : pair.token0;
    position.pair = pair.id;
    position.swapInterval = event.params._swapInterval.toString();
    position.status = 'ACTIVE';
    position.transaction = transaction.id;
    position.createdAtBlock = transaction.blockNumber;
    position.createdAtTimestamp = transaction.timestamp;
    position.save();
  }
  return position!;
}
