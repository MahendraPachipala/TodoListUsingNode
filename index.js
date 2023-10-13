import express from "express";
import bodyparser from "body-parser";
import mongoose from "mongoose";

const app = express();
app.use(bodyparser.urlencoded({extend:true}));
app.use(express.static("Public/Styles"));
mongoose.connect("mongodb+srv://admin-mahendra:Mahendra123@cluster0.l0a5t5v.mongodb.net/todolistDB");

const Task = mongoose.model("Task",{name:String});
const task1 = new Task({name:"Welcome to your todolist!"});
const task2 = new Task({name:"Hit the + button to add a new item."});
const task3 = new Task({name:"<-- Hit this to delete an item."});

var today = new Date();
var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var currentDate = today.toLocaleDateString(undefined, options);

const defaultItems = [task1,task2,task3];

const List = mongoose.model("List",{name:String,items:[{name:String}]});

app.get("/",(req,res)=>{
 
  Task.find({}).
  then((foundItems)=>{
    if(foundItems.length===0){
      Task.insertMany(defaultItems)
     .then(()=>console.log("inseted successfully"))
     .catch((err)=>{console.log(err)});
     res.redirect("/");
    }
    else{
      res.render("index.ejs",{listTitle:"Today",newListItems:foundItems,Date:currentDate});
    }
  })
})

app.get("/:customListName",(req,res)=>{
  const customListName = req.params.customListName;
  List.findOne({name:customListName})
  .then((foundList)=>{
  if(!foundList){
    const list = new List({name:customListName,items:defaultItems});
    list.save();
  }
  else{
   res.render("index.ejs",{listTitle:foundList.name,newListItems:foundList.items,Date:currentDate});
  }
})
  .catch((err)=>console.log(err));
});


app.post("/delete",(req,res)=>
{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Task.findByIdAndRemove(checkedItemId)
    .then(()=>{console.log("Successfully removed.")})
    .catch((err)=>{console.log(err)})
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
    .then(()=>{console.log("Successfully deleted checked item")})
    .catch((err)=>{console.log(err)})
    res.redirect("/"+listName);
  }
});

app.post("/",(req,res)=>{
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const task = new Task({name:itemName});
  if(listName === "Today"){
    task.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName})
    .then((foundList)=>{
      foundList.items.push(task);
      foundList.save();
      res.redirect("/"+listName);
    })
    .catch((err)=>{console.log(err)})
  }
});

app.listen(3000,()=>{console.log("listening on post 3000")});

