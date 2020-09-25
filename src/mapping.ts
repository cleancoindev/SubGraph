import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Contract,
  ChainlinkCancelled,
  ChainlinkFulfilled,
  ChainlinkRequested,
  ProductAdded,
  ProxyCreated,
  Rent,
  Return
} from "../generated/Contract/Contract"
import { User, Product } from "../generated/schema"

export function handleChainlinkCancelled(event: ChainlinkCancelled): void {}

export function handleChainlinkFulfilled(event: ChainlinkFulfilled): void {}

export function handleChainlinkRequested(event: ChainlinkRequested): void {}

export function handleProductAdded(event: ProductAdded): void {
  let id = event.params.nftId;
  let product = new Product(id.toHex());
  product.address = event.params.nftAddress
  product.owner = event.params.owner
  product.price = event.params.price
  product.duration = event.params.duration
  product.available = true
  product.borrower = null
  product.borrowedAt = BigInt.fromI32(0)
  product.collateral = BigInt.fromI32(0);

  let owner = event.params.owner
  let user = User.load(owner.toHex())
  if (user == null) {
    user = new User(owner.toHex())
    user.nftOwned = new Array<string>();
  }
  let nftOwned = user.nftOwned
  nftOwned.push(product.id)
  user.nftOwned = nftOwned
  user.save()
  product.save()
}

export function handleProxyCreated(event: ProxyCreated): void {}

export function handleRent(event: Rent): void {
  let id = event.params.nftId;
  let product = Product.load(id.toHex());
  product.price = event.params.price
  product.available = false
  product.collateral = event.params.collateral
  product.borrower = event.params.borrower
  product.borrowedAt = event.params.borrowedAt

  let borrower = User.load(event.params.borrower.toHex())
  if (borrower == null) {
    borrower = new User(event.params.borrower.toHex())
    borrower.nftRented = new Array<string>();
  }
  let nftRented = borrower.nftRented
  nftRented.push(product.id)
  borrower.nftRented = nftRented
  borrower.save()
  product.save()
}

export function handleReturn(event: Return): void {
  let id = event.params.nftId;
  let product = Product.load(id.toHex());
  product.available = true
  product.duration = BigInt.fromI32(0)
  product.save()
}
