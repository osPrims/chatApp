const jwt=require("jsonwebtoken");
const User = require("../database/signupschema");
const requireauth=(req,res,next)=>{
    const token=req.cookies.login;
    if(token)
    {
        jwt.verify(token,"ankitgarg",(err, decodedToken)=>{
            if(err)
            {
                console.log(err.message);
                res.redirect("/login");
            }
                else{
                    console.log(decodedToken);
                    next();
                }
            }
        )
    }
    else{
        res.redirect("/login");
    }
};


const checkuser=async(req,res,next)=>{
    const token=req.cookies.login;
    if(token)
    {
        jwt.verify(token,"ankitgarg",(err, decodedToken)=>{
            if(err)
            {
                
                res.locals.user=null;
                next();
            }
                else{
                    console.log(decodedToken);
                    let user= User.findOne({_id:decodedToken.id});
                    console.log(user);
                    res.locals.user=user;
                    next();
                }
            }
        )
    }
    else{
        res.locals.user=null;
        next();
    }
};
module.exports={requireauth};