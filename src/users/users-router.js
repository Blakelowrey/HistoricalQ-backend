const express = require('express');
const UsersService = require('./users-service.js');
const bcrypt = require('bcrypt');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
const checkAuth = require('../check-auth.js');

usersRouter
  .route('/favorites/arr')
  .get(checkAuth,(req,res)=>{
    const knexInstance = req.app.get('db'); 
    UsersService.getFavoritesArr(knexInstance, req.userData.userId).then(entry_refs => {
      if (entry_refs.length > 0){
        return res.status(200).json(entry_refs);
      }
      return res.status(201).json({message : 'no favorites'});
    }).catch(()=>res.status(404).json({message : 'error favorites'}));
  });
usersRouter
  .route('/favorites')
  .post(checkAuth,(req, res)=>{
    const {entryId} = req.body;
    const knexInstance = req.app.get('db');
    if(!entryId){
      return res.status(401).json({
        message : 'invalid fav'
      });
    }
    const favorite = {
      user_ref: req.userData.userId,
      entry_ref: entryId
    };
    console.log(favorite);
    UsersService.addFavorite(knexInstance, favorite)
      .then(()=>{
        return res.status(200).json({
          message: 'added favorite'
        });
      }).catch(()=>res.status(400).json({message: 'error'}));


  })
  .get(checkAuth, (req, res)=>{
    const knexInstance = req.app.get('db');
    UsersService.getFavorites(knexInstance, req.userData.userId)
      .then(entries => res.status(200).json(entries))
      .catch(()=>res.status(404).json({message : 'error getting fav'}));
  })
  .delete(checkAuth, (req , res)=>{
    const {entry_ref} = req.body;
    const knexInstance = req.app.get('db');
    UsersService.deleteFavorite(knexInstance, req.userData.userId, entry_ref).then(()=>req.status(200).json({message: 'deleted favorite'}))
      .catch(err=>{
        console.log(err);
        return res.json({message : 'failed favorite delete'});
      });
  });
usersRouter
  .route('/login')
  .post((req,res)=>{
    const {email , password} = req.body;
    const knexInstance = req.app.get('db');
    if(email && password){
      UsersService.getUserByEmail(knexInstance, email).then(users => {
        
        bcrypt.compare(password , users[0].password, (err, result) =>{
          if(err){
            return res.status(401).json({
              message: 'auth failed'
            });
          }
          if (result === true){
            const token = jwt.sign({
              email : users[0].email,
              userId : users[0].id
            }, 'secretpassword', 
            {
              expiresIn: '1h'
            });
            return res.status(200).json({
              message: 'auth success',
              token
            });
          }
          return res.status(401).json({
            message: 'auth failed'
          });
        });
      }).catch(()=>  
        res.status(401).json({
          message: 'auth failed'
        }));
      
    }
    




  })
  .get(checkAuth, (req,res)=>{
    const knexInstance = req.app.get('db');
    console.log(req.userData);
    UsersService.getUserById(knexInstance, req.userData.userId).then(users => {
      const {email, username, date_created, about } = users[0];
      return res.status(200).json({
        email,
        username,
        date_created,
        about
      });
    }).catch(()=>res.status(400).json({message: 'error getting login'}));
  })
  .delete(checkAuth , (req,res)=>{
    const knexInstance = req.app.get('db');
    UsersService.deleteUser(knexInstance, req.userData.userId).then(()=>{
      return res.status(200).json({
        message: 'user delete success'
      });
    }).catch(()=>res.status(400).json({message : 'error user delete'}));
  });




usersRouter
  .route('/create')
  .post((req, res)=>{
    const {username, password, email, about = ''} = req.body;
    bcrypt.hash(password , 10 , (err, hash) => {
      
      if(err){
        console.error(err);
        return res.status(500).json({message : 'internal error'});
      }
      else{
        if(username && password && email) {
          const user = {
            username, 
            password: hash,
            email,
            about
          };
          console.log(user);
          const knexInstance = req.app.get('db');
          UsersService.addUser(knexInstance , user).then(users=>{
            
            console.log(user[0]);
            
            const token = jwt.sign({
              email : users[0].email,
              userId : users[0].id
            }, 'secretpassword', 
            {
              expiresIn: '1h'
            });
            return res.status(200).json({
              message: 'user created',
              token
            });
           
          }).catch(()=>res.status(401).json({message : 'error registering'}));
        }
        else{
          return res.status(404).json({message : 'missing username, password, or email'});
        }
      }
    });
    
  });





module.exports = usersRouter;