import { useState, useEffect } from 'react';
import './App.css';
import Ape1 from './assets/images/ape1.png';
import Ape2 from './assets/images/ape2.png';
import Ape3 from './assets/images/ape3.png';
import Ape4 from './assets/images/ape4.png';
import Ape5 from './assets/images/ape5.png';
import axios from 'axios';
// import LgcyWeb from 'lgcyweb';
// import LgcyWeb from './lgcyweb/src/index';
import Weblgcy from 'weblgcy';
import { getAbi, getContractAddress } from './config/addreses';

const apes = [Ape1, Ape2, Ape3, Ape4, Ape5];
function App() {
  const [uri, setUri] = useState(Ape1);
  const [nfts, setNsfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');

  useEffect(() => {
    console.log('lgcy provider..', window.lgcyWeb);
    if (window.lgcyWeb && !loading) {
      if (window.lgcyWeb.defaultAddress.base58) {
        console.log('LGCY Wallet is installed');

        const address = window.lgcyWeb.defaultAddress.base58;
        console.log('address', address);
        if (window.lgcyWeb.defaultAddress.base58) {
          console.log('Wallet is unlocked');
        }
        getId();
      }
    }
  }, [window.lgcyWeb, loading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUri(getRandomItem());
    }, 1000);
    return () => clearInterval(interval);
  }, [uri]);

  const getRandomItem = () => {
    const randomIndex = Math.floor(Math.random() * apes.length);

    const item = apes[randomIndex];
    return item;
  };

  const getHexMessage = async () => {
    if (window.lgcyWeb) {
      // const web3 = new Web3(window.lgcyWeb)
      // const nftContract = new web3.eth.Contract(
      //   getAbi(),
      //   getContractAddress()
      // )

      const webLgcy = new Weblgcy({
        fullNode: 'https://api.lgcyscan.network:2096/middleware',
        solidityNode: 'https://api.lgcyscan.network:2096/middleware',
        eventServer: 'https://api.lgcyscan.network:2096/middleware',
      });

      const tokenId = Math.floor(Math.random() * 1000);
      setLoading(true);
      const contract = await window.lgcyWeb.contract(
        getAbi(),
        getContractAddress(),
      );
      try {
        const mintNFT = await contract
          .mint(tokenId + 1)
          .send({ from: window.lgcyWeb.defaultAddress.base58 });

        console.log(mintNFT);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }

      // console.log('smart contract...', contract);
    }
  };

  const transferToken = async (id) => {
    const contract = await window.lgcyWeb.contract(
      getAbi(),
      getContractAddress(),
    );
    try {
      setLoading(true);
      const mintNFT = await contract
        .transferFrom(window.lgcyWeb.defaultAddress.base58, transferAddress, id)
        .send({ from: window.lgcyWeb.defaultAddress.base58 });

      console.log(mintNFT);
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const getId = async () => {
    if (window.lgcyWeb) {
      const contract = await window.lgcyWeb.contract(
        getAbi(),
        getContractAddress(),
      );
      try {
        const tokenIds = await contract
          .getTokens(window.lgcyWeb.defaultAddress.base58)
          .call({ from: window.lgcyWeb.defaultAddress.base58 });

        console.log(tokenIds);
        const ids = await Promise.all(
          tokenIds.map(async (item) => {
            console.log(item.toNumber());
            const uri = await contract
              .tokenURI(item.toNumber())
              .call({ from: window.lgcyWeb.defaultAddress.base58 });
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

  return (
    <div className='App'>
      <div className='app_image'>
        {/* <img src={uri} className="app_image_container"/> */}
      </div>
      <div className='app_mint'>
        <button
          className='app_button'
          onClick={() => {
            getHexMessage();
          }}
        >
          Mint
        </button>
      </div>
      <div
        style={{
          display: 'flex',
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
            <input
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
