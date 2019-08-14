const EntriesService = {
  getAllEntries(db) {
    const entries = db('entries').select('*');
    console.log(entries);
    return entries;
  },
  getEntryById(db, id){
    return db('entries').select('*').where('id', id);
  },
  addEntry(db, Entry){
    return db('entries').insert(Entry).returning('*');
  },
  updateEntry(db, id, Entry){
    return db('entries').where('id', id).update(Entry
    ).returning('*');
  },
  deleteEntry(db, id){
    return db('entries').where('id', id).delete();
  }
};

module.exports = EntriesService;