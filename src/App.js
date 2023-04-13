import { useState, useEffect } from 'react';
import './App.css';
import Ape1 from './assets/images/ape1.png';
import Ape2 from './assets/images/ape2.png';
import Ape3 from './assets/images/ape3.png';
import Ape4 from './assets/images/ape4.png';
import Ape5 from './assets/images/ape5.png';
import axios from 'axios';
// import LgcyWeb from './lgcyweb/src/index';
// import Weblgcy from 'weblgcy';
import {
  getAbi,
  getPayAbi,
  getPayableAddress,
  getContractAddress,
  getTokenAbi,
  getTokenAddress,
  getTestAddress,
  getTestAbi,
  getProxyAddress,
  getTronTestAbi,
} from './config/addreses';

const apes = [Ape1, Ape2, Ape3, Ape4, Ape5];
const baseURI =
  'https://bigfoot-cryptoids.mypinata.cloud/ipfs/QmU9UuWAVhLacT8BjLsnMKnEemjtwWr1AtwYQYQh8ZYSHG/';
function App() {
  const [LGCYWeb, setLGCYWeb] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [nfts, setNsfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [trxId, setTrxId] = useState('');

  useEffect(() => {
    setTimeout(async () => {
      console.log(window.lgcyWeb);
      if (window.lgcyWeb && !loading) {
        console.log(window.lgcyWeb.defaultAddress.base58);
        if (window.lgcyWeb.defaultAddress.base58) {
          setWalletAddress(window.lgcyWeb.defaultAddress.base58);
        } else {
          setWalletAddress('');
        }
        const contract = await window.lgcyWeb.contract(
          getAbi(),
          getContractAddress(),
        );
        console.log(contract);
      }
    }, 1000);
  }, [loading]);

  useEffect(() => {
    if (walletAddress !== '') {
      getId();
    }
  }, [walletAddress, loading]);

  const logicInitialize = async () => {
    const contract = await window.lgcyWeb.contract(
      getAbi(),
      getContractAddress(),
    );
    const trx = await contract
      .initialize(getTokenAddress(), 'LXmV9iHq8Mn1h4NNUDeBj5fQXVt6zZ3ny2')
      .send({ from: window.lgcyWeb.defaultAddress.base58 });
    console.log(trx);
    setTrxId(trx.txID);
  };

  const setMangeAddress = async () => {
    const contract = await window.lgcyWeb.contract(
      getAbi(),
      getContractAddress(),
    );
    const trx = await contract
      .setManageAddress('LXmV9iHq8Mn1h4NNUDeBj5fQXVt6zZ3ny2')
      .send({ from: window.lgcyWeb.defaultAddress.base58 });
    console.log(trx);
    setTrxId(trx.txID);
  };

  const pause = async () => {
    const contract = await window.lgcyWeb.contract(
      getAbi(),
      getContractAddress(),
    );
    const trx = await contract
      .contractPause()
      .send({ from: window.lgcyWeb.defaultAddress.base58 });
    console.log(trx);
  };

  const unpause = async () => {
    const contract = await window.lgcyWeb.contract(
      getAbi(),
      getContractAddress(),
    );
    const trx = await contract
      .unpause()
      .send({ from: window.lgcyWeb.defaultAddress.base58 });
    console.log(trx);
  };

  const mint = async () => {
    setLoading(true);
    const tokenCount = 2;
    const contract = await window.lgcyWeb.contract(
      getAbi(),
      getContractAddress(),
    );
    let mintedToken = await contract
      .getMintedTokens('Adult')
      .call({ from: window.lgcyWeb.defaultAddress.base58 });
    mintedToken = mintedToken.map((item) => +item.toString());
    const tokenIds = [];
    for (let i = 1; i <= 60; i++) {
      if (!mintedToken.includes(i)) {
        tokenIds.push(i);
      }
      if (tokenIds.length === tokenCount) break;
    }
    if (tokenIds.length !== 0) {
      const traits = await Promise.all(
        tokenIds.map(async (item) => {
          const metadata = await axios.get(`${baseURI}${item}`);
          let attr = {};
          metadata.data.attributes.forEach((item) => {
            attr = { ...attr, [item.trait_type]: item.value };
          });
          return attr;
        }),
      );
      console.log(traits);
      const sexs = traits.map((item) => item.Sex);
      const ages = traits.map((item) => item.Age);
      const origins = traits.map((item) => item.Origin);

      try {
        const trx = await contract
          .adminMint(
            'LLdYXMtMQYHiY36zbMPt59j5db9gpw4MMU',
            tokenIds,
            ages,
            sexs,
            origins,
          )
          .send({
            callValue: 1000000 * tokenIds.length,
          });
        console.log('trx=>', trx);
        await getTransactionInfo(trx);
        alert('Successfully minted');
        setLoading(false);
      } catch (e) {
        alert('Error: ' + e);
        setLoading(false);
      }
    } else {
      alert('Already minted 60 nfts');
      setLoading(false);
    }
  };

  const getTransactionInfo = async (txId) => {
    const result = await LGCYWeb.trx.getTransactionInfo(txId);
    if (Object.keys(result).length === 0) {
      sleep(500);
      return getTransactionInfo(txId);
    } else {
      return new Promise(async (resolve, reject) => {
        if (result.result === 'FAILED') {
          const message = window.lgcyWeb.utils.abi.decodeParams(
            [],
            ['string'],
            '0x' + result.contractResult[0].slice(8),
          );
          reject(new Error(message));
        } else {
          resolve('Success');
        }
      });
    }
  };

  const sleep = async (ms) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(ms);
      }, ms);
    });
  };

  const getTokenName = async () => {
    const contract = await LGCYWeb.contract(getTestAbi(), getTestAddress());
    const name = await contract
      .retrieve()
      .call({ from: window.lgcyWeb.defaultAddress.base58 });
    console.log(name);
  };

  const growBaby = async (id) => {
    const contract = await window.lgcyWeb.contract(
      getAbi(),
      getContractAddress(),
    );
    const grow = await contract
      .growChild(id)
      .send({ from: window.lgcyWeb.defaultAddress.base58 });
    console.log(grow);
  };

  const mateAdult = async () => {
    const contract = await window.lgcyWeb.contract(
      getAbi(),
      getContractAddress(),
    );
    const grow = await contract
      .mateAdult(204, 696, 3026)
      .send({ from: window.lgcyWeb.defaultAddress.base58 });
    console.log(grow);
  };

  const setAddress = async () => {
    const contract = await window.lgcyWeb.contract(
      getAbi(),
      getContractAddress(),
    );
    const trx = await contract
      .setTokenAddress(getTokenAddress())
      .send({ from: window.lgcyWeb.defaultAddress.base58 });
    console.log(trx);
    const address = await contract
      .getTokenAddress()
      .call({ from: 'LXF4RZuNR9G1tptXaAo77A9whH3v1KcUk2' });
    console.log(window.lgcyWeb.address.fromHex(address));
  };

  const transferToken = async (id) => {
    const contract = await window.lgcyWeb.contract(
      getAbi(),
      getContractAddress(),
    );
    try {
      setLoading(true);
      const mintNFT = await contract
        .transferFrom(
          window.lgcyWeb.defaultAddress.base58,
          transferAddress,
          1000000,
        )
        .send({ from: window.lgcyWeb.defaultAddress.base58 });
      const trxInfo = await window.lgcyWeb.trx.getTransaction(mintNFT);
      console.log(trxInfo);
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const connectWallet = async () => {
    const token = await window.lgcyWeb.legacy.getTransaction(
      '77da47e9072e23f95b8ef2998ab8b5a9a60e180c19e5c26411f39e991c79ca32',
    );
    console.log(token);
    // console.log(sign);
  };

  const getId = async () => {
    if (window.lgcyWeb) {
      const contract = await window.lgcyWeb.contract().at(getTokenAddress());
      try {
        const balance = await contract
          .balanceOf(window.lgcyWeb.defaultAddress.base58)
          .call({ from: window.lgcyWeb.defaultAddress.base58 });
        console.log(balance);
        const promises = [];
        for (let i = 0; i < balance; i++) {
          promises.push(await getTokenIds(i));
        }
        const tokenIds = await Promise.all(promises);

        console.log(tokenIds);
        const ids = await Promise.all(
          tokenIds.map(async (item) => {
            console.log(item.toNumber());
            const uri = await contract
              .tokenURI(item.toNumber())
              .call({ from: window.lgcyWeb.defaultAddress.base58 });
            console.log(uri);
            const metadata = await axios.get(`${uri}`);
            console.log(metadata.data);
            return { ...metadata.data, id: item.toNumber() };
          }),
        );
        setNsfts(ids);
        console.log(ids);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const getTokenIds = async (index) => {
    const contract = await window.lgcyWeb.contract(
      getTokenAbi(),
      getTokenAddress(),
    );
    const tokenId = await contract
      .tokenOfOwnerByIndex(window.lgcyWeb.defaultAddress.base58, index)
      .call({ from: window.lgcyWeb.defaultAddress.base58 });
    return tokenId;
  };

  // token interface
  async function tokenInitialize() {
    const contract = await window.lgcyWeb.contract(
      getTokenAbi(),
      getTokenAddress(),
    );

    const trx = await contract
      .initialize(
        'https://bigfoot-cryptoids.mypinata.cloud/ipfs/QmU9UuWAVhLacT8BjLsnMKnEemjtwWr1AtwYQYQh8ZYSHG/',
      )
      .send({
        from: window.lgcyWeb.defaultAddress.base58,
        shouldPollResponse: true,
      });
    console.log(trx);
    setTrxId(trx.txID);
  }

  async function setMintRole() {
    const contract = await window.lgcyWeb.contract(
      getTokenAbi(),
      getTokenAddress(),
    );

    const trx = await contract
      .setMintRole(getContractAddress())
      .send({ from: window.lgcyWeb.defaultAddress.base58 });
    console.log(trx);
  }

  // test pay

  const getPrice = async () => {
    const contract = await window.lgcyWeb.contract(
      getPayAbi(),
      getPayableAddress(),
    );

    const trx = await contract
      .getValue()
      .call({ from: window.lgcyWeb.defaultAddress.base58 });
    console.log(trx.toString());
  };

  const sendUSDL = async () => {
    console.log(getPayableAddress());
    const contract = await window.lgcyWeb.contract(
      getPayAbi(),
      getPayableAddress(),
    );
    console.log(contract);
    try {
      const trx = await contract
        .purchase(1, 'LXmV9iHq8Mn1h4NNUDeBj5fQXVt6zZ3ny2')
        .send({
          from: window.lgcyWeb.defaultAddress.base58,
          feeLimit: 100_000_000,
          callValue: 1000000,
        });
      console.log(trx);
    } catch (e) {
      console.log(e);
    }
  };

  const proxyGet = async () => {
    const contract = await window.lgcyWeb.contract(
      getTestAbi(),
      getProxyAddress(),
    );
    console.log(contract);
    // const trx = await contract
    //   .getTokenInfo(1)
    //   .call({ from: window.lgcyWeb.defaultAddress.base58 });

    const trx = await contract
      .balanceOf('LRFSDL93ZRbe9yGeaK2roxaav3ctBuej7T')
      .call({ from: window.lgcyWeb.defaultAddress.base58 });

    // const trx = await contract
    //   .safeMint(window.lgcyWeb.defaultAddress.base58, 6, 'This is own Pack')
    //   .send({
    //     from: window.lgcyWeb.defaultAddress.base58,
    //   });

    // const trx = await contract
    //   .upgradeTo('LXekoq9HqAK8phceZfK6Cb6xgm1um3wpmC')
    //   .send({
    //     from: window.lgcyWeb.defaultAddress.base58,
    //   });
    console.log(trx);
  };

  const tronProxy = async () => {
    console.log(window.tronWeb);
    const contract = await window.tronWeb.contract(
      getTronTestAbi(),
      'TCmjKoiiinLvfbvMxsDTYqSMEagcDvfSn5',
    );
    console.log('contract=>', contract);
    const trx = await contract
      .balanceOf('TP5AvinZmwywEPYyDRG3HEtjbZUnLHgqMU')
      .call();
    // const trx = await contract
    //   .mint('TP5AvinZmwywEPYyDRG3HEtjbZUnLHgqMU', 10000)
    //   .send({ shouldPollResponse: true });
    console.log(trx);
  };

  const multiCall = async () => {
    const contract = await window.tronWeb.contract(
      getTestAbi(),
      getTestAddress(),
    );
    console.log('contract=>', contract);
    const trx = await contract
      .callTokenUri(
        'LWKPrFNTxS54PKvfa49AnAKaqcgWaP4aK6',
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      )
      .call({
        from: window.lgcyWeb.defaultAddress.base58,
      });
    console.log(trx);
  };

  return (
    <div className='App'>
      <p>{walletAddress}</p>
      <div className='app_mint'>
        {walletAddress !== '' ? (
          // <>
          //   <h4>Token Interact</h4>
          //   <div>
          //     {/* Token interact */}
          //     <button onClick={getTokenName}>Name</button>
          //     <button
          //       className='app_button'
          //       onClick={() => {
          //         tokenInitialize();
          //       }}
          //     >
          //       Token Initialize
          //     </button>
          //     <button className='app_button' onClick={setMintRole}>
          //       Set mint role
          //     </button>
          //   </div>
          //   {/* Interact Logic */}
          //   <div>
          //     <h4>Interact Logic</h4>
          //     <button className='app_button' onClick={logicInitialize}>
          //       Logic Initialize
          //     </button>
          //     <button className='app_button' onClick={setMangeAddress}>
          //       Set Manage Address
          //     </button>
          //     <br />
          //     <br />
          //     <button
          //       className='app_button'
          //       onClick={() => {
          //         pause();
          //       }}
          //       style={{ margin: '0px 5px' }}
          //     >
          //       Pause
          //     </button>
          //     <button
          //       className='app_button'
          //       onClick={() => {
          //         unpause();
          //       }}
          //       style={{ margin: '0px 5px' }}
          //     >
          //       Unpause
          //     </button>
          //     <br />
          //     <br />
          //     <button
          //       className='app_button'
          //       onClick={() => {
          //         mateAdult();
          //       }}
          //     >
          //       Breed Baby
          //     </button>
          //     <br />
          //     <br />
          //     <button
          //       className='app_button'
          //       onClick={() => {
          //         multiCall();
          //       }}
          //     >
          //       Multi Call
          //     </button>
          //   </div>
          // </>
          <div>
            {/* <input /> */}
            <button onClick={mint} className='app_button' disabled={loading}>
              {loading ? 'Minting...' : 'Mint'}
            </button>
          </div>
        ) : (
          <button
            className='app_button'
            onClick={() => {
              connectWallet();
            }}
          >
            Connect Wallet
          </button>
        )}
      </div>
      {/* <h4>Payable Contract</h4>
      <button
        className='app_button'
        onClick={() => {
          getPrice();
        }}
      >
        Get Price
      </button>
      <button
        className='app_button'
        onClick={() => {
          sendUSDL();
        }}
      >
        Send USDL
      </button>
      <button onClick={proxyGet}>Proxy</button>
      <button onClick={tronProxy}>Tron Proxy</button> */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 10,
        }}
      >
        {nfts.map((item, index) => (
          <div
            key={index}
            style={{
              borderRadius: 10,
              border: '1px solid gray',
              overflow: 'hidden',
              margin: '0px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
              src={item.image}
              alt='nft'
              key={index}
              style={{ width: 200 }}
            />
            <p>{item.tokenId}</p>
            {/* <input
              placeholder='Address...'
              onChange={(e) => setTransferAddress(e.target.value)}
              style={{ padding: 5, marginTop: 10 }}
            />
            <button
              style={{ padding: 10, marginTop: 10 }}
              onClick={() => transferToken(item.id)}
            >
              Trade
            </button>
            <button onClick={() => growBaby(item.id)}>Grow Baby</button> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
