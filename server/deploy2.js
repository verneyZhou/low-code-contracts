
// import process from 'node:process';
const chalk = require('chalk') //命令行颜色
const ora = require('ora') // 加载流程动画
const spinner_style = require('./spinner_style') //加载动画样式
const shell = require('shelljs') // 执行shell命令
const node_ssh = require('node-ssh') // ssh连接服务器
const inquirer = require('inquirer') //命令行交互
const fs = require('fs') // nodejs内置文件模块
const fsExtra = require('fs-extra')
const path = require('path') // nodejs内置路径模块
const solc = require('solc'); // https://github.com/ethereum/solc-js

const Web3 = require('web3'); // 连接区块链网络

const HDWalletProvider = require("@truffle/hdwallet-provider");

// 部署信息
const DEPLOY_INFO = {
    code: '',
    opts: '',
    // address: '0x1a5816bB1Fa231F073B9089E09a958E104EdD468',
    mnemonic: 'garden hungry punch cupboard just iron veteran wall decide note dinner accuse',
    url: 'http://127.0.0.1:8897/', // 部署网络 默认微博链
    socketName: ''
}

const SSH = new node_ssh();


//logs
const defaultLog = log => console.log(chalk.blue(`---------------- ${log} ----------------`));
const errorLog = log => console.log(chalk.red(`---------------- ${log} ----------------`));
const successLog = log => console.log(chalk.green(`---------------- ${log} ----------------`));



let contractsInfo = null;
const MY_CONTRACT_NAME = 'this_is_deploy_contract.sol';
let LOADING = null;



// 编译
async function compile() {
    return new Promise((resolve, reject) => {
        LOADING = ora(defaultLog('项目开始编译...')).start();
        LOADING.spinner = spinner_style.arrow4;

        // 生成sources对象
        const sources = {
            [MY_CONTRACT_NAME]: {
                content: DEPLOY_INFO.code
            }
        };
        console.log(sources);

        // 生成input对象
        const input = {
            language: 'Solidity',
            sources,
            settings: {
                outputSelection: {
                    '*': {
                        // '*': ['*']
                        '*': ['abi', 'evm.bytecode']
                    }
                }
            }
        }

        // 导入import合约（解决导入第三方合约报错问题）
        // https://stackoverflow.com/questions/67321111/file-import-callback-not-supported
        function findImports(relativePath) {
            //my imported sources are stored under the node_modules folder!
            const absolutePath = path.resolve(__dirname, './node_modules', relativePath);
            const source = fs.readFileSync(absolutePath, 'utf8');
            return { contents: source };
        }
        // 用solc编译合约，生成abi等信息
        let solcTemp = solc.compile(JSON.stringify(input), { import: findImports });
        console.log('=====solc', solcTemp.errors, typeof solcTemp);

        // 编译报错
        /**
         * errors:['...']
         */
        if (solcTemp.errors) {
            errorLog(`编译失败：${solcTemp.errors[0] || solcTemp.errors}`);
            reject(solcTemp.errors[0] || solcTemp.errors);
            return;
        }

        const contracts = (typeof solcTemp === 'string' ? JSON.parse(solcTemp) : solcTemp).contracts;
        if (!contracts) {
            errorLog(`编译失败：生成编译信息失败`);
            reject('生成编译信息失败');
            return;
        }
        contractsInfo = contracts;
        console.log('===contracts', contracts)

        LOADING.stop();
        successLog('编译完成！！！')
        resolve(true);
    })
}

