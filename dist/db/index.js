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
const pg_1 = require("pg");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
const fs_1 = require("fs");
class DatabaseManager {
    constructor() {
        const path = path_1.join(__dirname, '../../config/database.yml');
        const config = js_yaml_1.safeLoad(fs_1.readFileSync(path, 'utf8'));
        this.pool = new pg_1.Pool({
            user: config.user,
            database: config.database,
            password: config.password,
            host: config.host,
            port: config.port,
            max: config.max,
            idleTimeoutMillis: config.idleTimeoutMillis
        });
    }
    query(query, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = yield this.pool.connect();
            let res;
            try {
                yield client.query('BEGIN');
                try {
                    res = yield client.query(query, parameters);
                    yield client.query('COMMIT');
                }
                catch (err) {
                    yield client.query('ROLLBACK');
                    throw err;
                }
            }
            finally {
                client.release();
            }
            return res;
        });
    }
}
exports.DatabaseManager = DatabaseManager;
