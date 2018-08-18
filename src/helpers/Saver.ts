import { DatabaseManager } from '../db';
import { createHash } from 'crypto';

export function sha1(data: string): string {
  return createHash("sha1").update(data).digest("hex");
}

export function toDate(text: string): Date {
  return new Date(text.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1'));
}

export class Saver {
  public async save(json: any) {
    let news = json;
    let db = new DatabaseManager();
    let savedNews = await db.query('SELECT * FROM newsfeed_imports');
    let savedNewsRows = savedNews.rows;

    let unsavedNews = news.filter((element) => {
      let newsTitle = element.text;
      let savedTitleIndex = savedNewsRows.findIndex((obj) => {
        return obj.initial_title == newsTitle;
      })
      return savedTitleIndex < 0;
    });

    for (let element of unsavedNews) {
      const query = `
      INSERT into newsfeed_imports (title, initial_title, link, tags, date_created, is_ignoring, is_last_imported, created_at)
      SELECT $1, $2, $3, $4, $5, $6, $7, $8
      WHERE NOT EXISTS (SELECT * FROM newsfeed_imports WHERE initial_title = CAST($2 AS VARCHAR) AND date_created = $5)
      RETURNING id;
      `;
      
      await db.query(
        query,
        [
          element.text, 
          sha1(element.text), 
          element.link, 
          element.tags, 
          toDate(element['date-created']), 
          false, 
          false, 
          new Date()
        ]
      );
    }
  }
}