// 部署
async function deploy () {
    return new Promise(async (resolve, reject) => {
        LOADING = ora(defaultLog('项目开始部署...')).start();
        LOADING.spinner = spinner_style.arrow4;

        let contractArr = [];
        for(let contract in contractsInfo) {
            for(let name in contractsInfo[contract]) {
                // 用户部署合约
                if (contract === MY_CONTRACT_NAME) contractArr.push(contractsInfo[contract][name]);
            }
        }
        // console.log('===contractArr', contractArr);
        // 部署, 目前只支持一个合约
        const curContract = contractArr[0] || null;
        if (!curContract) {
            errorLog(`部署失败：${'无法获取到合约信息'}`);
            reject('无法获取到合约信息');
            return;
        }

        try {
            ////// 连接
            // 本地连接
            // var web3 = await new Web3(new Web3.providers.HttpProvider(DEPLOY_INFO.url))
            // 测试网络连接 传助记词或私钥都可~
            let provider = null;
            // 私钥
            if (DEPLOY_INFO.mnemonic.indexOf(' ') === -1) {
                provider = await new HDWalletProvider(DEPLOY_INFO.mnemonic, DEPLOY_INFO.url);
            } else { // 助记词
                provider = await new HDWalletProvider({
                    mnemonic: DEPLOY_INFO.mnemonic,
                    providerOrUrl: DEPLOY_INFO.url,
                });
            }
            var web3 = await new Web3(provider);
            web3.setProvider(provider);
            // console.log('====web3', provider);

            // user adress
            const accountArr = await web3.eth.getAccounts();
            console.log('===getAccounts' ,accountArr);
            if (!accountArr.length) {
                errorLog(`部署失败：${'无法获取到用户信息'}`);
                reject('无法获取到用户信息');
                return;
            }

            // chainId
            let chainID = await web3.eth.getChainId();
            console.log('===chainID', chainID, web3.utils.toHex(chainID));

            // balance
            let balance = await web3.eth.getBalance(accountArr[0]);
            console.log('====balance', balance, web3.utils.fromWei(balance)); // wei ether

            // gasPrice
            let gasPrice = await web3.eth.getGasPrice();
            console.log('====gasPrice', gasPrice, web3.utils.fromWei(gasPrice)); // wei eth

            // block
            let blockNumber = await web3.eth.getBlockNumber();
            console.log('=====blockNumber', blockNumber);
            let block = await web3.eth.getBlock(blockNumber);
            console.log('======block', block);


            const deployedContract = await new web3.eth.Contract(curContract.abi)
            // console.log('====deployedContract', deployedContract);
            let gasEstimate = await web3.eth.estimateGas({data:`0x${curContract.evm.bytecode.object}`});//获得这个合约部署大概所需的gas
            console.log('===gasEstimate', gasEstimate, web3.utils.fromWei(gasEstimate.toString())); // wei ether
            console.log('=====gas * price', gasEstimate * gasPrice, web3.utils.fromWei((gasEstimate * gasPrice).toString())); // wei eth
            let _gasEstimate = gasEstimate + 1000000
            if (balance < _gasEstimate) {
                errorLog(`部署失败：${'当前账户余额不足'}`);
                reject('当前账户余额不足');
                return;
            }

            let deployParams = {
                data: `0x${curContract.evm.bytecode.object}`
            }
            if (DEPLOY_INFO.opts) deployParams.arguments = DEPLOY_INFO.opts.split(','); // 入参
        //    console.log('====deployParams', deployParams);
            deployedContract.deploy(deployParams).send({
                from: accountArr[0], 
                // gas: 4700000, // 该交易 gas 用量上限  wei
                gas: _gasEstimate,
                // gasPrice: 100000000,
                gasPrice: gasPrice, // 单价，一个单位的Gas价格，以 wei 为单位，默认 1Gwei = 100000000 wei = 0.0
                // value: 0, // 交易转账金额 wei
                chainId: web3.utils.toHex(chainID) // 不传会报错：Error: only replay-protected (EIP-155) transactions allowed over RPC
            }, function (err, contract){
                console.log('======1234567 e, contract hash',err, contract);
                if (err) {
                    errorLog(`部署失败：${err}`);
                    reject(err);
                    return;
                }
                if (typeof contract.address !== 'undefined') {
                    console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
                }

                // // 部署中
                defaultLog('正在排队部署中，请稍等...');
            })
            .on('receipt', function(receipt){
                LOADING.stop();
                successLog("部署成功：receipt.contractAddress :" + receipt.contractAddress); // 包含新合约地址
                console.log('=====receipt===',receipt)
                resolve(receipt);
                // At termination, `provider.engine.stop()' should be called to finish the process elegantly.
                // provider && provider.engine.stop();
            })
            .then(function(newContractInstance){
                LOADING.stop();
                console.log("newContractInstance.options.address: " + newContractInstance.options.address) // 带有新合约地址的合约实例
            })
        } catch(err) {
            LOADING.stop();
            errorLog(`部署失败：${err}`);
            reject(err);
            // At termination, `provider.engine.stop()' should be called to finish the process elegantly.
            // provider && provider.engine.stop();
        }
    })
}


// 开始前的配置检查
/**
 * 
 * @param {Object} conf 配置对象
 */
async function checkConfig (data = {}) {
    return new Promise((resolve, reject) => {
        let _data = JSON.parse(data);
        console.log(_data);
        if (!_data.code) {
            reject('代码不能为空')
            return;
        }
        if (!_data.url) {
            reject('部署网络不能为空')
            return;
        }
        if (!_data.mnemonic) {
            reject('用户助记词不能为空')
            return;
        }
        Object.assign(DEPLOY_INFO, _data)
        console.log('====DEPLOY_INFO', DEPLOY_INFO);
        resolve(true);
    })
}

// 延时器方法
const setTimeoutFn = (time = 1000) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, time)
    })
};


// 部署流程方法
module.exports = async function(req, res, next) {
    console.log(req.body);
    console.log('===process.env.', process.argv, process.cwd());
    console.log('=====deploy');

    try {
        // 检查
        await checkConfig(req.body);

        console.log(chalk.yellow(`--------->  欢迎使用智能合约低代码自动部署工具 v2  <---------`));

        const io = req.app.get('socketio');
        // console.log('===io', io);

        io.emit(DEPLOY_INFO.socketName, {code: 1, msg: '====正在部署初始化......===='})
        await setTimeoutFn(2000);

        io.emit(DEPLOY_INFO.socketName, {code: 1, msg: '====正在进行编译....====='})
        // 编译
        await compile();

        await setTimeoutFn(2000);


        io.emit(DEPLOY_INFO.socketName, {code: 1, msg: '====正在排队部署中，请稍等....====='})
        // 部署
        const deployRes = await deploy();

        successLog('大吉大利, 部署成功!!!!'); 
        res.send({
            code: 200,
            msg: 'deploy success!!!',
            data: deployRes
        })
        LOADING = null;
        next();
    } catch(err) {
        LOADING = null;
        console.log('======err', err);
        if (err.code) {

        }
        errorLog(`====error: ${err.message || err}`);
        res.send({
            code: err.code || 203,
            msg: `${err.message || err}`
        })
        next();
        // process.exit(); // 结束node进程

        // process.on('unhandledRejection', (reason, promise) => {
        //     console.log('Unhandled Rejection at:', promise, 'reason:', reason);
        //     // Application specific logging, throwing an error, or other logic here
        // });
    }

   
    

  }