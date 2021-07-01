import { Address, log, BigInt } from '@graphprotocol/graph-ts';
import { Token } from '../../generated/schema';
import { ERC20 } from '../../generated/Factory/ERC20';

const DEFAULT_DECIMALS = 18;

export function getOrCreate(address: Address): Token {
  let id = address.toHexString();
  log.warning('[Token] Get or create {}', [id]);
  let token = Token.load(id);
  if (token === null) {
    token = new Token(id);
    let erc20Contract = ERC20.bind(address);
    let decimals = erc20Contract.try_decimals();
    let name = erc20Contract.try_name();
    let symbol = erc20Contract.try_symbol();

    token.decimals = decimals.reverted ? DEFAULT_DECIMALS : decimals.value;
    token.name = name.reverted ? 'TBD' : name.value;
    token.symbol = symbol.reverted ? 'TBD' : symbol.value;

    if (decimals.reverted || name.reverted || symbol.reverted) {
      log.warning('[Token] Decimals, name or symbol not found for token with address {}', [address.toHexString()]);
    }

    token.save();
  }

  return token!;
}

export function getMangitudeOf(id: string): BigInt {
  log.warning('[Token] Get magnitude of {}', [id]);
  return BigInt.fromI32(18);
}
