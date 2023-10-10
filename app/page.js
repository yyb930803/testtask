"use client"

import { useState } from 'react'
import { ethers } from 'ethers';
import V2FACTORY from "../ABI/UniswapFactory.json";
import V2PAIR from "../ABI/UniswapV2Pair.json";
import ERC20ABI from "../ABI/ERC20ABI.json";
import V2ROUTER from "../ABI/UniswapV2Router.json";
import V3FACTORYABI from "../ABI/UniswapV3FactoryABI.json";
import BigNumber from "bignumber.js";



export default function Home() {
  const [tokenA,setTokenA] = useState('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
  const [tokenB,setTokenB] = useState('0xdAC17F958D2ee523a2206206994597C13D831ec7');
  const [showSpinner,setShowSpinner] = useState(false);
  
  const [ticker,setTicker] = useState({
    tickera:'',
    token0amount:'',
    tickerb:'',
    token1amount:'',
  })

  const [v3ticker,setv3ticker] = useState({
    tickera:'',
    tickerb:'',
    token0amount500:'',
    token0amount3000:'',
    token0amount100:'',
    token1amount500:'',
    token1amount3000:'',
    token1amount100:'',
  })

  const [v3sushi,setv3sushi] = useState({
    tickera:'',
    tickerb:'',
    token0amount500:'',
    token0amount3000:'',
    token0amount100:'',
    token1amount500:'',
    token1amount3000:'',
    token1amount100:'',
  })

  const UNISWAP_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
  const UNISWAP_V2_FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
  const UNISWAP_V3_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
  const SUSHI_V3_FACTORY = "0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F";

 
  const isValidAddress = (address) => {
    try {
      ethers.getAddress(address);
      return true
    } catch (e) {
      return false
    }
  }

  const getTokenDetail = async(provider)=>{
    const erc20A = new ethers.BaseContract(tokenA,ERC20ABI,provider);
    const erc20B = new ethers.BaseContract(tokenB,ERC20ABI,provider);
    const tokenAdecimal = await  erc20A.decimals();
    const tokenBdecimal = await  erc20B.decimals();

    const tickerA = await erc20A.symbol();
    const tickerB = await erc20B.symbol();

    return {tickerA,tickerB,tokenAdecimal,tokenBdecimal}
  }

  const getReserveV2 = async (router,routerabi,factoryabi,pairabi,provider,{tickerA,tickerB,tokenAdecimal,tokenBdecimal}) =>{

    const crouter = new ethers.BaseContract(router,routerabi,provider);
    const factoryaddr = await crouter.factory();
    const cfactory = new ethers.BaseContract(factoryaddr,factoryabi,provider);
    const pairaddr = await cfactory.getPair(tokenA,tokenB);
    const cpair = new ethers.BaseContract(pairaddr,pairabi,provider);

    const reserve = await cpair.getReserves();
    const token0 = new BigNumber(reserve[0]);
    const token1 = new BigNumber(reserve[1]);

    const _token0 = token0.div(new BigNumber(10).pow(tokenAdecimal));
    const _token1 = token1.div(new BigNumber(10).pow(tokenBdecimal));

    return{
      tickera:tickerA,
      tickerb:tickerB,
      token0amount:_token0.c[0],
      token1amount:_token1.c[0]
    }
  
  }
  
  const getReserveV3 = async (factory,factoryabi,provider,{tickerA,tickerB,tokenAdecimal,tokenBdecimal}) =>{
    const erc20A = new ethers.BaseContract(tokenA,ERC20ABI,provider);
    const erc20B = new ethers.BaseContract(tokenB,ERC20ABI,provider);

    const cfactory = new ethers.BaseContract(factory,factoryabi,provider);
    const pairaddr = await cfactory.getPool(tokenA,tokenB,3000);
    const pairaddr500 = await cfactory.getPool(tokenA,tokenB,500);
    const pairaddr100 = await cfactory.getPool(tokenA,tokenB,100);

    const token0amount500 = await erc20A.balanceOf(pairaddr500);
    const token0amount3000 = await erc20A.balanceOf(pairaddr);
    const token0amount100 = await erc20A.balanceOf(pairaddr100);

    const _token0amount500 = new BigNumber(token0amount500).div(new BigNumber(10).pow(tokenAdecimal));
    const _token0amount3000 = new BigNumber(token0amount3000).div(new BigNumber(10).pow(tokenAdecimal));
    const _token0amount100 = new BigNumber(token0amount100).div(new BigNumber(10).pow(tokenAdecimal));

    const token1amount500 = await erc20B.balanceOf(pairaddr500);
    const token1amount3000 = await erc20B.balanceOf(pairaddr);
    const token1amount100 = await erc20B.balanceOf(pairaddr100);
    
    const _token1amount500 = new BigNumber(token1amount500).div(new BigNumber(10).pow(tokenBdecimal));
    const _token1amount3000 = new BigNumber(token1amount3000).div(new BigNumber(10).pow(tokenBdecimal));
    const _token1amount100 = new BigNumber(token1amount100).div(new BigNumber(10).pow(tokenBdecimal));

    return{
      tickera:tickerA,
      tickerb:tickerB,
      token0amount500:_token0amount500.c[0],
      token0amount3000:_token0amount3000.c[0],
      token0amount100:_token0amount100.c[0],
      token1amount500:_token1amount500.c[0],
      token1amount3000:_token1amount3000.c[0],
      token1amount100:_token1amount100.c[0],
    }
  }


  const  fetchReserve = async ()=>{    
    //Show loading
    setShowSpinner(true);
    
    //Check address
    let ret = isValidAddress(tokenA)?true:false;
    ret = isValidAddress(tokenB)?true:false;

    if(ret === false){
      setShowSpinner(false);
      alert("Invalid address");
      return;
    }
    else{
      const provider = new ethers.JsonRpcProvider("https://eth-mainnet.public.blastapi.io");

      //Get token details
      const d_token = await getTokenDetail(provider);

      //Get reserves
      const v2data = await getReserveV2(UNISWAP_V2_ROUTER,V2ROUTER.abi,V2FACTORY.abi,V2PAIR.abi,provider,d_token);
      const v3data = await getReserveV3(UNISWAP_V3_FACTORY,V3FACTORYABI,provider,d_token);
      const sushidata = await getReserveV3(SUSHI_V3_FACTORY,V3FACTORYABI,provider,d_token);

      //Set uniswap v2 data
      setTicker((obj)=>{return{...obj,...v2data}});
      // Set uniswap V3 data
      setv3ticker((obj)=>{return {...obj,...v3data}});
      //Set sushiswap v3 data
      setv3sushi((obj)=>{return{...obj,...sushidata}});

      //Remove spinner
      setShowSpinner(false);

    }

  }


  return (
    <main className="flex flex-col p-24">
      <div className={`${showSpinner?'opacity-40':''}`}>
        <div className='flex justify-around max-w-full'>
          <div className='flex-1 mr-2'>
            <input placeholder='Token A address' className='border-2 rounded border-pink-300 text-xs text-gray-300 py-1 px-3 min-w-full' value={tokenA} onChange={(event)=>{
              setTokenA(event.target.value);
            }}></input>

          </div>
          <div className='flex-1 ml-2'>
            <input placeholder='Token B address' className='border-2 rounded border-pink-300 text-xs text-gray-300 py-1 px-3 min-w-full' value={tokenB} onChange={(event)=>{
              setTokenB(event.target.value);
            }}></input>
          </div>
        </div>
        <div className='mt-2'>
          <button className="text-xs border-2 py-1 px-2 rounded border-pink-300 text-white bg-pink-500 hover:bg-pink-400" onClick={fetchReserve}>Get Reserve</button>
        </div>
        <div className='pt-4'>
          <div className='border-2 border-pink-300 rounded pl-2'>
            <p>UniswapV2 Reserve: <span className='text-pink-400'>{ticker.token0amount.toLocaleString("en-US")}</span> {ticker.tickera} / <span className='text-pink-400'>{ticker.token1amount.toLocaleString("en-US")}</span> {ticker.tickerb} </p>
          </div>
          <div className='border-2 border-pink-300 rounded pl-2 mt-2'>
            <p>UniswapV3 Reserve:</p>

              <p> (0.01%): <span className='text-pink-400'>{v3ticker.token0amount100.toLocaleString("en-US")}</span> {v3ticker.tickera} / <span className='text-pink-400'>{v3ticker.token1amount100.toLocaleString("en-US")}</span> {v3ticker.tickerb} </p>
              <p> (0.05%): <span className='text-pink-400'>{v3ticker.token0amount500.toLocaleString("en-US")}</span> {v3ticker.tickera} / <span className='text-pink-400'>{v3ticker.token1amount500.toLocaleString("en-US")}</span> {v3ticker.tickerb} </p>
              <p> (0.3%): <span className='text-pink-400'>{v3ticker.token0amount3000.toLocaleString("en-US")}</span> {v3ticker.tickera} / <span className='text-pink-400'>{v3ticker.token1amount3000.toLocaleString("en-US")}</span> {v3ticker.tickerb} </p>
            
          </div>
          <div className='border-2 border-pink-300 rounded pl-2 mt-2' >
            <p>SushiswapV3 Reserve: </p>
              <p> (0.01%): <span className='text-pink-400'>{v3sushi.token0amount100.toLocaleString("en-US")}</span> {v3sushi.tickera} / <span className='text-pink-400'>{v3sushi.token1amount100.toLocaleString("en-US")}</span> {v3sushi.tickerb} </p>
              <p> (0.05%): <span className='text-pink-400'>{v3sushi.token0amount500.toLocaleString("en-US")}</span> {v3sushi.tickera} / <span className='text-pink-400'>{v3sushi.token1amount500.toLocaleString("en-US")}</span> {v3sushi.tickerb} </p>
              <p> (0.3%): <span className='text-pink-400'>{v3sushi.token0amount3000.toLocaleString("en-US")}</span> {v3sushi.tickera} / <span className='text-pink-400'>{v3sushi.token1amount3000.toLocaleString("en-US")}</span> {v3sushi.tickerb} </p>
          </div>
        </div>
      </div>
      <div role="status" className={`absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2 ${showSpinner?'block':'hidden'}`}>
          <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-pink-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
          <span className="sr-only">Loading...</span>
      </div>
    </main>
  )
}
