import * as transactionLibrary from '../utils/transaction';
import * as globalParametersLibrary from '../utils/global-parameters';
import { SwapIntervalsAllowed, SwapIntervalsForbidden } from '../../generated/GlobalParameters/GlobalParameters';

export function handleSwapIntervalsAllowed(event: SwapIntervalsAllowed): void {
  let transaction = transactionLibrary.getOrCreateFromEvent(event, 'SwapIntervalsAllowed');
  globalParametersLibrary.addSwapIntervals(event, transaction);
}

export function handleSwapIntervalsForbidden(event: SwapIntervalsForbidden): void {
  // transactionLibrary.getOrCreateFromEvent(event, 'SwapIntervalsAllowed');
  // globalParametersLibrary.getOrCreate(event.transaction.to!);
}
