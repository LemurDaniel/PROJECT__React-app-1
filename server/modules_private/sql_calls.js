const mysql = require('mysql');
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

const SQL_CREATE_USER = 'create table ' + TABLE_USER + ' ( ' +
                        'id nchar(16) PRIMARY KEY,' +
                        'username nvarchar(50) NOT NULL unique,' +
                        'username_display nvarchar(50) NOT NULL ,' +
                        'bcrypt BINARY(60) NOT NULL ) ';

const SQL_CREATE_IMG =  'create table ' + TABLE_IMG + ' ( ' +
                        'img_id int NOT NULL PRIMARY KEY AUTO_INCREMENT,' +
                        'user_id nchar(16) NOT NULL,' +
                        'img_path nchar(20) NOT NULL unique,' +
                        'img_name nvarchar(50),' +
                        'ml5_bestfit nvarchar(25),' +
                        'ml5_bestfit_conf Decimal(20,19),' +
                        'ml5 text, ' +
                        'FOREIGN KEY(user_id) REFERENCES ' + TABLE_USER + '(id) )';

const SQL_CREATE_TASK = 'create table ' + TABLE_TASK + ' ( ' +
                        'id nchar(16) NOT NULL, ' +
                        'user_id nchar(16) NOT NULL, ' +
                        'title nchar(50) NOT NULL, ' +
                        'description text, ' +
                        'date bigint, ' +
                        'done BOOLEAN, ' +
                        'PRIMARY KEY (user_id, id), ' +
                        'FOREIGN KEY(user_id) REFERENCES ' + TABLE_USER + '(id) )';


const SQL_INSERT_IMG =  'Insert Into  ' + TABLE_IMG +
                        ' (img_path, img_name, user_id, ml5_bestfit, ml5_bestfit_conf, ml5) ' +
                        ' Values (?, ?, ?, ?, ?, ? )';

const SQL_UPDATE_IMG = 'Update ' + TABLE_IMG + ' Set ' +
                        'img_name = ?, ml5_bestfit = ?, ml5_bestfit_conf = ?, ml5 = ?' +
                        ' Where img_path = ? AND user_id = ?';

const SQL_GET_IMG = 'Select img_path, du.username_display, img_name, ml5_bestfit, ml5_bestfit_conf ' +
                    ' from ' + TABLE_IMG +
                    ' join ' + TABLE_USER + ' as du on ' + TABLE_IMG + '.user_id = du.user_id' +
                    ' where ' +
                    ' ml5_bestfit like ? And' +
                    ' img_name like ? And' +
                    ' du.username_display like ? ' +
                    ' Order By ml5_bestfit_conf desc';

const SQL_DELETE_IMG = 'Delete From ' + TABLE_IMG + ' where img_path = ?';

const SQL_INSERT_USER = 'Insert Into ' + TABLE_USER +
                        ' (id, username, username_display, bcrypt) ' +
                        ' Values ( ?, ?, ?, ? )';

const SQL_GET_HASH = 'select id, username_display, bcrypt from ' + TABLE_USER +
                        ' where username = ?';

const SQL_INSERT_TASK = 'Insert Into ' + TABLE_TASK +
                        ' (id, user_id, title, description, date, done) ' +
                        ' Values ( ?, ?, ?, ?, ?, ? )'

const SQL_GET_TASK = 'Select ta.id as id, title, description, date, done ' +
                    ' from ' + TABLE_TASK + ' as ta '+
                    ' join ' + TABLE_USER + ' as du on ta.user_id = du.id' +
                    ' where du.id = ? ';

const SQL_DELETE_TASK = 'Delete from '+TABLE_TASK+
                        ' where id = ? AND user_id = ? ';

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
    const data = await method(con);
    con.release;
    return data;

}

func.insertTask = (con, task) => {

    return new Promise( (resolve, reject) => {

        con.query(SQL_INSERT_TASK, [
            task.id,
            task.user,
            task.title,
            task.description,
            task.date,
            task.done
        ], (error, data) => {
            if(error) reject(error);
            else resolve(data)
        })

    })
}

