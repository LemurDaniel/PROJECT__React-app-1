const joi = require('joi');
const crypto = require('crypto')

const userDisplayName = joi.string()
    // .pattern(new RegExp('^[0-9a-zA-Z-_\\s]+$'))
    .min(2)
    .max(50)
    .trim()

const username = joi.string()
    .pattern(new RegExp('^[0-9a-zA-Z\-_\.]+$'))
    .min(2)
    .max(50)
    .lowercase()
    .trim()

const password = joi.string()
    //.pattern(new RegExp('^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])([a-zA-Z0-9]{7,30})$'))
    .pattern(new RegExp('^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(.{7,30})$'))

/*
    Muss eine Zahl haben: (?=.*[0-9])
    Einen Großbuchstaben: (?=.*[A-Z])
    Einen Kleinbuchstaben: (?=.*[a-z])
    Aplhanumerisch zwischen 7 und 30 Zeichen: ([a-zA-Z0-9]{7,30})$
*/

const UserRegisterModel = joi.object({

    isGuest: joi.boolean().required(),
    userDisplayName: userDisplayName.required(),
    username: username.required(),
    password: password.required(),

})

const UserLoginModel = joi.object({
    userDisplayName: userDisplayName.allow(''),
    username: username.required(),
    password: password.required(),
})


const UserModel = joi.object({

    id: joi.string()
        .pattern(new RegExp('^[0-9a-f]{16}$'))
        .required(),

    userDisplayName: userDisplayName.required(),

    pass: joi.string(),
    iat: joi.number(),
    exp: joi.number()

})

const ScoreModel = joi.object({

    score: joi.number().required(),
    ticks: joi.number().required(),
    timestamp: joi.string().
        pattern(new RegExp('^[\\d]{4}-[\\d]{2}-[\\d]{2}T([\\d]{2}:){2}[\\d]{2}$')).required(),

    user: UserModel

})

const TaskModel = joi.object({

    id: joi.string()
        .pattern(new RegExp('^[0-9a-f]{16}$'))
        .required(),

    user: joi.string()
        .pattern(new RegExp('^[0-9a-f]{16}$'))
        .required(),

    title: joi.string()
        .min(2)
        .max(50)
        .trim()
        .required(),

    description: joi.string()
        .min(0)
        .max(200)
        .trim()
        .allow('', null),

    date: joi.string().pattern(new RegExp('^[\\d]{4}-[\\d]{2}-[\\d]{2}$')).required(),
    time: joi.string().pattern(new RegExp('^[\\d]{2}:[\\d]{2}(:[\\d]{2}){0,1}$')).required(),

    done: joi.boolean().required(),
    update: joi.boolean().required(),

})

const ImageModel = joi.object({

    data: joi.string()
        .dataUri()
        .required(),

    path: joi.string()
        .pattern(new RegExp('^[0-9a-f]{16}[.]png$'))
        .allow('')
        .lowercase()
        .required(),

    name: joi.string()
        .min(2)
        .max(50)
        .trim()
        .required(),

    update: joi.boolean().required(),

    user: UserModel,

    ml5: joi.object({
        label: joi.string()
            .max(25)
            .required(),

        confidence: joi.number()
            .required(),

        meta: joi.array()
    }),
})


error = (message) => {
    const err = { code: 0, err: message.details[0].message };
    const label = message.details[0].context.label;

    if (label == 'username_display')
        err.err = 'Displayname only allows alphanumeric Characters including Spaces and - or _';

    if (label == 'username')
        err.err = 'Username only allows alphanumeric Characters including . or - or _';

    if (label == 'password')
        err.err = 'Password must be between 7 and 30 Characters ' +
            'and must include each once: Number, Lowercase and Uppercase Character';

    return err;
}


schemas = {};

schemas.validateImage = (req, res, next) => {

    // Get json body from post request
    const image = req.body;
    image.update = image.path != null && image.path.length > 0;
    if (image.path == null) image.path = '';

    // validate json body
    const validated = ImageModel.validate(image);
    
    if (!validated.error) next();
    else res.status(400).json(error(validated.error));

}

schemas.validateScore = (req, res, next) => {

    const validated = ScoreModel.validate(req.body);

    if(!validated.error) next(); 
    else res.status(400).json(error(validated.error));

}

schemas.validateTask = (req, res, next) => {

    req.body.update = req.body.id != null && req.body.id.length > 0;
    if (!req.body.update) req.body.id = crypto.randomBytes(8).toString('hex');

    req.body = { ...req.body, user: req.body.user.id };

    const validated = TaskModel.validate(req.body);
    if (!validated.error) next();
    else res.status(400).json(error(validated.error));

}

schemas.validateUser = (req, res, next) => {

    const user = req.body;
    if (user.username) user.username = user.username.toLowerCase().trim();

    if (req.path === '/user/guest') {
        user.username = crypto.randomBytes(16).toString('hex').toLocaleLowerCase();
        user.password = crypto.randomBytes(16).toString('hex').toLocaleLowerCase();
        user.userDisplayName += ' (Guest - ' + crypto.randomBytes(2).toString('hex') + ')'
        user.isGuest = true;
    } else if (req.path === '/user/register') {
        user.isGuest = false;
        const validated = UserRegisterModel.validate(user);
        if (validated.error) return res.json(error(validated.error));
    } else if (req.path === '/user/login') {
        const validated = UserLoginModel.validate(user);
        if (validated.error) return res.json(error(validated.error));
    }
    else return next();

    req.body = user;
    next();
}

module.exports = schemas;