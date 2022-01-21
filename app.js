//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb+srv://admin-abhay:admin123@cluster0.x7zat.mongodb.net/todolistDb",{useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(
  "mongodb+srv://admin-abhay:admin@123@cluster0.x7zat.mongodb.net/todolistDb",{useNewUrlParser:true, useUnifiedTopology:true}
);
const itemsSchema = {
  name: String
}
const Item = mongoose.model("Item",itemsSchema);


const item1 = new Item({
  name:"Rambo"
});

const item2 = new Item({
  name:"Jackie"
});

const item3 = new Item({
  name:"Deadpool"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

// 

// Item.deleteMany({ _id: ["6118d27b132e3907d0b35847","6118d27b132e3907d0b35848"]}, (err)=>{
//   if(err) throw err;
//   else console.log("Deleated successfully");
// });



app.get("/", function(req, res) {



  Item.find({}, (err, foundItems)=>{
    if (err){
      console.log(err);
    }
    else if(foundItems.length === 0){
      Item.insertMany(defaultItems, (err)=>{
          if(err){
           console.log(err);
          } 
          else{ console.log("Succesfully inserted the items") }
        })
        res.redirect("/");
    }else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

 
});


app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id: checkedItem}, function (err) {
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted the checked item.");
      }
    })
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
        console.log("Successfully deleted the checked item.");
      }
    })
  }
  
});


app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name:customListName}, function (err, foundItems) {
    if(!err){
      if(!foundItems){
        const list = new List({
          name: customListName,
          items: defaultItems
        })
      
        list.save();
        res.redirect("/"+ customListName);
        console.log("Succesfully inserted the items");
      }
      else{
        res.render("list", {listTitle: foundItems.name, newListItems: foundItems.items});
      }
    }
  })

  
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
