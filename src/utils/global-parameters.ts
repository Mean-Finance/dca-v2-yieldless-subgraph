import { log, ethereum, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { DCAGlobalParameters } from '../../generated/schema';
import { GlobalParameters } from '../../generated/Factory/GlobalParameters';

export function getOrCreate(address: Bytes): DCAGlobalParameters {
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
  }
  return globalParameters!;
}
