const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://t-shop:1010shop@cluster0-tqktf.gcp.mongodb.net/test?retryWrites=true', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");
});

const kittySchema = new mongoose.Schema({
    name: String
  });
kittySchema.methods.speak = function () {
    const greeting = this.name
        ? "Meow name is " + this.name
        : "I don't have a name";
    console.log(greeting);
}
const Kitten = mongoose.model('Kitten', kittySchema);
const fluffy = new Kitten({ name: 'fluffy3' });
fluffy.save(function (err, fluffy) {
    if (err) return console.error(err);
    fluffy.speak();
  });
Kitten.find(function (err, kittens) {
    if (err) return console.error(err);
    console.log(kittens);
})