const UsersService = {
  getUserByEmail(db, email){
    return db('users').select('*').where('email', email);
  },
  getUserById(db, id){
    return db('users').select('*').where('id', id);
  },
  addUser(db, user){
    return db('users').insert(user).returning('*');
  },
  deleteUser(db, id){
    db('favorites').where('user_ref', id).delete(); 
    return db('users').where('id', id).delete();
  },
  deleteFavorite(db, user_ref, entry_ref){
    return db('favorites').where({'entry_ref': entry_ref, 'user_ref' : user_ref}).delete();
  },
  addFavorite(db, favorite){
    return db('favorites').insert(favorite).returning('*');
  },
  getFavorites(db, user_ref){
    const favorites = db('favorites').select('entry_ref').where('user_ref', user_ref);
    const entries = db('entries').select('*').whereIn('id', favorites);
    return entries;
  },
  getFavoritesArr(db, user_ref){
    return db('favorites').select('entry_ref').where('user_ref', user_ref);
  }
};

module.exports = UsersService;