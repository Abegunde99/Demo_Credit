import { Router } from "express";
import TransactionController from "../controllers/transaction";
import AuthMiddleware from "../middlewares/auth";


const transactionController = new TransactionController();
const router = Router();

router.route("/transactions").get(AuthMiddleware.authorize, transactionController.getMyTransactions);

export default router;