import { Router } from 'express';
import swaggerUi from "swagger-ui-express";
const swaggerRouter = Router();

try{
    const swaggerDocument = require("./../../public/swagger.json");
    swaggerRouter.use('/api/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}catch(err){
    console.log('Unable to load swagger.json', err);
}

export default swaggerRouter;
