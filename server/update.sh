
sudo echo "开始部署服务端..."
# kill -9 `ps -ef|grep node|grep app.js|awk '{print $2}'` # 关闭所有node服务
ps -ef|grep node 查看所有开启的node服务
#  grep app.js  过滤只包含 app.js 的指令
#  awk '{print $2}'  $fileName :   一行一行的读取指定的文件， 以空格作为分隔符，打印第二个字段
#  kill -9  强制关闭进程
# rm -rf node_modules
npm install
npm run publish
echo "后台服务端启动成功!":