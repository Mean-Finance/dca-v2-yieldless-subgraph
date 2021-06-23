import { log, ethereum, BigInt, Address } from '@graphprotocol/graph-ts';
import { SwapInterval, DCAGlobalParameters, Transaction } from '../../generated/schema';
import { GlobalParameters, SwapIntervalsAllowed } from '../../generated/GlobalParameters/GlobalParameters';

export function getOrCreate(address: Address): DCAGlobalParameters {
  let id = address.toHexString();
  log.debug('[GlobalParameters] Get or create {}', [id]);
  let globalParameters = DCAGlobalParameters.load(id);
  if (globalParameters == null) {
    let globalParametersContract = GlobalParameters.bind(address);
    globalParameters = new DCAGlobalParameters(id);
    globalParameters.feeRecipient = globalParametersContract.feeRecipient();
    globalParameters.nftDescriptor = globalParametersContract.nftDescriptor();
    globalParameters.swapFee = globalParametersContract.swapFee();
    globalParameters.loanFee = globalParametersContract.loanFee();
    globalParameters.FEE_PRECISION = globalParametersContract.FEE_PRECISION();
    globalParameters.MAX_FEE = globalParametersContract.MAX_FEE();
    globalParameters.allowedIntervals = [];
    globalParameters.save();
  }
  return globalParameters!;
}

export function addSwapIntervals(event: SwapIntervalsAllowed, transaction: Transaction): DCAGlobalParameters {
  log.debug('[GlobalParameters] Add {} swap intervals {}', [event.params._swapIntervals.length.toString()]);
  let globalParameters = getOrCreate(transaction.to!);
  for (let i = 0; i < event.params._swapIntervals.length; i++) {
    let swapIntervalId = `${transaction.id}-${i.toString()}`;
    let swapInterval = SwapInterval.load(swapIntervalId);
    if (swapInterval == null) {
      swapInterval = new SwapInterval(swapIntervalId);
      swapInterval.dcaGlobalParameters = globalParameters.id;
      swapInterval.interval = event.params._swapIntervals[i];
      swapInterval.description = event.params._descriptions[i];
      swapInterval.save();
    }
  }
  return globalParameters!;
}
