const express = require('express')
const deploy = require('./deploy');
const deploy2 = require('./deploy2');

// 注册路由
const router = express.Router()


router.get('/', function(req, res) {
    res.send('contract deploy node.')
})


// 部署接口
router.post('/contract/deploy', deploy)

// 部署接口v2
router.post('/contract/deploy/v2', deploy2)

module.exports = router;