import * as transactionLibrary from '../utils/transaction';
import * as globalParametersLibrary from '../utils/global-parameters';
import { SwapIntervalsAllowed } from '../../generated/GlobalParameters/GlobalParameters';

export function handleSwapIntervalsAllowed(event: SwapIntervalsAllowed): void {
  transactionLibrary.getOrCreateFromEvent(event, 'SwapIntervalsAllowed');
  globalParametersLibrary.getOrCreate(event.transaction.to!);
}
