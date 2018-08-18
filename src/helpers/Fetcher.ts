import * as tress from 'tress';
import * as needle from 'needle';
import * as cheerio from 'cheerio';

export class Fetcher {
  public url: string

  constructor(url: string) {
    this.url = url;
  }

  public async parseNews(page: number): Promise<any[]> {
    let url = this.url + '?page=' + String(page);
    let results = [];
    let tmp = {};

    console.log('URL=', url);

    let job: tress.TressJob = {
      data: {'url' : url},
      callback: null
    };
  
    let q = tress((job, done) => {
      let url = job['url'] as string;

      needle('get', url)
      .then((res) => {
        let $ = cheerio.load(res.body);
        $('li').children().each(function(i, elem) {
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

    return new Promise<any[]>((resolve, reject) => {
      q.drain = function() {
        resolve(results);
      };

      q.error = function(e) {
        reject(e);
      };
    });
  }
}
