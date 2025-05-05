const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
   const authToken = req.headers.authorization;

    if (authToken === "valid-token") {
        console.log("User is authenticated.");

        // Check the specific subpath
        if (req.path === "/customer/auth/login") {
            res.send({ message: "Login page accessed via middleware." });
        } else if (req.path === "/customer/auth/profile") {
            res.send({ message: "Profile page accessed via middleware." });
        } else {
            next(); // Pass control to other route handlers
        }
    } else {
        console.log("Authentication failed.");
        res.status(401).send({ error: "Unauthorized: Invalid token" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
