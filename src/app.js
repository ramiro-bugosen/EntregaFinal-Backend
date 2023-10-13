import express from "express";
import { connectDB } from "./config/dbConnection.js";
import { usersRouter } from "./routes/usersRoutes.js";
import { __dirname } from "./utils.js";
 
const port = 8080;
const app = express();


app.use(express.json());
app.listen(port,()=>console.log(`Server listening on port ${port}`));

connectDB();

app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname,"/views"));

app.use(viewsRouter);
app.use("/api/products",productsRouter);
app.use("/api/carts", cartsRouter);
