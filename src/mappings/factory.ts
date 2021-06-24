import * as transactionLibrary from '../utils/transaction';
import * as pairLibrary from '../utils/pair';
import { PairCreated } from '../../generated/Factory/Factory';

export function handlePairCreated(event: PairCreated): void {
  let transaction = transactionLibrary.getOrCreateFromEvent(event, 'PairCreated');
  pairLibrary.getOrCreate(event, transaction);
}
