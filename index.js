import express from "express"
import path from 'path'
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://127.0.0.1:27017/backend").then(()=> console.log("database connected")).catch(e=>console.log(e))

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
})

const User = mongoose.model('User', userSchema)


const app=express();
const users=[]

app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.set("view engine","ejs");

const IsAuthenticated= async (req,res,next)=>{
    const token=req.cookies.token;
    if(token)
    {
        const decoded=jwt.verify(token,"ayushpandey")
        console.log(decoded)
        req.user=await User.findById(decoded._id)
        next()
    }
    else
    {
        res.render("login")
    }

}


app.get("/",IsAuthenticated, (req, res) => {
    //console.log(req.cookies)
    //const token=req.cookies.token;
    console.log(req.user)
    res.render("logout",{name: req.user.name})

    

    
    //res.send("index")
});
app.get("/register", async(req, res) => {
    //console.log(req.cookies)
    //const token=req.cookies.token;
    //console.log(req.user)

    
   res.render("register")


    

    
    //res.send("index")
});
 app.post("/register",async(req, res)=>{  
    let user =await User.findOne({email:req.body.email})
    
        if(user){
            //console.log("heyyyyyyyy")
           return res.redirect("/")
        }
        const hasedPassword=await bcrypt.hash(req.body.password,10);

    user= await User.create({
        name:req.body.name,
        email:req.body.email,
        password:hasedPassword
    })
    const token =jwt.sign({_id:user._id},"ayushpandey")
    //console.log(token)

    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now()+ 60*1000)
    });
    res.redirect("/")
})
app.get("/login", (req, res) =>{
    res.render("login")
})
app.post("/login", async(req, res) => {
    console.log(req.body)
    let user =await User.findOne({email:req.body.email})
    
        if(!user){
            console.log("heyyyyyyyy")
           return res.redirect("/register")
        }
    
    //console.log("heyyyyyyyy")
    const isMatch= await bcrypt.compare(req.body.password,user.password)

    if(!isMatch) return res.render("login",{message:"Incorrect Password",email:req.body.email})
    
    const token =jwt.sign({_id:user._id},"ayushpandey")
    //console.log(token)

    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now()+ 60*1000)
    });
    res.redirect("/")
})
app.get("/logout", (req, res) => {
    res.cookie("token",null,{
        expires:new Date(Date.now()) ,
    });
    res.redirect("/")
})





app.listen(8000,() =>{
    console.log("Server is Running")
})