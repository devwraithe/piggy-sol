import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { PiggySol } from "../target/types/piggy_sol";
import { assert } from "chai";

describe("piggy-sol", () => {
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.piggySol as Program<PiggySol>;

  const depositAmount = 1_000_000;

  const user_wallet = provider.wallet.payer; // payer = user
  const user_wallet_pubkey = provider.wallet.publicKey;
  const user_account = Keypair.generate();

  it("Initialize account", async () => {
    const tx = await program.methods.initializeAccount().accounts({
      userAuthority: user_wallet_pubkey,
      userAccount: user_account.publicKey,
    }).signers([user_account]).rpc();

    console.log("Initialize: Txn signature", tx);

    const userAccount = await program.account.userAccount.fetch(user_account.publicKey);
    assert.equal(userAccount.userAuthority.toString(), user_wallet_pubkey.toString(), "User authority should be user wallet's pubkey");
  });

  it("Deposit to account", async () => {
    const balanceBefore = (await program.account.userAccount.fetch(user_account.publicKey)).balance.toNumber();

    const tx = await program.methods.deposit(new anchor.BN(depositAmount)).accounts({
      userAuthority: user_wallet_pubkey,
      userAccount: user_account.publicKey,
    }).signers([user_wallet]).rpc();

    console.log("Deposit: Txn signature", tx);

    const balanceAfter = (await program.account.userAccount.fetch(user_account.publicKey)).balance.toNumber();
    assert.isTrue(balanceAfter > balanceBefore, "Account balance should increase after deposit");
  });

  it("Check account balance", async () => {
    const readAccount = await program.account.userAccount.fetch(user_account.publicKey);
    const accountBalance = readAccount.balance.toNumber();

    console.log("Balance: ", accountBalance);

    assert.isTrue(accountBalance == depositAmount, "Account balance should equal deposit. amount");
  });

  it("Withdraw from account", async () => {
    const withdrawAmount = 405_328;
    const balanceBefore = (await program.account.userAccount.fetch(user_account.publicKey)).balance.toNumber();;


    const tx = await program.methods.withdraw(new anchor.BN(withdrawAmount)).accounts({
      userAccount: user_account.publicKey,
    }).signers([user_wallet]).rpc();

    console.log("Withdraw: Txn signature", tx);

    const balanceAfter = (await program.account.userAccount.fetch(user_account.publicKey)).balance.toNumber();;
    assert.isTrue(balanceAfter < balanceBefore, "Account balance should decrease after withdrawal");
  });
});
