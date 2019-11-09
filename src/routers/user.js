const express = require('express')
const multer = require('multer')
// const sharp = require('sharp') //should work on node 10

const User = require('../models/user')

const auth = require('../middleware/auth')
const router = express.Router()


router.post('/users', async (req, res) => {
    const user = new User(req.body)
    
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})    
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req, res) =>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/logout', auth, async (req,res) => {
    try {
            req.user.tokens = req.user.tokens.filter((token) => {
                return token.token !== req.token
            })
            await req.user.save()
            res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    } catch (error) {
        res.status(500).send(error) 
    }
})

router.patch('/users/me', auth, async (req, res) =>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'invalid updates!'})
    }
    try {       
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        // const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) =>{
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Upload avatar should have extension: .jpg or .jpeg or .png'))
        }
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //should work on node 10
    // const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    // req.user.avatar = buffer
    
    req.user.avatar = req.file.buffer

    await req.user.save()    
    res.send()
}, (error, req, res, next) => {
    res.status(400).send( {error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) =>{
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const _id = req.params.id
        const user = await User.findById(_id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        // should work with working sharp
        // res.set('Content-Type', 'image/png')
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router