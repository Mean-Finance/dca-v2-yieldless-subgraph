import { log, BigInt, Address } from '@graphprotocol/graph-ts';
import { Transaction, Pair, PairSwap, PairSwapInterval } from '../../generated/schema';
import { SwappedSwapInformationPairsStruct } from '../../generated/Hub/Hub';
import { intervalsFromBytes } from './intervals';
import * as tokenLibrary from './token';

export function create(pair: Pair, event: SwappedSwapInformationPairsStruct, transaction: Transaction, fee: BigInt): PairSwap {
  const pairSwapId = pair.id.concat('-').concat(transaction.id);
  log.info('[PairSwap] Create {}', [pairSwapId]);
  let pairSwap = PairSwap.load(pairSwapId);
  const tokenA = tokenLibrary.getById(pair.tokenA);
  const tokenB = tokenLibrary.getById(pair.tokenB);
  if (pairSwap == null) {
    pairSwap = new PairSwap(pairSwapId);
    pairSwap.pair = pair.id;
    pairSwap.swapper = transaction.from;

    // Set ratios b to a
    pairSwap.ratioBToA = event.ratioBToA;
    pairSwap.ratioBToAWithFee = APPLY_FEE(fee, event.ratioBToA);

    // Set ratios a to b
    pairSwap.ratioAToB = event.ratioAToB;
    pairSwap.ratioAToBWithFee = APPLY_FEE(fee, event.ratioAToB);

    // Check yield-bearing-share on tokenA
    let underlyingPerTokenA = tokenA.magnitude;
    let underlyingPerTokenB = tokenB.magnitude;
    if (tokenA.type == 'YIELD_BEARING_SHARE') {
      underlyingPerTokenA = tokenLibrary.transformYieldBearingSharesToUnderlying(Address.fromString(pair.tokenA), tokenA.magnitude);
    }

    // Check yield-bearing-share on tokenB
    if (tokenB.type == 'YIELD_BEARING_SHARE') {
      underlyingPerTokenB = tokenLibrary.transformYieldBearingSharesToUnderlying(Address.fromString(pair.tokenB), tokenB.magnitude);
    }

    /**
     * Definitions
     */

    // convertToUnderlying(amountOfShares, underlyingPerShare, sharesMagnitude)
    // sharesMagnitude  ---- underlyingPerShare
    // amountOfShares   ---- X
    // X = amountOfShares * underlyingPerShare / sharesMagnitude

    /**
     * Example
     * Ratio B to A represents the amount of A received by one B
     */
    // B Shares     = 1540  ----- 1 A Share
    // B Underlying = 1580  ----- 1.05 A Underlying
    // B Underlying = X     ----- 1 A Underlying
    // X = 1 * 1580 / 1.05 = 1 * converToUnderlying(ratioBToA, UPSB, MAGNITUDE_B) / convertToUnderlying(MAGNITUDE_A, UPSA, MAGNITUDE_A)

    // => X = MAGNITUDE_A * [RATIO_B_TO_A * UNDERLYING_PER_TOKEN_B / MAGNITUDE_B] / [MAGNITUDE_A * UNDERLYING_PER_TOKEN_A / MAGNITUDE_A]
    // => X = MAGNITUDE_A * [RATIO_B_TO_A * UNDERLYING_PER_TOKEN_B / MAGNITUDE_B] / UNDERLYING_PER_TOKEN_A]

    pairSwap.ratioUnderlyingBToA = tokenA.magnitude
      .times(pairSwap.ratioBToA.times(underlyingPerTokenB).div(tokenB.magnitude))
      .div(underlyingPerTokenA);
    pairSwap.ratioUnderlyingBToAWithFee = tokenA.magnitude
      .times(pairSwap.ratioBToAWithFee.times(underlyingPerTokenB).div(tokenB.magnitude))
      .div(underlyingPerTokenA);

    pairSwap.ratioUnderlyingAToB = tokenB.magnitude
      .times(pairSwap.ratioAToB.times(underlyingPerTokenA).div(tokenA.magnitude))
      .div(underlyingPerTokenB);
    pairSwap.ratioUnderlyingAToBWithFee = tokenB.magnitude
      .times(pairSwap.ratioAToBWithFee.times(underlyingPerTokenA).div(tokenA.magnitude))
      .div(underlyingPerTokenB);

    pairSwap.transaction = transaction.id;
    pairSwap.executedAtBlock = transaction.blockNumber;
    pairSwap.executedAtTimestamp = transaction.timestamp;
    pairSwap.save();

    const intervals = intervalsFromBytes(event.intervalsInSwap);
    for (let i: i32 = 0; i < intervals.length; i++) {
      const pairSwapIntervalId = pairSwapId.concat('-').concat(intervals[i].toString());
      const pairSwapInterval = new PairSwapInterval(pairSwapIntervalId);
      pairSwapInterval.pair = pair.id;
      pairSwapInterval.pairSwap = pairSwapId;
      pairSwapInterval.swapInterval = intervals[i].toString();
      pairSwapInterval.save();
    }
  }
  return pairSwap;
}

function APPLY_FEE(fee: BigInt, amount: BigInt): BigInt {
  const FEE_PRECISION = BigInt.fromI32(10000);
  const feeAmount = amount.times(fee).div(FEE_PRECISION).div(BigInt.fromI32(100));
  return amount.minus(feeAmount);
}
