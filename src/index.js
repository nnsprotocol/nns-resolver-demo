import { DAppProvider, Mainnet } from "@usedapp/core";
import { getDefaultProvider } from "ethers";
import React from "react";
import ReactDOM from "react-dom/client";
import Component from "./examples/Component";
import { TEST_ADDRESS } from "./examples/constants";
import {
  lookupAddress,
  lookupAddressWithENSFallback,
  lookupAddressWithENSFallbackUsingContract,
} from "./examples/ethers";

// You can open the console to see the result of these calls.
lookupAddress()
  .then((addr) => console.log(`lookupAddress() -> ${addr}`))
  .catch((err) => console.error(err));
lookupAddressWithENSFallback()
  .then((addr) => console.log(`lookupAddressWithENSFallback() -> ${addr}`))
  .catch((err) => console.error(err));
lookupAddressWithENSFallbackUsingContract()
  .then((addr) =>
    console.log(`lookupAddressWithENSFallbackUsingContract() -> ${addr}`)
  )
  .catch((err) => console.error(err));

const config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: getDefaultProvider("mainnet"),
  },
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <Component address={TEST_ADDRESS} />
    </DAppProvider>
  </React.StrictMode>
);
