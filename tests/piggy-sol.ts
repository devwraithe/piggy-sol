import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { PiggySol } from "../target/types/piggy_sol";
import { assert, expect } from "chai";
import { MaliciousPiggy } from "../target/types/malicious_piggy";
import { airdropIfRequired } from "@solana-developers/helpers";

describe("piggy-sol", () => {
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.piggySol as Program<PiggySol>;
  const maliciousProgram = anchor.workspace
    .maliciousPiggy as Program<MaliciousPiggy>;

  const connection = provider.connection;
  const walletAuthority = provider.wallet as anchor.Wallet;

  const unauthorizedWallet = Keypair.generate();
  const vaultAccount = Keypair.generate();
  const maliciousVaultAccount = Keypair.generate();

  const INITIAL_AIRDROP_AMOUNT = 1 * LAMPORTS_PER_SOL;
  const MINIMUM_BALANCE_FOR_RENT_EXEMPTION = 1 * LAMPORTS_PER_SOL;
  const DEPOSIT_AMOUNT = 1_000_000;
  const WITHDRAW_AMOUNT = 1_000_000;

  before(async () => {
    try {
      await airdropIfRequired(
        connection,
        unauthorizedWallet.publicKey,
        INITIAL_AIRDROP_AMOUNT,
        MINIMUM_BALANCE_FOR_RENT_EXEMPTION,
      );
    } catch (e) {
      console.error("Test setup failed:", e);
      throw e;
    }
  });

  it("Initialize account", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        authority: walletAuthority.publicKey,
        vault: vaultAccount.publicKey,
      })
      .signers([vaultAccount])
      .rpc();

    console.log("Initialize: Txn signature", tx);

    const vault = await program.account.vault.fetch(vaultAccount.publicKey);
    assert.equal(
      vault.authority.toString(),
      walletAuthority.publicKey.toString(),
      "User authority should be user wallet's pubkey",
    );
  });

  it("initializes malicious vault", async () => {
    try {
      const txn = await maliciousProgram.methods
        .initialize()
        .accounts({
          authority: unauthorizedWallet.publicKey,
          vault: maliciousVaultAccount.publicKey,
        })
        .transaction();

      await sendAndConfirmTransaction(connection, txn, [
        unauthorizedWallet,
        maliciousVaultAccount,
      ]);

      console.log("initialize mmalicious vault signature", txn.signature);
    } catch (error) {
      console.error("Fake vault initialization failed:", error);
      throw error;
    }
  });

  it("Deposit to account", async () => {
    const balanceBefore = (
      await program.account.vault.fetch(vaultAccount.publicKey)
    ).balance.toNumber();

    const tx = await program.methods
      .deposit(new anchor.BN(DEPOSIT_AMOUNT))
      .accounts({
        authority: walletAuthority.publicKey,
        vault: vaultAccount.publicKey,
      })
      .signers([walletAuthority.payer])
      .rpc();

    console.log("Deposit: Txn signature", tx);

    const balanceAfter = (
      await program.account.vault.fetch(vaultAccount.publicKey)
    ).balance.toNumber();
    assert.isTrue(
      balanceAfter > balanceBefore,
      "Account balance should increase after deposit",
    );
  });

  it("Check account balance", async () => {
    const readAccount = await program.account.vault.fetch(
      vaultAccount.publicKey,
    );
    const accountBalance = readAccount.balance.toNumber();

    console.log("Balance: ", accountBalance);

    assert.isTrue(
      accountBalance == DEPOSIT_AMOUNT,
      "Account balance should equal deposit. amount",
    );
  });

  // WITHDRAW
  it("fails secure withdraw with unauthorized user", async () => {
    try {
      const txn = await program.methods
        .withdraw(new anchor.BN(WITHDRAW_AMOUNT))
        .accounts({
          authority: unauthorizedWallet.publicKey,
          vault: maliciousVaultAccount.publicKey,
        })
        .transaction();

      await sendAndConfirmTransaction(connection, txn, [unauthorizedWallet]);

      throw new Error("Expected transaction to fail, but it succeeded");
    } catch (error) {
      expect(error).to.be.an("error");
      console.log("Error message:", error.message);
    }
  });

  it("Withdraw from account", async () => {
    const balanceBefore = (
      await program.account.vault.fetch(vaultAccount.publicKey)
    ).balance.toNumber();

    const tx = await program.methods
      .withdraw(new anchor.BN(WITHDRAW_AMOUNT))
      .accounts({
        authority: walletAuthority.publicKey,
        vault: vaultAccount.publicKey,
      })
      .signers([walletAuthority.payer])
      .rpc();

    console.log("Withdraw: Txn signature", tx);

    const balanceAfter = (
      await program.account.vault.fetch(vaultAccount.publicKey)
    ).balance.toNumber();
    assert.isTrue(
      balanceAfter < balanceBefore,
      "Account balance should decrease after withdrawal",
    );
  });
});
