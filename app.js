const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));



mongoose.set("strictQuery", false);

mongoose.connect(process.env.MONGO_URI);

const itemsSchema = new mongoose.Schema({
    name : String
});

const Item = mongoose.model("Item",itemsSchema);

const listSchema = new mongoose.Schema({
    name: String,
    lists : [itemsSchema]

})

const List = mongoose.model("List",listSchema);

const item1 = new Item(
    {name : "coding" },
)

const item2 = new Item(
    {name : "leetcode"}
)

const item3 = new Item(
    {name : "news paper"}
)

const defaultItems = [item1, item2, item3];

app.get("/",function(req,res){
    let day = date.getday();
    Item.find(function(err,items){
        if(items.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err) console.log(err);
                else console.log("successfully added defaultList to database");
            });
            res.redirect("/");
        }
        else{
            res.render("list",{listType:day, listItems:items});
        }
        
    })
});

app.get("/:customlist", function(req,res){
    const customlistname = _.capitalize(req.params.customlist);
    
    List.findOne({name:customlistname}, function(err,foundlist){
        if(foundlist){
            res.render("list",{listType:customlistname, listItems :foundlist.lists});
        }
        else{
            const list = new List({
                name : customlistname,
                lists : defaultItems
            });
            list.save();
            res.redirect("/" + customlistname);
        }
    })
    
})

app.post("/",function(req,res){
    let item = req.body.listItem;
    let listname = req.body.button;
    const item4 = new Item({name : item});
    if(listname === date.getday()){
        item4.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listname}, function(err,foundlist){
            foundlist.lists.push(item4);
            foundlist.save();
        })
        res.redirect("/"+listname);
    }
    
});

app.post("/delete", function(req,res){
    let boxid = req.body.checkit;
    let listname = req.body.listItem;
    if(listname === date.getday()){
        Item.findByIdAndRemove(boxid, function(err){
            if(err) console.log(err);
            else console.log("successfully removed");
        })
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name: listname}, {$pull:{lists:{_id:boxid}}}, function(err,foundlist){
            if(!err){
                res.redirect("/" + listname);
            }
        })
    }
    
})



app.get("/about",function(req,res){
    res.render("about");
});

app.listen(3000, function(){
    console.log("app is running at port 3000");
});
