const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const {loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts} = require('./utils/contacts')
const { body, validationResult, check } = require('express-validator')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

// konfigurasi flash
app.use(cookieParser('secret'))
app.use(session({
  cookie: {maxAge: 6000},
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}))
app.use(flash())

app.get('/', (req, res) => {
  const mahasiswa = [
    { 
      nama: 'Agung Widiyanto',
      email: 'agung@gmail.com'
    },
    {
      nama: 'Amin Widiyanto',
      email: 'amin@gmail.com'
    },
    {
      nama: 'Angga Widiyanto',
      email: 'angga@gmail.com'
    }
  ]
  res.render('index', {
    layout: 'layouts/main-layout',
    nama: 'Agung', 
    title: 'Home',
    mahasiswa
  })
})

app.get('/about', (req, res) => {
  res.render('about', {
    layout: 'layouts/main-layout',
    title: 'About Page'
  })
})

app.get('/contact', (req, res) => {
    const contacts = loadContact()
    
   res.render('contact', {
    layout: 'layouts/main-layout',
     title: 'Contact Page',
     contacts,
     msg: req.flash('msg')
   })
})

app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    title: 'Form Tambah Data Contact',
    layout: 'layouts/main-layout'
  })
})

app.post('/contact',
 [check('email', 'Email tidak valid!').isEmail(),
 body('nama').custom((value) => {
   const duplikat = cekDuplikat(value)
   if(duplikat) {
     throw new Error('Nama contact sudah digunakan!')
   }
   return true
 }),
 check('nohp', 'No Hp tidak valid!').isMobilePhone('id-ID'),
],(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array()
      })
    } else {
      addContact(req.body)
      req.flash('msg', 'Data contact berhasil ditambahkan!')
      res.redirect('/contact')
    }
  
})

app.get('/contact/delete/:nama', (req, res) => {
  const contact = findContact(req.params.nama)
  if(!contact) {
    res.status(404)
    res.send('<h1>404</h1>')
  } else {
    deleteContact(req.params.nama)
    req.flash('msg', 'Data contact berhasil dihapus!')
    res.redirect('/contact')
  }
})

app.get('/contact/edit/:nama', (req, res) => {
  const contact = findContact(req.params.nama)
  res.render('edit-contact', {
    title: 'Form Ubah Data Contact',
    layout: 'layouts/main-layout',
    contact,
  })
})

app.post('/contact/update',
 [check('email', 'Email tidak valid!').isEmail(),
 body('nama').custom((value, { req }) => {
   const duplikat = cekDuplikat(value)
   if(value !== req.body.namaLama && duplikat) {
     throw new Error('Nama contact sudah digunakan!')
   }
   return true
 }),
 check('nohp', 'No Hp tidak valid!').isMobilePhone('id-ID'),
],(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      res.render('edit-contact', {
        title: 'Form Ubah Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array(),
        contact: req.body,
      })
    } else {
      updateContacts(req.body)
      req.flash('msg', 'Data contact berhasil diubah!')
      res.redirect('/contact')
    }  
})

app.get('/contact/:nama', (req, res) => {
  const contact = findContact(req.params.nama)
  
 res.render('detail', {
  layout: 'layouts/main-layout',
   title: 'Detail Page',
   contact,
 })
})

app.use('/', (req, res) => {
	res.status(404)
	res.send('404')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})