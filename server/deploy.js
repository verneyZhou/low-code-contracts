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
const HDWalletProvider = require('truffle-hdwallet-provider');

// 部署信息
const DEPLOY_INFO = {
    code: '',
    opts: '',
    // address: '0x1a5816bB1Fa231F073B9089E09a958E104EdD468',
    mnemonic: 'garden hungry punch cupboard just iron veteran wall decide note dinner accuse',
    url: 'http://127.0.0.1:8897/' // 部署网络 默认微博链
}

const SSH = new node_ssh();


//logs
const defaultLog = log => console.log(chalk.blue(`---------------- ${log} ----------------`));
const errorLog = log => console.log(chalk.red(`---------------- ${log} ----------------`));
const successLog = log => console.log(chalk.green(`---------------- ${log} ----------------`));

// 正确设置本地文件路径
const contractPath = path.resolve(__dirname, './contracts');
// 正确设置编译文件路径
const compilePath = path.resolve(__dirname, './compiles');



// 打包
async function build() {
    return new Promise((resolve, reject) => {
        const loading = ora(defaultLog('项目开始打包...')).start();
        loading.spinner = spinner_style.arrow4;
        if (!fs.existsSync(contractPath)) { // existsSync同步判断
            fs.mkdirSync(contractPath) // 迭代创建
        }
        // 写入合约代码，生成 .sol 文件
        const outputPath = path.join(contractPath,'contract.sol');
        fs.writeFileSync(outputPath,DEPLOY_INFO.code,'utf-8');
        console.log(contractPath, outputPath)
        loading.stop();
        successLog('打包完成！！！')
        resolve(true);
    })
}

// 编译
async function compile() {
    return new Promise((resolve, reject) => {
        const loading = ora(defaultLog('项目开始编译...')).start();
        loading.spinner = spinner_style.arrow4;

        // 生成sources对象
        const sources = {};
        const files = fs.readdirSync(contractPath);
        (files || []).forEach(file => {
            const fullPath = path.join(contractPath, file);
            sources[file] = {
                content: fs.readFileSync(fullPath, 'utf-8')
            }
        })
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
        console.log('===contracts', contracts)
        // 生成编译文件
        let contractNames = [];
        for(let contract in contracts) {
            for(let name in contracts[contract]) {
                fsExtra.outputJsonSync(
                    path.resolve(compilePath, `${name}.json`),
                    contracts[contract][name],
                    {spaces: 2}
                )
                // 用户部署合约
                if (contract === 'contract.sol') contractNames.push(name);
            }
        }

        loading.stop();
        successLog('编译完成！！！')
        resolve(contractNames);
    })
}

// 部署
async function deploy (contractNames) {
    return new Promise(async (resolve, reject) => {
        let loading = ora(defaultLog('项目开始部署...')).start();
        loading.spinner = spinner_style.arrow4;

        try {
            ////// 连接
            // 本地连接
            // var web3 = await new Web3(new Web3.providers.HttpProvider(DEPLOY_INFO.url))
            // 测试网络连接
            const provider = await new HDWalletProvider(DEPLOY_INFO.mnemonic, DEPLOY_INFO.url);
            console.log('====provider', provider, provider.address);
            var web3 = await new Web3(provider);
            console.log('====web3');

            // 获取账号地址
            // let results = [];
            // const accountArr = await web3.eth.getAccounts();
            // console.log('===getAccounts' ,accountArr);
            // await web3.eth.getAccounts(function (error, result) {
            //     console.log(error, result);
            //     loading.stop();
            //     if (error) {
            //         errorLog(error);
            //         reject(err);
            //         return;
            //     }
            //     results = result || [];
            // });
            // console.log('====results', results);

            // let chainID = 9215;
            let chainID = await web3.eth.getChainId();
            console.log('===chainID', chainID, web3.utils.toHex(chainID));

            // 部署, 目前只支持一个合约
            const contract = require(path.resolve(compilePath, `${contractNames[0]}.json`));
            console.log('===contract', contract.abi);
            const deployedContract = await new web3.eth.Contract(contract.abi)
            console.log('====deployedContract', deployedContract);
            // let gasEstimate = await web3.eth.estimateGas({data:`0x${contract.evm.bytecode.object}`});//获得这个合约部署大概所需的gas
            // console.log('===gasEstimate', gasEstimate);
            deployedContract.deploy({
                data: `0x${contract.evm.bytecode.object}`,
                // arguments: [1,2] // 初始化传参
            }).send({
                // from: accountArr[0], 
                from: provider.address, 
                gas: '4700000',
                // gas: gasEstimate,
                chainId: web3.utils.toHex(chainID) // 不传会报错：Error: only replay-protected (EIP-155) transactions allowed over RPC
            }, function (err, contract){
                console.log('======1234567 e, contract',err, contract);
                if (err) {
                    errorLog(`部署失败：${err}`);
                    reject(err);
                    return;
                }
                if (typeof contract.address !== 'undefined') {
                    console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
                }

                // 部署中
                loading = ora(defaultLog('正在排队部署中，请稍等...')).start();
                loading.spinner = spinner_style.arrow4;
            })
            .on('receipt', function(receipt){
                loading.stop();
                successLog("部署成功：receipt.contractAddress :" + receipt.contractAddress); // 包含新合约地址
                console.log('=====receipt===',receipt)
                resolve(receipt);
            })
            .then(function(newContractInstance){
                loading.stop();
                console.log("newContractInstance.options.address: " + newContractInstance.options.address) // 带有新合约地址的合约实例
            });
        } catch(err) {
            errorLog(`部署失败：${err}`);
            reject(err);
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

        console.log(chalk.yellow(`--------->  欢迎使用智能合约低代码自动部署工具  <---------`));

        const io = req.app.get('socketio');
        console.log('===io', io);

        io.emit('onContractDeploy', {code: 1, msg: '====正在开始打包....====='})
        // 打包
        await build();

        await setTimeoutFn(2000);

        io.emit('onContractDeploy', {code: 1, msg: '====正在进行编译....====='})
        // 编译
        const contractNames = await compile();

        await setTimeoutFn(2000);

        console.log('====contractNames', contractNames);

        io.emit('onContractDeploy', {code: 1, msg: '====正在排队部署中，请稍等....====='})
        // 部署
        const deployRes = await deploy(contractNames);

        successLog('大吉大利, 部署成功!!!!'); 
        res.send({
            code: 200,
            msg: 'deploy success!!!',
            data: deployRes
        })
        next();
    } catch(err) {
        console.log('======err', err);
        errorLog(`====error: ${err}`);
        res.send({
            code: 203,
            msg: `${err}`
        })
        next();
        // process.exit();
    }
    

  }