const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const Joi = require('joi');
const { campgroundSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const Campground = require('./models/campgrounds');

mongoose.connect('mongodb://localhost:27017/camp-ground', {useNewUrlParser : true, useUnifiedTopology : true})
    .then(() =>{
        console.log('CONNECTION OPEN');
    })
    .catch(err =>{
        console.log('OH NO ERROR!!!!');
        console.log(err);
    })

 
const validateCampground = (req, res, next) =>{
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}

//This is used so that we can use the views file from anywhere if we want to
const dirname = path.dirname(__dirname);
// import methodOverride from 'method-override';
const methodOverride = require('method-override');

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, '/views'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


app.get('/', (req, res)=>{
    res.render('home');
})

app.get('/campgrounds', catchAsync(async (req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

app.get('/campgrounds/new', (req, res)=>{
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground , catchAsync(async (req, res,next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/campgrounds/:id', catchAsync(async (req, res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

app.put('/campgrounds/:id', validateCampground , catchAsync(async (req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.all('*', (req, res, next)=>{
    next(new ExpressError('Page not found', 404));
})

app.use((err,req,res,next)=>{
    const {statusCode = 500, message="Something Went Wrong"} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', {err});
})

app.listen(3000, () => {
    console.log('listening to port 3000')
})