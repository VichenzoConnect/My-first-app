import { Router, type IRouter } from "express";
import healthRouter from "./health";
import translateRouter from "./translate";
import historyRouter from "./history";
import favoritesRouter from "./favorites";
import phraseRouter from "./phrase";

const router: IRouter = Router();

router.use(healthRouter);
router.use(translateRouter);
router.use(historyRouter);
router.use(favoritesRouter);
router.use(phraseRouter);

export default router;
