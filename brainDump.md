Positions

- pair
- from
- to
- swapInterval

PositionState

- rate
- swapsLeft
- swapsExecuted

PositionSwap

- id
- position
- positionState
- pairSwap
- swapped (from)
- rate
- obtained (to)

PairSwap

- id
- pair
- swapper
- swapCalle
- borrowedTokenA
- borrowedTokenB
- pairSwapIntervals[]
- availableToBorrowTokenA
- availableToBorrowTokenB
- ratePerUnitBToA
- ratePerUnitAToB
- platformFeeTokenA
- platformFeeTokenB
- amountToBeProvidedBySwapper
- amountToRewardSwapperWith
- tokenToBeProvidedBySwapper
- tokenToRewardSwapperWith
- blockNumber
- timestamp

- PairSwapInterval
  - id
  - swapInterval
  - pairSwap
  - swapPerformed;
  - amountToSwapTokenA
  - amountToSwapTokenB
