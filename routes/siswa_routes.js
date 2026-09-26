const express = require('express')
const router = express.Router() // const.router, membuat wadah yang bernama router. expres.Router, router diambil dari express

router.get('/', (req, res) => { //membuat route yang dipinjem dari express menjadi url yang bermetode get yang url /
    res.send('Tes Berhasil, MANTAP') //
})

module.exports = router; // project ini bisa di pinjemin ke server.js