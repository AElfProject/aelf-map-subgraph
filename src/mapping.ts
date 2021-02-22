import {
  Address,
  BigDecimal,
  BigInt
} from '@graphprotocol/graph-ts';
import {
  NewReceipt
} from "./types/TokenMap/Map";
import {
  Account,
  Receipt,
  Invitor,
  AccountCount,
  InvitorAccountSnap
} from "./types/schema";
import {
  ELF_ADDRESS,
  convertTokenToDecimal,
  ZERO_BD,
  ZERO_BI,
  ONE_BI
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
    invitor.receiptsCount = ZERO_BI;
    invitor.accountCount = ZERO_BI;
    invitor.save();
  }
  return invitor as Invitor;
}

function updateCount(account: Address): void {
  let count = AccountCount.load('1');
  if (count === null) {
    count = new AccountCount('1');
    count.count = ZERO_BI;
  }
  let user = Account.load(account.toHexString());
  if (user === null) {
    count.count = count.count.plus(ONE_BI);
  }
  count.save();
}

function createInvitorAccountSnap(invitor: Invitor, account: Account): void {
  let id = invitor.id + '-' + account.id;
  let snap = InvitorAccountSnap.load(id);
  if (snap === null) {
    snap = new InvitorAccountSnap(id);
    snap.inviteCode = invitor.id;
    snap.sender = account.id;
    snap.save();
    invitor.accountCount = invitor.accountCount.plus(ONE_BI);
    invitor.save();
  }
}

export function handleNewReceipt(event: NewReceipt): void {
  if (isELF(event.params.asset)) {
    let amount = convertTokenToDecimal(event.params.amount, BI_18);
    updateCount(event.params.owner);
    let account = createAccount(event.params.owner);
    let receipt = Receipt.load(event.params.receiptId.toString());
    let invitor = createInvitor(event);
    createInvitorAccountSnap(invitor, account);
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
    invitor.receiptsCount = invitor.receiptsCount.plus(ONE_BI);
    invitor.save();
  }
}
