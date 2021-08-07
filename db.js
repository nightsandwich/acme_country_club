const Sequelize = require('sequelize');
const {STRING, UUID, UUIDV4, DATE} = Sequelize;
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_country_club_db');

const Facility = db.define('facility', {
    id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true
    },
    fac_name: {
        type: STRING(100),
        allowNull: false,
        unique: true
    }
});

const Member = db.define('member', {
    id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true
    },
    first_name: {
        type: STRING(20),
        allowNull: false,
        unique: true
    }
});

const Booking = db.define('booking', {
    startTime: {
        type: DATE,
        allowNull: false
    },
    endTime: {
        type: DATE,
        allowNull: false
    }
});

Booking.belongsTo(Member, {as: 'bookedBy'});
Booking.belongsTo(Facility);

Member.belongsTo(Member, {as: 'sponsor'});
Member.hasMany(Member, {as: 'sponsored', foreignKey: 'sponsorId'});

const syncAndSeed = async() => {
    await db.sync({force: true});
    const [lucy, moe, larry, ethyl] = await Promise.all([ 
        //re create
        Member.create({ first_name: "lucy" }),
        Member.create({ first_name: "moe", sponsorId: lucy.id }),
        Member.create({ first_name: "larry", sponsorId: lucy.id }),
        Member.create({ first_name: "ethyl", sponsorId: moe.id })
  ]);

    const [tennis, pingpong, raquetball, bowling] = await Promise.all([
        Facility.create({fac_name: 'tennis'}),
        Facility.create({fac_name: 'ping-pong'}),
        Facility.create({fac_name: 'raquet-ball'}),
        Facility.create({fac_name: 'bowling'})
    ]);
};

module.exports = {
    syncAndSeed,
    models: {
        Member,
        Facility,
        Booking
    }
}
