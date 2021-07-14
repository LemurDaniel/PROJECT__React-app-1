const mysql = require('mysql');
const path = require('path');
const fs = require('fs');

const SQL_HOST = process.env.SQL_HOST;
const SQL_USER = process.env.SQL_USER;
const SQL_PORT = process.env.SQL_PORT ?? 3306;
const SQL_PASSWORD = process.env.SQL_PASSWORD;
const SQL_DATABASE = process.env.SQL_DATABASE;

const CON_LIMIT = 15;

const TABLE_NAME = process.env.SQL_TABLE_NAME;

const TABLE_USER = TABLE_NAME + '_user';
const TABLE_IMG = TABLE_NAME + '_img';
const TABLE_TASK = TABLE_NAME + '_task';
const TABLE_SCORE = TABLE_NAME + '_score';

const SQL_CREATE_USER = 'create table ' + TABLE_USER + ' ( ' +
    'id nchar(16) PRIMARY KEY,' +
    'username nvarchar(50) NOT NULL unique,' +
    'userDisplayName nvarchar(50) NOT NULL, ' +
    'isGuest BOOLEAN, ' +
    'bcrypt BINARY(60) NOT NULL ) ';

const SQL_CREATE_IMG = 'create table ' + TABLE_IMG + ' ( ' +
    'id int NOT NULL PRIMARY KEY AUTO_INCREMENT,' +
    'userId nchar(16) NOT NULL,' +
    'path nchar(20) NOT NULL unique,' +
    'name nvarchar(50),' +
    'ml5 nvarchar(25),' +
    'ml5_conf Decimal(20,19),' +
    'ml5_meta text, ' +
    'FOREIGN KEY(userId) REFERENCES ' + TABLE_USER + '(id) )';

const SQL_CREATE_TASK = 'create table ' + TABLE_TASK + ' ( ' +
    'id nchar(16) NOT NULL, ' +
    'userId nchar(16) NOT NULL, ' +
    'title nchar(50) NOT NULL, ' +
    'description text, ' +
    'date date, ' +
    'time time, ' +
    'done BOOLEAN, ' +
    'PRIMARY KEY (userId, id), ' +
    'FOREIGN KEY(userId) REFERENCES ' + TABLE_USER + '(id) )';


const SQL_CREATE_SCORE = 'create table ' + TABLE_SCORE + ' ( ' +
    'score int NOT NULL, ' +
    'ticks int NOT NULL, ' +
    'userId nchar(16) NOT NULL, ' +
    'timestamp timestamp NOT NULL, ' +
    'PRIMARY KEY (userId, score), ' +
    'FOREIGN KEY(userId) REFERENCES ' + TABLE_USER + '(id) )';


const SQL_INSERT_IMG = 'Insert Into  ' + TABLE_IMG +
    ' (path, name, userId, ml5, ml5_conf, ml5_meta) ' +
    ' Values (?, ?, ?, ?, ?, ? )';

const SQL_UPDATE_IMG = 'Update ' + TABLE_IMG + ' Set ' +
    'name = ?, ml5 = ?, ml5_conf = ?, ml5_meta = ?' +
    ' Where path = ? AND userId = ?';

const SQL_GET_IMG = 'Select path, userDisplayName, img.name, ml5, ml5_conf ' +
    ' from ' + TABLE_IMG + ' as img ' +
    ' join ' + TABLE_USER + ' as usr on img.userId = usr.id' +
    ' where ' +
    ' ml5 like ? And' +
    ' img.name like ? And' +
    ' userDisplayName like ? ' +
    ' Order By ml5_conf desc';

const SQL_DELETE_IMG = 'Delete From ' + TABLE_IMG + ' where img_path = ?';

const SQL_INSERT_USER = 'Insert Into ' + TABLE_USER +
    ' (id, username, userDisplayName, bcrypt, isGuest) ' +
    ' Values ( ?, ?, ?, ?, ? )';

const SQL_GET_HASH = 'select id, userDisplayName, bcrypt from ' + TABLE_USER +
    ' where username = ? AND isGuest = false ';

const SQL_INSERT_TASK = 'Insert Into ' + TABLE_TASK +
    ' (id, userId, title, description, date, time, done) ' +
    ' Values ( ?, ?, ?, ?, ?, ?, ? )'

