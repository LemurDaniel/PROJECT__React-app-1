const fs = require('fs');
const crypto = require('crypto');
const routes =  require('express').Router();

const sql = require('./sql_calls');
const schema = require('./joi_models');
const { auth, auth2 } = require('./user_auth');
const { checkCache } = require('./caching');

// Constants
const PATH = '/var/project/src/public/';
const DOODLES = PATH+'doodles/';

// create chache folder if non-existant
if(!fs.existsSync(DOODLES)) fs.mkdirSync(DOODLES);

const TRANSLATION = PATH+'assets/other/translation.json';
const TRANSLATION_ENG = PATH+'assets/other/class_names.txt';
const TRANSLATION_DE = PATH+'assets/other/class_names_german.txt';


/* Create Translation File  */
fs.readFile(TRANSLATION, 'utf8', (err, data) => {
    if(err === null) return;
    const de = fs.readFileSync(TRANSLATION_DE, 'utf8').split('\r\n');
    const eng = fs.readFileSync(TRANSLATION_ENG, 'utf8').split('\r\n');
    const replace = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' }
 
    const translation = {};
    for (let i = 0; i < eng.length; i++) {
        if(!eng[i]) continue;
        translation[eng[i]] = de[i];  
        Object.keys(replace).forEach(rp => {
            translation[eng[i]] = translation[eng[i]].split(rp).join(replace[rp]);
        });
    }
    fs.writeFileSync(TRANSLATION, JSON.stringify(translation, null, 4));
});



const helper = {
    TRANSLATION: TRANSLATION,
    DOODLES: DOODLES,
    PATH: PATH,
    HTML: (str) => PATH+'html/'+str+'.html'
};


async function postImage(req, res) {

      // Get json body from post request
      const image = req.body;
      const flag_update = image.path.length > 0;

      // validate json body
      const validated = schema.image.validate(image);
      if(validated.error) return res.status(400).json(schema.error(validated.error));
        
  
    try {

        // Convert random 8_Bytes to a hex string: 2^64 or 16^16 possible permutations
        if (!flag_update) image.path = crypto.randomBytes(8).toString('hex') + '.png';
        const base64 = image.data.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(DOODLES + image.path, base64, 'base64');

        if (flag_update) await sql.updateImage(sql.pool, image);
        else await sql.insertImage(sql.pool, image);

        return res.status(200).json({ path: image.path });

    } catch (err) {
        console.log(err)
        fs.unlink(image.path, () => null);
        res.status(500).send();
    }

}


// POSTS //
routes.get('/images', (req,res) => {
    checkCache(req, res, false, async query => await sql.queryImages(sql.pool, query));
});

routes.post('/images', auth, postImage);




/* Testing */
// delete metadate of an existing image from the database via a post request
routes.post('/images/delete', auth2, (req, res) => {
    sql.delete_img(sql.pool, req.body.img_path, (err, result) => {
        if(err) return res.json(err);
        else    fs.unlink(DOODLES+req.body.img_path, (err) => res.json({ sql: result, fs: err}) );   
    })
})

// Send back all database entries encoded in json //
routes.get('/export', auth, async (req, res) => {
    
    sql.export_data().then(
        data => res.status(200).json(data)
    ).catch(
        err => res.status(500).send(err)
    );

})

module.exports = { 
    helper,
    routes 
}