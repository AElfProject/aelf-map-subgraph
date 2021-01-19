import {
  Address,
  BigDecimal,
  BigInt
} from '@graphprotocol/graph-ts';
import {
  NewReceipt
} from "./types/Gravity/Map";
import {
  Account,
  Receipt,
  Invitor
} from "./types/schema";
import {
  ELF_ADDRESS,
  convertTokenToDecimal,
  ZERO_BD
} from "./helper";

function isELF(address: Address): boolean {
  return Address.fromString(ELF_ADDRESS).equals(address);
}

function createAccount(address: Address): Account {
  let account = Account.load(address.toHexString());
  if (account === null) {
    account = new Account(address.toHexString());
    account.amount = ZERO_BD;
    account.save();
  }
  return account as Account;
}

let BI_18 = BigInt.fromI32(18);

function createInvitor(
  event: NewReceipt
): Invitor {
  let invitor = Invitor.load(event.params.invitingCode);
  if (invitor === null && event.params.invitingCode !== '') {
    invitor = new Invitor(event.params.invitingCode);
    invitor.amount = ZERO_BD;
    invitor.save();
  }
  return invitor as Invitor;
}

export function handleNewReceipt(event: NewReceipt): void {
  if (isELF(event.params.asset)) {
    let amount = convertTokenToDecimal(event.params.amount, BI_18);
    let account = createAccount(event.params.owner);
    let receipt = Receipt.load(event.params.receiptId.toString());
    let invitor = createInvitor(event);
    if (receipt === null) {
      receipt = new Receipt(event.params.receiptId.toString());
      receipt.amount = amount;
      receipt.endTime = event.params.endTime;
      receipt.inviteCode = invitor.id;
      receipt.sender = account.id;
      receipt.save();
    }
    account.amount = account.amount.plus(amount);
    account.save();
    invitor.amount = invitor.amount.plus(amount);
    invitor.save();
  }
}
