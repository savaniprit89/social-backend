const express = require("express");
const dotenv = require("dotenv");
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const auth=require('./routes/authRouter.js')
const user=require('./routes/userRouter.js')
const post=require('./routes/postRouter.js')
const comment=require('./routes/commentRouter.js')
const notify=require('./routes/notifyRouter.js')
const message=require('./routes/messageRouter.js')
// const {PeerServer} =require('peer')
const SocketServer=require('./socketServer.js')
const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())
dotenv.config();

//const URI = 'mongodb+srv://PRIT:prit@cluster0.musona2.mongodb.net/?retryWrites=true&w=majority'

mongoose
  .connect(process.env.MURI)
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
  });

//socket
const http=require('http').createServer(app)
const io=require('socket.io')(http,{
  cors: {
    origin: '*',
  }})
const users=[]
io.on( "connection", function( socket ) {
 SocketServer(socket)
  });


//   //create peer server
// PeerServer({port:3001,path: '/'})



app.get("/",(req,res)=>{
    res.json({msg:"hello"})
})
app.use("/api",auth);
app.use('/api',user);
app.use("/api",post);
app.use("/api",comment);
app.use("/api",notify);
app.use("/api",message);


const port = process.env.PORT || 5000
http.listen(port, () => {
    console.log('Server is running on port', port)
})