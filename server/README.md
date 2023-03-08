


# 智能合约自动部署node服务端


npm install
npm run dev




## 总结

1. 编写智能合约：solidity
2. 编译：`solc` => bytycode + abi
3. 部署：`web3`，返回合约地址address
4. 生成合约实例：(abi + address) + web3
5. 前端调用合约方法



## TODO

- 兼容部署过程中的报错
- 考虑当用户同一时刻部署良过多时怎么解决，并发量？性能问题？
- 优化部署前端页面
- socket.io使用优化 断开链接？
- 合约部署后增加调用逻辑
- 兼容合约传参的逻辑
- 部署后：合约abi => 方法展示，调用
- 将客户端 .svelte 部分单独抽出来
- rollup打包，路径？
- 安全问题
- 通过私钥如何拿到助记词？
- 部署Mainnet和微博测试链报错？
- 部署连接钱包？
- socket并发问题




## 报错


- 本地`node index.js`时报错：`Error: listen EADDRINUSE: address already in use :::8023`
``` shell
sudo lsof -i:端口号 # 查看被占用进程的pid
sudo kill -9 pid  # 杀死进程
```

- 测试环境部署报错：`Error: Invalid JSON RPC response: ""`
> 应该是在阿里云服务器里，连接需要内网才能访问的微博测试链，访问不了导致的，换成Goerli测试链可以~





- 测试环境`node index.js`时提示：`(node:16144) ExperimentalWarning: The dns.promises API is experimental`


- 部署报错：`insufficient funds for gas * price + value`
> 账户余额不足，或者是部署时 默认的gasPrice过低，获取gasPrice设置即可~ [以太坊中gas、gasPrice、gasLimit是什么？](https://blog.csdn.net/webhaifeng/article/details/112890801)



## 参考

- [Web3部署智能合约](https://blog.csdn.net/zhongliwen1981/article/details/89926975)
- [区块链研究实验室 | 使用JavaScript编译和部署以太坊智能合约](https://zhuanlan.zhihu.com/p/69166912)
- [deploy/upload](https://github.com/bgwd666/deploy/blob/master/upload/upload.js)、[vue + node 前端自动化部署到远程服务器](https://www.jianshu.com/p/216134013ea6)
- [node-ssh编写前端自动部署脚本](https://zhuanlan.zhihu.com/p/339507164)
- [Node如何实现前端一键自动化部署](https://www.jianshu.com/p/221a1e847e57)
- [前端项目nodejs自动部署脚本](https://cloud.tencent.com/developer/article/1882523)


- [JS fetch()用法详解](https://blog.csdn.net/weixin_52148548/article/details/124703828)
- [Ethereum JavaScript API（contract,部署与调用智能合约）](https://blog.csdn.net/wonderBlock/article/details/106842029)
- [基于NodeJS从零构建线上自动化打包工作流](https://mp.weixin.qq.com/s/6619NcJjuPQsZhmikDZ-Og)
- [@truffle/hdwallet-provider](https://www.npmjs.com/package/@truffle/hdwallet-provider)
> nodejs是后端语言，使用nodejs编写的HDWalletProvider无法在前端使用


## 收藏


- [在快速路由文件中使用socket.io](https://qa.1r1g.com/sf/ask/1319933331/)
- [W3Cschool socket.io 概述](https://www.w3cschool.cn/socket/socket-1olq2egc.html)

- [Node进程管理工具—pm2](https://blog.csdn.net/qq_38128179/article/details/120401139)

- [abi-to-sol](https://gnidan.github.io/abi-to-sol/)

- [web3.js 中文文档](https://learnblockchain.cn/docs/web3.js/index.html)


- [Infura](https://www.infura.io/zh)、[Infura开发手册](http://cw.hubwiz.com/card/c/infura-api/)
> Infura 是一种 IaaS（Infrastructure as a Service）产品，目的是为了降低访问以太坊数据的门槛。通俗一点讲，Infura 就是一个可以让你的 DApp 快速接入以太坊的平台，不需要本地运行以太坊节点。
>Infura为开发者提供基础的底层设施，借助于Infura，开发者在以太坊上开发任何应用程序，无需运行后端基础设施。除了提供链上的API服务，Infura还可通过IPFS API为开发者提供分布式存储，满足开发者的交易管理、GAS处理，NFT API等需求。


**Ethereum 网络**

- [https://cn.etherscan.com/](https://cn.etherscan.com/)、[https://etherscan.io/](https://etherscan.io/)
- [Sepolia](https://sepolia.dev/)、[https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)
- [https://goerlifaucet.com/](https://goerlifaucet.com/)、[https://goerli.etherscan.io/](https://goerli.etherscan.io/)



### 前端

- [sveltejs](https://www.sveltejs.cn/)
- [rollupjs](https://www.rollupjs.com/)
- [Tailwind CSS](https://www.tailwindcss.cn/)


## 我的账号


- Mainnet
    - https://mainnet.infura.io/v3/8a2751c410bb400bb48a7e617c84ff62
    - 
    - https://cn.etherscan.com/address/0x5Eab66c132E5A522259d3569C9D8D000aFc7c44A

- Goerli
    - https://goerli.infura.io/v3/8a2751c410bb400bb48a7e617c84ff62
    - 0ad7c7a56bbfb49d4f881a6706651ac0987f96b511683f2cfb7e171028349c39(0x5Eab66c132E5A522259d3569C9D8D000aFc7c44A)
    - https://goerli.etherscan.io/address/0x5Eab66c132E5A522259d3569C9D8D000aFc7c44A

- Sepolia 
    - https://sepolia.infura.io/v3/8a2751c410bb400bb48a7e617c84ff62
    - 36f46abac27b4e164d427943ded2c3b69d26ba64c20c1cc69c8fd19cb30a2a53(0xFdC6914FE61e0033e5DCEdE898c803e6953d7983)
    - https://sepolia.etherscan.io/address/0xfdc6914fe61e0033e5dcede898c803e6953d7983

- 微博测试链
    - http://10.182.10.193:1234  链ID:9215
    - garden hungry punch cupboard just iron veteran wall decide note dinner accuse(0x1a5816bB1Fa231F073B9089E09a958E104EdD468)
    -  http://10.182.10.193:4000/address/0x1a5816bB1Fa231F073B9089E09a958E104EdD468

- Rinkeby 
    - 
    - 36f46abac27b4e164d427943ded2c3b69d26ba64c20c1cc69c8fd19cb30a2a53(0x900B0286dd9b69bCc106C88102e4B11D18Ed19e9)
    - https://rinkeby.etherscan.io/address/0x900B0286dd9b69bCc106C88102e4B11D18Ed19e9

> 自 2022 年起, 以太坊基金会日前宣布即将弃用Ropsten、Rinkeby和Kiln等测试网，以便将精力长期集中在维护Goerli和Sepolia测试网上。

