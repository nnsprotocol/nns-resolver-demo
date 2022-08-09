# Resolving .⌐◨-◨ domains

The NNS registry is a fork of the [ENS registry](https://ens.domains/) and therefore most operations are fully compatible.

Most libraries have hardcoded the ENS registry address so that all interactions, such as looking up .eth domain from an address are automatically executed against ENS. Luckily, most of them let us change the default ENS registry and therefore we can resolve names against NNS quite easily.

Here you can find how you can resolve address to `.⌐◨-◨` domains with and without falling back to `.eth`.

#### See it working!

Everything explained here can be tries by running this simple demo application.

```
npm i
npm start
```

then open a browser and the console and you will see the name resolved as described below
as well as on the page.

Everything explained below can be found in the [examples](./src/examples/) folder.

## General solution using ethers.js

### Looking up .⌐◨-◨ domains from an address

A common requirement is to perform a reverse lookup from an address,
so that websites can display a `name.⌐◨-◨` rather than the associated address.
This process is already performed by most websites only for `.eth` addresses using the ENS registry and we just need to switch to the NNS registry.

Assyming we are using [ethers.js](https://docs.ethers.io/v5/), this can be done very easily with the following code:

```js
export async function lookupAddress(provider, adddress) {
  provider.network.ensAddress = NNS_REGISTRY;
  return await provider.lookupAddress(adddress);
}
```

where `NNS_REGISTRY` is the address of the NNS registry (.⌐◨-◨) on mainnet, i.e. [0x3e1970dc478991b49c4327973ea8a4862ef5a4de](https://etherscan.io/address/0x3e1970dc478991b49c4327973ea8a4862ef5a4de).

This code can also be found [here](./src/examples/ethers.js) with a simple Infura provider as a quick way to test the integration. In your application, you should use the provider you are already using to connect to the network.

### Looking up .⌐◨-◨ domains from an address with .eth fallback

Most of the times however, you might be interested in resolving an address against NNS and then ENS in case there is no .⌐◨-◨ lookup.
In other words, you are more likely interested in resolving one address so that:

- first you check if they have a name.⌐◨-◨ domain
- and if not, you try to check if they have a name.eth
- and if not, you just show the address

It's very likely your website is already doing step 2 and 3.

The following code shows how this can be implemented:

```js
export async function lookupAddressWithENSFallback(provider, address) {
  // try looking up the address on NNS (ie get name.⌐◨-◨)
  provider.network.ensAddress = NNS_REGISTRY;
  const nnsName = await provider.lookupAddress(address);
  if (nnsName) {
    return nnsName;
  }
  // if not, look up on ENS (ie get name.eth)
  provider.network.ensAddress = ENS_REGISTRY;
  return await provider.lookupAddress(address);
}
```

where `NNS_REGISTRY` is the address of the NNS (.⌐◨-◨) registry on mainnet, i.e. [0x3e1970dc478991b49c4327973ea8a4862ef5a4de](https://etherscan.io/address/0x3e1970dc478991b49c4327973ea8a4862ef5a4de) as before and `ENS_REGISTRY` is the ENS registry (.eth) on mainnet, i.e. [0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e](https://etherscan.io/address/0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e).

As for the previous example, this code can also be found [here](./src/examples/ethers.js)

### Looking up .⌐◨-◨ domains from an address with .eth fallback with resolver contract

The approach presented above does work, but requires two calls for each address which may be considered expensive and slow. For this reason, we have a created a contract that specifically resolves addresses to `.⌐◨-◨` with fallback to `.eth` so you can achieve the desired result in one call.

The contract is called `NNSENSReverseResolver` and is deployed at [0x5982cE3554B18a5CF02169049e81ec43BFB73961](https://etherscan.io/address/0x5982cE3554B18a5CF02169049e81ec43BFB73961) where you can also see the source code. The contract implements the same logic as above in the `resolve(address)` method:

- looks up an address on the NNS registry
- if not found, looks up the address on the ENS registry

Therefore, you only need your application to call this method which can be done easily as follow:

```js
export async function lookupAddressWithENSFallbackUsingContract(
  provider,
  address
) {
  try {
    const res = await provider.call({
      to: "0x5982ce3554b18a5cf02169049e81ec43bfb73961",
      data: "0x55ea6c47000000000000000000000000" + address.substring(2), // resolve() method
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
```

## Example of integration is a React application with @usedapp/core

[useDApp](https://github.com/TrueFiEng/useDApp) is a popular react-friendly library to interact with the ethereum blockchain using react hooks.

A simple and nice way to add NNS resolution is to create a custom hook that call the contract mentioned above.

```jsx
import { useEthers, Web3Provider } from "@usedapp/core";

export const useReverseENSLookUp = (address: string) => {
  const { library } = useEthers();
  const [name, setName] = useState<string>();

  useEffect(() => {
    if (address) {
      // NOTE: you might want to cache the address once resolved.
      lookupAddress(library, address)
        .then((name) => {
          if (!name) return;
          setName(name);
        })
        .catch((error) => {
          console.log(`error resolving reverse ens lookup: `, error);
        });
    }
    return () => {
      setName("");
    };
  }, [address, library]);

  return name;
};

async function lookupAddress(
  library: Web3Provider,
  address: string
): Promise<string | null> {
  try {
    const res = await library.call({
      to: "0x5982ce3554b18a5cf02169049e81ec43bfb73961",
      data: "0x55ea6c47000000000000000000000000" + address.substring(2),method
    });
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
```

We can then use this hook in any react component:

```jsx
const Component = ({ address }) => {
  const name = useReverseENSLookUp(address);
  return (
    <>
      <p>Address: {address}</p>
      <p>Resolved name: {name || "NOT FOUND"}</p>
    </>
  );
};
```
