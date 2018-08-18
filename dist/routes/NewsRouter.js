"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Fetcher_1 = require("../helpers/Fetcher");
;
class NewsRouter {
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetcher = new Fetcher_1.Fetcher('http://www.parallel.ru/news');
            try {
                let result = yield fetcher.parseNews(0);
                console.log(result);
                res.json(JSON.stringify(result, null, 2));
            }
            catch (e) {
                res.json(e);
            }
        });
    }
    init() {
        this.router.get('/', this.getAll);
    }
}
exports.NewsRouter = NewsRouter;
let router = new NewsRouter();
router.init();
exports.default = router.router;
