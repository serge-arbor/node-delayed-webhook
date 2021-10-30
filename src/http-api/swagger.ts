import { Router } from 'express';
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./../../public/swagger.json";

const swaggerRouter = Router();

swaggerRouter.use('/api/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default swaggerRouter;