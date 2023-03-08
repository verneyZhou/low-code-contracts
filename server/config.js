module.exports = Object.freeze({
    localhost: {//本地
      SERVER_PATH: 'http://127.0.0.1:8897/', // ssh地址 服务器地址
      SSH_USER: 'root', // ssh 用户名
      //方式一 用秘钥登录服务器(推荐), private 本机私钥文件地址(需要在服务器用户目录 一般是 /root/.ssh/authorized_keys 配置公钥 并该文件权限为 600, (.ssh文件夹一般默认隐藏)
      // PRIVATE_KEY: 'C:/Users/Html5/.ssh/id_rsa', 
    //   PASSWORD: '12345', //方式二 用密码连接服务器
    //   PATH: '/usr/local/nginx/html/vue' // 需要上传的服务器目录地址 如 /usr/local/nginx/html
    },
    weibo_chain: {//微博链
      SERVER_PATH: 'http://10.182.10.193:1234', 
      SSH_USER: 'root',
    //   PRIVATE_KEY: '222', 
    //   PATH: '/test/html' 
    }
  })