const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require('./cities');
const { descriptors, places} = require('./seedhelpers')

mongoose.connect('mongodb://localhost:27017/camp-ground', {useNewUrlParser : true, useUnifiedTopology : true})
    .then(() =>{
        console.log('CONNECTION OPEN');
    })
    .catch(err =>{
        console.log('OH NO ERROR!!!!');
        console.log(err);
    })

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() =>{
    await Campground.deleteMany({});
    for(let i = 0; i <50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 20;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aliquam, deserunt non magnam, reprehenderit sed sunt maxime velit quos nam veniam repudiandae illo incidunt, quidem minima debitis perspiciatis nemo earum molestiae.',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});
