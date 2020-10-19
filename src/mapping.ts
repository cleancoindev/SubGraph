import { BigInt } from "@graphprotocol/graph-ts";
import {
  ChainlinkCancelled,
  ChainlinkFulfilled,
  ChainlinkRequested,
  ProductAdded,
  ProxyCreated,
  Rent,
  Return,
} from "../generated/Contract/Contract";
import { User, Product } from "../generated/schema";

export function handleChainlinkCancelled(event: ChainlinkCancelled): void {}

export function handleChainlinkFulfilled(event: ChainlinkFulfilled): void {}

export function handleChainlinkRequested(event: ChainlinkRequested): void {}

export function handleProductAdded(event: ProductAdded): void {
  let { nftId, nftAddress, owner, price, duration } = event.params;

  let product = new Product(nftId.toHex());

  product.address = nftAddress;
  product.owner = owner;
  product.price = price;
  product.duration = duration;
  product.available = true;
  product.borrower = null;
  product.borrowedAt = BigInt.fromI32(0);
  product.collateral = BigInt.fromI32(0);

  let user = User.load(owner.toHex());
  if (user == null) {
    user = new User(owner.toHex());
    user.nftOwned = new Array<string>();
  }

  let nftOwned = user.nftOwned;
  nftOwned.push(product.id);
  user.nftOwned = nftOwned;
  user.save();
  product.save();
}

export function handleProxyCreated(event: ProxyCreated): void {}

export function handleRent(event: Rent): void {
  let { nftId, price, collateral, borrower, borrowedAt } = event.params;

  let product = Product.load(nftId.toHex());

  product.price = price;
  product.collateral = collateral;
  product.borrower = borrower;
  product.borrowedAt = borrowedAt;
  product.available = false;

  let userBorrower = User.load(borrower.toHex());
  if (userBorrower == null) {
    userBorrower = new User(borrower.toHex());
    userBorrower.nftRented = new Array<string>();
  }
  let nftRented = userBorrower.nftRented;
  nftRented.push(product.id);
  userBorrower.nftRented = nftRented;
  userBorrower.save();
  product.save();
}

export function handleReturn(event: Return): void {
  let id = event.params.nftId;
  let product = Product.load(id.toHex());
  product.available = true;
  product.duration = BigInt.fromI32(0);
  product.save();
}
