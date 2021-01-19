import {BigDecimal, BigInt} from "@graphprotocol/graph-ts/index";

export let ELF_ADDRESS = '0xb5685232b185cadf7c5f58217722ac40bc4ec45e';
export let ZERO_BI = BigInt.fromI32(0)
export let ZERO_BD = BigDecimal.fromString('0');
export let ONE_BI = BigInt.fromI32(1)

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}
