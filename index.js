const express = require("express")
const bodyParser = require("body-parser")
// const date = require(__dirname + "/date.js")
const mongoose = require('mongoose')
const _ = require('lodash')
const port = 3000;
const app = express()

const PORT = process.env.PORT || 3000

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
// const newItems = []
// const workItems = [];

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
app.set('view engine', 'ejs')

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

// const item1 = new Item({
//     name: "Welcome to your todolist!"
//   });
  
// const item2 = new Item({
//     name: "Hit the + button to add a new item"
//   });

// const item3 = new Item({
//     name: "<<--- Hit this to delete item"
//   });

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

const defaultItems = []

app.get('/', (req, res) =>{
    // const day = date.getDate()

    
    Item.find({})
    .then(foundItem => {
      if (foundItem.length === 0) {
        // console.log("Default items are added!")
        return Item.insertMany(defaultItems);
      } else {
        return foundItem;
      }
    })

    .then(savedItem => {
      res.render("list", {
        listTitle: "Today",
        newTodoItems: savedItem
      });
    })

    .catch(err => console.log(err));
 
});

app.get('/:customListName', (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            console.log("Route is saved");
            res.redirect("/"+ customListName);
          }
          else{
            res.render("list",{listTitle:foundList.name, newTodoItems:foundList.items});
          }
    })
    .catch(function(err){});
})


app.post('/', (req,res) =>{

    const itemName = req.body.todoInput
    const listName = req.body.list

    const item = new Item({
        name: itemName
      });

      if(listName === "Today"){
        item.save();
     
        res.redirect("/");
      }else{
        List.findOne({name: listName})
        .then(foundList => {
          foundList.items.push(item)
          foundList.save()
          res.redirect("/" + listName)
        })
        .catch(err => {
          console.log(err);
        })
      }
})

app.post("/delete", (req,res)=>{
    const checkedItemId = req.body.checkbox.trim();
    const listName = req.body.listName;
 
    
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(function () {
        console.log("Item from main list is deleted")
        res.redirect("/");
      })
      .catch(function () {
        console.log("delete error");
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then(function (foundList) {
        res.redirect("/" + listName);
        console.log("Item from custom list is deleted")
      })
      .catch(function (err) {
        console.log("err in delete item from custom list");
      });
  }
});

app.get('/about', (req,res)=>{
    res.render('about')
})

app.post("/work", (req,res)=>{
    let newItem = req.body.todoInput;
    workItems.push(newItem)
    res.redirect("/work")
})

connectDB().then(() => {
  app.listen(PORT, () => {
      console.log("listening for requests");
  })
})