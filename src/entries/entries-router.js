const express = require('express');
const EntriesService = require('./entries-service.js');

const entriesRouter = express.Router();
const parse = express.json();


entriesRouter
  .route('/')
  .get((req, res)=>{
    const knexInstance = req.app.get('db');
    EntriesService.getAllEntries(knexInstance).then(entries=>{
      console.log(entries);
      return res.status(200).json(entries);
    }).catch(()=>res.status(404).json({message: 'failed get all'}));
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
            return a.yob-b.yob;
          });
          console.log(newEntries);
        }
      }
      if(era){
        console.log('era working');
        if(era === 'antiquity'){
          newEntries = newEntries.filter(entry => {
            if(entry.yob === 'BC'){
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
      return res.status(200).json(newEntries);

    }).catch(()=>res.status(404).json({message: 'error getting sort'}));
    
  });

entriesRouter
  .route('/random')
  .get((req, res)=>{
    console.log('random running');
    const knexInstance = req.app.get('db');
    EntriesService.getAllEntries(knexInstance).then(entries=>{
      console.log(entries);
      let {amount} = req.query;
      amount = parseInt(amount);
      if(!amount)(
        amount = 3
      );
      let randomEntries = [];
      let indexArray = [];
      let i = 0;
      while( i < amount){
        let randomIndex = Math.floor(Math.random() * entries.length);
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
        randomEntries.push(entries[index]);
      });
      console.log(randomEntries);
      return res.status(200).json(randomEntries);
    
    }).catch(()=>res.status(404).json({message: ' error getting random'}));
  });

module.exports = entriesRouter;