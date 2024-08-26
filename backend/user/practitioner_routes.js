const PractitionerController = require ('../user/user_controller');


module.exports = app => { 
    app.get('/api/test',(req,res)=>{res.json({message:"the api is working"})});
    app.post('/api/medapp/signup', PractitionerController.NewUserSignUp);
    //For Login (getting all users)
    app.get('/api/medapp/allusers', PractitionerController.findAllUsers);
    app.get('/api/medapp/user/:email', PractitionerController.findUserByEmail);


    //For Post
    app.post('/api/medapp/addpost/:id', PractitionerController.addNewPostById);
    app.get('/api/medapp/finduser/:id', PractitionerController.findUserById);
    app.get('/api/medapp/post/getallpost/:id', PractitionerController.getAllPostbyId);
    app.delete('/api/medapp/post/deletepost/:uid/:index', PractitionerController.findPostByIdDelete);
    app.put('/api/medapp/post/updatepost/:id/:index', PractitionerController.updatePostAtIndex);
}
