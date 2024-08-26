const Users = require('./user_model');

const NewUserSignUp = (req, res) => {
    Users.User.create(req.body)
    .then((newUser) => {
        res.json({newUser: newUser, status:"Successfully registered user."})
    })
    .catch((err) => {
        res.json({ message: 'Something went wrong. Please try again.', error:err})
    });
} 

const findAllUsers = (req, res) => {
    Users.User.find()
    .then((allDataUsers) => {
      res.json({ theUser: allDataUsers })
  })
  .catch((err) => {
      res.json({ message: 'Something went wrong', error: err })
  });
}

//getuser
const findUserById = (req, res) => {
  Users.User.findOne({_id:req.params.id})
      .then((theUser) => {
          res.json({theUser})
      })
      .catch((err) => {
          res.json({ message: 'Something went wrong', error: err })
      });
}

const findUserByEmail = (req, res) => {
  Users.User.findOne({email:req.params.email})
      .then((theUser) => {
          res.json({theEmail : theUser})
      })
      .catch((err) => {
          res.json({ message: 'Something went wrong', error: err })
      });
}

// Array New Post
const addNewPostById = (req, res) => {
    Users.User.findById({_id:req.params.id})
      .then((user) => {
        if (!user) {
          res.json({ message: 'User not found' });
        }
        user.post.unshift(req.body.post);
        return user.save();
      })
      .then((updatedUser) => {
        res.json({ updatedUser, message: 'New post added successfully' });
      })
      .catch((error) => {
        res.json({ message: 'Error adding post', error });
      });
  };
  

//find posts by id Array 
const getAllPostbyId = (req, res) => {
    Users.User.findOne({ _id: req.params.id })
      .then((user) => {
        if (!user) {
          res.json({ message: 'User not found' });
        }
          res.json({ posts: user.post }); 
      })
      .catch((err) => {
        res.json({ message: 'Error retrieving posts', error: err });
      });
};

//Deleting by Id Array Post
const findPostByIdDelete = (req, res) => {
  Users.User.findById(req.params.uid)
    .then((user) => {
      if (!user) {
        return res.json({ message: 'User not found' });
      }
        user.post.splice(req.params.index, 1); 
        return user.save()
          .then((updatedUser) => {
            res.json({ updatedUser, message: 'Post deleted successfully' });
          })
          .catch((error) => {
            res.json({ message: 'Error deleting post', error });
          });

    })
    .catch((error) => {
      res.json({ message: 'Error finding user', error });
    });
};


const updatePostAtIndex = (req, res) => {
  Users.User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.json({ message: 'User not found' });
      }
            user.post[req.params.index] = req.body.post; 
            return user.save()
          .then((updatedUser) => {
            res.json({ updatedUser, message: 'Post updated successfully' });
          })
          .catch((error) => {
            res.json({ message: 'Error updating post', error });
          });
    })
    .catch((error) => {
      res.json({ message: 'Error finding user', error });
    });
};



module.exports = {
    NewUserSignUp,
    findAllUsers,
    findUserByEmail,
    addNewPostById,
    getAllPostbyId,
    findPostByIdDelete,
    findUserById,
    updatePostAtIndex
}