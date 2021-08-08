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
    id: {
        primaryKey: true,
        type: UUID,
        defaultValue: UUIDV4
      },
    startTime: {
        type: DATE,
        allowNull: false,
        defaultValue: ()=> new Date(),
    },
    endTime: {
        type: DATE,
        allowNull: false,
        defaultValue: ()=> new Date(new Date().getTime() + 1000*60*60)
    }
});

Booking.belongsTo(Member, {as: 'bookedBy'});
Booking.belongsTo(Facility);

Facility.hasMany(Booking);

Member.belongsTo(Member, {as: 'sponsor'});
Member.hasMany(Member, {as: 'sponsored', foreignKey: 'sponsorId'});

const syncAndSeed = async() => {
    await db.sync({force: true});
    const [lucy, moe, larry, ethyl] = await Promise.all([ 
        Member.create({ first_name: "lucy" }),
        Member.create({ first_name: "moe" }),
        Member.create({ first_name: "larry"}),
        Member.create({ first_name: "ethyl"})
  ]);
    moe.sponsorId = lucy.id;
    larry.sponsorId = lucy.id;
    ethyl.sponsorId = moe.id;
    await Promise.all([moe.save(), ethyl.save(), larry.save()]);

    const [tennis, pingpong, raquetball, bowling] = await Promise.all([
        Facility.create({fac_name: 'tennis'}),
        Facility.create({fac_name: 'ping-pong'}),
        Facility.create({fac_name: 'raquet-ball'}),
        Facility.create({fac_name: 'bowling'})
    ]);
    Booking.create({bookedById:ethyl.id, facilityId:tennis.id });
    Booking.create({bookedById:ethyl.id, facilityId:raquetball.id });
    Booking.create({bookedById:moe.id, facilityId:raquetball.id });
    Booking.create({bookedById:larry.id, facilityId:bowling.id });
    Booking.create({bookedById:lucy.id, facilityId:pingpong.id });
};

module.exports = {
    syncAndSeed,
    models: {
        Member,
        Facility,
        Booking
    }
}
