
let users=[]
const EditData = (data, id, call) => {
    const newData = data.map(item => 
        item.id === id ? {...item, call} : item
    )
    return newData;
}
const SocketServer = (socket) =>{
socket.on('joineduser',joinuser =>{
    users.push({id:joinuser._id, socketId: socket.id,followers:joinuser.followers})
    jsonObject = users.map(JSON.stringify);
    uniqueSet = new Set(jsonObject);
    users = Array.from(uniqueSet).map(JSON.parse);
    console.log(users,"as")
})


socket.on('disconnect', () => {
    
    users = users.filter(user => user.socketId !== socket.id)
    
})


socket.on('likepost',newPost=>{
 //   console.log(newPost)
 const ids = [...newPost.user.followers, newPost.user._id]
 const clients = users.filter(user => ids.includes(user.id))
    console.log(clients)
    if(clients.length > 0){
        clients.forEach(client => {
            socket.to(`${client.socketId}`).emit('likeToClient', newPost)
        })
    }
});

socket.on('unlikepost',newPost=>{
    //   console.log(newPost)
    const ids = [...newPost.user.followers, newPost.user._id]
    const clients = users.filter(user => ids.includes(user.id))
       console.log(clients)
       if(clients.length > 0){
           clients.forEach(client => {
               socket.to(`${client.socketId}`).emit('unlikeToClient', newPost)
           })
       }
   });


   socket.on('createcomment',newPost=>{
    //   console.log(newPost)
    const ids = [...newPost.user.followers, newPost.user._id]
    const clients = users.filter(user => ids.includes(user.id))
       console.log(clients)
       if(clients.length > 0){
           clients.forEach(client => {
               socket.to(`${client.socketId}`).emit('commentToClient', newPost)
           })
       }
   });

   socket.on('deletecomment',newPost=>{
    //   console.log(newPost)
    const ids = [...newPost.user.followers, newPost.user._id]
    const clients = users.filter(user => ids.includes(user.id))
       console.log(clients)
       if(clients.length > 0){
           clients.forEach(client => {
               socket.to(`${client.socketId}`).emit('deletecommentToClient', newPost)
           })
       }
   });

     // Follow
     socket.on('follow', newUser => {
        const user = users.find(user => user.id === newUser._id)
        user && socket.to(`${user.socketId}`).emit('followToClient', newUser)
    })

    socket.on('unfollow', newUser => {
        const user = users.find(user => user.id === newUser._id)
        user && socket.to(`${user.socketId}`).emit('unFollowToClient', newUser)
    })


    socket.on('createnotify', msg => {
        const client = users.find(user => msg.recipients.includes(user.id))
        client && socket.to(`${client.socketId}`).emit('createNotifyToClient', msg)    })



        socket.on('removenotify', msg => {
            const clients = users.find(user => msg.recipients.includes(user.id))
            console.log("sdksdh")
            clients && socket.to(`${clients.socketId}`).emit('removeNotifyToClient', msg) 
        
        
        
        })



          // Message
    socket.on('addMessage', msg => {
        const user = users.find(user => user.id === msg.recipient)
        user && socket.to(`${user.socketId}`).emit('addMessageToClient', msg)
    })
        
    //call
    socket.on('callUser',data=>{
        
        users = EditData(users, data.sender, data.recipient)
        const client = users.find(user => user.id === data.recipient)

        if(client){
            if(client.call){
                users=  EditData(users, data.sender, null)
                socket.emit('userBusy', data)
            }else{
                users = EditData(users, data.recipient, data.sender)
                socket.to(`${client.socketId}`).emit('callUserToClient', data)
            }
        }
    })
        

     //endcall
     socket.on('endCall',data=>{
        const client = users.find(user => user.id === data.sender)

        if(client){
            socket.to(`${client.socketId}`).emit('endCallToClient', data)
            users = EditData(users, client.id, null)

            if(client.call){
                const clientCall = users.find(user => user.id === client.call)
                clientCall && socket.to(`${clientCall.socketId}`).emit('endCallToClient', data)

                users = EditData(users, client.call  , null)
            }
        }
       
        
    })
}

module.exports=SocketServer