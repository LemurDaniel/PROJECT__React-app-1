const joi = require('joi');

schemas = {};
schemas.user_register = joi.object({

    userDisplayName: joi.string()
        .pattern(new RegExp('^[0-9a-zA-Z-_\\s]+$'))
        .min(2)
        .max(50)
        .trim()
        .required(),

    username: joi.string()
        .pattern(new RegExp('^[0-9a-zA-Z\-_\.]+$'))
        .min(2)
        .max(50)
        .lowercase()
        .trim()
        .required(),

    password: joi.string()
        //.pattern(new RegExp('^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])([a-zA-Z0-9]{7,30})$'))
        .pattern(new RegExp('^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(.{7,30})$'))
        .required(),
        /*
            Muss eine Zahl haben: (?=.*[0-9])
            Einen Großbuchstaben: (?=.*[A-Z])
            Einen Kleinbuchstaben: (?=.*[a-z])
            Aplhanumerisch zwischen 7 und 30 Zeichen: ([a-zA-Z0-9]{7,30})$
        */
})

schemas.user = joi.object({

    id: joi.string()
        .pattern(new RegExp('^[0-9a-f]{16}$'))
        .required(),

    userDisplayName: joi.string()
        .pattern(new RegExp('^[0-9a-zA-Z()-_\\s]+$'))
        .min(2)
        .max(50)
        .trim()
        .required(),

    pass: joi.string(),

    iat: joi.number(),
    exp: joi.number()

})

schemas.task = joi.object({

    id: joi.string()
        .pattern(new RegExp('^[0-9a-f]{16}$'))
        .required(),

    user: joi.string()
        .pattern(new RegExp('^[0-9a-f]{16}$'))
        .required(),

    title: joi.string()
        .pattern(new RegExp('^[0-9a-zA-Z-_\\s]+$'))
        .min(2)
        .max(50)
        .trim()
        .required(),

    description: joi.string()
        .pattern(new RegExp('^[0-9a-zA-Z-_.,\\s]+$'))
        .min(0)
        .max(200)
        .trim()
        .allow('', null),

    date: joi.string().pattern(new RegExp('^[\\d]{4}-[\\d]{2}-[\\d]{2}$')).required(),
    time: joi.string().pattern(new RegExp('^[\\d]{2}:[\\d]{2}(:[\\d]{2}){0,1}$')).required(),

    done: joi.boolean().required(),

})

schemas.score = joi.object({

    score: joi.number().required(),
    ticks: joi.number().required(),
    timestamp: joi.string().
        pattern(new RegExp('^[\\d]{4}-[\\d]{2}-[\\d]{2}T([\\d]{2}:){2}[\\d]{2}$')).required(),

    user: schemas.user

})

schemas.image = joi.object({

    data: joi.string()
        .dataUri()
        .required(),

    path: joi.string()
        .pattern(new RegExp('^[0-9a-f]{16}[.]png$'))
        .allow('')
        .lowercase()
        .required(),

    name: joi.string()
        .pattern(new RegExp('^[0-9a-zA-Z-_\\s]+$'))
        .min(2)
        .max(50)
        .trim()
        .required(),

    user: schemas.user,

    ml5: joi.object({
        label: joi.string()
        .max(25)
        .required(),

        confidence: joi.number()
        .required(),

        meta: joi.array()
    }), 
})

schemas.error = (message) => {
    const err = { code: 0, err: message.details[0].message};
    const label = message.details[0].context.label;

    if(label == 'username_display')
        err.err = 'Displayname only allows alphanumeric Characters including Spaces and - or _';

    if(label == 'username')
        err.err = 'Username only allows alphanumeric Characters including . or - or _';

    if(label == 'password')
        err.err = 'Password must be between 7 and 30 Characters '+
                    'and must include each once: <br>Number, Lowercase and Uppercase Character';

    return err;
}

module.exports = schemas;