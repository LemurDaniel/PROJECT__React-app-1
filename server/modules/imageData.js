const fs = require('fs');
const path = require('path')
const PNG = require("pngjs").PNG;
const crypto = require('crypto');
const routes =  require('express').Router();

const sql = require('./sqlCalls');
const schema = require('./joiModels');
const { auth, auth2 } = require('./userAuth');
const { checkCache } = require('./caching');


const DOODLES = path.join(__dirname, '..', 'public', 'doodles')

// create chache folder if non-existant
if(!fs.existsSync(DOODLES)) fs.mkdirSync(DOODLES);

const TRANSLATION = path.join(__dirname, '..', 'public', 'other', 'translation.json');
const TRANSLATION_ENG = path.join(__dirname, '..', 'public', 'other', 'class_names.txt'); 
const TRANSLATION_DE = path.join(__dirname, '..', 'public', 'other', 'class_names_german.txt'); 


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
        fs.writeFileSync(path.join(DOODLES, image.path), base64, 'base64');
        processPng(path.join(DOODLES, image.path));

        if (flag_update) await sql.updateImage(sql.pool, image);
        else await sql.insertImage(sql.pool, image);

        return res.status(200).json({ path: image.path });

    } catch (err) {
        console.log(err)
        fs.unlink(image.path, () => null);
        res.status(500).send();
    }

}

function processPng(file) {

    console.log(file)
    fs.createReadStream(file)
    .pipe( new PNG({ filterType: 4 }))
    .on("parsed", function () {

        const pixels = this.height * this.width;
   
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                const idx = (this.width * y + x) << 2;

                const rgb = [this.data[idx], this.data[idx + 1], this.data[idx + 2]]
                const erase = rgb.every(data => data >= 225);

                const px = y * this.height + x;
                if(px % 1000 == 0) console.log( (px / pixels * 100) + '% Done')
      
                if (erase) {
                    this.data[idx + 3] = 0;
                }
            }
        }
   
      this.pack().pipe(fs.createWriteStream(file));
    });
}


routes.get('/translation', (req,res) => res.sendFile(TRANSLATION));

routes.get('/images', (req,res) => {
    checkCache(req, res, 10, false, async query => await sql.queryImages(sql.pool, query));
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
routes.get('/export', auth2, async (req, res) => {
    
    sql.exportData().then(
        data => res.status(200).json(data)
    ).catch(
        err => res.status(500).send(err)
    );

})

module.exports = { 
    routes 
}