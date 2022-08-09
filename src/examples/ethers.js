import { BigNumber, ethers, utils } from "ethers";
import { ENS_REGISTRY, NNS_REGISTRY, TEST_ADDRESS } from "./constants";

export async function lookupAddress() {
  const provider = new ethers.providers.InfuraProvider();
  provider.network.ensAddress = NNS_REGISTRY;
  return await provider.lookupAddress(TEST_ADDRESS);
}

export async function lookupAddressWithENSFallback() {
  const provider = new ethers.providers.InfuraProvider();

  // try looking up the address on NNS (ie get name.⌐◨-◨)
  provider.network.ensAddress = NNS_REGISTRY;
  const nnsName = await provider.lookupAddress(TEST_ADDRESS);
  if (nnsName) {
    return nnsName;
  }
  // if not, look up on ENS (ie get name.eth)
  provider.network.ensAddress = ENS_REGISTRY;
  return await provider.lookupAddress(TEST_ADDRESS);
}

export async function lookupAddressWithENSFallbackUsingContract() {
  const provider = new ethers.providers.InfuraProvider();

  try {
    // Call resolver contract
    const res = await provider.call({
      to: "0x5982ce3554b18a5cf02169049e81ec43bfb73961", // see https://etherscan.io/address/0x5982cE3554B18a5CF02169049e81ec43BFB73961
      data: "0x55ea6c47000000000000000000000000" + TEST_ADDRESS.substring(2), // call .resolve(address) method
    });
    // Parse result into a string.
    const offset = BigNumber.from(utils.hexDataSlice(res, 0, 32)).toNumber();
    const length = BigNumber.from(
      utils.hexDataSlice(res, offset, offset + 32)
    ).toNumber();
    const data = utils.hexDataSlice(res, offset + 32, offset + 32 + length);
    return utils.toUtf8String(data) || null;
  } catch (e) {
    return null;
  }
}
