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
const tress = require("tress");
const needle = require("needle");
const cheerio = require("cheerio");
class Fetcher {
    constructor(url) {
        this.url = url;
    }
    parseNews(page) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = this.url + '?page=' + String(page);
            let results = [];
            let tmp = {};
            console.log('URL=', url);
            let job = {
                data: { 'url': url },
                callback: null
            };
            let q = tress((job, done) => {
                let url = job['url'];
                needle('get', url)
                    .then((res) => {
                    let $ = cheerio.load(res.body);
                    $('li').children().each(function (i, elem) {
                        switch (elem.attribs['class']) {
                            case 'views-field views-field-body':
                                tmp = {};
                                tmp['text'] = $(this).text().trim();
                                tmp['link'] = $(this).find('a').attr('href');
                                break;
                            case 'views-field views-field-field-newtype newstype-wrapper':
                                let val = $(this).find('a').contents().map((index, elem) => {
                                    return String(elem.data).trim();
                                });
                                tmp['tags'] = val.toArray();
                                break;
                            case 'views-field views-field-created':
                                tmp['date-created'] = $(this).text().trim();
                                results.push(tmp);
                                break;
                            default:
                                break;
                        }
                    });
                    return done(null);
                })
                    .catch((err) => {
                    return done(err);
                });
            });
            q.push(job.data);
            return new Promise((resolve, reject) => {
                q.drain = function () {
                    resolve(results);
                };
                q.error = function (e) {
                    reject(e);
                };
            });
        });
    }
}
exports.Fetcher = Fetcher;
