
import { useEthers } from "@usedapp/core";
import { BigNumber, utils } from "ethers";
import { useEffect, useState } from "react";

const useReverseENSLookUp = (address) => {
  const { library } = useEthers();
  const [name, setName] = useState();

  useEffect(() => {
    if (address) {
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
  library,
  address
) {
  try {
    const res = await library.call({
      to: "0x5982ce3554b18a5cf02169049e81ec43bfb73961",
      data: "0x55ea6c47000000000000000000000000" + address.substring(2),
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

const Component = ({address}) => {
  const name = useReverseENSLookUp(address);

  return (
    <>
      <p>Address: {address}</p>
      <p>Resolved name: {name || 'NOT FOUND'}</p>
    </>
  )
};

export default Component;