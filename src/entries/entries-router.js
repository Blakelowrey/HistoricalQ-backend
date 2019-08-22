const express = require('express');
const EntriesService = require('./entries-service.js');

const entriesRouter = express.Router();
const checkAuth = require('../check-auth.js');


entriesRouter
  .route('/')
  .get((req, res)=>{
    const knexInstance = req.app.get('db');
    EntriesService.getAllEntries(knexInstance).then(entries=>{
      console.log(entries);
      let newEntries = entries.filter(entry => {
        return (entry.post_status === 'active');
      });
      return res.status(200).json(newEntries);
    }).catch(()=>res.status(404).json({message: 'failed get all'}));
  })
  .post(checkAuth, (req,res)=>{
    const {name, description, yob, eob, pob, yod, eod, pod} = req.body;
    if (!(name || description || yob || eob || pob || yod || eod || pod)){
      return res.status(501).json({message : 'missing info in submission'});
    }
  });



entriesRouter
  .route('/sort/')
  .get((req,res) => {
    const knexInstance = req.app.get('db');
    EntriesService.getAllEntries(knexInstance).then(entries=>{
      console.log(entries);
      const { sortBy, era} = req.query;
 
      let newEntries = entries;
      if (sortBy) {
        if (sortBy === 'alphabetical'){
          newEntries.sort((a,b) =>{
            let charCodeA = a.name.toLowerCase().charCodeAt(0);
            let charCodeB = b.name.toLowerCase().charCodeAt(0);
            return charCodeA - charCodeB;
          });
          console.log(newEntries);
        }
        if (sortBy === 'YOB'){
          newEntries.sort((a,b) =>{
            let aYear = a.yob;
            let bYear = b.yob;
            if(a.eob === 'BC'){
              aYear = aYear * -1;
            }
            if(b.eob === 'BC'){
              bYear = bYear * -1;
            }
            return aYear - bYear;
          });
          console.log(newEntries);
        }
      }
      if(era){
        console.log('era working');
        if(era === 'antiquity'){
          newEntries = newEntries.filter(entry => {
            if(entry.eob === 'BC'){
              return true;
            }
            else if (entry.eob === 'AD'){
              if(entry.yob < 400){
                return true;
              }
            }
            return false;
          });
        }
        if(era === 'medieval'){
          newEntries = newEntries.filter(entry => {
            if (entry.eob === 'AD'){
              if(entry.yob > 400 && entry.yob < 1500){
                return true;
              }
            }
            return false;
          });
        }
        if(era === 'modern'){
          newEntries = newEntries.filter(entry => {
            if (entry.eob === 'AD'){
              if(entry.yob >= 1500){
                return true;
              }
            }
            return false;
          });
        }

      }
      newEntries = entries.filter(entry => {
        return (entry.post_status === 'active');
      });
      return res.status(200).json(newEntries);

    }).catch(()=>res.status(404).json({message: 'error getting sort'}));
    
  });

entriesRouter
  .route('/random')
  .get((req, res)=>{
    console.log('random running');
    const knexInstance = req.app.get('db');
    EntriesService.getAllEntries(knexInstance).then(entries=>{
      let newEntries = entries.filter(entry => {
        return (entry.post_status === 'active');
      });
      console.log(newEntries);
      let {amount} = req.query;
      amount = parseInt(amount);
      if(!amount)(
        amount = 3
      );
      let randomEntries = [];
      let indexArray = [];
      let i = 0;
      while( i < amount){
        let randomIndex = Math.floor(Math.random() * newEntries.length);
        let isSame = false;
        indexArray.forEach(index => {
          if(index === randomIndex){
            isSame = true;
          }
        });
        if (!isSame){
          indexArray.push(randomIndex);
          i++;
        }
      }
      console.log(indexArray);
      indexArray.forEach(index => {
        randomEntries.push(newEntries[index]);
      });
      console.log(randomEntries);
      return res.status(200).json(randomEntries);
    
    }).catch(()=>res.status(404).json({message: ' error getting random'}));
  });

module.exports = entriesRouter;