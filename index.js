import express  from"express";
import bodyParser  from "body-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from "mongoose"; 
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } 
  catch (error) {
    console.log(error)
    process.exit(1)
  }
}

  const itemSchema = {
    name: String
  };

  const Item = mongoose.model("Item", itemSchema);

  const item1 = new Item({
    name:"Welcome to your ToDoList!"
  });

  const item2 = new Item({
    name:"Hit the + button for add new item"
  });

  const item3 = new Item({
    name:"<--Hit this to delete an item"
  });

  const defaultItems = [item1, item2, item3];
 
 
app.get("/", (req,res) => {

    let options = { 
        weekday: 'long', 
        day: 'numeric',
        month: 'long' 
    };
    let today  = new Date();
    let day = today.toLocaleDateString("en-US", options);

    Item.find({})
    .then(function (foundItems) {
      if (foundItems.length === 0) {
        
        Item.insertMany(defaultItems)
          .then(function (result) {
            console.log("Successfully Added Default Items to DB.");
          })
          .catch(function (err) {
            console.log(err);
          });
          res.redirect("/");
      } else {
         res.render("list", {kindOfDay: day, newLists: foundItems});
      }
    })
    .catch(function (err) {
      console.log(err);
    });


});


app.post('/', (req, res) => {
  let item = req.body.newItem;
  const itemName = new Item({
    name: item
  });

  itemName.save();
  res.redirect("/");
})

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndDelete(checkedItemId)
          .then(function (result) {
            console.log("Successfully Deleted Items to DB.");
            res.redirect("/");
          })
          .catch(function (err) {
            console.log(err);
          });
})

connectDB().then(() =>{
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
  });
});