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
const db_1 = require("../db");
const crypto_1 = require("crypto");
function sha1(data) {
    return crypto_1.createHash("sha1").update(data).digest("hex");
}
exports.sha1 = sha1;
function toDate(text) {
    return new Date(text.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1'));
}
exports.toDate = toDate;
class Saver {
    save(json) {
        return __awaiter(this, void 0, void 0, function* () {
            let news = json;
            let db = new db_1.DatabaseManager();
            let savedNews = yield db.query('SELECT * FROM newsfeed_imports');
            let savedNewsRows = savedNews.rows;
            let unsavedNews = news.filter((element) => {
                let newsTitle = element.text;
                let savedTitleIndex = savedNewsRows.findIndex((obj) => {
                    return obj.initial_title == newsTitle;
                });
                return savedTitleIndex < 0;
            });
            for (let element of unsavedNews) {
                const query = `
      INSERT into newsfeed_imports (title, initial_title, link, tags, date_created, is_ignoring, is_last_imported, created_at)
      SELECT $1, $2, $3, $4, $5, $6, $7, $8
      WHERE NOT EXISTS (SELECT * FROM newsfeed_imports WHERE initial_title = CAST($2 AS VARCHAR) AND date_created = $5)
      RETURNING id;
      `;
                yield db.query(query, [
                    element.text,
                    sha1(element.text),
                    element.link,
                    element.tags,
                    toDate(element['date-created']),
                    false,
                    false,
                    new Date()
                ]);
            }
        });
    }
}
exports.Saver = Saver;
