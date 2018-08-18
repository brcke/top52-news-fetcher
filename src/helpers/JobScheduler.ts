import  { CronJob, CronTime } from 'cron';
import { DatabaseManager } from '../db';
import { Fetcher } from './Fetcher';
import { Saver, toDate, sha1 } from './Saver';

export class JobScheduler {
  public job: CronJob
  private fetcher = new Fetcher('http://www.parallel.ru/news');
  private saver = new Saver();
  private db = new DatabaseManager();
  private isForced = false;

  public constructor() {
    this.job = new CronJob({
      cronTime: '0 */15 * * * *',
      onTick: this.onTick,
      runOnInit: true,
      start: true
    });
  }

  public async schedule() {
    this.job.start();
  }

  public setForceUpdate(isForced: boolean) {
    this.isForced = isForced;
  }

  private onTick = async () => {
    console.log(`[${new Date()}] Job started`);
    for (let page = 0, rewrittenPages = 0; rewrittenPages < 5; page++) {
      let news = await this.fetcher.parseNews(page);

      if (news.length == 0) {
        break;
      }

      if (!this.isForced) {
        let rewrittenObjects = 0;
        for (const obj of news) {
          let sameNewsQuery = await this.db.query(
            `SELECT * FROM newsfeed_imports WHERE initial_title = $1 AND date_created = $2`, 
          [sha1(obj.text), toDate(obj["date-created"])]);
          if (sameNewsQuery.rows.length > 0) {
            rewrittenObjects++;
          }
        }
        if (rewrittenObjects == news.length) {
          rewrittenPages++;
        }
      }

      await this.saver.save(news);
    }
    await this.updateJobSchedule();
  }

  private updateJobSchedule = async () => {
    let settingsQuery = await this.db.query('SELECT * FROM newsfeed_settings');
    let settings = settingsQuery.rows[0];

    let cronSchedule = settings.cron_schedule;
    let cronValue = settings.cron_value;
    let cronTime: string;

    switch (cronSchedule) {
      case 'minute':
        // At every {cronValue} minute
        cronTime = `0 */${cronValue} * * * *`;
        break
      case 'hour':
        // At minute 0 past every {cronValue} hour.
        cronTime = `0 0 */${cronValue} * * *`;
        break
      case 'day':
        // At 00:00 on every {cronValue} day-of-month
        cronTime = `0 0 0 */${cronValue} * *`;
        break
      case 'week':
        // At 00:00 on every {cronValue} day-of-month.
        cronTime = `0 0 0 */${cronValue} * *`;
        break
      case 'month':
        // At 00:00 on day-of-month 1 in every {cronValue} month
        cronTime = `0 0 0 1 */${cronValue} *`;
        break
    }
    
    this.job.setTime(new CronTime(cronTime));
    this.job.start();
    console.log(`[${new Date()}] Next time update: ${this.job.nextDates(1)}`);
  }
}