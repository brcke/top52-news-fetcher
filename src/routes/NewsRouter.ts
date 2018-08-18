import { Router, Request, Response, NextFunction } from 'express';
import { Fetcher } from '../helpers/Fetcher';;

export class NewsRouter {
  router: Router

  constructor() {
    this.router = Router();
    this.init();
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    let fetcher = new Fetcher('http://www.parallel.ru/news');
    try {
      let result = await fetcher.parseNews(0);
      console.log(result);
      res.json(JSON.stringify(result, null, 2));
    } catch (e) {
      res.json(e);
    }
  }

  init() {
    this.router.get('/', this.getAll);
  }
}

let router = new NewsRouter();
router.init();

export default router.router;