const SQL_UPDATE_TASK = 'Update ' + TABLE_TASK + ' SET ' +
    ' title = ?, description = ?, date = ?, time = ?, done = ? ' +
    ' where id = ? AND userId = ? ';

const SQL_QUERY_TASK = 'Select id, title, description, date, time, done ' +
    ' from ' + TABLE_TASK +
    ' where userId = ? ' +
    ' AND Date(date) = Date(?)';

const SQL_GET_TASK = 'Select date ' +
    ' from ' + TABLE_TASK + ' as ta ' +
    ' where id = ? ' +
    ' AND userId = ?';

const SQL_DELETE_TASK = 'Delete from ' + TABLE_TASK +
    ' where id = ? AND userId = ? ';

const SQL_INSERT_SCORE = 'Insert into ' + TABLE_SCORE +
    ' (score, ticks, userId, timestamp) ' +
    ' values( ?, ?, ?, ? ) ';

const SQL_GET_SCORE = 'Select score, ticks, timestamp, userDisplayName from ' + TABLE_SCORE +
    ' join ' + TABLE_USER + ' as usr on usr.id = userId ' +
    ' order by score DESC ' +
    ' limit 10 ';

func = {}

func.pool = mysql.createPool({
    connectionLimit: CON_LIMIT,
    host: SQL_HOST,
    user: SQL_USER,
    port: SQL_PORT,
    password: SQL_PASSWORD,
    database: SQL_DATABASE
});


func.getConnection = () => {
    return new Promise((resolve, reject) => {
        func.pool.getConnection((err, con) => {
            if (err) return reject(err);
            resolve(con);
        });
    });
}

func.call = (con, statement) => {

    return new Promise((resolve, reject) => {
        con.query(statement, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        })
    });
}

func.transaction = async (method) => {

    const con = await func.getConnection();
    try {
        const data = await method(con);
        con.commit();
        con.release;
        return data;
    } catch (err) {
        con.rollback();
        throw err;
    }

}

func.insertTask = (con, task) => {

    return new Promise((resolve, reject) => {

        con.query(SQL_INSERT_TASK, [
            task.id,
            task.user,
            task.title,
            task.description,
            task.date,
            task.time,
            task.done
        ], (error, data) => {
            if (error) reject(error);
            else resolve(data)
        })

    })
}

func.updateTask = (con, task) => {

    return new Promise((resolve, reject) => {

        con.query(SQL_UPDATE_TASK, [
            task.title,
            task.description,
            task.date,
            task.time,
            task.done,
            task.id,
            task.user,
        ], (error, data) => {
            if (error) reject(error);
            else resolve(data)
        })

    })
}

func.queryTasks = (con, params) => {

    return new Promise((resolve, reject) => {

        con.query(SQL_QUERY_TASK, [
            params.user,
            params.date
        ], (error, data) => {
            if (error) return reject(error);
            data.forEach(row => row.date = row.date.toISOString().split('T')[0]);
            resolve(data)
        })

    })
}

func.getTaskDate = (con, id, user) => {

    return new Promise((resolve, reject) => {

        con.query(SQL_GET_TASK, [
            id,
            user.id
        ], (error, data) => {
            if (error) reject(error);
            if (data.length === 0) reject(error);
            else resolve(data[0].date.toISOString().split('T')[0]);
        })

    })
}

func.deleteTask = (con, id, user) => {

    return new Promise((resolve, reject) => {

        con.query(SQL_DELETE_TASK, [
            id,
            user.id
        ], (error, data) => {
            if (error) reject(error);
            else resolve(data)
        })

    })
}

func.delete_img = (con, img_path, callback) => con.query(SQL_DELETE_IMG, [img_path], callback);

