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
const cron_1 = require("cron");
const db_1 = require("../db");
const Fetcher_1 = require("./Fetcher");
const Saver_1 = require("./Saver");
class JobScheduler {
    constructor() {
        this.fetcher = new Fetcher_1.Fetcher('http://www.parallel.ru/news');
        this.saver = new Saver_1.Saver();
        this.db = new db_1.DatabaseManager();
        this.isForced = false;
        this.onTick = () => __awaiter(this, void 0, void 0, function* () {
            console.log(`[${new Date()}] Job started`);
            for (let page = 0, rewrittenPages = 0; rewrittenPages < 5; page++) {
                let news = yield this.fetcher.parseNews(page);
                if (news.length == 0) {
                    break;
                }
                if (!this.isForced) {
                    let rewrittenObjects = 0;
                    for (const obj of news) {
                        let sameNewsQuery = yield this.db.query(`SELECT * FROM newsfeed_imports WHERE initial_title = $1 AND date_created = $2`, [Saver_1.sha1(obj.text), Saver_1.toDate(obj["date-created"])]);
                        if (sameNewsQuery.rows.length > 0) {
                            rewrittenObjects++;
                        }
                    }
                    if (rewrittenObjects == news.length) {
                        rewrittenPages++;
                    }
                }
                yield this.saver.save(news);
            }
            yield this.updateJobSchedule();
        });
        this.updateJobSchedule = () => __awaiter(this, void 0, void 0, function* () {
            let settingsQuery = yield this.db.query('SELECT * FROM newsfeed_settings');
            let settings = settingsQuery.rows[0];
            let cronSchedule = settings.cron_schedule;
            let cronValue = settings.cron_value;
            let cronTime;
            switch (cronSchedule) {
                case 'minute':
                    // At every {cronValue} minute
                    cronTime = `0 */${cronValue} * * * *`;
                    break;
                case 'hour':
                    // At minute 0 past every {cronValue} hour.
                    cronTime = `0 0 */${cronValue} * * *`;
                    break;
                case 'day':
                    // At 00:00 on every {cronValue} day-of-month
                    cronTime = `0 0 0 */${cronValue} * *`;
                    break;
                case 'week':
                    // At 00:00 on every {cronValue} day-of-month.
                    cronTime = `0 0 0 */${cronValue} * *`;
                    break;
                case 'month':
                    // At 00:00 on day-of-month 1 in every {cronValue} month
                    cronTime = `0 0 0 1 */${cronValue} *`;
                    break;
            }
            this.job.setTime(new cron_1.CronTime(cronTime));
            this.job.start();
            console.log(`[${new Date()}] Next time update: ${this.job.nextDates(1)}`);
        });
        this.job = new cron_1.CronJob({
            cronTime: '0 */15 * * * *',
            onTick: this.onTick,
            runOnInit: true,
            start: true
        });
    }
    schedule() {
        return __awaiter(this, void 0, void 0, function* () {
            this.job.start();
        });
    }
    setForceUpdate(isForced) {
        this.isForced = isForced;
    }
}
exports.JobScheduler = JobScheduler;
