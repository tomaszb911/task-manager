const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT 

// const multer = require('multer')
// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) {
//         if(!file.originalname.match(/\.(doc|docx)$/)) {
//           return cb(new Error('file must be a .doc or .docx'))
//         }
//         cb(undefined, true)
//     }
// })

// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// }, (error, req, res, next) => {
//     res.status(400).send( {error: error.message})
// })

//maitanance mode middleware
// app.use((req, res, next) => {
//     res.status(503).send('Maintanance mode')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, ()=>{
    console.log('Server is listening on port ' + port)
})