func.searchTasks = (con, params) => {

    return new Promise( (resolve, reject) => {

        con.query(SQL_GET_TASK, [
            params.user
        ], (error, data) => {
            if(error) reject(error);
            else resolve(data)
        })

    })
}

func.deleteTask = (con, id, userId) => {

    return new Promise( (resolve, reject) => {

        con.query(SQL_DELETE_TASK, [
            id,
            userId
        ], (error, data) => {
            if(error) reject(error);
            else resolve(data)
        })

    })
}

func.delete_img = (con, img_path, callback) => con.query(SQL_DELETE_IMG, [img_path], callback);

func.insert_img = (con, body, callback) => {

    con.query(SQL_INSERT_IMG,
        [body.img_path,
        body.img_name,
        body.user.id,
        body.ml5_bestfit.label,
        body.ml5_bestfit.confidence,
        JSON.stringify(body.ml5)],
        callback);
}

func.update_img = (con, body, callback) => {

    con.query(SQL_UPDATE_IMG,
        [body.img_name,
        body.ml5_bestfit.label,
        body.ml5_bestfit.confidence,
        JSON.stringify(body.ml5),
        body.img_path,
        body.user.id],
        callback);
}

func.get_img = (con, params, callback) => {

    let img_name = params.img_name + '%';
    let user_display = params.user_searched + '%';
    let ml5_bestfit = params.ml5_bestfit + '%';

    if (!ml5_bestfit) ml5_bestfit = '%';
    if (!img_name) img_name = '%';
    if (!user_display) user_display = '%';

    con.query(SQL_GET_IMG, [
        ml5_bestfit,
        img_name,
        user_display],
        (err, res) => {
            if (err) return callback(err, null);

            let result = [];
            res.forEach(row => {
                result.push({
                    img_path: row.img_path,
                    img_name: row.img_name,
                    user_display: row.userDisplayName,
                    ml5_bestfit: {
                        label: row.ml5_bestfit,
                        confidence: row.ml5_bestfit_conf
                    }
                });
            });
            callback(err, result);
        });
}



func.insert_user = (con, user) => {

    return new Promise((resolve, reject) => {

        con.query(SQL_INSERT_USER, [
            user.id,
            user.username,
            user.userDisplayName,
            user.bcrypt
        ], (error, data) => {
            if (error) reject(error);
            else resolve(data);
        });

    })

}


func.get_password_hash = (con, user) => {

    return new Promise((resolve, reject) => {

        console.log('STARTING QUERY')
        con.query(SQL_GET_HASH, [user.username], (err, res) => {
            console.log(res)
            console.log(res.length > 0)
            if (err) return reject(err);
            else if( res.length <= 0 ) return reject('No User Found');

            user.id = res[0].id;
            user.userDisplayName = res[0].username_display;
            console.log(user)
            resolve(res[0].bcrypt.toString());
        });

    })
}

func.init_Database = function () {

    // Check for file indicating that tables have been initialized
    return func.transaction(async con => {

        await func.call(con, SQL_CREATE_USER);
        await func.call(con, SQL_CREATE_IMG);
        await func.call(con, SQL_CREATE_TASK);
        return 'OK';

    }
    );

}




func.export_data = () => {

    return func.transaction( async con => {

        const user = 'Select * from ' + TABLE_USER;
        const img  = 'Select * from ' + TABLE_IMG;
        const task ='Select * from ' + TABLE_TASK;

        const user_data = await func.call(con, user);
        const img_data  = await func.call(con, img);
        const task_data = await func.call(con, task);


        return {
            users: user_data.map( row => new Object({ ...row, bcrypt: row.bcrypt.toString() }) ),
            tasks: task_data.map( row => new Object({ ...row }) ),
            images: img_data.map( row => new Object({ ...row }) ),
        }
    });
}

func.import_data = data => {

    return func.transaction( async con => {

        throw 'Not implemented'
    });
}



func.import_users = (con, users, callback) => {

    if (!users || users.length == 0) return callback(null);
    const qu = (i, info) => {
        const user = users[i];
        con.query('Insert into ' + TABLE_USER + ' Values( ?, ?, ?, ? )', [
            user.user_id,
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
            image.user_id,
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