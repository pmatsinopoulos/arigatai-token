import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

const CONTRACT_NAME = "Arigatai";

describe("Arigatai", function () {
  async function deployArigataiFixture() {
    const [deployer, accountA, accountB] = await hre.ethers.getSigners();

    const Arigatai = await hre.ethers.getContractFactory(CONTRACT_NAME);

    const arigatai = await Arigatai.deploy(deployer);

    return {
      arigatai,
      deployer,
      accountA,
      accountB,
    };
  }

  describe("Deployment", function () {
    it("sets the owner to be the deployer", async function () {
      const { arigatai, deployer } = await loadFixture(deployArigataiFixture);

      const owner = await arigatai.owner();

      expect(owner).to.equal(deployer);
    });

    it("sets the owner to be the initialOwner given in the constructor", async function () {
      const [_, accountB] = await hre.ethers.getSigners();

      const Arigatai = await hre.ethers.getContractFactory(CONTRACT_NAME);

      const arigatai = await Arigatai.deploy(accountB);

      const owner = await arigatai.owner();

      expect(owner).to.equal(accountB);
    });

    it("sets the name", async function () {
      const { arigatai } = await loadFixture(deployArigataiFixture);

      expect(await arigatai.name()).to.equal("Arigatai");
    });

    it("sets the symbol", async function () {
      const { arigatai } = await loadFixture(deployArigataiFixture);

      expect(await arigatai.symbol()).to.equal("ARIG");
    });

    it("is not paused", async function () {
      const { arigatai } = await loadFixture(deployArigataiFixture);

      expect(await arigatai.paused()).to.equal(false);
    });
  });

  describe("ERC20", function () {
    describe("#name", function () {
      it("returns 'Arigatai'", async function () {
        const { arigatai } = await loadFixture(deployArigataiFixture);

        expect(await arigatai.name()).to.equal("Arigatai");
      });
    });

    describe("#symbol", function () {
      it("returns 'ARIG'", async function () {
        const { arigatai } = await loadFixture(deployArigataiFixture);

        expect(await arigatai.symbol()).to.equal("ARIG");
      });
    });
  });

  describe("ERC20Pausable", function () {
    describe("#pause", function () {
      it("sets Arigatai to be paused", async function () {
        const { arigatai } = await loadFixture(deployArigataiFixture);

        await arigatai.pause();

        expect(await arigatai.paused()).to.equal(true);
      });

      context("when called by a non-owner account", function () {
        it("reverts with the custom error", async function () {
          const { arigatai, accountA: nonDeployerAccount } = await loadFixture(
            deployArigataiFixture
          );

          await expect(arigatai.connect(nonDeployerAccount).pause())
            .to.be.revertedWithCustomError(
              arigatai,
              "OwnableUnauthorizedAccount"
            )
            .withArgs(nonDeployerAccount);
        });
      });
    });

    describe("#unpause", function () {
      it("sets Arigatai to be unpaused", async function () {
        const { arigatai } = await loadFixture(deployArigataiFixture);

        await arigatai.pause();

        // fire
        await arigatai.unpause();

        expect(await arigatai.paused()).to.equal(false);
      });

      context("when called by a non-owner account", function () {
        it("reverts with a custom error OwnableUnauthorizedAccount", async function () {
          const { arigatai, accountA: nonDeployerAccount } = await loadFixture(
            deployArigataiFixture
          );

          await arigatai.pause();

          // fire
          await expect(arigatai.connect(nonDeployerAccount).unpause())
            .to.be.revertedWithCustomError(
              arigatai,
              "OwnableUnauthorizedAccount"
            )
            .withArgs(nonDeployerAccount);
        });
      });
    });

    describe("#paused()", function () {
      context("when contract is paused", function () {
        it("returns true", async function () {
          const { arigatai } = await loadFixture(deployArigataiFixture);

          await arigatai.pause();

          expect(await arigatai.paused()).to.equal(true);
        });
      });

      context("when contract is not paused", function () {
        it("returns true", async function () {
          const { arigatai } = await loadFixture(deployArigataiFixture);

          expect(await arigatai.paused()).to.equal(false);
        });
      });
    });
  });

  describe("Ownable", function () {
    describe("#owner()", function () {
      context("when deployer is the initial owner", function () {
        it("returns the current owner of the smart contract", async function () {
          const { arigatai, deployer } = await loadFixture(
            deployArigataiFixture
          );

          // fire
          expect(await arigatai.owner()).to.equal(deployer);
        });
      });

      context("when we pass a different account as initial owner", function () {
        it("sets owner the account we pass as initial owner", async function () {
          const Arigatai = await hre.ethers.getContractFactory(CONTRACT_NAME);
          const anotherAccount = hre.ethers.Wallet.createRandom();

          const arigatai = await Arigatai.deploy(anotherAccount);

          expect(await arigatai.owner()).to.equal(anotherAccount);
        });
      });
    });

    describe("#renounceOwnership", function () {
      context("when contract is paused", function () {
        it("leaves contract without an owner", async function () {
          const { arigatai, deployer } = await loadFixture(
            deployArigataiFixture
          );

          await arigatai.pause();

          await expect(arigatai.renounceOwnership())
            .to.emit(arigatai, "OwnershipTransferred")
            .withArgs(deployer, hre.ethers.ZeroAddress);

          expect(await arigatai.owner()).to.equal(hre.ethers.ZeroAddress);
        });

        context("when called by a non-owner", function () {
          it("reverts with the error OwnableUnauthorizedAccount", async function () {
            const { arigatai, accountA: nonDeployerAccount } =
              await loadFixture(deployArigataiFixture);

            await arigatai.pause();

            await expect(
              arigatai.connect(nonDeployerAccount).renounceOwnership()
            )
              .to.be.revertedWithCustomError(
                arigatai,
                "OwnableUnauthorizedAccount"
              )
              .withArgs(nonDeployerAccount);
          });
        });
      });

      context("when contract is not paused", function () {
        it("raises an error that the contract should be paused", async function () {
          const { arigatai } = await loadFixture(deployArigataiFixture);

          await expect(
            arigatai.renounceOwnership()
          ).to.be.revertedWithCustomError(arigatai, "ExpectedPause");
        });
      });
    });

    describe("#transferOwnership", function () {
      context("when contract is paused", function () {
        it("transfers ownership", async function () {
          const { arigatai, accountA: newOwner } = await loadFixture(
            deployArigataiFixture
          );

          await arigatai.pause();

          // fire
          await arigatai.transferOwnership(newOwner);

          expect(await arigatai.owner()).to.equal(newOwner);
        });

        context("when is called by a non-owner account", function () {
          it("reverts with error OwnableUnauthorizedAccount", async function () {
            const {
              arigatai,
              accountA: nonOwnerAccount,
              accountB: newOwner,
            } = await loadFixture(deployArigataiFixture);

            await arigatai.pause();

            // fire
            await expect(
              arigatai.connect(nonOwnerAccount).transferOwnership(newOwner)
            )
              .to.be.revertedWithCustomError(
                arigatai,
                "OwnableUnauthorizedAccount"
              )
              .withArgs(nonOwnerAccount);
          });
        });
      });

      context("when contract is not paused", function () {
        it("reverts with error ExpectedPaused", async function () {
          const { arigatai, accountA: newOwner } = await loadFixture(
            deployArigataiFixture
          );

          // fire
          await expect(
            arigatai.transferOwnership(newOwner)
          ).to.be.revertedWithCustomError(arigatai, "ExpectedPause");
        });
      });
    });
  });
});
