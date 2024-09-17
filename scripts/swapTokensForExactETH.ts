import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
	const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
	const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
	const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

	const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

	await helpers.impersonateAccount(TOKEN_HOLDER);
	const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

	const amountOut = ethers.parseEther("1");
	const amountInMax = ethers.parseUnits("2500", 18);

	const DAI_Contract = await ethers.getContractAt(
		"IERC20",
		DAI,
		impersonatedSigner
	);

	const ROUTER = await ethers.getContractAt(
		"IUniswapV2Router",
		ROUTER_ADDRESS,
		impersonatedSigner
	);
	const approveTx = await DAI_Contract.approve(ROUTER_ADDRESS, amountInMax);
	await approveTx.wait();

	const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

	const EhersBalBeforeSwap = await ethers.provider.getBalance(TOKEN_HOLDER);
	console.log({
		"Ethers Balance before swap": ethers.formatEther(EhersBalBeforeSwap.toString()),
	});
	const txnResponse = await ROUTER.swapTokensForExactETH(
		amountOut,
		amountInMax,
		[DAI, WETH],
		TOKEN_HOLDER,
		deadline
	);

	console.log(txnResponse);
	await txnResponse.wait();

	const EthersBalAfterSwap = await ethers.provider.getBalance(TOKEN_HOLDER);
	console.log({
		"Ethers balance after swap": ethers.formatEther(EthersBalAfterSwap.toString()),
	});
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
