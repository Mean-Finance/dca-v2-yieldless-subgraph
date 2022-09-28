import { Address, log, BigInt, dataSource } from '@graphprotocol/graph-ts';
import { Token } from '../../generated/schema';
import { ERC20 } from '../../generated/Hub/ERC20';
import { Transformer, Transformer__calculateTransformToUnderlyingResultValue0Struct } from '../../generated/Hub/Transformer';
import { TransformerRegistry } from '../../generated/Hub/TransformerRegistry';
import { PROTOCOL_TOKEN_ADDRESS } from './constants';

export const TRANSFORMER_REGISTRY_ADDRESS = Address.fromString('0xC0136591Df365611B1452B5F8823dEF69Ff3A685');
// WETH / WMATIC / ETC
export const PROTOCOL_TOKEN_WRAPPER_TRANSFORMER_ADDRESS = Address.fromString('0xfd55b5A6F61f22c70f4A1d8e63d181c6D0a290c6');
// Yield bearing shares is a more human way of referring to 4626 transformer.
export const YIELD_BEARING_SHARE_TRANSFORMER_ADDRESS = Address.fromString('0x7CbdcA3c992953bdd536BE234973686D758DAabc');

export function getById(id: string): Token {
  const token = Token.load(id);
  if (token == null) throw Error('Token not found');
  return token;
}

export function getByAddress(tokenAddress: Address): Token {
  return getById(tokenAddress.toHexString());
}

export function getOrCreate(tokenAddress: Address, allowed: boolean): Token {
  const id = tokenAddress.toHexString();
  log.info('[Tokens] Get or create {}', [id]);
  let token = Token.load(id);
  if (token == null) {
    if (tokenAddress.equals(PROTOCOL_TOKEN_ADDRESS)) {
      token = createProtocolToken();
    } else {
      token = new Token(id);
      const erc20Contract = ERC20.bind(tokenAddress);
      token.name = erc20Contract.name();
      token.symbol = erc20Contract.symbol();
      token.decimals = erc20Contract.decimals();
      token.magnitude = BigInt.fromI32(10).pow(erc20Contract.decimals() as u8);
      token.allowed = allowed;

      const tokenTypeAndTransformerAddress = getTokenTypeAndTransformerAddress(tokenAddress);
      token.type = tokenTypeAndTransformerAddress.tokenType;

      if (tokenTypeAndTransformerAddress.tokenType != 'BASE') {
        token.underlyingTokens = getUnderlyingTokenIds(tokenTypeAndTransformerAddress.transformerAddress, tokenAddress);
      }
    }

    token.save();
  } else {
    if (allowed != token.allowed) {
      token.allowed = allowed;
      token.save();
    }
  }

  return token;
}

export function createProtocolToken(): Token {
  const token = new Token(PROTOCOL_TOKEN_ADDRESS.toHexString());
  if (
    dataSource.network() == 'mainnet' ||
    dataSource.network() == 'optimism' ||
    dataSource.network() == 'optimism-kovan' ||
    dataSource.network() == 'arbitrum-one' ||
    dataSource.network() == 'arbitrum-rinkeby'
  ) {
    token.name = 'Ethereum';
    token.symbol = 'ETH';
  } else if (dataSource.network() == 'matic' || dataSource.network() == 'mumbai') {
    token.name = 'Matic';
    token.symbol = 'MATIC';
  }
  token.decimals = 18;
  token.magnitude = BigInt.fromI32(10).pow(18);
  token.allowed = false;
  token.type = 'BASE';
  return token;
}

export function getTokenTypeAndTransformerAddress(tokenAddress: Address): TokenTypeAndTransformerAddress {
  const transformerAddress = getTransformerAddress(tokenAddress)[0];
  const tokenType = getTokenTypeByTransformerAddress(transformerAddress);
  return new TokenTypeAndTransformerAddress(tokenType, transformerAddress);
}

export function getTransformerAddress(dependantTokenAddress: Address): Address[] {
  const transformerRegistry = TransformerRegistry.bind(TRANSFORMER_REGISTRY_ADDRESS);
  return transformerRegistry.transformers([dependantTokenAddress]);
}

function getTokenTypeByTransformerAddress(transformerAddress: Address): string {
  if (transformerAddress.equals(PROTOCOL_TOKEN_WRAPPER_TRANSFORMER_ADDRESS)) {
    return 'WRAPPED_PROTOCOL_TOKEN';
  } else if (transformerAddress.equals(YIELD_BEARING_SHARE_TRANSFORMER_ADDRESS)) {
    return 'YIELD_BEARING_SHARE';
  }
  return 'BASE';
}

export function getUnderlyingTokenIds(transformerAddress: Address, dependantTokenAddress: Address): string[] {
  const underlyingTokens: string[] = [];
  const transformer = Transformer.bind(transformerAddress);
  const underlyingTokenAddresses = transformer.getUnderlying(dependantTokenAddress);
  for (let i: i32 = 0; i < underlyingTokenAddresses.length; i++) {
    const underlyingId = underlyingTokenAddresses[i].toHexString();
    const underlyingToken = Token.load(underlyingId);
    if (underlyingToken == null) getOrCreate(underlyingTokenAddresses[i], false);
    underlyingTokens.push(underlyingId);
  }
  return underlyingTokens;
}

export function transformToUnderlying(
  dependantAddress: Address,
  amount: BigInt
): Array<Transformer__calculateTransformToUnderlyingResultValue0Struct> {
  const transformer = Transformer.bind(getTransformerAddress(dependantAddress)[0]);
  return transformer.calculateTransformToUnderlying(dependantAddress, amount);
}

export function transformYieldBearingSharesToUnderlying(dependantTokenAddress: Address, amount: BigInt): BigInt {
  const underlyings = transformToUnderlying(dependantTokenAddress, amount);
  return underlyings[0].amount;
}

export class TokenTypeAndTransformerAddress {
  private _tokenType: string;
  private _transformerAddress: Address;

  constructor(tokenType: string, transformerAddress: Address) {
    this._tokenType = tokenType;
    this._transformerAddress = transformerAddress;
  }

  get tokenType(): string {
    return this._tokenType;
  }

  get transformerAddress(): Address {
    return this._transformerAddress;
  }
}
