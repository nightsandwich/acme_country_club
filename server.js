const { syncAndSeed, models: {Member, Facility, Booking} }= require('./db');

const express = require('express');
const app = express();

app.get('/api/members', async(req, res, next) => {
    try{
        res.send(await Member.findAll({
            include: [
                {model: Member, as: 'sponsor'},
                {model: Member, as: 'sponsored'}
            ]
        }));
    }
    catch(ex){
        next(ex);
    }
});

app.get('/api/facilities', async(req, res, next) => {
    try{
        res.send(await Facility.findAll({
            include: [
                {model: Booking}
            ]
        }));
    }
    catch(ex){
        next(ex);
    }
});

app.get('/api/bookings', async(req, res, next) => {
    try{
        res.send(await Booking.findAll({
            include: [ Facility, {
                model: Member,
                as: 'bookedBy'
            }]
        }));
    }
    catch(ex){
        next(ex);
    }
});

const init = async()=> {
    await syncAndSeed();
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`));
};

init();