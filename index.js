const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userList = require("./users.json");
const app = express();
const PORT = 3333;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/login", async (req, res) => {
    let usernameBody = req.body.username;
    let passBody = req.body.password;

    if (!usernameBody || !passBody) {
        res.json({
            msg: "Debes ingresar username y password"
        })
    }

    let user = userList.find(user=> user.username == usernameBody);

    if (!user) {
        res.json({
            msg: "El username no existe!",
        })
    }
    if (await bcrypt.compare(passBody, user.password)) {
        const token = jwt.sign({user}, "my_secret_key");
        res.json({
            msg: "INGRESO CORRECTO",
            token
        })
    }else{
        res.json({
            msg: "EL username y/o la clave son inválidos",
        })
    }

    app.get("/home", ensureToken ,(req, res)=>{
        jwt.verify(req.token, "my_secret_key", (err, data)=>{
            if (err) {
                res.sendStatus(403);
            }else{
                res.status(200).json({ message: `Hello ${data.user.username}` });
            }
        });

    })

    function ensureToken(req, res, next){
        const bearerHeader = req.headers["authorization"];
            if (bearerHeader) {
            const bearer = bearerHeader.split(" ");
            const bearerToken = bearer[1];
            req.token = bearerToken;
            next();
        }else{
            res.sendStatus(403);
        }
    }
    

    // Codigo usado para hasehar las claves almacenadas
    // if(userBody == "admin" && passBody == "megaAdmin"){
    //     let passHash = await bcrypt.hash(password, 8);
    //     res.json({
    //         msg: "INGRESO EXITOSO",
    //         passHash: passHash
    //     })
    // } else{
    //     res.json({
    //         msg: "INGRESE SUS DATOS CORRECTAMENTE"
    //     })
    // }
})

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
