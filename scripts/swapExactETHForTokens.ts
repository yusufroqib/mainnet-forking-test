import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
	const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; 
	const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
	const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; 

	const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621"; 

	await helpers.impersonateAccount(TOKEN_HOLDER);
	const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

	const amountIn = ethers.parseEther("1.5");
	const amountOutMin = ethers.parseUnits("2500", 6); 

	const ROUTER = await ethers.getContractAt(
		"IUniswapV2Router",
		ROUTER_ADDRESS,
		impersonatedSigner
	);

	const USDC_Contract = await ethers.getContractAt(
		"IERC20",
		USDC,
		impersonatedSigner
	);

	const deadline = Math.floor(Date.now() / 1000) + 60 * 10; 

	const EthBalanceBeforeSwap = await ethers.provider.getBalance(TOKEN_HOLDER);
	const USDCBalanceBeforeSwap = await USDC_Contract.balanceOf(TOKEN_HOLDER);
	console.log({
		"ETH balance before swap": ethers.formatEther(
			EthBalanceBeforeSwap.toString()
		),
	});
	console.log({
		"USDC balance before swap": ethers.formatUnits(
			USDCBalanceBeforeSwap.toString(),
			6
		),
	});

	const txnResponse = await ROUTER.swapExactETHForTokens(
		amountOutMin, 
		[WETH, USDC], 
		TOKEN_HOLDER, 
		deadline, 
		{ value: amountIn } 
	);

	console.log(txnResponse);
	await txnResponse.wait();

	const EthBalanceAfterSwap = await ethers.provider.getBalance(TOKEN_HOLDER);
	console.log({
		"ETH balance after swap": ethers.formatEther(
			EthBalanceAfterSwap.toString()
		),
	});

	const USDCBalanceAfterSwap = await USDC_Contract.balanceOf(TOKEN_HOLDER);
	console.log({
		"USDC balance after swap": ethers.formatUnits(
			USDCBalanceAfterSwap.toString(),
			6
		),
	});
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