func.insertImage = (con, image) => {

    return new Promise((resolve, reject) => {
        con.query(SQL_INSERT_IMG,
            [image.path,
            image.name,
            image.user.id,
            image.ml5.label,
            image.ml5.confidence,
            JSON.stringify(image.ml5.meta)
            ], (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
    })
}

func.updateImage = (con, image) => {

    return new Promise((resolve, reject) => {
        con.query(SQL_UPDATE_IMG,
            [image.name,
            image.ml5.label,
            image.ml5.confidence,
            JSON.stringify(image.ml5.meta),
            image.path,
            image.user.id
            ], (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
    });
}

func.queryImages = (con, params) => {

    return new Promise((resolve, reject) => {

        const name = (params.name ?? '') + '%';
        const user = (params.user ?? '') + '%';
        const ml5 = (params.ml5 ?? '') + '%';

        con.query(SQL_GET_IMG, [
            ml5, name, user
        ], (err, res) => {
            if (err) return reject(err);
            const result = res.map(row => new Object({ ...row }));
            resolve(result);
        });
    })
}


func.insertScore = (con, score) => {

    return new Promise((resolve, reject) => {

        con.query(SQL_INSERT_SCORE, [
            score.score,
            score.ticks,
            score.user.id,
            score.timestamp
        ], (error, data) => {
            if (error) reject(error);
            else resolve(data);
        });

    })

}

func.getScores = () => {
    return func.call(func.pool, SQL_GET_SCORE);
}

func.insertUser = (con, user) => {

    return new Promise((resolve, reject) => {
        con.query(SQL_INSERT_USER, [
            user.id,
            user.username,
            user.userDisplayName,
            user.bcrypt,
            user.isGuest,
        ], (error, data) => {
            if (error) reject(error);
            else resolve(data);
        });

    })

}


func.getPasswordHash = (con, user) => {

    return new Promise((resolve, reject) => {

        con.query(SQL_GET_HASH, [user.username], (err, res) => {
            if (err) return reject(err);
            else if (res.length <= 0) return reject('No User Found');

            user.id = res[0].id;
            user.userDisplayName = res[0].userDisplayName;
            resolve(res[0].bcrypt.toString());
        });

    })
}



func.initDatabase = async () => {

    const file = path.join(__dirname, '..', 'public', 'doodles', TABLE_NAME + '_EXISTS.info');
    if (fs.existsSync(file)) return;

    const init = async con => {
        await func.call(con, SQL_CREATE_USER);
        await func.call(con, SQL_CREATE_IMG);
        await func.call(con, SQL_CREATE_TASK);
        await func.call(con, SQL_CREATE_SCORE);
        return 'Tables created successfully';
    }

    let tries = 0;
    const MAX_TRIES = 30;

    while (tries++ < MAX_TRIES) {

        try {
            const res = await func.transaction(init);
            fs.writeFileSync(file, '');
            console.log(res);
            return;

        } catch (err) {
            console.log(err)
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log(`Waiting for database connection | Trie: ${tries} / ${MAX_TRIES} - CODE ${err.code}`);
        }
    }

    throw new Error('Unable to initialize database');
}




func.exportData = () => {

    return func.transaction(async con => {

        const user = 'Select * from ' + TABLE_USER;
        const img = 'Select * from ' + TABLE_IMG;
        const task = 'Select * from ' + TABLE_TASK;

        const user_data = await func.call(con, user);
        const img_data = await func.call(con, img);
        const task_data = await func.call(con, task);


        return {
            users: user_data.map(row => new Object({ ...row, bcrypt: row.bcrypt.toString() })),
            tasks: task_data.map(row => new Object({ ...row })),
            images: img_data.map(row => new Object({ ...row })),
        }
    });
}

func.import_data = data => {

    return func.transaction(async con => {

        throw 'Not implemented'
    });
}



func.import_users = (con, users, callback) => {

    if (!users || users.length == 0) return callback(null);
    const qu = (i, info) => {
        const user = users[i];
        con.query('Insert into ' + TABLE_USER + ' Values( ?, ?, ?, ? )', [
            user.userId,
            user.username,
            user.userDisplayName,
            user.bcrypt],
            (err, res) => {
                if (err) info.err.push({ user: user.username, err: err });
                else info.done.push(user.username);
                if ((i + 1) >= users.length) return callback(info);
                else qu(i + 1, info);
            });
    }
    qu(0, { err: [], done: [] });
}

func.import_images = (con, images, callback) => {

    if (!images || images.length == 0) return callback(null);
    const qu = (i, info) => {
        const image = images[i];
        con.query('Insert into ' + TABLE_IMG + ' Values( ?, ?, ?, ?, ?, ?, ? )', [
            image.img_id,
            image.userId,
            image.img_path,
            image.img_name,
            image.ml5_bestfit,
            image.ml5_bestfit_conf,
            image.ml5],
            (err, res) => {
                if (err) info.err.push({ image: image.img_path, err: err });
                else info.done.push(image.img_path);
                if ((i + 1) >= images.length) return callback(info);
                else qu(i + 1, info);
            });
    }
    qu(0, { err: [], done: [] });
}

module.exports = func;